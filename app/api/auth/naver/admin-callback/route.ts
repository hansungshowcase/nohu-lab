import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

const CAFE_ID = '20898041'

// 카페 등급 → DB tier (1~4)
function mapCafeLevelToTier(levelName: string): number {
  const name = levelName.trim()
  if (name.includes('매니저') || name.includes('스탭') || name.includes('운영') || name === '헤리티지회원') return 4
  if (name === '시그니처회원' || name === '프리미엄회원') return 3
  if (name === '우수회원') return 2
  return 1
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_BASE_URL!))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.redirect(new URL('/admin?sync=failed&reason=no_code', process.env.NEXT_PUBLIC_BASE_URL!))
  }

  try {
    // 1. 액세스 토큰 발급
    const tokenRes = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&code=${code}&state=${state}`
    )
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error('Token failed: error_code=', tokenData.error, 'error_description=', tokenData.error_description)
      return NextResponse.redirect(new URL(`/admin?sync=failed&reason=token_failed`, process.env.NEXT_PUBLIC_BASE_URL!))
    }

    const accessToken = tokenData.access_token

    // 2. 카페 회원 목록 조회
    let page = 1
    const allMembers: { nickname: string; levelName: string }[] = []
    let apiError = ''

    while (true) {
      const membersRes = await fetch(
        `https://openapi.naver.com/v1/cafe/${CAFE_ID}/members?page=${page}&perPage=100`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const membersData = await membersRes.json()

      console.log(`Cafe API page ${page}:`, JSON.stringify(membersData).substring(0, 500))

      // API 에러 체크
      if (membersData.error_code || membersData.errorCode) {
        apiError = membersData.error_description || membersData.errorMessage || 'API 오류'
        console.error('Cafe API error:', JSON.stringify(membersData))
        break
      }

      // 응답 형식에 따라 회원 추출
      let members: Array<Record<string, string>> = []

      if (membersData.message?.result?.members) {
        members = membersData.message.result.members
      } else if (membersData.result?.members) {
        members = membersData.result.members
      } else if (Array.isArray(membersData.members)) {
        members = membersData.members
      } else if (membersData.message?.status !== '200') {
        apiError = `API status: ${membersData.message?.status || 'unknown'}`
        console.error('Unexpected API response:', JSON.stringify(membersData))
        break
      }

      if (members.length === 0) break

      for (const m of members) {
        const nickname = m.nickname || m.nick || m.memberNickName || ''
        const levelName = m.memberLevelName || m.levelName || m.memberLevel || '일반회원'
        if (nickname) {
          allMembers.push({ nickname, levelName: String(levelName) })
        }
      }

      if (members.length < 100) break
      page++
      if (page > 100) break // 안전장치
    }

    // API 에러가 있고 회원도 없으면 실패
    if (allMembers.length === 0 && apiError) {
      return NextResponse.redirect(
        new URL(`/admin?sync=failed&reason=${encodeURIComponent(apiError)}`, process.env.NEXT_PUBLIC_BASE_URL!)
      )
    }

    if (allMembers.length === 0) {
      return NextResponse.redirect(
        new URL('/admin?sync=failed&reason=no_members', process.env.NEXT_PUBLIC_BASE_URL!)
      )
    }

    // 3. DB에 동기화
    const supabase = getServiceSupabase()
    let syncCount = 0
    let newCount = 0
    let updateCount = 0

    for (const member of allMembers) {
      const tier = mapCafeLevelToTier(member.levelName)

      const { data: existing } = await supabase
        .from('members')
        .select('id, tier')
        .eq('nickname', member.nickname)
        .single()

      if (existing) {
        if (existing.tier !== tier) {
          await supabase
            .from('members')
            .update({ tier })
            .eq('id', existing.id)
          updateCount++
        }
      } else {
        await supabase
          .from('members')
          .insert({ nickname: member.nickname, phone: '', tier })
        newCount++
      }
      syncCount++
    }

    return NextResponse.redirect(
      new URL(`/admin?sync=success&count=${syncCount}&new=${newCount}&updated=${updateCount}`, process.env.NEXT_PUBLIC_BASE_URL!)
    )
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.redirect(new URL('/admin?sync=error', process.env.NEXT_PUBLIC_BASE_URL!))
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

const CAFE_ID = 'eovhskfktmak'

// 카페 등급 → DB tier (1~4)
// 일반/코어 → 1, 우수 → 2, 프리미엄/시그니처 → 3, 헤리티지/스탭 → 4
function mapCafeLevelToTier(levelName: string): number {
  const name = levelName.trim()
  if (name.includes('매니저') || name.includes('스탭') || name.includes('운영') || name === '헤리티지회원') return 4
  if (name === '시그니처회원' || name === '프리미엄회원') return 3
  if (name === '우수회원') return 2
  return 1 // 일반회원, 코어회원
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
    return NextResponse.redirect(new URL('/admin?sync=failed', process.env.NEXT_PUBLIC_BASE_URL!))
  }

  try {
    // 1. 액세스 토큰 발급
    const tokenRes = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&code=${code}&state=${state}`
    )
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/admin?sync=token_failed', process.env.NEXT_PUBLIC_BASE_URL!))
    }

    const accessToken = tokenData.access_token

    // 2. 카페 회원 목록 조회
    let page = 1
    const allMembers: { nickname: string; levelName: string }[] = []

    while (true) {
      const membersRes = await fetch(
        `https://openapi.naver.com/v1/cafe/${CAFE_ID}/members?page=${page}&perPage=100`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const membersData = await membersRes.json()

      if (membersData.message?.status !== '200' || !membersData.message?.result?.members) {
        break
      }

      const members = membersData.message.result.members
      if (members.length === 0) break

      for (const m of members) {
        allMembers.push({
          nickname: m.nickname || m.nick || '',
          levelName: m.memberLevelName || m.levelName || '일반회원',
        })
      }

      if (members.length < 100) break
      page++
    }

    // 3. DB에 동기화
    const supabase = getServiceSupabase()
    let syncCount = 0

    for (const member of allMembers) {
      if (!member.nickname) continue

      const tier = mapCafeLevelToTier(member.levelName)

      const { data: existing } = await supabase
        .from('members')
        .select('id, tier')
        .eq('nickname', member.nickname)
        .single()

      if (existing) {
        // 등급이 변경된 경우만 업데이트
        if (existing.tier !== tier) {
          await supabase
            .from('members')
            .update({ tier })
            .eq('id', existing.id)
        }
      } else {
        // 신규 회원 추가
        await supabase
          .from('members')
          .insert({
            nickname: member.nickname,
            phone: '',
            tier,
          })
      }
      syncCount++
    }

    return NextResponse.redirect(
      new URL(`/admin?sync=success&count=${syncCount}`, process.env.NEXT_PUBLIC_BASE_URL!)
    )
  } catch {
    return NextResponse.redirect(new URL('/admin?sync=error', process.env.NEXT_PUBLIC_BASE_URL!))
  }
}

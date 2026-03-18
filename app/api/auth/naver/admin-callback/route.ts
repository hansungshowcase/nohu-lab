import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { mapGradeToTier } from '@/lib/types'

const CAFE_ID = '20898041'

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://retireplan.kr'
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.redirect(new URL('/dashboard', getBaseUrl()))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.redirect(new URL('/admin?sync=failed&reason=no_code', getBaseUrl()))
  }

  const savedState = request.cookies.get('oauth_state')?.value
  if (!savedState || savedState !== state) {
    const res = NextResponse.redirect(new URL('/admin?sync=failed&reason=invalid_state', getBaseUrl()))
    res.cookies.set('oauth_state', '', { maxAge: 0, path: '/' })
    return res
  }

  try {
    // 1. 액세스 토큰 발급
    const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        code: code!,
        state: state || '',
      }),
    })
    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL(`/admin?sync=failed&reason=token_failed`, getBaseUrl()))
    }
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL(`/admin?sync=failed&reason=token_failed`, getBaseUrl()))
    }

    const accessToken = tokenData.access_token

    // 2. 카페 회원 목록 조회
    let page = 1
    const allMembers: { nickname: string; levelName: string; memberLevel: number }[] = []
    let apiError = ''

    while (true) {
      const membersRes = await fetch(
        `https://openapi.naver.com/v1/cafe/${CAFE_ID}/members?page=${page}&perPage=100`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!membersRes.ok) break
      const membersData = await membersRes.json()

      // cafe API response logged server-side only in dev

      // API 에러 체크
      if (membersData.error_code || membersData.errorCode) {
        apiError = membersData.error_description || membersData.errorMessage || 'API 오류'
        // cafe API error
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
        // unexpected API response
        break
      }

      if (members.length === 0) break

      for (const m of members) {
        const nickname = m.nickname || m.nick || m.memberNickName || ''
        const levelName = m.memberLevelName || m.levelName || ''
        const memberLevel = Number(m.memberLevel) || 0
        if (nickname) {
          allMembers.push({ nickname, levelName: String(levelName || '일반회원'), memberLevel })
        }
      }

      if (members.length < 100) break
      page++
      if (page > 100) break // 안전장치
    }

    // API 에러가 있고 회원도 없으면 실패
    if (allMembers.length === 0 && apiError) {
      return NextResponse.redirect(
        new URL('/admin?sync=failed&reason=api_error', getBaseUrl())
      )
    }

    if (allMembers.length === 0) {
      return NextResponse.redirect(
        new URL('/admin?sync=failed&reason=no_members', getBaseUrl())
      )
    }

    // 3. DB에 동기화 (upsert로 레이스 컨디션 방지)
    const supabase = getServiceSupabase()
    let syncCount = 0
    let errorCount = 0

    for (let i = 0; i < allMembers.length; i += 500) {
      const batch = allMembers.slice(i, i + 500).map(m => ({
        nickname: m.nickname,
        tier: mapGradeToTier(m.levelName, m.memberLevel),
      }))
      const { error } = await supabase
        .from('members')
        .upsert(batch, { onConflict: 'nickname' })
      if (error) errorCount += batch.length
      else syncCount += batch.length
    }

    const response = NextResponse.redirect(
      new URL(`/admin?sync=success&count=${syncCount}&errors=${errorCount}`, getBaseUrl())
    )
    response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' })
    return response
  } catch (err) {
    // sync error
    const response = NextResponse.redirect(new URL('/admin?sync=error', getBaseUrl()))
    response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' })
    return response
  }
}

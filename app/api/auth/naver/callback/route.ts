import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createToken, COOKIE_NAME } from '@/lib/auth'
import { mapGradeToTier } from '@/lib/types'

const CAFE_ID = '20898041'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=naver_denied', process.env.NEXT_PUBLIC_BASE_URL!))
  }

  const savedState = request.cookies.get('oauth_state')?.value
  if (!savedState || savedState !== state) {
    const res = NextResponse.redirect(new URL('/?error=invalid_state', process.env.NEXT_PUBLIC_BASE_URL!))
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
      return NextResponse.redirect(new URL('/?error=token_failed', process.env.NEXT_PUBLIC_BASE_URL!))
    }
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/?error=token_failed', process.env.NEXT_PUBLIC_BASE_URL!))
    }

    const accessToken = tokenData.access_token

    // 2. 네이버 프로필 조회
    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!profileRes.ok) {
      return NextResponse.redirect(new URL('/?error=profile_failed', process.env.NEXT_PUBLIC_BASE_URL!))
    }
    const profileData = await profileRes.json()

    if (profileData.resultcode !== '00') {
      return NextResponse.redirect(new URL('/?error=profile_failed', process.env.NEXT_PUBLIC_BASE_URL!))
    }

    const naverProfile = profileData.response
    if (!naverProfile) {
      return NextResponse.redirect(new URL('/?error=profile_failed', process.env.NEXT_PUBLIC_BASE_URL!))
    }
    const naverNickname = naverProfile.nickname || naverProfile.name || '회원'

    // 3. 카페 가입 여부 및 등급 확인 (디버그 모드)
    let cafeTier: 1 | 2 | 3 | 4 = 1
    let cafeJoined = false
    const debugResults: Record<string, unknown> = {}

    const cafeIds = ['eovhskfktmak', CAFE_ID]
    for (const cid of cafeIds) {
      try {
        const cafeRes = await fetch(
          `https://openapi.naver.com/v1/cafe/member/${cid}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        if (!cafeRes.ok) {
          debugResults[cid] = { status: cafeRes.status, error: 'HTTP error' }
          continue
        }
        const cafeData = await cafeRes.json()
        debugResults[cid] = { status: cafeRes.status, data: cafeData }

        if (cafeData.message?.status === '200' && cafeData.message?.result) {
          const memberLevel = cafeData.message.result.memberLevel || 1
          const memberLevelName = cafeData.message.result.memberLevelName || ''
          cafeTier = mapGradeToTier(memberLevelName, memberLevel)
          cafeJoined = true
          break
        }
      } catch (e) {
        debugResults[cid] = { error: String(e) }
      }
    }

    if (!cafeJoined) {
      return NextResponse.redirect(
        new URL('/?error=not_cafe_member', process.env.NEXT_PUBLIC_BASE_URL!)
      )
    }

    // 4. DB에 회원 등록/업데이트 (upsert로 레이스 컨디션 방지)
    const supabase = getServiceSupabase()

    const { data: member, error: upsertError } = await supabase
      .from('members')
      .upsert({
        nickname: naverNickname,
        phone: naverProfile.mobile?.replace(/-/g, '') || '',
        tier: cafeTier,
        last_login: new Date().toISOString(),
      }, { onConflict: 'nickname' })
      .select()
      .single()

    if (upsertError || !member) {
      return NextResponse.redirect(new URL('/?error=server_error', process.env.NEXT_PUBLIC_BASE_URL!))
    }

    const memberId = member.id

    // 5. JWT 발급
    const token = await createToken({
      memberId,
      nickname: naverNickname,
      tier: cafeTier,
    })

    const response = NextResponse.redirect(
      new URL('/dashboard', process.env.NEXT_PUBLIC_BASE_URL!)
    )

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' })

    return response
  } catch {
    const res = NextResponse.redirect(
      new URL('/?error=server_error', process.env.NEXT_PUBLIC_BASE_URL!)
    )
    res.cookies.set('oauth_state', '', { maxAge: 0, path: '/' })
    return res
  }
}

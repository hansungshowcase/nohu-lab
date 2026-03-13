import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createToken, COOKIE_NAME } from '@/lib/auth'

const CAFE_ID = '20898041'

// 노후연구소 카페 등급 → 시스템 Tier 매핑
// 일반회원 → Tier 1
// 코어회원 → Tier 1
// 우수회원 → Tier 2
// 프리미엄회원 → Tier 3
// 시그니처회원 → Tier 3
// 헤리티지회원 → Tier 4
// 스탭/매니저 → Tier 4
// 카페 등급 → DB tier (1~4)
// 일반/코어 → 1, 우수 → 2, 프리미엄/시그니처 → 3, 헤리티지/스탭 → 4
function mapCafeLevelToTier(memberLevel: number, memberLevelName?: string): 1 | 2 | 3 | 4 {
  if (memberLevelName) {
    const name = memberLevelName.trim()
    if (name.includes('매니저') || name.includes('스탭') || name.includes('운영') || name === '헤리티지회원') return 4
    if (name === '시그니처회원' || name === '프리미엄회원') return 3
    if (name === '우수회원') return 2
    return 1  // 일반회원, 코어회원
  }
  if (memberLevel >= 6) return 4
  if (memberLevel >= 4) return 3
  if (memberLevel >= 3) return 2
  return 1
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=naver_denied', process.env.NEXT_PUBLIC_BASE_URL!))
  }

  try {
    // 1. 액세스 토큰 발급
    const tokenRes = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&code=${code}&state=${state}`
    )
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/?error=token_failed', process.env.NEXT_PUBLIC_BASE_URL!))
    }

    const accessToken = tokenData.access_token

    // 2. 네이버 프로필 조회
    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const profileData = await profileRes.json()

    if (profileData.resultcode !== '00') {
      return NextResponse.redirect(new URL('/?error=profile_failed', process.env.NEXT_PUBLIC_BASE_URL!))
    }

    const naverProfile = profileData.response
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
        const cafeData = await cafeRes.json()
        debugResults[cid] = { status: cafeRes.status, data: cafeData }

        if (cafeData.message?.status === '200' && cafeData.message?.result) {
          const memberLevel = cafeData.message.result.memberLevel || 1
          const memberLevelName = cafeData.message.result.memberLevelName || ''
          cafeTier = mapCafeLevelToTier(memberLevel, memberLevelName)
          cafeJoined = true
          break
        }
      } catch (e) {
        debugResults[cid] = { error: String(e) }
      }
    }

    // 디버그: 카페 API 응답을 URL에 포함 (임시)
    if (!cafeJoined) {
      const debugStr = encodeURIComponent(JSON.stringify(debugResults).substring(0, 300))
      return NextResponse.redirect(
        new URL(`/?error=not_cafe_member&debug=${debugStr}`, process.env.NEXT_PUBLIC_BASE_URL!)
      )
    }

    // 4. DB에 회원 등록/업데이트
    const supabase = getServiceSupabase()

    const { data: existing } = await supabase
      .from('members')
      .select('*')
      .eq('nickname', naverNickname)
      .single()

    let memberId: string

    if (existing) {
      // 기존 회원 → 등급 업데이트 + 로그인 시간
      await supabase
        .from('members')
        .update({
          tier: cafeTier,
          last_login: new Date().toISOString(),
        })
        .eq('id', existing.id)
      memberId = existing.id
    } else {
      // 신규 회원 등록
      const { data: newMember } = await supabase
        .from('members')
        .insert({
          nickname: naverNickname,
          phone: naverProfile.mobile?.replace(/-/g, '') || '',
          tier: cafeTier,
          last_login: new Date().toISOString(),
        })
        .select()
        .single()
      memberId = newMember?.id || ''
    }

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
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.redirect(
      new URL('/?error=server_error', process.env.NEXT_PUBLIC_BASE_URL!)
    )
  }
}

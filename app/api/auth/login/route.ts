import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { nickname } = await request.json()

    if (!nickname) {
      return NextResponse.json(
        { error: '닉네임을 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    // 1. DB에서 닉네임 검색
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('nickname', nickname.trim())
      .single()

    if (member) {
      // DB에 있는 회원 → 바로 로그인
      await supabase
        .from('members')
        .update({ last_login: new Date().toISOString() })
        .eq('id', member.id)

      const token = await createToken({
        memberId: member.id,
        nickname: member.nickname,
        tier: member.tier as 1 | 2 | 3 | 4,
      })

      const response = NextResponse.json({
        success: true,
        member: { nickname: member.nickname, tier: member.tier },
      })

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return response
    }

    // 2. DB에 없으면 → 카페 회원이 아닌 것으로 안내
    return NextResponse.json(
      { error: '노후연구소 카페 회원이 아니거나, 아직 동기화되지 않았습니다.\n관리자에게 문의하세요.' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

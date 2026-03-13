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

    // DB에서 닉네임 검색 (동기화 스크립트가 카페 회원을 DB에 자동 등록)
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('nickname', nickname.trim())
      .single()

    if (member) {
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

    return NextResponse.json(
      { error: '노후연구소 카페에 가입되지 않은 닉네임입니다.\n카페 가입 후 잠시 기다리면 자동으로 등록됩니다.' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

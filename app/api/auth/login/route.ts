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
    const trimmed = nickname.trim().slice(0, 100)

    // DB에서 닉네임 검색
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('nickname', trimmed)
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

    // DB에 없으면 → 실시간 확인 요청 생성
    const { data: verifyReq } = await supabase
      .from('verify_requests')
      .insert({ nickname: trimmed, status: 'pending' })
      .select()
      .single()

    if (!verifyReq) {
      return NextResponse.json(
        { error: '확인 요청 생성 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'verifying',
      verifyId: verifyReq.id,
    })
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

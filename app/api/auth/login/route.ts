import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { nickname } = await request.json()

    if (!nickname || typeof nickname !== 'string' || !nickname.trim()) {
      return NextResponse.json(
        { error: '닉네임을 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    const trimmed = nickname.trim().slice(0, 100)

    // DB에서 닉네임 검색
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, nickname, tier')
      .eq('nickname', trimmed)
      .single()

    if (member && !memberError) {
      const { error: updateError } = await supabase
        .from('members')
        .update({ last_login: new Date().toISOString() })
        .eq('id', member.id)
      if (updateError) {
        return NextResponse.json({ error: '로그인 처리 실패' }, { status: 500 })
      }

      const token = await createToken({
        memberId: member.id,
        nickname: member.nickname,
        tier: ([1, 2, 3, 4].includes(member.tier) ? member.tier : 1) as 1 | 2 | 3 | 4,
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

    // DB에 없으면 → 기존 pending 요청 확인 후 생성
    const { data: existingReq, error: existingError } = await supabase
      .from('verify_requests')
      .select('id')
      .eq('nickname', trimmed)
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 2 * 60 * 1000).toISOString())
      .limit(1)
      .single()

    if (!existingError && existingReq) {
      return NextResponse.json({
        status: 'verifying',
        verifyId: existingReq.id,
      })
    }

    const { data: verifyReq, error: verifyError } = await supabase
      .from('verify_requests')
      .insert({ nickname: trimmed, status: 'pending' })
      .select()
      .single()

    if (verifyError || !verifyReq) {
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

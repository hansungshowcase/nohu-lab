import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createToken, COOKIE_NAME } from '@/lib/auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'wnsgud20!'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    // DB에서 관리자 계정 조회
    const supabase = getServiceSupabase()
    const { data: admin, error: adminError } = await supabase
      .from('members')
      .select('id, nickname, tier')
      .eq('tier', 4)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (adminError || !admin) {
      return NextResponse.json(
        { error: '관리자 계정이 없습니다.' },
        { status: 500 }
      )
    }

    const { error: loginError } = await supabase
      .from('members')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)
    if (loginError) {
      return NextResponse.json({ error: '로그인 처리 실패' }, { status: 500 })
    }

    const token = await createToken({
      memberId: admin.id,
      nickname: admin.nickname,
      tier: 4,
    })

    const response = NextResponse.json({
      success: true,
      member: { nickname: admin.nickname, tier: 4 },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

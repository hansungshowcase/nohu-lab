import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createToken, COOKIE_NAME } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { nickname, phone } = await request.json()

    if (!nickname || !phone) {
      return NextResponse.json(
        { error: '닉네임과 연락처를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('nickname', nickname.trim())
      .single()

    if (error || !member) {
      return NextResponse.json(
        { error: '등록되지 않은 회원입니다. 관리자에게 문의하세요.' },
        { status: 401 }
      )
    }

    // 연락처 비교 (해시된 경우와 평문 모두 지원)
    const phoneClean = phone.replace(/-/g, '')
    const phoneMatch =
      member.phone === phoneClean ||
      (await bcrypt.compare(phoneClean, member.phone))

    if (!phoneMatch) {
      return NextResponse.json(
        { error: '연락처가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    // last_login 업데이트
    await supabase
      .from('members')
      .update({ last_login: new Date().toISOString() })
      .eq('id', member.id)

    const token = await createToken({
      memberId: member.id,
      nickname: member.nickname,
      tier: member.tier,
    })

    const response = NextResponse.json({
      success: true,
      member: {
        nickname: member.nickname,
        tier: member.tier,
      },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
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

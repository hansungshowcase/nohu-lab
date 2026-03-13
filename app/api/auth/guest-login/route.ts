import { NextResponse } from 'next/server'
import { createToken, COOKIE_NAME } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function POST() {
  try {
    const token = await createToken({
      memberId: `guest-${randomUUID()}`,
      nickname: '비회원',
      tier: 0,
    })

    const response = NextResponse.json({
      success: true,
      member: { nickname: '비회원', tier: 0 },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1일 (비회원은 짧게)
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

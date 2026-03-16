import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') // 'admin' = 관리자 동기화용

  const clientId = process.env.NAVER_CLIENT_ID!
  let redirectUri: string
  let state: string

  if (mode === 'admin') {
    // 관리자 전용: 카페 회원 동기화
    const user = await getCurrentUser()
    if (!user || user.tier !== 4) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }
    redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/naver/admin-callback`
    state = 'admin_' + randomBytes(16).toString('hex')
  } else {
    // 일반 회원: 네이버 로그인 + 카페 인증
    redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/naver/callback`
    state = 'user_' + randomBytes(16).toString('hex')
  }

  const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  return NextResponse.redirect(authUrl)
}

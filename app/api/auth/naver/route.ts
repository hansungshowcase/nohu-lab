import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') // 'admin' = 관리자 동기화용

  const clientId = process.env.NAVER_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'NAVER_CLIENT_ID가 설정되지 않았습니다.' }, { status: 500 })
  }

  let redirectUri: string
  let state: string

  if (mode === 'admin') {
    const user = await getCurrentUser()
    if (!user || user.tier !== 4) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }
    redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/naver/admin-callback`
    state = 'admin_' + randomBytes(16).toString('hex')
  } else {
    redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/naver/callback`
    state = 'user_' + randomBytes(16).toString('hex')
  }

  const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 5,
    path: '/',
  })
  return response
}

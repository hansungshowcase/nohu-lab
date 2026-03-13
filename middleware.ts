import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'cafe-auth-token'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-change-me-in-production')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  // 보호된 경로 체크
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/programs') ||
    pathname.startsWith('/admin')

  if (!isProtected) return NextResponse.next()

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // /admin 경로는 tier 4만 접근 가능
    if (pathname.startsWith('/admin') && payload.tier !== 4) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch {
    // 토큰 만료/무효 → 쿠키 삭제 후 로그인으로
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/programs/:path*', '/admin/:path*'],
}

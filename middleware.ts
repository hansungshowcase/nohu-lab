import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'cafe-auth-token'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-change-me-in-production')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  // 관리자 로그인 페이지는 보호하지 않음
  if (pathname === '/admin/login') return NextResponse.next()

  // 보호된 경로 체크
  // 임시: 프로그램 페이지 비로그인 허용
  if (pathname.startsWith('/programs')) return NextResponse.next()

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/chat')

  if (!isProtected) return NextResponse.next()

  if (!token) {
    // /admin 경로는 관리자 로그인으로 리다이렉트
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
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
  matcher: ['/dashboard/:path*', '/programs/:path*', '/admin/:path*', '/chat/:path*'],
}

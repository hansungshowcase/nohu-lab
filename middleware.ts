import { NextRequest, NextResponse } from 'next/server'

export async function middleware(_request: NextRequest) {
  // 인증 체크 제거 — 모든 요청 통과
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/programs/:path*', '/admin/:path*', '/chat/:path*'],
}

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    // 로그인 없이 기본 사용자(tier 4) 반환
    return NextResponse.json({ memberId: 'guest', nickname: '방문자', tier: 4 })
  }
  return NextResponse.json(user)
}

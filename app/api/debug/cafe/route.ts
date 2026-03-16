import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// 디버그: 카페 API 응답 확인용 (관리자 전용)
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }
  // 먼저 토큰 발급 테스트 (클라이언트 크레덴셜은 안됨, 그냥 API 형식 확인)
  const results: Record<string, unknown> = {}

  // 카페 API 엔드포인트 형식 확인
  const endpoints = [
    'https://openapi.naver.com/v1/cafe/member/eovhskfktmak',
    'https://openapi.naver.com/v1/cafe/member/20898041',
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: 'Bearer test' },
      })
      const data = await res.json()
      results[url] = { status: res.status, data }
    } catch (e) {
      results[url] = { error: String(e) }
    }
  }

  return NextResponse.json(results)
}

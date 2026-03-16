import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// 임시 디버그: 카페 API 응답 확인용 (관리자 전용)
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const results: Record<string, unknown> = {}

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

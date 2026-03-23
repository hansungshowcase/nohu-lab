import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Vercel Cron Job: 30분마다 배당주 데이터 캐시 갱신
// vercel.json에서 "*/30 * * * *" 스케줄로 호출됨

export async function GET() {
  try {
    // 국내 + 미국 API 캐시 무효화
    revalidatePath('/api/dividend')

    // 실제 데이터를 미리 가져와서 캐시 워밍
    const [krRes, usRes] = await Promise.allSettled([
      fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/dividend?market=kr`, {
        cache: 'no-store',
      }),
      fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/dividend?market=us`, {
        cache: 'no-store',
      }),
    ])

    const krOk = krRes.status === 'fulfilled' && krRes.value.ok
    const usOk = usRes.status === 'fulfilled' && usRes.value.ok

    let krCount = 0
    let usCount = 0
    if (krOk) {
      const data = await (krRes as PromiseFulfilledResult<Response>).value.json()
      krCount = data.count || 0
    }
    if (usOk) {
      const data = await (usRes as PromiseFulfilledResult<Response>).value.json()
      usCount = data.count || 0
    }

    return NextResponse.json({
      success: true,
      refreshedAt: new Date().toISOString(),
      kr: { ok: krOk, count: krCount },
      us: { ok: usOk, count: usCount },
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: String(e),
      refreshedAt: new Date().toISOString(),
    }, { status: 500 })
  }
}

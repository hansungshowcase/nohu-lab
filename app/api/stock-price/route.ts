import { NextResponse } from 'next/server'

// 네이버 증권에서 현재가 조회 (서버사이드)
// GET /api/stock-price?ticker=005930
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'ticker required' }, { status: 400 })
  }

  try {
    // 미국 ETF인 경우
    if (/^[A-Z]+$/.test(ticker)) {
      const res = await fetch(
        `https://api.stock.naver.com/stock/${ticker}/basic`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 300 }, // 5분 캐시
        }
      )
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({
          ticker,
          price: data.closePrice || data.stockEndPrice || null,
          name: data.stockName || ticker,
          change: data.compareToPreviousClosePrice || 0,
          changePct: data.fluctuationsRatio || 0,
        })
      }
    }

    // 국내 주식
    const res = await fetch(
      `https://api.stock.naver.com/stock/${ticker}/basic`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 300 },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'fetch failed', ticker }, { status: 502 })
    }

    const data = await res.json()

    return NextResponse.json({
      ticker,
      price: parseInt(data.closePrice || data.stockEndPrice || '0', 10),
      name: data.stockName || ticker,
      change: parseInt(data.compareToPreviousClosePrice || '0', 10),
      changePct: parseFloat(data.fluctuationsRatio || '0'),
    })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

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
    // 미국 주식/ETF인 경우
    if (/^[A-Z]+$/.test(ticker)) {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' },
          next: { revalidate: 300 }, // 5분 캐시
        }
      )
      if (res.ok) {
        const data = await res.json()
        const meta = data?.chart?.result?.[0]?.meta
        if (!meta?.regularMarketPrice) {
          return NextResponse.json({ error: 'price unavailable', ticker }, { status: 502 })
        }
        return NextResponse.json({
          ticker,
          price: meta.regularMarketPrice,
          priceUsd: meta.regularMarketPrice,
          name: meta.longName || meta.shortName || ticker,
          change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice),
          changePct: meta.previousClose
            ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
            : 0,
        })
      }
      return NextResponse.json({ error: 'fetch failed', ticker }, { status: 502 })
    }

    // 국내 주식 (네이버 모바일 API)
    const res = await fetch(
      `https://m.stock.naver.com/api/stock/${ticker}/basic`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' },
        next: { revalidate: 300 },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'fetch failed', ticker }, { status: 502 })
    }

    const data = await res.json()

    return NextResponse.json({
      ticker,
      price: parseInt((data.closePrice || '0').replace(/,/g, ''), 10),
      name: data.stockName || ticker,
      change: parseInt((data.compareToPreviousClosePrice || '0').replace(/,/g, ''), 10),
      changePct: parseFloat(data.fluctuationsRatio || '0'),
    })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

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
    if (/^[A-Z][A-Z0-9.-]*$/.test(ticker)) {
      const yahooTicker = ticker.replace(/\./g, '-')
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?range=1y&interval=1d&events=div`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' },
          next: { revalidate: 300 }, // 5분 캐시
        }
      )
      if (res.ok) {
        const data = await res.json()
        const chart = data?.chart?.result?.[0]
        const meta = chart?.meta
        if (!meta?.regularMarketPrice) {
          return NextResponse.json({ error: 'price unavailable', ticker }, { status: 502 })
        }
        const dividends = Object.values(chart?.events?.dividends || {}) as Array<{ amount?: number; date?: number }>
        const oneYearAgo = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60
        const dividendRate = Math.round(dividends
          .filter((d) => (d.date || 0) >= oneYearAgo)
          .reduce((sum, d) => sum + Number(d.amount || 0), 0) * 10000) / 10000
        const yieldPct = dividendRate > 0
          ? Math.round((dividendRate / meta.regularMarketPrice) * 10000) / 100
          : 0
        const previousClose = Number(meta.previousClose || 0)
        const change = previousClose > 0 ? meta.regularMarketPrice - previousClose : 0
        return NextResponse.json({
          ticker,
          price: meta.regularMarketPrice,
          priceUsd: meta.regularMarketPrice,
          name: meta.longName || meta.shortName || ticker,
          dividendRate,
          yieldPct,
          change,
          changePct: previousClose > 0
            ? (change / previousClose) * 100
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

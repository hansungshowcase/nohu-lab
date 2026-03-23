import { NextResponse } from 'next/server'

// Vercel Cron Job: 매일 한국시간 오전 10시
// 1. 국내: 기존 JSON 시세 업데이트
// 2. 미국: FMP 배당 캘린더에서 새 종목 누적 수집 + Yahoo 시세 업데이트

const GITHUB_REPO = 'hansungshowcase/nohu-lab'
const KR_FILE = 'components/programs/dividend/krDividendData.json'
const US_FILE = 'components/programs/dividend/usDividendData.json'
const FMP_KEY = 'vAEjM15Bmc98HcAU0f7ycjl2FWHS7a7r'

export async function GET() {
  const startTime = Date.now()
  const githubToken = process.env.GITHUB_TOKEN
  if (!githubToken) {
    return NextResponse.json({ success: false, error: 'No GITHUB_TOKEN' })
  }

  const results: Record<string, unknown> = { refreshedAt: new Date().toISOString() }

  try {
    // ── 1. 국내 시세 업데이트 ──
    const krResult = await updateKrPrices(githubToken)
    results.kr = krResult

    // ── 2. 미국 배당주 누적 수집 ──
    const usResult = await accumulateUsDividends(githubToken)
    results.us = usResult

    results.success = true
    results.elapsed = Math.round((Date.now() - startTime) / 1000) + 's'
  } catch (e) {
    results.success = false
    results.error = String(e)
    results.elapsed = Math.round((Date.now() - startTime) / 1000) + 's'
  }

  return NextResponse.json(results)
}

// 국내: 기존 JSON의 상위 200개 시세만 업데이트
async function updateKrPrices(githubToken: string) {
  try {
    const fileRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${KR_FILE}`, {
      headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' },
    })
    const fileData = await fileRes.json()
    const stocks = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'))

    let updated = 0
    for (let i = 0; i < Math.min(stocks.length, 200); i += 20) {
      const batch = stocks.slice(i, i + 20)
      const results = await Promise.allSettled(
        batch.map((s: { ticker: string }) =>
          fetch(`https://m.stock.naver.com/api/stock/${s.ticker}/basic`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(3000),
          }).then((r) => r.json()).then((d) => ({
            ticker: s.ticker,
            price: parseInt((d.closePrice || '0').replace(/,/g, ''), 10),
          }))
        )
      )
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value && r.value.price > 0) {
          const idx = stocks.findIndex((x: { ticker: string }) => x.ticker === r.value!.ticker)
          if (idx >= 0 && stocks[idx].dividendPerShare > 0) {
            stocks[idx].price = r.value.price
            stocks[idx].yieldPct = Math.round((stocks[idx].dividendPerShare / r.value.price) * 1000) / 10
            updated++
          }
        }
      }
    }

    // 데이터 무결성 검증
    const valid = stocks.filter((s: { price: number; yieldPct: number }) => s.price > 0 && s.yieldPct > 0)
    if (valid.length < stocks.length * 0.5) {
      return { ok: false, error: 'too many lost', original: stocks.length, valid: valid.length }
    }

    // GitHub 커밋
    const newContent = Buffer.from(JSON.stringify(stocks)).toString('base64')
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${KR_FILE}`, {
      method: 'PUT',
      headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `chore: update KR prices (${updated} updated)`,
        content: newContent, sha: fileData.sha,
        committer: { name: 'hansungshowcase', email: 'hansungshowcase@users.noreply.github.com' },
      }),
    })

    return { ok: true, total: stocks.length, updated }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// 미국: FMP 배당 캘린더에서 새 종목 누적 + Yahoo 스크리너 보강
async function accumulateUsDividends(githubToken: string) {
  try {
    // 1. 기존 JSON 로드
    const fileRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${US_FILE}`, {
      headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' },
    })
    const fileData = await fileRes.json()
    const existingStocks = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'))
    const existingMap = new Map<string, unknown>()
    existingStocks.forEach((s: { ticker: string }) => existingMap.set(s.ticker, s))
    const beforeCount = existingMap.size

    // 2. FMP 배당 캘린더 (최근 4주, 주당 1호출 = 4호출)
    let fmpAdded = 0
    for (let w = 0; w < 4; w++) {
      const end = new Date(Date.now() - w * 7 * 86400000)
      const start = new Date(Date.now() - (w + 1) * 7 * 86400000)
      const from = start.toISOString().slice(0, 10)
      const to = end.toISOString().slice(0, 10)

      try {
        const res = await fetch(
          `https://financialmodelingprep.com/stable/dividends-calendar?from=${from}&to=${to}&apikey=${FMP_KEY}`,
          { signal: AbortSignal.timeout(5000) }
        )
        const text = await res.text()
        if (!text.startsWith('[')) continue
        const items = JSON.parse(text)
        for (const item of items) {
          if (!item.symbol || existingMap.has(item.symbol)) continue
          existingMap.set(item.symbol, {
            ticker: item.symbol,
            name: item.label || item.symbol,
            priceUsd: 0, price: 0,
            sector: '기타', industry: '',
            yieldPct: Math.round(((item.yield || 0) as number) * 100) / 100,
            dividendRate: (item.adjDividend || item.dividend || 0) as number,
            frequency: '분기배당',
            marketCap: 0,
          })
          fmpAdded++
        }
      } catch { /* continue */ }
      await new Promise((r) => setTimeout(r, 300))
    }

    // 3. Yahoo 스크리너 1개 추가 호출 (매일 다른 스크리너)
    const screeners = ['high_dividend_yield', 'most_actives', 'undervalued_large_caps', 'conservative_foreign_funds', 'top_mutual_funds', 'portfolio_anchors', 'top_performing_etfs']
    const dayIndex = new Date().getDate() % screeners.length
    let yahooAdded = 0
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=${screeners[dayIndex]}&count=250`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }
      )
      const data = await res.json()
      const quotes = data?.finance?.result?.[0]?.quotes || []
      for (const q of quotes) {
        if (!q.symbol || !q.dividendYield || q.dividendYield <= 0) continue
        if (existingMap.has(q.symbol)) {
          // 기존 종목 시세 업데이트
          const existing = existingMap.get(q.symbol) as Record<string, unknown>
          existing.priceUsd = q.regularMarketPrice || existing.priceUsd
          existing.price = Math.round(((q.regularMarketPrice as number) || 0) * 1400)
          existing.yieldPct = Math.round(((q.dividendYield as number) || 0) * 100) / 100
          existing.sector = q.sector || existing.sector
          existing.industry = q.industry || existing.industry
          existing.marketCap = q.marketCap || existing.marketCap
        } else {
          const monthlyTickers = ['JEPI', 'JEPQ', 'QYLD', 'XYLD', 'RYLD', 'DIVO', 'O', 'MAIN', 'STAG', 'AGNC', 'NLY', 'PSEC', 'CLM', 'GOF', 'PDI']
          existingMap.set(q.symbol, {
            ticker: q.symbol, name: q.longName || q.shortName || '',
            priceUsd: q.regularMarketPrice || 0, price: Math.round(((q.regularMarketPrice as number) || 0) * 1400),
            sector: q.sector || '기타', industry: q.industry || '',
            yieldPct: Math.round(((q.dividendYield as number) || 0) * 100) / 100,
            dividendRate: q.dividendRate || q.trailingAnnualDividendRate || 0,
            frequency: monthlyTickers.includes(q.symbol) ? '월배당' : '분기배당',
            marketCap: q.marketCap || 0,
          })
          yahooAdded++
        }
      }
    } catch { /* silent */ }

    // 4. 결과 저장
    const allStocks = Array.from(existingMap.values()) as Array<{ yieldPct: number }>
    allStocks.sort((a, b) => b.yieldPct - a.yieldPct)

    const newContent = Buffer.from(JSON.stringify(allStocks)).toString('base64')
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${US_FILE}`, {
      method: 'PUT',
      headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `chore: update US dividends (+${fmpAdded} FMP, +${yahooAdded} Yahoo, total ${allStocks.length})`,
        content: newContent, sha: fileData.sha,
        committer: { name: 'hansungshowcase', email: 'hansungshowcase@users.noreply.github.com' },
      }),
    })

    return { ok: true, before: beforeCount, after: allStocks.length, fmpAdded, yahooAdded }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

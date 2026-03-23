import { NextResponse } from 'next/server'

// Vercel Cron Job: 매일 한국시간 오전 10시 (UTC 01:00)
// 네이버 증권에서 전체 배당주 데이터 수집 → GitHub 커밋 → 자동 재배포

const GITHUB_REPO = 'hansungshowcase/nohu-lab'
const FILE_PATH = 'components/programs/dividend/krDividendData.json'

export async function GET() {
  const startTime = Date.now()

  try {
    // 1단계: 코스피+코스닥 전체 종목 목록 수집
    const allTickers: string[] = []

    for (const market of ['KOSPI', 'KOSDAQ']) {
      for (let page = 1; page <= 50; page++) {
        try {
          const res = await fetch(
            `https://m.stock.naver.com/api/stocks/marketValue/${market}?page=${page}&pageSize=100`,
            { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' }, signal: AbortSignal.timeout(5000) }
          )
          if (!res.ok) break
          const data = await res.json()
          const stocks = data.stocks || []
          stocks.forEach((s: { itemCode: string }) => allTickers.push(s.itemCode))
          if (stocks.length < 100) break
        } catch { break }
      }
    }

    if (allTickers.length < 100) {
      return NextResponse.json({ success: false, error: 'Too few tickers: ' + allTickers.length })
    }

    // 2단계: 배당수익률 조회 (상위 500개만 - 타임아웃 방지)
    const dividendStocks: Array<{
      ticker: string; name: string; price: number
      yieldPct: number; dividendPerShare: number
    }> = []

    for (let i = 0; i < Math.min(allTickers.length, 500); i += 20) {
      const batch = allTickers.slice(i, i + 20)
      const results = await Promise.allSettled(
        batch.map((ticker) =>
          fetch(`https://m.stock.naver.com/api/stock/${ticker}/integration`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(3000),
          })
            .then((r) => r.json())
            .then((d) => {
              let yieldPct = 0, dps = 0
              for (const info of (d.totalInfos || [])) {
                if (info.key === '배당수익률') yieldPct = parseFloat(info.value) || 0
                if (info.key === '주당배당금') dps = parseInt((info.value || '0').replace(/,/g, ''), 10) || 0
              }
              return { ticker, name: d.stockName || '', yieldPct, dividendPerShare: dps }
            })
        )
      )
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value && r.value.yieldPct > 0) {
          dividendStocks.push({ ...r.value, price: 0 })
        }
      }
    }

    // 3단계: 시세 조회
    for (let i = 0; i < dividendStocks.length; i += 20) {
      const batch = dividendStocks.slice(i, i + 20)
      const results = await Promise.allSettled(
        batch.map((s) =>
          fetch(`https://m.stock.naver.com/api/stock/${s.ticker}/basic`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(3000),
          })
            .then((r) => r.json())
            .then((d) => ({
              ticker: s.ticker,
              price: parseInt((d.closePrice || '0').replace(/,/g, ''), 10),
            }))
        )
      )
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value && r.value.price > 0) {
          const idx = dividendStocks.findIndex((x) => x.ticker === r.value!.ticker)
          if (idx >= 0) dividendStocks[idx].price = r.value.price
        }
      }
    }

    const valid = dividendStocks
      .filter((s) => s.price > 0 && s.yieldPct > 0 && s.yieldPct < 50)
      .sort((a, b) => b.yieldPct - a.yieldPct)

    if (valid.length < 50) {
      return NextResponse.json({ success: false, error: 'Too few valid stocks: ' + valid.length })
    }

    // 4단계: GitHub에 커밋 (자동 재배포 트리거)
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      return NextResponse.json({ success: false, error: 'No GITHUB_TOKEN', count: valid.length })
    }

    // 현재 파일 SHA 가져오기
    const shaRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' },
    })
    const shaData = await shaRes.json()
    const currentSha = shaData.sha

    // 파일 업데이트
    const newContent = Buffer.from(JSON.stringify(valid)).toString('base64')
    const commitRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `chore: auto-update dividend data (${valid.length} stocks)`,
        content: newContent,
        sha: currentSha,
        committer: { name: 'hansungshowcase', email: 'hansungshowcase@users.noreply.github.com' },
      }),
    })

    const commitData = await commitRes.json()
    const elapsed = Math.round((Date.now() - startTime) / 1000)

    return NextResponse.json({
      success: commitRes.ok,
      refreshedAt: new Date().toISOString(),
      elapsed: elapsed + 's',
      tickers: allTickers.length,
      dividendStocks: valid.length,
      commitSha: commitData.commit?.sha?.slice(0, 7) || 'failed',
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: String(e),
      elapsed: Math.round((Date.now() - startTime) / 1000) + 's',
    }, { status: 500 })
  }
}

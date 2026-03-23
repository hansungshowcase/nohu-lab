import { NextResponse } from 'next/server'

// Vercel Cron Job: 매일 한국시간 오전 10시
// 기존 JSON 데이터의 시세만 업데이트 → GitHub 커밋 → 자동 재배포

const GITHUB_REPO = 'hansungshowcase/nohu-lab'
const KR_FILE = 'components/programs/dividend/krDividendData.json'
const US_FILE = 'components/programs/dividend/usDividendData.json'

export async function GET() {
  const startTime = Date.now()

  try {
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      return NextResponse.json({ success: false, error: 'No GITHUB_TOKEN' })
    }

    // 1. GitHub에서 현재 국내 JSON 가져오기
    const krFileRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${KR_FILE}`, {
      headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' },
    })
    const krFileData = await krFileRes.json()
    const krStocks = JSON.parse(Buffer.from(krFileData.content, 'base64').toString('utf8'))

    // 2. 상위 200개 시세 업데이트 (네이버)
    let updated = 0
    for (let i = 0; i < Math.min(krStocks.length, 200); i += 20) {
      const batch = krStocks.slice(i, i + 20)
      const results = await Promise.allSettled(
        batch.map((s: { ticker: string }) =>
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
          const idx = krStocks.findIndex((x: { ticker: string }) => x.ticker === r.value!.ticker)
          if (idx >= 0 && krStocks[idx].dividendPerShare > 0) {
            krStocks[idx].price = r.value.price
            krStocks[idx].yieldPct = Math.round((krStocks[idx].dividendPerShare / r.value.price) * 1000) / 10
            updated++
          }
        }
      }
    }

    // 3. GitHub에 커밋
    const newContent = Buffer.from(JSON.stringify(krStocks)).toString('base64')
    const commitRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${KR_FILE}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `chore: update KR stock prices (${updated} updated)`,
        content: newContent,
        sha: krFileData.sha,
        committer: { name: 'hansungshowcase', email: 'hansungshowcase@users.noreply.github.com' },
      }),
    })

    const elapsed = Math.round((Date.now() - startTime) / 1000)

    return NextResponse.json({
      success: commitRes.ok,
      refreshedAt: new Date().toISOString(),
      elapsed: elapsed + 's',
      krTotal: krStocks.length,
      pricesUpdated: updated,
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: String(e),
      elapsed: Math.round((Date.now() - startTime) / 1000) + 's',
    }, { status: 500 })
  }
}

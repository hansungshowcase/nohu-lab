import { NextResponse } from 'next/server'

// 배당주 정보 API
// GET /api/dividend?market=kr    → 국내 배당주 (하드코딩 + 네이버 실시간 시세)
// GET /api/dividend?market=us    → 미국 배당주 전체 (Yahoo Finance 실시간)
// GET /api/dividend?market=us&offset=0&limit=100 → 페이징

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const market = searchParams.get('market') || 'kr'

  try {
    if (market === 'kr') {
      return await fetchKrDividends()
    } else {
      return await fetchAllUsDividends()
    }
  } catch (e) {
    return NextResponse.json({ error: 'fetch failed', detail: String(e) }, { status: 500 })
  }
}

// ══════════════════════════════════════
// 미국 배당주 - Yahoo Finance (전체 실시간)
// ══════════════════════════════════════

// 미국 배당주 전체 로드 (250개씩 병렬)
async function fetchAllUsDividends() {
  // 1차: 첫 페이지로 total 파악
  const first = await fetchUsPage(0, 250)
  if (!first) {
    return NextResponse.json({
      market: 'us', total: usHardcoded.length, count: usHardcoded.length,
      updatedAt: new Date().toISOString(), source: 'hardcoded', stocks: usHardcoded,
    }, { headers: { 'Cache-Control': 'public, s-maxage=300' } })
  }

  const allStocks: Record<string, unknown>[] = [...first.stocks]
  const total = first.total

  // 2차: 나머지 페이지 병렬 호출
  if (total > 250) {
    const pages: number[] = []
    for (let offset = 250; offset < total; offset += 250) {
      pages.push(offset)
    }
    const results = await Promise.allSettled(
      pages.map((offset) => fetchUsPage(offset, 250))
    )
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        allStocks.push(...r.value.stocks)
      }
    }
  }

  // 중복 제거 (ticker 기준)
  const seen = new Set<string>()
  const uniqueStocks = allStocks.filter((s) => {
    const ticker = (s as { ticker: string }).ticker
    if (seen.has(ticker)) return false
    seen.add(ticker)
    return true
  })

  if (uniqueStocks.length === 0) {
    // 전체 실패 시 폴백
    return NextResponse.json({
      market: 'us', total: usHardcoded.length, count: usHardcoded.length,
      updatedAt: new Date().toISOString(), source: 'hardcoded', stocks: usHardcoded,
    }, { headers: { 'Cache-Control': 'public, s-maxage=300' } })
  }

  return NextResponse.json({
    market: 'us', total, count: uniqueStocks.length,
    updatedAt: new Date().toISOString(), source: 'yahoo',
    stocks: uniqueStocks,
  }, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' } })
}

async function fetchUsPage(offset: number, limit: number): Promise<{ total: number; stocks: Record<string, unknown>[] } | null> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=high_dividend_yield&count=${limit}&offset=${offset}`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(8000),
    }
  )

  if (!res.ok) return null

  const data = await res.json()
  const result = data?.finance?.result?.[0]
  if (!result || !result.quotes) return null

  const stocks = (result.quotes as Record<string, unknown>[]).map((q) => ({
    ticker: q.symbol || '',
    name: (q.longName || q.shortName || '') as string,
    price: Math.round(((q.regularMarketPrice as number) || 0) * 1400),
    priceUsd: (q.regularMarketPrice as number) || 0,
    sector: (q.sector || guessSectorFromName((q.longName || q.shortName || '') as string)) as string,
    industry: (q.industry || '') as string,
    yieldPct: Math.round(((q.dividendYield as number) || 0) * 100) / 100,
    dividendRate: (q.dividendRate as number) || (q.trailingAnnualDividendRate as number) || 0,
    frequency: guessUsFrequency((q.dividendRate as number) || 0, (q.trailingAnnualDividendRate as number) || 0, (q.symbol as string) || ''),
    marketCap: (q.marketCap as number) || 0,
    change: (q.regularMarketChangePercent as number) || 0,
  })).filter((s: { yieldPct: number }) => s.yieldPct > 0)

  return { total: result.total || 0, stocks }
}

// 미국 주식 배당 주기 추정
function guessUsFrequency(rate: number, trailing: number, ticker: string): string {
  // 월배당 ETF 목록
  const monthlyTickers = ['JEPI','JEPQ','QYLD','XYLD','RYLD','DIVO','O','MAIN','STAG','AGNC','NLY','PSEC','CLM','GOF','PDI','PCI','USOI','SVOL','KLIP','CONY','TSLY','NVDY','AMZY','MSTY']
  if (monthlyTickers.includes(ticker)) return '월배당'
  // 대부분 미국 주식은 분기배당
  return '분기배당'
}

function guessSectorFromName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('bank') || n.includes('financial') || n.includes('capital') || n.includes('invest')) return '금융'
  if (n.includes('energy') || n.includes('oil') || n.includes('petrol') || n.includes('gas')) return '에너지'
  if (n.includes('pharma') || n.includes('health') || n.includes('medical') || n.includes('bio')) return '헬스케어'
  if (n.includes('tech') || n.includes('software') || n.includes('semi')) return 'IT'
  if (n.includes('realty') || n.includes('reit') || n.includes('property')) return '리츠'
  if (n.includes('telecom') || n.includes('comm')) return '통신'
  if (n.includes('util')) return '유틸리티'
  if (n.includes('consumer') || n.includes('food') || n.includes('beverage')) return '필수소비재'
  return '기타'
}

// 미국 하드코딩 폴백
const usHardcoded = [
  { ticker: 'JEPI', name: 'JP모건 Equity Premium Income', price: 77000, priceUsd: 55, sector: 'ETF', industry: 'ETF', yieldPct: 7.2, dividendRate: 3.96, frequency: '월배당', marketCap: 0, change: 0 },
  { ticker: 'JEPQ', name: 'JP모건 Nasdaq Equity Premium', price: 74000, priceUsd: 53, sector: 'ETF', industry: 'ETF', yieldPct: 9.1, dividendRate: 4.82, frequency: '월배당', marketCap: 0, change: 0 },
  { ticker: 'SCHD', name: 'Schwab US Dividend Equity', price: 37000, priceUsd: 26.5, sector: 'ETF', industry: 'ETF', yieldPct: 3.5, dividendRate: 0.93, frequency: '분기배당', marketCap: 0, change: 0 },
  { ticker: 'VYM', name: 'Vanguard High Dividend Yield', price: 56000, priceUsd: 40, sector: 'ETF', industry: 'ETF', yieldPct: 2.8, dividendRate: 1.12, frequency: '분기배당', marketCap: 0, change: 0 },
  { ticker: 'QYLD', name: 'Global X NASDAQ 100 CC', price: 24000, priceUsd: 17, sector: 'ETF', industry: 'ETF', yieldPct: 11.5, dividendRate: 1.96, frequency: '월배당', marketCap: 0, change: 0 },
  { ticker: 'O', name: '리얼티인컴', price: 80000, priceUsd: 57, sector: '리츠', industry: 'REIT', yieldPct: 5.5, dividendRate: 3.14, frequency: '월배당', marketCap: 0, change: 0 },
  { ticker: 'KO', name: '코카콜라', price: 89000, priceUsd: 63.5, sector: '필수소비재', industry: 'Beverages', yieldPct: 3.0, dividendRate: 1.94, frequency: '분기배당', marketCap: 0, change: 0 },
  { ticker: 'JNJ', name: '존슨앤존슨', price: 220000, priceUsd: 157, sector: '헬스케어', industry: 'Drug Manufacturers', yieldPct: 3.2, dividendRate: 5.04, frequency: '분기배당', marketCap: 0, change: 0 },
  { ticker: 'MO', name: '알트리아', price: 78000, priceUsd: 55.7, sector: '필수소비재', industry: 'Tobacco', yieldPct: 7.8, dividendRate: 4.08, frequency: '분기배당', marketCap: 0, change: 0 },
  { ticker: 'T', name: 'AT&T', price: 39000, priceUsd: 27.8, sector: '통신', industry: 'Telecom', yieldPct: 5.1, dividendRate: 1.11, frequency: '분기배당', marketCap: 0, change: 0 },
]

// ══════════════════════════════════════
// 국내 배당주 (하드코딩 + 네이버 실시간)
// ══════════════════════════════════════

type KrStock = {
  ticker: string; name: string; price: number; sector: string
  yieldPct: number; dividendPerShare: number; frequency: string; desc: string
}

async function fetchKrDividends() {
  // 1단계: 공공데이터포털에서 최신 배당 데이터 가져오기
  let apiStocks = await fetchDataGoKrDividends()

  // 2단계: API 실패 시 하드코딩 폴백
  if (apiStocks.length < 10) {
    apiStocks = getKrHardcodedStocks()
  }

  // 3단계: 네이버 실시간 시세 + 배당수익률 계산
  const liveStocks = await updateNaverPrices(apiStocks)

  return NextResponse.json({
    market: 'kr',
    total: liveStocks.length,
    count: liveStocks.length,
    updatedAt: new Date().toISOString(),
    source: apiStocks.length > 50 ? 'api+naver' : 'hardcoded+naver',
    stocks: liveStocks.sort((a, b) => b.yieldPct - a.yieldPct),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150' },
  })
}

// 공공데이터포털 금융위원회 주식배당정보 → 최신 배당 기업 추출
async function fetchDataGoKrDividends(): Promise<KrStock[]> {
  try {
    // 69,771건 / 500건 = ~140페이지. 2024년 데이터는 100~140페이지에 분포
    const pagesToFetch: number[] = []
    for (let p = 100; p <= 140; p++) pagesToFetch.push(p)

    const results = await Promise.allSettled(
      pagesToFetch.map((page) =>
        fetch(
          `http://apis.data.go.kr/1160100/service/GetStocDiviInfoService/getDiviInfo?serviceKey=${DATA_GO_KR_KEY}&numOfRows=500&resultType=json&pageNo=${page}`,
          { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(7000) }
        ).then((r) => r.json())
      )
    )

    // 2024년 이후 + 배당금 > 0 필터
    const companyMap = new Map<string, KrStock>()

    for (const r of results) {
      if (r.status !== 'fulfilled') continue
      const items = r.value?.response?.body?.items?.item
      if (!Array.isArray(items)) continue

      for (const item of items) {
        const baseDt = item.dvdnBasDt || ''
        if (baseDt < '20240101') continue

        const dps = parseInt(item.stckGenrDvdnAmt || '0', 10)
        if (dps <= 0) continue

        const isin = item.isinCd || ''
        const ticker = isin.slice(4, 10)
        if (!ticker || ticker.length < 6) continue
        if (item.scrsItmsKcdNm && item.scrsItmsKcdNm !== '보통주') continue

        const name = item.stckIssuCmpyNm || ''

        // 배당 주기 판별: 같은 기업이 여러 번 나오면 분기/반기 배당
        if (companyMap.has(ticker)) {
          const existing = companyMap.get(ticker)!
          existing.dividendPerShare += dps
          const count = parseInt(existing.desc.split(':')[1] || '1', 10) + 1
          existing.desc = 'count:' + count
          if (count >= 4) existing.frequency = '분기배당'
          else if (count >= 2) existing.frequency = '반기배당'
        } else {
          companyMap.set(ticker, {
            ticker,
            name,
            price: 0,
            sector: guessSector(name),
            yieldPct: 0,
            dividendPerShare: dps,
            frequency: '연배당',
            desc: 'count:1',
          })
        }
      }
    }

    // desc 정리
    const stocks = Array.from(companyMap.values())
    stocks.forEach((s) => {
      const count = parseInt(s.desc.split(':')[1] || '1', 10)
      s.desc = count >= 4 ? '연 ' + count + '회 배당' : count >= 2 ? '연 ' + count + '회 배당' : ''
    })

    return stocks
  } catch {
    return []
  }
}

function guessSector(name: string): string {
  if (name.includes('금융') || name.includes('은행') || name.includes('보험') || name.includes('증권') || name.includes('캐피탈')) return '금융'
  if (name.includes('통신') || name.includes('텔레콤') || name.includes('SK텔')) return '통신'
  if (name.includes('전력') || name.includes('가스') || name.includes('에너지') || name.includes('Oil') || name.includes('석유')) return '에너지'
  if (name.includes('건설')) return '건설'
  if (name.includes('리츠') || name.includes('인프라')) return '리츠'
  if (name.includes('KODEX') || name.includes('TIGER') || name.includes('ACE') || name.includes('SOL') || name.includes('PLUS') || name.includes('RISE')) return 'ETF'
  if (name.includes('전자') || name.includes('하이닉') || name.includes('네이버') || name.includes('카카오')) return 'IT'
  if (name.includes('화학') || name.includes('철강') || name.includes('아연')) return '소재'
  if (name.includes('자동차') || name.includes('기아') || name.includes('현대차')) return '자동차'
  if (name.includes('제약') || name.includes('바이오') || name.includes('약품')) return '제약'
  if (name.includes('식품') || name.includes('음료')) return '식품'
  return '기타'
}

async function updateNaverPrices(stocks: KrStock[]): Promise<KrStock[]> {
  const updated = stocks.map(s => ({ ...s }))
  const targets = updated.filter(s => /^\d{6}$/.test(s.ticker))

  for (let i = 0; i < targets.length && i < 200; i += 20) {
    const batch = targets.slice(i, i + 20)
    await Promise.allSettled(
      batch.map(async (s) => {
        try {
          const res = await fetch(`https://m.stock.naver.com/api/stock/${s.ticker}/basic`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' },
            signal: AbortSignal.timeout(5000),
          })
          if (!res.ok) return
          const data = await res.json()
          const price = parseInt((data.closePrice || '0').replace(/,/g, ''), 10)
          if (price > 0) {
            const idx = updated.findIndex(u => u.ticker === s.ticker)
            if (idx >= 0) {
              updated[idx].price = price
              updated[idx].name = updated[idx].name || data.stockName || ''
              if (updated[idx].dividendPerShare > 0) {
                updated[idx].yieldPct = Math.round((updated[idx].dividendPerShare / price) * 1000) / 10
              }
            }
          }
        } catch { /* silent */ }
      })
    )
  }

  return updated.filter(s => s.price > 0 && s.yieldPct > 0)
}

function getKrHardcodedStocks(): KrStock[] {
  return [
    // ── 금융 ──
    { ticker: '086790', name: '하나금융지주', price: 68000, sector: '금융', yieldPct: 6.8, dividendPerShare: 4600, frequency: '분기배당', desc: '4대 금융지주' },
    { ticker: '105560', name: 'KB금융', price: 95000, sector: '금융', yieldPct: 5.3, dividendPerShare: 5000, frequency: '분기배당', desc: '국내 최대 금융지주' },
    { ticker: '055550', name: '신한지주', price: 58000, sector: '금융', yieldPct: 5.2, dividendPerShare: 3000, frequency: '분기배당', desc: '4대 금융지주' },
    { ticker: '316140', name: '우리금융지주', price: 17000, sector: '금융', yieldPct: 6.4, dividendPerShare: 1080, frequency: '분기배당', desc: '높은 배당수익률' },
    { ticker: '024110', name: '기업은행', price: 15000, sector: '금융', yieldPct: 7.3, dividendPerShare: 1095, frequency: '분기배당', desc: '중소기업 전문은행' },
    { ticker: '138930', name: 'BNK금융지주', price: 9500, sector: '금융', yieldPct: 6.5, dividendPerShare: 620, frequency: '분기배당', desc: '부산·경남 금융지주' },
    { ticker: '139130', name: 'DGB금융지주', price: 10000, sector: '금융', yieldPct: 6.0, dividendPerShare: 600, frequency: '분기배당', desc: '대구·경북 금융지주' },
    { ticker: '175330', name: 'JB금융지주', price: 14000, sector: '금융', yieldPct: 6.2, dividendPerShare: 870, frequency: '분기배당', desc: '전북·광주 금융지주' },
    { ticker: '000810', name: '삼성화재', price: 390000, sector: '금융', yieldPct: 4.1, dividendPerShare: 16000, frequency: '반기배당', desc: '국내 1위 손해보험' },
    { ticker: '005830', name: 'DB손해보험', price: 115000, sector: '금융', yieldPct: 4.8, dividendPerShare: 5500, frequency: '연배당', desc: '높은 배당성향' },
    { ticker: '003540', name: '대신증권', price: 18000, sector: '금융', yieldPct: 5.6, dividendPerShare: 1000, frequency: '연배당', desc: '증권사 고배당' },
    // ── 통신 ──
    { ticker: '017670', name: 'SK텔레콤', price: 60000, sector: '통신', yieldPct: 5.9, dividendPerShare: 3540, frequency: '분기배당', desc: '국내 통신 1위' },
    { ticker: '030200', name: 'KT', price: 44000, sector: '통신', yieldPct: 4.5, dividendPerShare: 2000, frequency: '반기배당', desc: '유무선 통신' },
    { ticker: '032640', name: 'LG유플러스', price: 12000, sector: '통신', yieldPct: 5.4, dividendPerShare: 650, frequency: '연배당', desc: '3위 통신사' },
    // ── 에너지 ──
    { ticker: '010950', name: 'S-Oil', price: 65000, sector: '에너지', yieldPct: 6.9, dividendPerShare: 4500, frequency: '분기배당', desc: '아람코 자회사' },
    { ticker: '015760', name: '한국전력', price: 23000, sector: '에너지', yieldPct: 4.3, dividendPerShare: 1000, frequency: '연배당', desc: '유일 전력공급' },
    { ticker: '078930', name: 'GS', price: 48000, sector: '에너지', yieldPct: 5.0, dividendPerShare: 2400, frequency: '반기배당', desc: 'GS그룹 지주' },
    { ticker: '267250', name: 'HD현대', price: 75000, sector: '에너지', yieldPct: 4.0, dividendPerShare: 3000, frequency: '반기배당', desc: 'HD현대 지주' },
    // ── IT ──
    { ticker: '005930', name: '삼성전자', price: 72000, sector: 'IT', yieldPct: 2.0, dividendPerShare: 1444, frequency: '분기배당', desc: '세계 1위 반도체' },
    { ticker: '000660', name: 'SK하이닉스', price: 200000, sector: 'IT', yieldPct: 1.1, dividendPerShare: 2200, frequency: '분기배당', desc: '메모리 반도체 2위' },
    // ── 소재 ──
    { ticker: '005490', name: 'POSCO홀딩스', price: 310000, sector: '소재', yieldPct: 3.9, dividendPerShare: 12000, frequency: '반기배당', desc: '세계적 철강기업' },
    { ticker: '051910', name: 'LG화학', price: 280000, sector: '소재', yieldPct: 2.5, dividendPerShare: 7000, frequency: '연배당', desc: '화학·2차전지' },
    // ── 자동차 ──
    { ticker: '005380', name: '현대차', price: 230000, sector: '자동차', yieldPct: 4.3, dividendPerShare: 10000, frequency: '반기배당', desc: '글로벌 자동차 3위' },
    { ticker: '000270', name: '기아', price: 130000, sector: '자동차', yieldPct: 4.6, dividendPerShare: 6000, frequency: '반기배당', desc: '글로벌 자동차 7위' },
    // ── 필수소비재 ──
    { ticker: '033780', name: 'KT&G', price: 110000, sector: '필수소비재', yieldPct: 5.5, dividendPerShare: 6000, frequency: '분기배당', desc: '담배·인삼 대표' },
    // ── 유통 ──
    { ticker: '004170', name: '신세계', price: 180000, sector: '유통', yieldPct: 3.3, dividendPerShare: 6000, frequency: '반기배당', desc: '백화점' },
    { ticker: '069960', name: '현대백화점', price: 55000, sector: '유통', yieldPct: 3.6, dividendPerShare: 2000, frequency: '반기배당', desc: '프리미엄 백화점' },
    // ── 건설·리츠 ──
    { ticker: '000720', name: '현대건설', price: 35000, sector: '건설', yieldPct: 3.4, dividendPerShare: 1200, frequency: '연배당', desc: '국내 1위 건설' },
    { ticker: '293940', name: '신한알파리츠', price: 6500, sector: '리츠', yieldPct: 6.0, dividendPerShare: 390, frequency: '반기배당', desc: '오피스 리츠' },
    // ── ETF ──
    { ticker: '279530', name: 'KODEX 고배당', price: 12000, sector: 'ETF', yieldPct: 4.5, dividendPerShare: 540, frequency: '분기배당', desc: '국내 고배당 30종목' },
    { ticker: '466940', name: 'TIGER 은행고배당플러스TOP10', price: 12500, sector: 'ETF', yieldPct: 6.0, dividendPerShare: 750, frequency: '월배당', desc: '은행 고배당 10종목' },
    { ticker: '458250', name: 'KODEX 주주환원고배당주', price: 11000, sector: 'ETF', yieldPct: 5.0, dividendPerShare: 550, frequency: '월배당', desc: '주주환원 고배당주' },
    { ticker: '161510', name: 'TIGER 코스피고배당', price: 12500, sector: 'ETF', yieldPct: 4.2, dividendPerShare: 525, frequency: '분기배당', desc: '코스피 고배당 지수' },
    { ticker: '329200', name: 'TIGER 미국배당다우존스', price: 13000, sector: 'ETF', yieldPct: 3.5, dividendPerShare: 455, frequency: '월배당', desc: 'SCHD 추종' },
    { ticker: '446720', name: 'ACE 미국배당다우존스', price: 12800, sector: 'ETF', yieldPct: 3.4, dividendPerShare: 435, frequency: '월배당', desc: 'SCHD 추종' },
    { ticker: '456600', name: 'KODEX 미국배당프리미엄액티브', price: 10500, sector: 'ETF', yieldPct: 7.5, dividendPerShare: 788, frequency: '월배당', desc: '미국 배당+커버드콜' },
    { ticker: '441800', name: 'TIGER 미국나스닥100커버드콜', price: 11000, sector: 'ETF', yieldPct: 8.5, dividendPerShare: 935, frequency: '월배당', desc: 'JEPQ 추종' },
    { ticker: '088980', name: '맥쿼리인프라', price: 13000, sector: 'ETF', yieldPct: 6.0, dividendPerShare: 780, frequency: '반기배당', desc: '인프라 펀드' },
    { ticker: '395400', name: 'SK리츠', price: 4200, sector: 'ETF', yieldPct: 6.0, dividendPerShare: 252, frequency: '분기배당', desc: 'SK 오피스 리츠' },
  ]
}

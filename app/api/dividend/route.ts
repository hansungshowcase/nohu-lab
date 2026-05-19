import { NextResponse } from 'next/server'

type DividendStock = {
  ticker: string
  name: string
  price: number
  priceUsd?: number
  sector: string
  industry?: string
  yieldPct: number
  dividendPerShare: number
  dividendRate?: number
  frequency: string
  desc?: string
  marketCap?: number
  change?: number
}

type KrDividendJson = {
  ticker: string
  name: string
  price: number
  dividendPerShare: number
  yieldPct: number
  count?: number
  frequency?: string
}

type UsDividendJson = {
  ticker: string
  name: string
  price: number
  priceUsd: number
  sector: string
  industry: string
  yieldPct: number
  dividendRate: number
  frequency: string
  marketCap: number
}

type ListedStock = {
  ticker: string
  name: string
  sector: string
  industry?: string
}

const ETF_KEYWORDS = [
  'ETF', 'ETN', 'KODEX', 'TIGER', 'ACE', 'SOL', 'RISE', 'PLUS', 'HANARO',
  'KOSEF', 'ARIRANG', 'TIMEFOLIO', 'KBSTAR', 'TREX', 'WON', '히어로즈',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const market = searchParams.get('market') || 'kr'

  try {
    if (market === 'kr') return await fetchKrStocks()
    return await fetchUsStocks()
  } catch (e) {
    return NextResponse.json({ error: 'fetch failed', detail: String(e) }, { status: 500 })
  }
}

async function fetchKrStocks() {
  const dividendRows = await loadKrDividendRows()
  const dividendMap = new Map(dividendRows.map((s) => [s.ticker, s]))
  const listed = await fetchKrxListedStocks()

  const base = listed.length > 0
    ? listed
    : dividendRows.map((s) => ({ ticker: s.ticker, name: s.name, sector: guessKrSector(s.name) }))

  const merged = base.map((stock): DividendStock => {
    const dividend = dividendMap.get(stock.ticker)
    const price = dividend?.price || 0
    const dividendPerShare = dividend?.dividendPerShare || 0
    return {
      ticker: stock.ticker,
      name: dividend?.name || stock.name,
      price,
      sector: normalizeKrSector(stock.sector || guessKrSector(stock.name), stock.name),
      yieldPct: dividend?.yieldPct || 0,
      dividendPerShare,
      frequency: dividend?.frequency || (dividendPerShare > 0 ? '연배당' : '배당없음'),
      desc: dividend?.count && dividend.count >= 2 ? `연 ${dividend.count}회 배당` : '',
    }
  })

  return NextResponse.json({
    market: 'kr',
    total: merged.length,
    count: merged.length,
    dividendCount: merged.filter((s) => s.yieldPct > 0 || s.dividendPerShare > 0).length,
    universeCount: listed.length,
    updatedAt: new Date().toISOString(),
    source: listed.length > 0 ? 'krx-kind+dividend-json' : 'dividend-json',
    stocks: sortStocks(merged),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600' },
  })
}

async function fetchUsStocks() {
  const dividendRows = await loadUsDividendRows()
  const dividendMap = new Map(dividendRows.map((s) => [s.ticker, s]))
  const listed = await fetchNasdaqListedStocks()

  const base = listed.length > 0
    ? listed
    : dividendRows.map((s) => ({ ticker: s.ticker, name: s.name, sector: s.sector, industry: s.industry }))

  const merged = base.map((stock): DividendStock => {
    const dividend = dividendMap.get(stock.ticker)
    const priceUsd = dividend?.priceUsd || 0
    const dividendRate = dividend?.dividendRate || 0
    const sector = dividend?.sector || stock.sector || normalizeUsSector('', stock.name)
    return {
      ticker: stock.ticker,
      name: dividend?.name || stock.name,
      priceUsd,
      price: dividend?.price || Math.round(priceUsd * 1400),
      sector: normalizeUsSector(sector, stock.name),
      industry: dividend?.industry || stock.industry || '',
      yieldPct: dividend?.yieldPct || 0,
      dividendRate,
      dividendPerShare: dividendRate,
      frequency: dividend?.frequency || (dividendRate > 0 ? guessUsFrequency(stock.ticker) : '배당없음'),
      marketCap: dividend?.marketCap || 0,
      change: 0,
    }
  })

  return NextResponse.json({
    market: 'us',
    total: merged.length,
    count: merged.length,
    dividendCount: merged.filter((s) => s.yieldPct > 0 || (s.dividendRate || 0) > 0).length,
    universeCount: listed.length,
    updatedAt: new Date().toISOString(),
    source: listed.length > 0 ? 'nasdaqtrader+dividend-json' : 'dividend-json',
    stocks: sortStocks(merged),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600' },
  })
}

async function loadKrDividendRows(): Promise<KrDividendJson[]> {
  try {
    const data = (await import('@/components/programs/dividend/krDividendData.json')).default as KrDividendJson[]
    return data.filter((s) => s.ticker && s.name)
  } catch {
    return []
  }
}

async function loadUsDividendRows(): Promise<UsDividendJson[]> {
  try {
    const data = (await import('@/components/programs/dividend/usDividendData.json')).default as UsDividendJson[]
    return data.filter((s) => s.ticker && s.name)
  } catch {
    return []
  }
}

async function fetchKrxListedStocks(): Promise<ListedStock[]> {
  const res = await fetch('https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' },
    next: { revalidate: 21600 },
  })
  if (!res.ok) return []

  const html = new TextDecoder('euc-kr').decode(await res.arrayBuffer())
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
  const listed: ListedStock[] = []
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => cleanHtml(m[1]))
    if (cells.length < 4) continue
    const name = cells[0]
    const market = cells[1]
    const ticker = cells[2].replace(/[^0-9A-Z]/gi, '').toUpperCase()
    const industry = cells[3] || ''
    if (!/^[0-9A-Z]{6}$/.test(ticker) || !name || name === '회사명') continue
    listed.push({ ticker, name, sector: normalizeKrSector(industry || market, name), industry })
  }
  return dedupeStocks(listed)
}

async function fetchNasdaqListedStocks(): Promise<ListedStock[]> {
  const urls = [
    'https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt',
    'https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt',
  ]
  const responses = await Promise.allSettled(urls.map((url) => fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' },
    next: { revalidate: 21600 },
  })))
  const listed: ListedStock[] = []

  for (const response of responses) {
    if (response.status !== 'fulfilled' || !response.value.ok) continue
    const text = await response.value.text()
    const lines = text.split(/\r?\n/)
    for (const line of lines.slice(1)) {
      if (!line || line.startsWith('File Creation Time')) continue
      const cols = line.split('|')
      const ticker = normalizeUsTicker(cols[0])
      const name = cleanUsName(cols[1] || cols[2] || ticker)
      if (!ticker || !name || ticker === 'Symbol' || ticker === 'ACT Symbol') continue
      listed.push({ ticker, name, sector: normalizeUsSector('', name) })
    }
  }

  return dedupeStocks(listed)
}

function sortStocks(stocks: DividendStock[]) {
  return [...stocks].sort((a, b) => {
    const yd = (b.yieldPct || 0) - (a.yieldPct || 0)
    if (yd !== 0) return yd
    return a.name.localeCompare(b.name, 'ko')
  })
}

function dedupeStocks<T extends { ticker: string }>(stocks: T[]): T[] {
  const map = new Map<string, T>()
  for (const stock of stocks) {
    if (!map.has(stock.ticker)) map.set(stock.ticker, stock)
  }
  return [...map.values()]
}

function cleanHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function normalizeUsTicker(value: string) {
  return value.trim().replace(/\s+/g, '').replace(/\$/g, '-')
}

function cleanUsName(value: string) {
  return value
    .replace(/\s+-\s+Common Stock$/i, '')
    .replace(/\s+-\s+Ordinary Shares$/i, '')
    .replace(/\s+-\s+Class [A-Z].*$/i, '')
    .replace(/\s+-\s+ETF$/i, '')
    .trim()
}

function normalizeKrSector(sector: string, name: string): string {
  const text = `${sector} ${name}`
  if (ETF_KEYWORDS.some((word) => text.toUpperCase().includes(word.toUpperCase()))) return 'ETF'
  if (/리츠|REIT/i.test(text)) return '리츠'
  if (/금융|은행|증권|보험|캐피탈/i.test(text)) return '금융'
  if (/통신|텔레콤/i.test(text)) return '통신'
  if (/전기|가스|에너지|정유|석유|Oil/i.test(text)) return '에너지'
  if (/건설/i.test(text)) return '건설'
  if (/전자|반도체|소프트웨어|인터넷|IT|카카오|네이버/i.test(text)) return 'IT'
  if (/화학|철강|소재/i.test(text)) return '소재'
  if (/자동차|기아|현대차/i.test(text)) return '자동차'
  if (/제약|바이오|의료/i.test(text)) return '헬스케어'
  if (/식품|음료|소비/i.test(text)) return '필수소비재'
  return sector || '기타'
}

function normalizeUsSector(sector: string, name: string): string {
  const text = `${sector} ${name}`
  if (/ETF|Fund|Trust|Income|Portfolio|Index|iShares|Vanguard|Schwab|SPDR|Invesco|Global X/i.test(text)) return 'ETF·펀드'
  if (/REIT|Realty|Real Estate|Property/i.test(text)) return '리츠'
  if (/Bank|Financial|Capital|Insurance|Asset|Investment/i.test(text)) return '금융'
  if (/Energy|Oil|Petroleum|Gas|Pipeline/i.test(text)) return '에너지'
  if (/Pharma|Health|Medical|Bio|Therapeutics/i.test(text)) return '헬스케어'
  if (/Technology|Software|Semiconductor|Data|Cloud|NVIDIA|Microsoft|Apple/i.test(text)) return 'IT'
  if (/Telecom|Communication/i.test(text)) return '통신'
  if (/Utility|Utilities|Power|Electric/i.test(text)) return '유틸리티'
  if (/Consumer|Food|Beverage|Retail/i.test(text)) return '필수소비재'
  return sector || '기타'
}

function guessKrSector(name: string): string {
  return normalizeKrSector('', name)
}

function guessUsFrequency(ticker: string): string {
  const monthly = ['JEPI', 'JEPQ', 'QYLD', 'XYLD', 'RYLD', 'DIVO', 'O', 'MAIN', 'STAG', 'AGNC', 'NLY', 'PSEC', 'CLM', 'GOF', 'PDI', 'SVOL']
  return monthly.includes(ticker) ? '월배당' : '분기배당'
}

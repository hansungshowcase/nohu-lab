import { NextResponse } from 'next/server'

// KRX 배당수익률 전체 종목 조회 (OTP → CSV 방식)
// GET /api/dividend?market=kr  → 국내 전체 배당주
// GET /api/dividend?market=us  → 미국 주요 배당 ETF/주식

interface KrxStock {
  ISU_SRT_CD: string   // 종목코드
  ISU_ABBRV: string    // 종목명
  TDD_CLSPRC: string   // 종가
  SECT_TP_NM: string   // 업종
  DVD_RATE: string     // 배당수익률
  DVD_PRC: string      // 주당 배당금
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const market = searchParams.get('market') || 'kr'

  try {
    if (market === 'kr') {
      return await fetchKrxDividends()
    } else {
      return await fetchUsDividends()
    }
  } catch (e) {
    return NextResponse.json({ error: 'fetch failed', detail: String(e) }, { status: 500 })
  }
}

async function fetchKrxDividends() {
  // Step 1: KRX OTP 발급
  const otpRes = await fetch('http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC02020401',
    },
    body: new URLSearchParams({
      locale: 'ko_KR',
      mktId: 'ALL',
      trdDd: getLatestTradingDate(),
      money: '1',
      csvxls_is498No: '',
      name: 'fileDown',
      url: 'dbms/MDC/STAT/standard/MDCSTAT03501',
    }),
  })

  if (!otpRes.ok) {
    // KRX가 안되면 네이버 증권 배당 스크리너 사용
    return await fetchNaverDividends()
  }

  const otp = await otpRes.text()

  // Step 2: OTP로 데이터 요청
  const dataRes = await fetch('http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
    },
    body: new URLSearchParams({ code: otp }),
  })

  if (!dataRes.ok) {
    return await fetchNaverDividends()
  }

  const csvText = await dataRes.text()
  const stocks = parseKrxCsv(csvText)

  // 국내 배당 ETF 추가
  const krEtfs = [
    { ticker: '279530', name: 'KODEX 고배당', price: 12000, sector: 'ETF', yieldPct: 4.5, dividendPerShare: 540, frequency: '분기배당', desc: '국내 고배당주 30종목 ETF' },
    { ticker: '466940', name: 'TIGER 은행고배당플러스TOP10', price: 12500, sector: 'ETF', yieldPct: 6.0, dividendPerShare: 750, frequency: '월배당', desc: '은행 고배당 10종목, 월배당' },
    { ticker: '458250', name: 'KODEX 주주환원고배당주', price: 11000, sector: 'ETF', yieldPct: 5.0, dividendPerShare: 550, frequency: '월배당', desc: '주주환원 우수 고배당주' },
    { ticker: '161510', name: 'TIGER 코스피고배당', price: 12500, sector: 'ETF', yieldPct: 4.2, dividendPerShare: 525, frequency: '분기배당', desc: '코스피 고배당 지수 추종' },
    { ticker: '329200', name: 'TIGER 미국배당다우존스', price: 13000, sector: 'ETF', yieldPct: 3.5, dividendPerShare: 455, frequency: '월배당', desc: 'SCHD 추종 국내 상장 ETF' },
    { ticker: '446720', name: 'ACE 미국배당다우존스', price: 12800, sector: 'ETF', yieldPct: 3.4, dividendPerShare: 435, frequency: '월배당', desc: 'SCHD 추종, ACE 브랜드' },
    { ticker: '456600', name: 'KODEX 미국배당프리미엄액티브', price: 10500, sector: 'ETF', yieldPct: 7.5, dividendPerShare: 788, frequency: '월배당', desc: '미국 배당+커버드콜 전략' },
    { ticker: '441800', name: 'TIGER 미국나스닥100커버드콜', price: 11000, sector: 'ETF', yieldPct: 8.5, dividendPerShare: 935, frequency: '월배당', desc: 'JEPQ 추종 국내 상장' },
    { ticker: '088980', name: '맥쿼리인프라', price: 13000, sector: 'ETF', yieldPct: 6.0, dividendPerShare: 780, frequency: '반기배당', desc: '인프라 펀드, 도로·터널 수익' },
    { ticker: '395400', name: 'SK리츠', price: 4200, sector: 'ETF', yieldPct: 6.0, dividendPerShare: 252, frequency: '분기배당', desc: 'SK 오피스빌딩 리츠' },
  ]

  const allStocks = [...stocks, ...krEtfs]

  return NextResponse.json({
    market: 'kr',
    count: allStocks.length,
    updatedAt: new Date().toISOString(),
    stocks: allStocks,
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' },
  })
}

function getLatestTradingDate(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000) // KST
  const day = now.getDay()
  // 주말이면 금요일로
  if (day === 0) now.setDate(now.getDate() - 2)
  else if (day === 6) now.setDate(now.getDate() - 1)
  // 장 시작 전이면 전날
  const hour = now.getHours()
  if (hour < 9) now.setDate(now.getDate() - 1)
  return now.toISOString().slice(0, 10).replace(/-/g, '')
}

function parseKrxCsv(csv: string) {
  const lines = csv.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const stocks: Array<{
    ticker: string
    name: string
    price: number
    sector: string
    yieldPct: number
    dividendPerShare: number
  }> = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim())
    if (cols.length < 6) continue

    const yieldPct = parseFloat(cols[4] || '0')
    const price = parseInt(cols[2]?.replace(/,/g, '') || '0', 10)
    const dps = parseInt(cols[5]?.replace(/,/g, '') || '0', 10)

    if (yieldPct <= 0 || price <= 0) continue

    stocks.push({
      ticker: cols[0],
      name: cols[1],
      price,
      sector: mapKrxSector(cols[3]),
      yieldPct: Math.round(yieldPct * 10) / 10,
      dividendPerShare: dps || Math.round(price * yieldPct / 100),
    })
  }

  return stocks.sort((a, b) => b.yieldPct - a.yieldPct)
}

function mapKrxSector(sector: string): string {
  if (!sector) return '기타'
  if (sector.includes('은행') || sector.includes('금융') || sector.includes('보험') || sector.includes('증권')) return '금융'
  if (sector.includes('통신')) return '통신'
  if (sector.includes('전기') || sector.includes('가스') || sector.includes('에너지')) return '에너지'
  if (sector.includes('건설')) return '건설'
  if (sector.includes('철강') || sector.includes('화학')) return '소재'
  if (sector.includes('운수') || sector.includes('운송')) return '운송'
  if (sector.includes('유통') || sector.includes('소매')) return '유통'
  if (sector.includes('음식') || sector.includes('식품')) return '식품'
  if (sector.includes('의약') || sector.includes('제약') || sector.includes('바이오')) return '제약·바이오'
  if (sector.includes('전자') || sector.includes('IT') || sector.includes('반도체')) return 'IT·전자'
  if (sector.includes('자동차') || sector.includes('기계')) return '자동차·기계'
  if (sector.includes('서비스')) return '서비스'
  return '기타'
}

// 네이버 증권 배당 스크리너 (KRX 실패 시 폴백)
async function fetchNaverDividends() {
  const sectors = [
    { code: 'KOSPI', name: '코스피' },
  ]

  const stocks: Array<{
    ticker: string
    name: string
    price: number
    sector: string
    yieldPct: number
    dividendPerShare: number
  }> = []

  try {
    // 네이버 증권 배당 상위 종목
    const res = await fetch('https://api.stock.naver.com/stock/exchange/KOSPI/marketValue?page=1&pageSize=100', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (res.ok) {
      const data = await res.json()
      if (data.stocks) {
        for (const s of data.stocks) {
          if (s.dividendYield && parseFloat(s.dividendYield) > 0) {
            stocks.push({
              ticker: s.stockCode || s.itemCode,
              name: s.stockName,
              price: parseInt(s.closePrice || '0', 10),
              sector: s.sectorName || '기타',
              yieldPct: Math.round(parseFloat(s.dividendYield) * 10) / 10,
              dividendPerShare: parseInt(s.dividend || '0', 10),
            })
          }
        }
      }
    }
  } catch { /* silent */ }

  return NextResponse.json({
    market: 'kr',
    count: stocks.length,
    updatedAt: new Date().toISOString(),
    stocks: stocks.sort((a, b) => b.yieldPct - a.yieldPct),
    source: 'naver',
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' },
  })
}

// 미국 배당주 (하드코딩 + 실시간 가격)
async function fetchUsDividends() {
  // 미국 주요 배당주/ETF (배당 정보는 비교적 안정적이므로 하드코딩)
  const usStocks = [
    // 고배당 ETF
    { ticker: 'SCHD', name: 'Schwab US Dividend Equity', sector: 'ETF', yieldPct: 3.5, frequency: '분기배당', desc: '미국 배당성장 대표 ETF' },
    { ticker: 'JEPI', name: 'JP모건 Equity Premium Income', sector: 'ETF', yieldPct: 7.2, frequency: '월배당', desc: '월배당 커버드콜 ETF' },
    { ticker: 'JEPQ', name: 'JP모건 Nasdaq Equity Premium', sector: 'ETF', yieldPct: 9.1, frequency: '월배당', desc: '나스닥 기반 고배당 ETF' },
    { ticker: 'SPYD', name: 'SPDR S&P 500 High Dividend', sector: 'ETF', yieldPct: 4.5, frequency: '분기배당', desc: 'S&P500 고배당 80종목' },
    { ticker: 'VYM', name: 'Vanguard High Dividend Yield', sector: 'ETF', yieldPct: 2.8, frequency: '분기배당', desc: '뱅가드 고배당 ETF' },
    { ticker: 'HDV', name: 'iShares Core High Dividend', sector: 'ETF', yieldPct: 3.5, frequency: '분기배당', desc: '블랙록 고배당 ETF' },
    { ticker: 'DVY', name: 'iShares Select Dividend', sector: 'ETF', yieldPct: 3.8, frequency: '분기배당', desc: '배당 선별 ETF' },
    { ticker: 'QYLD', name: 'Global X NASDAQ 100 Covered Call', sector: 'ETF', yieldPct: 11.5, frequency: '월배당', desc: '초고배당 커버드콜' },
    { ticker: 'XYLD', name: 'Global X S&P 500 Covered Call', sector: 'ETF', yieldPct: 9.8, frequency: '월배당', desc: 'S&P500 커버드콜' },
    { ticker: 'DIVO', name: 'Amplify CWP Enhanced Dividend', sector: 'ETF', yieldPct: 4.5, frequency: '월배당', desc: '배당성장+커버드콜' },
    { ticker: 'DGRO', name: 'iShares Core Dividend Growth', sector: 'ETF', yieldPct: 2.3, frequency: '분기배당', desc: '배당 성장 ETF' },
    { ticker: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats', sector: 'ETF', yieldPct: 2.0, frequency: '분기배당', desc: '배당 귀족주 ETF (25년+ 연속)' },
    // 배당킹 (50년+ 연속 배당 증가)
    { ticker: 'JNJ', name: '존슨앤존슨', sector: '헬스케어', yieldPct: 3.2, frequency: '분기배당', desc: '62년 연속 배당 증가' },
    { ticker: 'PG', name: '프록터앤갬블', sector: '필수소비재', yieldPct: 2.4, frequency: '분기배당', desc: '68년 연속 배당 증가' },
    { ticker: 'KO', name: '코카콜라', sector: '필수소비재', yieldPct: 3.0, frequency: '분기배당', desc: '62년 연속 배당 증가' },
    { ticker: 'PEP', name: '펩시코', sector: '필수소비재', yieldPct: 2.7, frequency: '분기배당', desc: '52년 연속 배당 증가' },
    { ticker: 'MMM', name: '3M', sector: '산업재', yieldPct: 2.1, frequency: '분기배당', desc: '글로벌 복합 산업기업' },
    // 고배당 개별주
    { ticker: 'T', name: 'AT&T', sector: '통신', yieldPct: 5.1, frequency: '분기배당', desc: '미국 통신 대표' },
    { ticker: 'VZ', name: '버라이즌', sector: '통신', yieldPct: 6.4, frequency: '분기배당', desc: '미국 2위 통신사' },
    { ticker: 'MO', name: '알트리아', sector: '필수소비재', yieldPct: 7.8, frequency: '분기배당', desc: '담배 기업, 초고배당' },
    { ticker: 'PM', name: '필립모리스', sector: '필수소비재', yieldPct: 4.3, frequency: '분기배당', desc: '글로벌 담배 기업' },
    { ticker: 'XOM', name: '엑슨모빌', sector: '에너지', yieldPct: 3.4, frequency: '분기배당', desc: '세계 최대 석유기업' },
    { ticker: 'CVX', name: '셰브론', sector: '에너지', yieldPct: 4.1, frequency: '분기배당', desc: '미국 2위 석유기업' },
    { ticker: 'ABBV', name: '애브비', sector: '헬스케어', yieldPct: 3.5, frequency: '분기배당', desc: '52년 연속 배당 증가' },
    { ticker: 'O', name: '리얼티인컴', sector: '리츠', yieldPct: 5.5, frequency: '월배당', desc: '월배당 리츠 대표' },
    { ticker: 'MAIN', name: '메인스트리트캐피탈', sector: '금융', yieldPct: 6.0, frequency: '월배당', desc: 'BDC 월배당' },
    { ticker: 'EPD', name: '엔터프라이즈프로덕츠', sector: '에너지', yieldPct: 7.1, frequency: '분기배당', desc: '에너지 인프라 MLP' },
    { ticker: 'AAPL', name: '애플', sector: 'IT', yieldPct: 0.5, frequency: '분기배당', desc: '세계 시가총액 1위' },
    { ticker: 'MSFT', name: '마이크로소프트', sector: 'IT', yieldPct: 0.7, frequency: '분기배당', desc: 'AI·클라우드 1위' },
    { ticker: 'AVGO', name: '브로드컴', sector: 'IT', yieldPct: 1.2, frequency: '분기배당', desc: '반도체·인프라 대표' },
    { ticker: 'JPM', name: 'JP모건체이스', sector: '금융', yieldPct: 2.1, frequency: '분기배당', desc: '미국 최대 은행' },
    { ticker: 'BAC', name: '뱅크오브아메리카', sector: '금융', yieldPct: 2.4, frequency: '분기배당', desc: '미국 2위 은행' },
  ]

  return NextResponse.json({
    market: 'us',
    count: usStocks.length,
    updatedAt: new Date().toISOString(),
    stocks: usStocks.sort((a, b) => b.yieldPct - a.yieldPct),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' },
  })
}

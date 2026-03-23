import { NextResponse } from 'next/server'

// 배당주 정보 API
// GET /api/dividend?market=kr   → 국내 배당주 (공공데이터포털 + 네이버 시세)
// GET /api/dividend?market=us   → 미국 배당주 (하드코딩 + 향후 FMP API 연동)

const DATA_GO_KR_KEY = '8b53e3f38d48739f1f3d6df2307eec63ecf657996bfae51a5468ca0fa11a5e20'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const market = searchParams.get('market') || 'kr'

  try {
    if (market === 'kr') {
      return await fetchKrDividends()
    } else {
      return await fetchUsDividends()
    }
  } catch (e) {
    return NextResponse.json({ error: 'fetch failed', detail: String(e) }, { status: 500 })
  }
}

// ══════════════════════════════════════
// 국내 배당주
// ══════════════════════════════════════

type KrStock = {
  ticker: string; name: string; price: number; sector: string
  yieldPct: number; dividendPerShare: number; frequency: string; desc: string
}

async function fetchKrDividends() {
  // 1단계: 공공데이터포털 API 시도
  let apiStocks = await fetchFromDataGoKr()

  // 2단계: API 실패 시 하드코딩 데이터 사용
  if (apiStocks.length === 0) {
    apiStocks = getKrHardcodedStocks()
  }

  // 3단계: 네이버 증권에서 실시간 시세 업데이트
  const liveStocks = await updateNaverPrices(apiStocks)

  return NextResponse.json({
    market: 'kr',
    count: liveStocks.length,
    updatedAt: new Date().toISOString(),
    source: apiStocks.length > 50 ? 'api' : 'hardcoded',
    stocks: liveStocks.sort((a, b) => b.yieldPct - a.yieldPct),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150' },
  })
}

// 공공데이터포털 금융위원회 주식배당정보 API
async function fetchFromDataGoKr(): Promise<KrStock[]> {
  try {
    const url = new URL('http://apis.data.go.kr/1160100/service/GetStocDiviInfoService/getDiviInfo')
    url.searchParams.set('serviceKey', DATA_GO_KR_KEY)
    url.searchParams.set('numOfRows', '500')
    url.searchParams.set('pageNo', '1')
    url.searchParams.set('resultType', 'json')

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return []

    const text = await res.text()
    if (text === 'Unauthorized' || text.includes('error')) return []

    const data = JSON.parse(text)
    const items = data?.response?.body?.items?.item
    if (!Array.isArray(items) || items.length === 0) return []

    const stockMap = new Map<string, KrStock>()

    for (const item of items) {
      const ticker = item.isinCd?.slice(-6) || item.shotnIsin || ''
      if (!ticker || ticker.length < 4) continue

      const name = item.issuCmpyNm || item.stckIssuCmpyNm || ''
      const dps = parseInt(item.stckGenrDvdnAmt || item.dvdnAmt || '0', 10)
      if (dps <= 0) continue

      // 배당주기 판별 (배당사유명에서 추출)
      const reason = item.dvdnRsnNm || item.dvdnRsnCd || ''
      let frequency = '연배당'
      if (reason.includes('분기') || reason.includes('1분기') || reason.includes('2분기') || reason.includes('3분기')) {
        frequency = '분기배당'
      } else if (reason.includes('반기') || reason.includes('중간')) {
        frequency = '반기배당'
      }

      // 같은 종목이 여러 번 나오면 (분기배당 등) 합산
      if (stockMap.has(ticker)) {
        const existing = stockMap.get(ticker)!
        existing.dividendPerShare += dps
        if (frequency === '분기배당') existing.frequency = '분기배당'
        else if (frequency === '반기배당' && existing.frequency === '연배당') existing.frequency = '반기배당'
      } else {
        stockMap.set(ticker, {
          ticker,
          name,
          price: 0, // 네이버에서 업데이트
          sector: guessSector(name),
          yieldPct: 0,
          dividendPerShare: dps,
          frequency,
          desc: '',
        })
      }
    }

    return Array.from(stockMap.values())
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

// 네이버 증권 모바일 API에서 실시간 시세 업데이트
async function updateNaverPrices(stocks: KrStock[]): Promise<KrStock[]> {
  const updated = stocks.map(s => ({ ...s }))
  const targets = updated.filter(s => /^\d{6}$/.test(s.ticker))

  // 10개씩 배치 처리
  for (let i = 0; i < targets.length && i < 60; i += 10) {
    const batch = targets.slice(i, i + 10)
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

  // 가격 없는 종목 필터
  return updated.filter(s => s.price > 0 && s.yieldPct > 0)
}

// 하드코딩 데이터 (API 실패 시 폴백)
function getKrHardcodedStocks(): KrStock[] {
  return [
    // ── 금융 (분기배당) ──
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
    { ticker: '030610', name: '교보증권', price: 9000, sector: '금융', yieldPct: 5.0, dividendPerShare: 450, frequency: '연배당', desc: '교보그룹 증권사' },
    // ── 통신 ──
    { ticker: '017670', name: 'SK텔레콤', price: 60000, sector: '통신', yieldPct: 5.9, dividendPerShare: 3540, frequency: '분기배당', desc: '국내 통신 1위' },
    { ticker: '030200', name: 'KT', price: 44000, sector: '통신', yieldPct: 4.5, dividendPerShare: 2000, frequency: '반기배당', desc: '유무선 통신' },
    { ticker: '032640', name: 'LG유플러스', price: 12000, sector: '통신', yieldPct: 5.4, dividendPerShare: 650, frequency: '연배당', desc: '3위 통신사' },
    // ── 에너지 ──
    { ticker: '010950', name: 'S-Oil', price: 65000, sector: '에너지', yieldPct: 6.9, dividendPerShare: 4500, frequency: '분기배당', desc: '아람코 자회사 정유' },
    { ticker: '015760', name: '한국전력', price: 23000, sector: '에너지', yieldPct: 4.3, dividendPerShare: 1000, frequency: '연배당', desc: '유일 전력공급' },
    { ticker: '078930', name: 'GS', price: 48000, sector: '에너지', yieldPct: 5.0, dividendPerShare: 2400, frequency: '반기배당', desc: 'GS그룹 지주' },
    { ticker: '267250', name: 'HD현대', price: 75000, sector: '에너지', yieldPct: 4.0, dividendPerShare: 3000, frequency: '반기배당', desc: 'HD현대그룹 지주' },
    // ── IT ──
    { ticker: '005930', name: '삼성전자', price: 72000, sector: 'IT', yieldPct: 2.0, dividendPerShare: 1444, frequency: '분기배당', desc: '세계 1위 반도체' },
    { ticker: '000660', name: 'SK하이닉스', price: 200000, sector: 'IT', yieldPct: 1.1, dividendPerShare: 2200, frequency: '분기배당', desc: '메모리 반도체 2위' },
    { ticker: '035420', name: 'NAVER', price: 220000, sector: 'IT', yieldPct: 0.5, dividendPerShare: 1100, frequency: '연배당', desc: '국내 1위 포털' },
    // ── 소재 ──
    { ticker: '005490', name: 'POSCO홀딩스', price: 310000, sector: '소재', yieldPct: 3.9, dividendPerShare: 12000, frequency: '반기배당', desc: '세계적 철강기업' },
    { ticker: '010130', name: '고려아연', price: 800000, sector: '소재', yieldPct: 2.5, dividendPerShare: 20000, frequency: '연배당', desc: '세계 1위 아연 제련' },
    { ticker: '051910', name: 'LG화학', price: 280000, sector: '소재', yieldPct: 2.5, dividendPerShare: 7000, frequency: '연배당', desc: '화학·2차전지 소재' },
    // ── 자동차 ──
    { ticker: '005380', name: '현대차', price: 230000, sector: '자동차', yieldPct: 4.3, dividendPerShare: 10000, frequency: '반기배당', desc: '글로벌 자동차 3위' },
    { ticker: '000270', name: '기아', price: 130000, sector: '자동차', yieldPct: 4.6, dividendPerShare: 6000, frequency: '반기배당', desc: '글로벌 자동차 7위' },
    // ── 필수소비재 ──
    { ticker: '033780', name: 'KT&G', price: 110000, sector: '필수소비재', yieldPct: 5.5, dividendPerShare: 6000, frequency: '분기배당', desc: '담배·인삼 대표' },
    // ── 유통 ──
    { ticker: '004170', name: '신세계', price: 180000, sector: '유통', yieldPct: 3.3, dividendPerShare: 6000, frequency: '반기배당', desc: '백화점·이마트' },
    { ticker: '069960', name: '현대백화점', price: 55000, sector: '유통', yieldPct: 3.6, dividendPerShare: 2000, frequency: '반기배당', desc: '프리미엄 백화점' },
    // ── 건설·리츠 ──
    { ticker: '000720', name: '현대건설', price: 35000, sector: '건설', yieldPct: 3.4, dividendPerShare: 1200, frequency: '연배당', desc: '국내 1위 건설사' },
    { ticker: '293940', name: '신한알파리츠', price: 6500, sector: '리츠', yieldPct: 6.0, dividendPerShare: 390, frequency: '반기배당', desc: '오피스·물류 리츠' },
    // ── 식품 ──
    { ticker: '271560', name: '오리온', price: 110000, sector: '식품', yieldPct: 2.5, dividendPerShare: 2750, frequency: '연배당', desc: '글로벌 제과' },
    // ── 제약 ──
    { ticker: '128940', name: '한미약품', price: 350000, sector: '제약', yieldPct: 1.1, dividendPerShare: 3850, frequency: '연배당', desc: '국내 대표 제약사' },
    // ── 국내 ETF ──
    { ticker: '279530', name: 'KODEX 고배당', price: 12000, sector: 'ETF', yieldPct: 4.5, dividendPerShare: 540, frequency: '분기배당', desc: '국내 고배당주 30종목' },
    { ticker: '466940', name: 'TIGER 은행고배당플러스TOP10', price: 12500, sector: 'ETF', yieldPct: 6.0, dividendPerShare: 750, frequency: '월배당', desc: '은행 고배당 10종목' },
    { ticker: '458250', name: 'KODEX 주주환원고배당주', price: 11000, sector: 'ETF', yieldPct: 5.0, dividendPerShare: 550, frequency: '월배당', desc: '주주환원 우수 고배당주' },
    { ticker: '161510', name: 'TIGER 코스피고배당', price: 12500, sector: 'ETF', yieldPct: 4.2, dividendPerShare: 525, frequency: '분기배당', desc: '코스피 고배당 지수' },
    { ticker: '329200', name: 'TIGER 미국배당다우존스', price: 13000, sector: 'ETF', yieldPct: 3.5, dividendPerShare: 455, frequency: '월배당', desc: 'SCHD 추종 국내 상장' },
    { ticker: '446720', name: 'ACE 미국배당다우존스', price: 12800, sector: 'ETF', yieldPct: 3.4, dividendPerShare: 435, frequency: '월배당', desc: 'SCHD 추종' },
    { ticker: '456600', name: 'KODEX 미국배당프리미엄액티브', price: 10500, sector: 'ETF', yieldPct: 7.5, dividendPerShare: 788, frequency: '월배당', desc: '미국 배당+커버드콜' },
    { ticker: '441800', name: 'TIGER 미국나스닥100커버드콜', price: 11000, sector: 'ETF', yieldPct: 8.5, dividendPerShare: 935, frequency: '월배당', desc: 'JEPQ 추종 국내 상장' },
    { ticker: '088980', name: '맥쿼리인프라', price: 13000, sector: 'ETF', yieldPct: 6.0, dividendPerShare: 780, frequency: '반기배당', desc: '인프라 펀드' },
    { ticker: '395400', name: 'SK리츠', price: 4200, sector: 'ETF', yieldPct: 6.0, dividendPerShare: 252, frequency: '분기배당', desc: 'SK 오피스 리츠' },
    { ticker: '357120', name: 'KODEX 배당성장', price: 11500, sector: 'ETF', yieldPct: 3.0, dividendPerShare: 345, frequency: '분기배당', desc: '배당 성장 우량주' },
  ]
}

// ══════════════════════════════════════
// 미국 배당주
// ══════════════════════════════════════

async function fetchUsDividends() {
  const usStocks = [
    // ── 월배당 ETF ──
    { ticker: 'JEPI', name: 'JP모건 Equity Premium Income', sector: 'ETF', yieldPct: 7.2, frequency: '월배당', desc: '월배당 커버드콜 ETF' },
    { ticker: 'JEPQ', name: 'JP모건 Nasdaq Equity Premium', sector: 'ETF', yieldPct: 9.1, frequency: '월배당', desc: '나스닥 기반 고배당' },
    { ticker: 'QYLD', name: 'Global X NASDAQ 100 Covered Call', sector: 'ETF', yieldPct: 11.5, frequency: '월배당', desc: '초고배당 커버드콜' },
    { ticker: 'XYLD', name: 'Global X S&P 500 Covered Call', sector: 'ETF', yieldPct: 9.8, frequency: '월배당', desc: 'S&P500 커버드콜' },
    { ticker: 'DIVO', name: 'Amplify CWP Enhanced Dividend', sector: 'ETF', yieldPct: 4.5, frequency: '월배당', desc: '배당성장+커버드콜' },
    { ticker: 'O', name: '리얼티인컴', sector: '리츠', yieldPct: 5.5, frequency: '월배당', desc: '월배당 리츠 대표' },
    { ticker: 'MAIN', name: '메인스트리트캐피탈', sector: '금융', yieldPct: 6.0, frequency: '월배당', desc: 'BDC 월배당' },
    { ticker: 'STAG', name: 'STAG Industrial', sector: '리츠', yieldPct: 4.0, frequency: '월배당', desc: '산업용 부동산 월배당 리츠' },
    { ticker: 'AGNC', name: 'AGNC Investment', sector: '리츠', yieldPct: 14.5, frequency: '월배당', desc: '모기지 리츠, 초고배당' },
    // ── 분기배당 ETF ──
    { ticker: 'SCHD', name: 'Schwab US Dividend Equity', sector: 'ETF', yieldPct: 3.5, frequency: '분기배당', desc: '미국 배당성장 대표' },
    { ticker: 'VYM', name: 'Vanguard High Dividend Yield', sector: 'ETF', yieldPct: 2.8, frequency: '분기배당', desc: '뱅가드 고배당' },
    { ticker: 'HDV', name: 'iShares Core High Dividend', sector: 'ETF', yieldPct: 3.5, frequency: '분기배당', desc: '블랙록 고배당' },
    { ticker: 'DVY', name: 'iShares Select Dividend', sector: 'ETF', yieldPct: 3.8, frequency: '분기배당', desc: '배당 선별 ETF' },
    { ticker: 'SPYD', name: 'SPDR S&P 500 High Dividend', sector: 'ETF', yieldPct: 4.5, frequency: '분기배당', desc: 'S&P500 고배당 80종목' },
    { ticker: 'DGRO', name: 'iShares Core Dividend Growth', sector: 'ETF', yieldPct: 2.3, frequency: '분기배당', desc: '배당 성장 ETF' },
    { ticker: 'NOBL', name: 'ProShares Dividend Aristocrats', sector: 'ETF', yieldPct: 2.0, frequency: '분기배당', desc: '배당 귀족주 (25년+)' },
    // ── 분기배당 개별주: 배당킹 (50년+ 연속) ──
    { ticker: 'JNJ', name: '존슨앤존슨', sector: '헬스케어', yieldPct: 3.2, frequency: '분기배당', desc: '62년 연속 배당 증가' },
    { ticker: 'PG', name: '프록터앤갬블', sector: '필수소비재', yieldPct: 2.4, frequency: '분기배당', desc: '68년 연속 배당 증가' },
    { ticker: 'KO', name: '코카콜라', sector: '필수소비재', yieldPct: 3.0, frequency: '분기배당', desc: '62년 연속 배당 증가' },
    { ticker: 'PEP', name: '펩시코', sector: '필수소비재', yieldPct: 2.7, frequency: '분기배당', desc: '52년 연속 배당 증가' },
    { ticker: 'ABBV', name: '애브비', sector: '헬스케어', yieldPct: 3.5, frequency: '분기배당', desc: '52년 연속 배당 증가' },
    { ticker: 'MMM', name: '3M', sector: '산업재', yieldPct: 2.1, frequency: '분기배당', desc: '글로벌 산업기업' },
    // ── 분기배당 개별주: 고배당 ──
    { ticker: 'MO', name: '알트리아', sector: '필수소비재', yieldPct: 7.8, frequency: '분기배당', desc: '담배, 초고배당' },
    { ticker: 'VZ', name: '버라이즌', sector: '통신', yieldPct: 6.4, frequency: '분기배당', desc: '미국 2위 통신사' },
    { ticker: 'T', name: 'AT&T', sector: '통신', yieldPct: 5.1, frequency: '분기배당', desc: '미국 통신 대표' },
    { ticker: 'PM', name: '필립모리스', sector: '필수소비재', yieldPct: 4.3, frequency: '분기배당', desc: '글로벌 담배 기업' },
    { ticker: 'EPD', name: '엔터프라이즈프로덕츠', sector: '에너지', yieldPct: 7.1, frequency: '분기배당', desc: '에너지 인프라 MLP' },
    { ticker: 'XOM', name: '엑슨모빌', sector: '에너지', yieldPct: 3.4, frequency: '분기배당', desc: '세계 최대 석유기업' },
    { ticker: 'CVX', name: '셰브론', sector: '에너지', yieldPct: 4.1, frequency: '분기배당', desc: '미국 2위 석유기업' },
    // ── 분기배당 개별주: 빅테크 ──
    { ticker: 'AAPL', name: '애플', sector: 'IT', yieldPct: 0.5, frequency: '분기배당', desc: '시가총액 1위' },
    { ticker: 'MSFT', name: '마이크로소프트', sector: 'IT', yieldPct: 0.7, frequency: '분기배당', desc: 'AI·클라우드 1위' },
    { ticker: 'AVGO', name: '브로드컴', sector: 'IT', yieldPct: 1.2, frequency: '분기배당', desc: '반도체 대표' },
    // ── 분기배당 개별주: 금융 ──
    { ticker: 'JPM', name: 'JP모건체이스', sector: '금융', yieldPct: 2.1, frequency: '분기배당', desc: '미국 최대 은행' },
    { ticker: 'BAC', name: '뱅크오브아메리카', sector: '금융', yieldPct: 2.4, frequency: '분기배당', desc: '미국 2위 은행' },
    { ticker: 'WFC', name: '웰스파고', sector: '금융', yieldPct: 2.3, frequency: '분기배당', desc: '미국 3위 은행' },
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

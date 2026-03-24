// 배당주 데이터 + 세금 계산 로직

export interface DividendStock {
  name: string
  ticker: string
  sector: string
  price: number           // 현재 주가 (원)
  dividendPerShare: number // 주당 배당금 (원)
  yieldPct: number         // 배당수익률 (%)
  frequency: '연배당' | '반기배당' | '분기배당' | '월배당'
  market: '코스피' | '코스닥' | '미국'
  description: string
}

export const SECTORS = [
  { id: 'all', name: '전체', icon: '📊' },
  { id: 'finance', name: '금융', icon: '🏦' },
  { id: 'telecom', name: '통신', icon: '📡' },
  { id: 'energy', name: '에너지·전기', icon: '⚡' },
  { id: 'industry', name: '제조·산업', icon: '🏭' },
  { id: 'realestate', name: '부동산·리츠', icon: '🏢' },
  { id: 'etf-kr', name: '국내 ETF', icon: '📈' },
  { id: 'etf-us', name: '미국 ETF', icon: '🇺🇸' },
]

export const STOCKS: DividendStock[] = [
  // ── 금융 ──
  { name: '하나금융지주', ticker: '086790', sector: 'finance', price: 68000, dividendPerShare: 4600, yieldPct: 6.8, frequency: '분기배당', market: '코스피', description: '국내 4대 금융지주, 분기배당 실시' },
  { name: 'KB금융', ticker: '105560', sector: 'finance', price: 95000, dividendPerShare: 5000, yieldPct: 5.3, frequency: '분기배당', market: '코스피', description: '국내 최대 금융지주, 안정적 배당 성장' },
  { name: '신한지주', ticker: '055550', sector: 'finance', price: 58000, dividendPerShare: 3000, yieldPct: 5.2, frequency: '분기배당', market: '코스피', description: '4대 금융지주, 꾸준한 배당 확대' },
  { name: '우리금융지주', ticker: '316140', sector: 'finance', price: 17000, dividendPerShare: 1080, yieldPct: 6.4, frequency: '분기배당', market: '코스피', description: '높은 배당수익률, 분기배당 실시' },
  { name: '삼성화재', ticker: '000810', sector: 'finance', price: 390000, dividendPerShare: 16000, yieldPct: 4.1, frequency: '반기배당', market: '코스피', description: '국내 1위 손해보험사, 안정적 배당' },
  { name: 'DB손해보험', ticker: '005830', sector: 'finance', price: 115000, dividendPerShare: 5500, yieldPct: 4.8, frequency: '연배당', market: '코스피', description: '높은 배당성향, 보험업 대표 배당주' },

  // ── 통신 ──
  { name: 'KT', ticker: '030200', sector: 'telecom', price: 44000, dividendPerShare: 2000, yieldPct: 4.5, frequency: '반기배당', market: '코스피', description: '유무선 통신 1위, 반기배당 실시' },
  { name: 'SK텔레콤', ticker: '017670', sector: 'telecom', price: 60000, dividendPerShare: 3540, yieldPct: 5.9, frequency: '분기배당', market: '코스피', description: '국내 통신 1위, AI·데이터센터 성장' },
  { name: 'LG유플러스', ticker: '032640', sector: 'telecom', price: 12000, dividendPerShare: 650, yieldPct: 5.4, frequency: '연배당', market: '코스피', description: '3위 통신사, 안정적 현금흐름' },

  // ── 에너지·전기 ──
  { name: '한국전력', ticker: '015760', sector: 'energy', price: 23000, dividendPerShare: 1000, yieldPct: 4.3, frequency: '연배당', market: '코스피', description: '국내 유일 전력 공급, 적자 축소 중' },
  { name: 'S-Oil', ticker: '010950', sector: 'energy', price: 65000, dividendPerShare: 4500, yieldPct: 6.9, frequency: '분기배당', market: '코스피', description: '정유업, 사우디 아람코 자회사' },
  { name: 'GS', ticker: '078930', sector: 'energy', price: 48000, dividendPerShare: 2400, yieldPct: 5.0, frequency: '반기배당', market: '코스피', description: 'GS그룹 지주회사, 에너지·유통' },

  // ── 제조·산업 ──
  { name: '삼성전자', ticker: '005930', sector: 'industry', price: 72000, dividendPerShare: 1444, yieldPct: 2.0, frequency: '분기배당', market: '코스피', description: '분기배당, 세계 1위 반도체' },
  { name: 'POSCO홀딩스', ticker: '005490', sector: 'industry', price: 310000, dividendPerShare: 12000, yieldPct: 3.9, frequency: '반기배당', market: '코스피', description: '세계적 철강기업, 2차전지 소재' },
  { name: '현대차', ticker: '005380', sector: 'industry', price: 230000, dividendPerShare: 10000, yieldPct: 4.3, frequency: '반기배당', market: '코스피', description: '글로벌 자동차 3위, 배당 확대 중' },

  // ── 부동산·리츠 ──
  { name: '맥쿼리인프라', ticker: '088980', sector: 'realestate', price: 13000, dividendPerShare: 780, yieldPct: 6.0, frequency: '반기배당', market: '코스피', description: '인프라 펀드, 도로·터널 수익' },
  { name: 'SK리츠', ticker: '395400', sector: 'realestate', price: 4200, dividendPerShare: 252, yieldPct: 6.0, frequency: '분기배당', market: '코스피', description: 'SK 오피스빌딩 기반 리츠' },
  { name: '신한알파리츠', ticker: '293940', sector: 'realestate', price: 6500, dividendPerShare: 390, yieldPct: 6.0, frequency: '반기배당', market: '코스피', description: '오피스·물류 부동산 투자' },

  // ── 국내 ETF ──
  { name: 'KODEX 고배당', ticker: '279530', sector: 'etf-kr', price: 12000, dividendPerShare: 540, yieldPct: 4.5, frequency: '분기배당', market: '코스피', description: '국내 고배당주 30종목 ETF' },
  { name: 'TIGER 은행고배당플러스TOP10', ticker: '466940', sector: 'etf-kr', price: 12500, dividendPerShare: 750, yieldPct: 6.0, frequency: '월배당', market: '코스피', description: '은행 고배당주 10종목, 월배당' },
  { name: 'KODEX 주주환원고배당주', ticker: '458250', sector: 'etf-kr', price: 11000, dividendPerShare: 550, yieldPct: 5.0, frequency: '월배당', market: '코스피', description: '주주환원 우수 고배당주 ETF' },

  // ── 미국 ETF ──
  { name: 'SCHD', ticker: 'SCHD', sector: 'etf-us', price: 37000, dividendPerShare: 1300, yieldPct: 3.5, frequency: '분기배당', market: '미국', description: '미국 배당성장 대표 ETF, 10년+ 배당기업' },
  { name: 'JEPI', ticker: 'JEPI', sector: 'etf-us', price: 77000, dividendPerShare: 5400, yieldPct: 7.0, frequency: '월배당', market: '미국', description: '월배당 ETF, 커버드콜 전략' },
  { name: 'JEPQ', ticker: 'JEPQ', sector: 'etf-us', price: 74000, dividendPerShare: 6700, yieldPct: 9.1, frequency: '월배당', market: '미국', description: '나스닥 기반 월배당, 높은 수익률' },
  { name: 'SPYD', ticker: 'SPYD', sector: 'etf-us', price: 56000, dividendPerShare: 2500, yieldPct: 4.5, frequency: '분기배당', market: '미국', description: 'S&P500 고배당 80종목 ETF' },
]

// ── 배당소득 세금 계산 (2026년 기준) ──

export interface TaxResult {
  grossDividend: number       // 세전 배당금 (연)
  taxRate: number             // 적용 세율 (%)
  taxAmount: number           // 세금
  netDividend: number         // 세후 배당금
  monthlyNet: number          // 월 환산 세후 배당금
  taxType: string             // 과세 유형 설명
}

/**
 * 배당소득세 계산 (2026년 기준)
 * - 국내: 15.4% 원천징수 (지방세 포함)
 * - 미국: 15% 현지 원천징수 (한미 조세조약)
 * - 연 2,000만원 초과 시 금융소득종합과세
 * - ISA 계좌: 200만원 비과세, 초과분 9.9%
 */
export function calculateTax(
  grossDividend: number,
  market: '코스피' | '코스닥' | '미국',
  accountType: 'general' | 'isa' = 'general'
): TaxResult {
  if (accountType === 'isa') {
    // ISA: 200만원 비과세, 초과분 9.9%
    const exempt = 2000000
    if (grossDividend <= exempt) {
      return {
        grossDividend,
        taxRate: 0,
        taxAmount: 0,
        netDividend: grossDividend,
        monthlyNet: Math.round(grossDividend / 12),
        taxType: 'ISA 비과세 (200만원 이내)',
      }
    }
    const taxable = grossDividend - exempt
    const taxAmount = Math.round(taxable * 0.099)
    return {
      grossDividend,
      taxRate: 9.9,
      taxAmount,
      netDividend: grossDividend - taxAmount,
      monthlyNet: Math.round((grossDividend - taxAmount) / 12),
      taxType: 'ISA 분리과세 9.9% (200만원 초과분)',
    }
  }

  if (market === '미국') {
    // 미국: 15% 현지 원천징수 (한미 조세조약)
    const taxAmount = Math.round(grossDividend * 0.15)
    return {
      grossDividend,
      taxRate: 15,
      taxAmount,
      netDividend: grossDividend - taxAmount,
      monthlyNet: Math.round((grossDividend - taxAmount) / 12),
      taxType: '미국 원천징수 15% (한미 조세조약)',
    }
  }

  // 국내: 15.4% 원천징수
  if (grossDividend <= 20000000) {
    const taxAmount = Math.round(grossDividend * 0.154)
    return {
      grossDividend,
      taxRate: 15.4,
      taxAmount,
      netDividend: grossDividend - taxAmount,
      monthlyNet: Math.round((grossDividend - taxAmount) / 12),
      taxType: '배당소득세 15.4% (원천징수)',
    }
  }

  // 2,000만원 초과: 금융소득종합과세 (최대 세율 적용)
  const baseTax = Math.round(20000000 * 0.154)
  const excess = grossDividend - 20000000
  const excessTax = Math.round(excess * 0.275) // 간이 계산 (27.5% 적용)
  const taxAmount = baseTax + excessTax
  const effectiveRate = Math.round((taxAmount / grossDividend) * 1000) / 10

  return {
    grossDividend,
    taxRate: effectiveRate,
    taxAmount,
    netDividend: grossDividend - taxAmount,
    monthlyNet: Math.round((grossDividend - taxAmount) / 12),
    taxType: '금융소득종합과세 (2,000만원 초과)',
  }
}

/** 투자금 → 배당 시뮬레이션 */
export function simulateDividend(
  stock: DividendStock,
  investAmount: number,
  accountType: 'general' | 'isa' = 'general'
) {
  const shares = Math.floor(investAmount / stock.price)
  const actualInvest = shares * stock.price
  const grossAnnual = shares * stock.dividendPerShare
  const tax = calculateTax(grossAnnual, stock.market, accountType)

  let paymentsPerYear: number
  switch (stock.frequency) {
    case '월배당': paymentsPerYear = 12; break
    case '분기배당': paymentsPerYear = 4; break
    case '반기배당': paymentsPerYear = 2; break
    default: paymentsPerYear = 1
  }

  const perPayment = Math.round(tax.netDividend / paymentsPerYear)

  return {
    shares,
    actualInvest,
    grossAnnual,
    ...tax,
    paymentsPerYear,
    perPayment,
    effectiveYield: actualInvest > 0 ? Math.round((tax.netDividend / actualInvest) * 1000) / 10 : 0,
  }
}

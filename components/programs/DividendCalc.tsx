'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { calculateTax } from './dividend/dividendData'

interface KakaoWindow extends Window {
  Kakao?: {
    isInitialized: () => boolean
    init: (k: string) => void
    Share: { sendDefault: (o: Record<string, unknown>) => void }
  }
}
const KAKAO_KEY = '3913fde247b12ce25084eb42a9b17ed9'

interface StockItem {
  ticker: string
  name: string
  price: number
  sector: string
  yieldPct: number
  dividendPerShare: number
  frequency?: string
  desc?: string
}

type Category = 'stock' | 'etf'
type SubMarket = 'kr' | 'us'

export default function DividendCalc() {
  // URL 파라미터로 공유된 결과 감지
  const sharedData = useMemo(() => {
    if (typeof window === 'undefined') return null
    const p = new URLSearchParams(window.location.search)
    const t = p.get('t'), n = p.get('n'), pr = p.get('p'), d = p.get('d'), y = p.get('y'), f = p.get('f'), inv = p.get('i'), m = p.get('m')
    if (t && n && pr && y) {
      return {
        stock: { ticker: t, name: decodeURIComponent(n), price: +pr, dividendPerShare: +(d || 0), yieldPct: +y, frequency: f ? decodeURIComponent(f) : '연배당', sector: '기타' } as StockItem,
        investRaw: +(inv || 0),
        market: (m === 'us' ? 'us' : 'kr') as SubMarket,
      }
    }
    return null
  }, [])

  const [category, setCategory] = useState<Category>('stock')
  const [subMarket, setSubMarket] = useState<SubMarket>(sharedData?.market || 'kr')
  const [sector, setSector] = useState('전체')
  const [allKr, setAllKr] = useState<StockItem[]>([])
  const [allUs, setAllUs] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [selected, setSelected] = useState<StockItem | null>(sharedData?.stock || null)
  const [investInput, setInvestInput] = useState(sharedData?.investRaw ? sharedData.investRaw.toLocaleString() : '')
  const [accountType, setAccountType] = useState<'general' | 'isa'>('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [style, setStyle] = useState<'all' | 'high' | 'safe' | 'monthly' | 'growth'>('all')
  const [sortBy, setSortBy] = useState<'yield' | 'name' | 'price'>('yield')

  // 데이터 로드
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [krRes, usRes] = await Promise.allSettled([
        fetch('/api/dividend?market=kr'),
        fetch('/api/dividend?market=us'),
      ])
      if (krRes.status === 'fulfilled' && krRes.value.ok) {
        const data = await krRes.value.json()
        setAllKr(data.stocks || [])
        const d = new Date(data.updatedAt)
        setUpdatedAt(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`)
      }
      if (usRes.status === 'fulfilled' && usRes.value.ok) {
        const data = await usRes.value.json()
        setAllUs(data.stocks || [])
      }
    } catch {
      setError('데이터를 불러오지 못했습니다.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 현재 탭에 맞는 stocks 추출
  const stocks = useMemo(() => {
    const source = subMarket === 'kr' ? allKr : allUs
    if (category === 'etf') return source.filter((s) => s.sector === 'ETF')
    return source.filter((s) => s.sector !== 'ETF')
  }, [category, subMarket, allKr, allUs])

  const market = subMarket // 세금 계산용

  // 분야 목록 추출
  const sectors = useMemo(() => {
    const set = new Set(stocks.map((s) => s.sector))
    return ['전체', ...Array.from(set).sort()]
  }, [stocks])

  // 필터링
  const filtered = useMemo(() => {
    let list = stocks
    // 성향 필터
    if (style === 'high') list = list.filter((s) => s.yieldPct >= 5)
    else if (style === 'safe') list = list.filter((s) => s.yieldPct >= 2 && s.yieldPct <= 5)
    else if (style === 'monthly') list = list.filter((s) => s.frequency?.includes('월'))
    else if (style === 'growth') list = list.filter((s) => s.yieldPct >= 1 && s.yieldPct <= 4 && s.desc?.includes('연속'))
    // 분야 필터
    if (sector !== '전체') list = list.filter((s) => s.sector === sector)
    // 검색
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q))
    }
    // 정렬
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    else if (sortBy === 'price') list = [...list].sort((a, b) => b.price - a.price)
    else list = [...list].sort((a, b) => b.yieldPct - a.yieldPct)
    return list
  }, [stocks, sector, searchQuery, style, sortBy])

  // 투자 시뮬레이션
  const investRaw = parseInt(investInput.replace(/,/g, ''), 10) || 0
  const investAmount = investRaw * 10000 // 만원 단위 입력

  const result = useMemo(() => {
    if (!selected || investAmount <= 0) return null
    const shares = Math.floor(investAmount / selected.price)
    const actualInvest = shares * selected.price
    const dps = selected.dividendPerShare || Math.round(selected.price * selected.yieldPct / 100)
    const grossAnnual = shares * dps
    const marketType = market === 'us' ? '미국' as const : '코스피' as const
    const tax = calculateTax(grossAnnual, marketType, accountType)
    const freq = selected.frequency || '연배당'
    let paymentsPerYear = 1
    if (freq.includes('월')) paymentsPerYear = 12
    else if (freq.includes('분기')) paymentsPerYear = 4
    else if (freq.includes('반기')) paymentsPerYear = 2
    const perPayment = Math.round(tax.netDividend / paymentsPerYear)
    const effectiveYield = actualInvest > 0 ? Math.round((tax.netDividend / actualInvest) * 1000) / 10 : 0

    return { shares, actualInvest, grossAnnual, perPayment, paymentsPerYear, effectiveYield, frequency: freq, ...tax }
  }, [selected, investAmount, market, accountType])

  function formatMoney(n: number): string {
    if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
    if (n >= 10000) return `${Math.round(n / 10000).toLocaleString()}만`
    return n.toLocaleString()
  }

  function formatInput(val: string): string {
    const num = val.replace(/[^0-9]/g, '')
    return num ? parseInt(num, 10).toLocaleString() : ''
  }

  const frequencyLabel: Record<string, string> = {
    '월배당': '매월', '분기배당': '3개월마다', '반기배당': '6개월마다', '연배당': '연 1회',
  }

  async function shareKakao() {
    if (!selected || !result) return
    const params = `t=${encodeURIComponent(selected.ticker)}&n=${encodeURIComponent(selected.name)}&p=${selected.price}&d=${selected.dividendPerShare || Math.round(selected.price * selected.yieldPct / 100)}&y=${selected.yieldPct}&f=${encodeURIComponent(selected.frequency || '연배당')}&i=${investRaw}&m=${subMarket}`
    const url = `${window.location.origin}/programs/dividend-calc?${params}`
    const w = window as KakaoWindow
    if (!w.Kakao) {
      for (let i = 0; i < 15; i++) { await new Promise((r) => setTimeout(r, 200)); if ((window as KakaoWindow).Kakao) break }
    }
    const kakao = (window as KakaoWindow).Kakao
    if (kakao) {
      if (!kakao.isInitialized()) kakao.init(KAKAO_KEY)
      try {
        kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `💰 ${selected.name} 배당 시뮬레이션`,
            description: `${formatMoney(investAmount)} 투자 → 연 ${formatMoney(result.netDividend)} (세후 ${result.effectiveYield}%)`,
            imageUrl: `${window.location.origin}/api/og`,
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: '나도 계산하기', link: { mobileWebUrl: url, webUrl: url } }],
        })
        return
      } catch { /* fallback */ }
    }
    const text = `💰 ${selected.name} 배당 시뮬레이션\n${formatMoney(investAmount)} 투자 → 연 ${formatMoney(result.netDividend)}\n${url}`
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px'
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    alert('결과 링크가 클립보드에 복사되었습니다.')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="text-4xl mb-2">💰</div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">배당주 계산기</h1>
        <p className="text-sm mt-1.5 opacity-90">국내·미국 전체 배당주 정보 + 투자 시뮬레이션</p>
        {updatedAt && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
            실시간 시세 ({updatedAt} 업데이트)
          </div>
        )}
      </div>

      {/* 대 카테고리: 개별주식 / ETF */}
      <div className="flex gap-2">
        {([['stock', '📊 개별주식'], ['etf', '📈 ETF (간접투자)']] as const).map(([c, label]) => (
          <button
            key={c}
            onClick={() => { setCategory(c); setSelected(null); setSector('전체'); setSearchQuery('') }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold min-h-[48px] transition-all ${
              category === c ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 소 카테고리: 국내 / 미국 */}
      <div className="flex gap-2">
        {([['kr', '🇰🇷 국내'], ['us', '🇺🇸 미국']] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setSubMarket(m); setSelected(null); setSector('전체'); setSearchQuery('') }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold min-h-[44px] transition-all ${
              subMarket === m ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {label}
            <span className="block text-[10px] font-normal opacity-70 mt-0.5">
              {m === 'kr'
                ? category === 'etf' ? 'KODEX, TIGER, ACE 등' : '코스피·코스닥'
                : category === 'etf' ? 'SCHD, JEPI, VYM 등' : '배당킹·고배당주'
              }
            </span>
          </button>
        ))}
      </div>

      {/* 종목 선택 안 된 상태 */}
      {!selected && (
        <>
          {/* 빠른 필터 */}
          <div className="grid grid-cols-2 gap-2">
            {([
              ['high', '💰 고수익 배당', '연 5% 이상', 'from-red-500 to-orange-500'],
              ['monthly', '📅 매달 받는 배당', '월배당 종목만', 'from-blue-500 to-indigo-500'],
              ['safe', '🛡️ 안정적 배당', '연 2~5% 우량주', 'from-emerald-500 to-green-500'],
              ['growth', '📈 배당 늘리는 기업', '연속 배당 증가', 'from-purple-500 to-pink-500'],
            ] as const).map(([id, label, sub, gradient]) => (
              <button
                key={id}
                onClick={() => setStyle(style === id ? 'all' : id)}
                className={`p-3 rounded-xl text-left min-h-[56px] transition-all active:scale-[0.97] ${
                  style === id
                    ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-xs font-bold">{label}</p>
                <p className={`text-[10px] mt-0.5 ${style === id ? 'text-white/80' : 'text-gray-400'}`}>{sub}</p>
              </button>
            ))}
          </div>

          {/* 검색 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="종목명 또는 티커로 검색..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 min-h-[44px]"
          />

          {/* 정렬 */}
          <div className="flex gap-1.5">
            {([
              ['yield', '배당률순', '📉'],
              ['name', '이름순', '🔤'],
              ['price', '주가순', '💲'],
            ] as const).map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => setSortBy(id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold min-h-[32px] transition-all ${
                  sortBy === id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* 분야 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sectors.map((s) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[40px] transition-all ${
                  sector === s ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={() => fetchData(market)} className="mt-2 text-xs text-emerald-600 font-bold">다시 시도</button>
            </div>
          )}

          {/* 종목 목록 */}
          {!loading && !error && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-medium px-1">{filtered.length}개 종목</p>
              {filtered.slice(0, 50).map((stock) => (
                <button
                  key={stock.ticker}
                  onClick={() => setSelected(stock)}
                  className="w-full bg-white rounded-2xl p-4 border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold text-gray-900 truncate">{stock.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium shrink-0">{stock.ticker}</span>
                    </div>
                    <span className="text-lg font-black text-emerald-600 shrink-0 ml-2">{stock.yieldPct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{stock.price?.toLocaleString()}원 · {stock.sector}</span>
                    {stock.frequency && <span className="text-emerald-500 font-medium">{stock.frequency}</span>}
                  </div>
                </button>
              ))}
              {filtered.length > 50 && (
                <p className="text-center text-xs text-gray-400 py-2">상위 50개 표시 · 검색으로 더 많은 종목을 찾아보세요</p>
              )}
              {filtered.length === 0 && !loading && (
                <p className="text-center text-sm text-gray-400 py-8">검색 결과가 없습니다</p>
              )}
            </div>
          )}
        </>
      )}

      {/* 선택된 종목 상세 */}
      {selected && (
        <div className="space-y-4 animate-slide-up">
          {/* 종목 정보 */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-900 truncate">{selected.name}</h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold shrink-0">
                    {selected.frequency || '연배당'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{selected.desc || `${selected.sector} · ${selected.ticker}`}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 min-h-[44px] px-2 shrink-0">← 목록</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-400 font-medium">현재가</p>
                <p className="text-sm font-black text-gray-900">{selected.price?.toLocaleString()}원</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <p className="text-[10px] text-gray-400 font-medium">배당수익률</p>
                <p className="text-sm font-black text-emerald-600">{selected.yieldPct}%</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-400 font-medium">주당 배당금</p>
                <p className="text-sm font-black text-gray-900">{(selected.dividendPerShare || Math.round(selected.price * selected.yieldPct / 100)).toLocaleString()}원</p>
              </div>
            </div>
          </div>

          {/* 투자금 입력 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">투자 금액</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={investInput}
                onChange={(e) => setInvestInput(formatInput(e.target.value))}
                placeholder="예: 1,000"
                className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-200 text-right text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300 min-h-[44px]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">만원</span>
            </div>
            {investAmount > 0 && (
              <p className="text-xs text-gray-400 text-right mt-1">{investAmount.toLocaleString()}원</p>
            )}
            <div className="flex gap-2 mt-2">
              {[100, 500, 1000, 3000, 5000].map((v) => (
                <button key={v} onClick={() => setInvestInput(v.toLocaleString())}
                  className="flex-1 py-2 text-xs font-semibold bg-gray-50 hover:bg-emerald-50 text-gray-600 rounded-lg min-h-[36px]">
                  {v >= 1000 ? `${v / 10000}억` : `${v}만`}
                </button>
              ))}
            </div>
            {market === 'kr' && (
              <div className="flex gap-2 mt-3">
                {(['general', 'isa'] as const).map((t) => (
                  <button key={t} onClick={() => setAccountType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold min-h-[44px] transition-all ${
                      accountType === t ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {t === 'general' ? '일반 계좌' : 'ISA 계좌 (절세)'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 결과 */}
          {result && investAmount > 0 && (
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <p className="text-xs font-medium opacity-80 mb-1">세후 연간 배당금</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black">{formatMoney(result.netDividend)}</span>
                  <span className="text-lg opacity-80">원</span>
                </div>
                <div className="mt-3 flex gap-3 text-sm">
                  <div><p className="text-xs opacity-70">세후 수익률</p><p className="font-black text-lg">{result.effectiveYield}%</p></div>
                  <div className="w-px bg-white/30" />
                  <div><p className="text-xs opacity-70">월 환산</p><p className="font-black text-lg">{formatMoney(result.monthlyNet)}원</p></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-2">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">상세 내역</p>
                {[
                  ['매수 가능 수량', `${result.shares.toLocaleString()}주`],
                  ['실제 투자금', `${result.actualInvest.toLocaleString()}원`],
                  ['세전 배당금 (연)', `${result.grossAnnual.toLocaleString()}원`],
                  ['배당소득세', `−${result.taxAmount.toLocaleString()}원 (${result.taxRate}%)`],
                  ['세후 배당금 (연)', `${result.netDividend.toLocaleString()}원`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className={`text-sm font-bold ${label === '배당소득세' ? 'text-red-500' : label === '세후 배당금 (연)' ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* 배당 수령 일정 */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">배당 수령 일정</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{result.frequency.includes('월') ? '📅' : result.frequency.includes('분기') ? '📊' : '📆'}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{result.frequency} · {frequencyLabel[result.frequency] || '연 1회'}</p>
                    <p className="text-xs text-gray-500">1회당 약 {result.perPayment.toLocaleString()}원</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 12 }).map((_, i) => {
                    let active = false
                    if (result.frequency.includes('월')) active = true
                    else if (result.frequency.includes('분기')) active = [2, 5, 8, 11].includes(i)
                    else if (result.frequency.includes('반기')) active = [5, 11].includes(i)
                    else active = i === 11
                    return (
                      <div key={i} className="flex-1 text-center">
                        <div className={`h-8 rounded-md mb-1 flex items-center justify-center text-[10px] font-bold ${active ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                          {active ? '💰' : ''}
                        </div>
                        <span className="text-[9px] text-gray-400">{i + 1}월</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 직관적 결과 요약 */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <p className="text-xs font-medium text-gray-400 mb-3">📌 한눈에 보는 결과</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <span className="text-lg">💵</span>
                    </div>
                    <p className="text-[15px] sm:text-base leading-snug">
                      <strong className="text-emerald-400">{selected.name}</strong>에 <strong className="text-white">{formatMoney(investAmount)}원</strong>을 투자하시면
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                      <span className="text-lg">📅</span>
                    </div>
                    <p className="text-[15px] sm:text-base leading-snug">
                      {result.frequency.includes('월')
                        ? <><strong className="text-amber-400">매달</strong> 약 <strong className="text-white text-xl">{formatMoney(result.perPayment)}원</strong>씩</>
                        : result.frequency.includes('분기')
                          ? <><strong className="text-amber-400">3개월마다</strong> 약 <strong className="text-white text-xl">{formatMoney(result.perPayment)}원</strong>씩</>
                          : result.frequency.includes('반기')
                            ? <><strong className="text-amber-400">6개월마다</strong> 약 <strong className="text-white text-xl">{formatMoney(result.perPayment)}원</strong>씩</>
                            : <><strong className="text-amber-400">1년에 한 번</strong> 약 <strong className="text-white text-xl">{formatMoney(result.perPayment)}원</strong>을</>
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <span className="text-lg">🏦</span>
                    </div>
                    <p className="text-[15px] sm:text-base leading-snug">
                      세금 제외하고 <strong className="text-blue-400">통장으로 받으실 수 있습니다</strong>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-500">
                  연간 총 {result.paymentsPerYear}회 수령 · 세후 연 {formatMoney(result.netDividend)}원 · 실질 수익률 {result.effectiveYield}%
                </div>
              </div>

              {/* 세금 팁 */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5">💡</span>
                  <div>
                    <p className="text-xs font-bold text-amber-800 mb-1">세금 안내</p>
                    <p className="text-xs text-amber-700 leading-relaxed">{result.taxType}</p>
                    {market === 'us' && <p className="text-xs text-amber-600 mt-1">미국 주식은 15% 원천징수 (한미 조세조약). 국내 세금은 별도 신고 필요할 수 있습니다.</p>}
                    {market === 'kr' && accountType === 'general' && (
                      <p className="text-xs text-emerald-600 mt-1 font-medium">💚 ISA 계좌 이용 시 200만원까지 비과세!</p>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={shareKakao}
                className="w-full py-3.5 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-semibold rounded-xl active:scale-[0.98] text-[14px] flex items-center justify-center gap-2 transition-all min-h-[44px]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
                카카오톡으로 공유하기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 면책 */}
      <div className="text-center px-4 py-3">
        <p className="text-[10px] text-gray-300 leading-relaxed">
          본 계산기는 참고용이며 실제 배당금은 기업 실적에 따라 변동될 수 있습니다.
          투자 판단의 책임은 본인에게 있습니다.
        </p>
      </div>
    </div>
  )
}

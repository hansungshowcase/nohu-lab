'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { SECTORS, STOCKS, simulateDividend, type DividendStock } from './dividend/dividendData'

interface KakaoWindow extends Window {
  Kakao?: {
    isInitialized: () => boolean
    init: (k: string) => void
    Share: { sendDefault: (o: Record<string, unknown>) => void }
  }
}
const KAKAO_KEY = '3913fde247b12ce25084eb42a9b17ed9'

export default function DividendCalc() {
  const [sector, setSector] = useState('all')
  const [selected, setSelected] = useState<DividendStock | null>(null)
  const [investInput, setInvestInput] = useState('')
  const [accountType, setAccountType] = useState<'general' | 'isa'>('general')
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const [priceLoading, setPriceLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const filtered = useMemo(() =>
    sector === 'all' ? STOCKS : STOCKS.filter((s) => s.sector === sector)
  , [sector])

  // 실시간 시세 조회
  const fetchLivePrices = useCallback(async () => {
    setPriceLoading(true)
    const prices: Record<string, number> = {}
    // 국내 주식만 실시간 조회 (미국 ETF는 원화 환산 필요하여 기본값 사용)
    const krStocks = STOCKS.filter((s) => s.market !== '미국')
    const results = await Promise.allSettled(
      krStocks.map(async (s) => {
        try {
          const res = await fetch(`/api/stock-price?ticker=${s.ticker}`)
          if (res.ok) {
            const data = await res.json()
            if (data.price && data.price > 0) {
              prices[s.ticker] = data.price
            }
          }
        } catch { /* silent */ }
      })
    )
    if (Object.keys(prices).length > 0) {
      setLivePrices(prices)
      const now = new Date()
      setLastUpdate(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`)
    }
    setPriceLoading(false)
  }, [])

  useEffect(() => {
    fetchLivePrices()
  }, [fetchLivePrices])

  // 실시간 가격 반영된 주식 데이터
  function getStock(stock: DividendStock): DividendStock {
    const livePrice = livePrices[stock.ticker]
    if (livePrice && livePrice > 0) {
      const newYield = Math.round((stock.dividendPerShare / livePrice) * 1000) / 10
      return { ...stock, price: livePrice, yieldPct: newYield }
    }
    return stock
  }

  const investAmount = parseInt(investInput.replace(/,/g, ''), 10) || 0
  const result = selected ? simulateDividend(getStock(selected), investAmount, accountType) : null

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
    '월배당': '매월',
    '분기배당': '3개월마다',
    '반기배당': '6개월마다',
    '연배당': '1년에 1회',
  }

  async function shareKakao() {
    if (!selected || !result) return
    const s = getStock(selected)
    const url = `${window.location.origin}/programs/dividend-calc`
    const w = window as KakaoWindow
    if (!w.Kakao) {
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 200))
        if ((window as KakaoWindow).Kakao) break
      }
    }
    const kakao = (window as KakaoWindow).Kakao
    if (kakao) {
      if (!kakao.isInitialized()) kakao.init(KAKAO_KEY)
      try {
        kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `💰 ${s.name} 배당 시뮬레이션`,
            description: `${formatMoney(investAmount)} 투자 → 연 ${formatMoney(result.netDividend)} (세후 ${result.effectiveYield}%) | ${s.frequency}`,
            imageUrl: `${window.location.origin}/api/og`,
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: '나도 계산하기', link: { mobileWebUrl: url, webUrl: url } }],
        })
        return
      } catch { /* fallback */ }
    }
    const text = `💰 ${s.name} 배당 시뮬레이션\n${formatMoney(investAmount)} 투자 → 연 ${formatMoney(result.netDividend)} (세후)\n${url}`
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea')
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px'
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
        <p className="text-sm mt-1.5 opacity-90">투자 금액별 배당금·세금·수령 주기를 한눈에</p>
        {lastUpdate && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
            실시간 시세 반영 ({lastUpdate} 업데이트)
          </div>
        )}
      </div>

      {/* 분야 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SECTORS.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSector(s.id); setSelected(null) }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[40px] transition-all ${
              sector === s.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
            }`}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      {/* 종목 목록 */}
      {!selected && (
        <div className="space-y-2.5">
          {filtered.map((stock) => {
            const s = getStock(stock)
            return (
              <button
                key={s.ticker}
                onClick={() => setSelected(stock)}
                className="w-full bg-white rounded-2xl p-4 border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all text-left active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">{s.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{s.market}</span>
                  </div>
                  <span className="text-lg font-black text-emerald-600">{s.yieldPct}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{s.price.toLocaleString()}원 · {s.frequency}</span>
                  <span className="text-gray-400">{s.description.slice(0, 20)}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* 선택된 종목 상세 */}
      {selected && (
        <div className="space-y-4 animate-slide-up">
          {/* 종목 정보 카드 */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-900">{getStock(selected).name}</h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">{selected.frequency}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{selected.description}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 min-h-[44px] px-2">
                ← 목록
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-400 font-medium">현재가</p>
                <p className="text-sm font-black text-gray-900">{getStock(selected).price.toLocaleString()}원</p>
                {livePrices[selected.ticker] && (
                  <p className="text-[9px] text-emerald-500 font-medium">실시간</p>
                )}
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <p className="text-[10px] text-gray-400 font-medium">배당수익률</p>
                <p className="text-sm font-black text-emerald-600">{getStock(selected).yieldPct}%</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-400 font-medium">주당 배당금</p>
                <p className="text-sm font-black text-gray-900">{selected.dividendPerShare.toLocaleString()}원</p>
              </div>
            </div>
          </div>

          {/* 투자금 입력 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">투자 금액을 입력하세요</label>
            <input
              type="text"
              inputMode="numeric"
              value={investInput}
              onChange={(e) => setInvestInput(formatInput(e.target.value))}
              placeholder="예: 10,000,000"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-right text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 min-h-[44px]"
            />
            <div className="flex gap-2 mt-2">
              {[100, 500, 1000, 3000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setInvestInput((v * 10000).toLocaleString())}
                  className="flex-1 py-2 text-xs font-semibold bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 rounded-lg transition-all min-h-[36px]"
                >
                  {v >= 1000 ? `${v / 1000}천만` : `${v}만`}
                </button>
              ))}
            </div>

            {/* 계좌 유형 */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setAccountType('general')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold min-h-[44px] transition-all ${
                  accountType === 'general' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                일반 계좌
              </button>
              <button
                onClick={() => setAccountType('isa')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold min-h-[44px] transition-all ${
                  accountType === 'isa' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                ISA 계좌 (절세)
              </button>
            </div>
          </div>

          {/* 결과 */}
          {result && investAmount > 0 && (
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
              {/* 메인 결과 */}
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <p className="text-xs font-medium opacity-80 mb-1">세후 연간 배당금</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black">{formatMoney(result.netDividend)}</span>
                  <span className="text-lg opacity-80">원</span>
                </div>
                <div className="mt-3 flex gap-3 text-sm">
                  <div>
                    <p className="text-xs opacity-70">세후 수익률</p>
                    <p className="font-black text-lg">{result.effectiveYield}%</p>
                  </div>
                  <div className="w-px bg-white/30" />
                  <div>
                    <p className="text-xs opacity-70">월 환산</p>
                    <p className="font-black text-lg">{formatMoney(result.monthlyNet)}원</p>
                  </div>
                </div>
              </div>

              {/* 상세 내역 */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">상세 내역</p>
                <div className="space-y-2">
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
              </div>

              {/* 배당 수령 일정 */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">배당 수령 일정</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{selected.frequency === '월배당' ? '📅' : selected.frequency === '분기배당' ? '📊' : selected.frequency === '반기배당' ? '📆' : '🗓️'}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selected.frequency} · {frequencyLabel[selected.frequency]}</p>
                    <p className="text-xs text-gray-500">1회당 약 {result.perPayment.toLocaleString()}원 수령</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 12 }).map((_, i) => {
                    let active = false
                    if (selected.frequency === '월배당') active = true
                    else if (selected.frequency === '분기배당') active = [2, 5, 8, 11].includes(i)
                    else if (selected.frequency === '반기배당') active = [5, 11].includes(i)
                    else active = i === 11
                    return (
                      <div key={i} className="flex-1 text-center">
                        <div className={`h-8 rounded-md mb-1 flex items-center justify-center text-[10px] font-bold ${
                          active ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'
                        }`}>
                          {active ? '💰' : ''}
                        </div>
                        <span className="text-[9px] text-gray-400">{i + 1}월</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 세금 안내 */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5">💡</span>
                  <div>
                    <p className="text-xs font-bold text-amber-800 mb-1">세금 안내</p>
                    <p className="text-xs text-amber-700 leading-relaxed">{result.taxType}</p>
                    {accountType === 'general' && result.grossAnnual > 20000000 && (
                      <p className="text-xs text-amber-600 mt-1 font-medium">⚠️ 연 배당 2,000만원 초과 시 금융소득종합과세 대상입니다.</p>
                    )}
                    {accountType === 'general' && (
                      <p className="text-xs text-emerald-600 mt-1 font-medium">💚 ISA 계좌 이용 시 200만원까지 비과세, 초과분도 9.9%만 과세됩니다.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 공유 */}
              <button
                onClick={shareKakao}
                className="w-full py-3.5 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-semibold rounded-xl active:scale-[0.98] text-[14px] flex items-center justify-center gap-2 transition-all min-h-[44px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
                카카오톡으로 공유하기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 하단 면책 */}
      <div className="text-center px-4 py-3">
        <p className="text-[10px] text-gray-300 leading-relaxed">
          본 계산기는 참고용이며 실제 배당금은 기업 실적에 따라 변동될 수 있습니다.
          주가는 네이버 증권 기준이며 15분 지연될 수 있습니다.
          투자 판단의 책임은 본인에게 있습니다.
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── 상수 ───
const LIFE = 85 // 기대수명
const RET = 0.05 // 연 수익률
const INF = 0.03 // 물가상승률
const LIVING: Record<string, { label: string; monthly: number; desc: string }> = {
  min_single: { label: '1인 최소', monthly: 1_240_000, desc: '끼니 해결 수준' },
  min_couple: { label: '부부 최소', monthly: 2_400_000, desc: '기본 생활' },
  ok_single: { label: '1인 적정', monthly: 1_920_000, desc: '가끔 외식' },
  ok_couple: { label: '부부 적정', monthly: 3_500_000, desc: '여유 있는 생활' },
}

// ─── 계산 ───
interface Input { age: number; retireAge: number; monthlyNeed: string; currentSaved: number; monthlySave: number; pensionExpect: number }
interface Result {
  retireYrs: number // 은퇴까지 남은 년수
  liveYrs: number // 은퇴 후 생존 년수
  totalNeed: number // 은퇴 후 총 필요 자금
  totalNeedInfl: number // 물가 반영 총 필요
  pension: number // 연금 총 수령
  gap: number // 부족분
  currentGrow: number // 현재 자산 복리 성장
  saveGrow: number // 매월 저축 복리 성장
  totalHave: number // 은퇴 시점 총 자산
  surplus: number // 잉여 or 부족
  extraPerMonth: number // 부족 시 월 추가 필요
  monthlyNeedVal: number // 월 생활비
}

function calc(inp: Input): Result {
  const monthlyNeedVal = LIVING[inp.monthlyNeed]?.monthly ?? 2_400_000
  const retireYrs = Math.max(inp.retireAge - inp.age, 1)
  const liveYrs = Math.max(LIFE - inp.retireAge, 1)
  const totalNeed = monthlyNeedVal * 12 * liveYrs
  const totalNeedInfl = Math.round(monthlyNeedVal * 12 * liveYrs * Math.pow(1 + INF, retireYrs))
  const pension = inp.pensionExpect * 10000 * 12 * liveYrs
  const gap = totalNeedInfl - pension

  const currentSavedWon = inp.currentSaved * 10000
  const monthlySaveWon = inp.monthlySave * 10000
  const currentGrow = Math.round(currentSavedWon * Math.pow(1 + RET, retireYrs))
  const mr = RET / 12, mo = retireYrs * 12
  const saveGrow = monthlySaveWon > 0 ? Math.round(monthlySaveWon * ((Math.pow(1 + mr, mo) - 1) / mr)) : 0
  const totalHave = currentGrow + saveGrow
  const surplus = totalHave - gap

  // 부족 시 월 추가 저축 필요액
  let extraPerMonth = 0
  if (surplus < 0) {
    const need = -surplus
    // need = X * ((1+mr)^mo - 1) / mr → X = need * mr / ((1+mr)^mo - 1)
    const factor = (Math.pow(1 + mr, mo) - 1) / mr
    extraPerMonth = factor > 0 ? Math.round(need / factor) : 0
  }

  return { retireYrs, liveYrs, totalNeed, totalNeedInfl, pension, gap, currentGrow, saveGrow, totalHave, surplus, extraPerMonth, monthlyNeedVal }
}

function w(n: number) {
  if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(1) + '억'
  if (Math.abs(n) >= 1e4) return Math.round(n / 1e4).toLocaleString() + '만'
  return n.toLocaleString()
}
function ww(n: number) { return w(n) + '원' }

// ─── 컴포넌트 ───
export default function RetirementSimulator() {
  const [inp, setInp] = useState<Input>({
    age: 35, retireAge: 65, monthlyNeed: 'ok_couple',
    currentSaved: 3000, monthlySave: 50, pensionExpect: 80,
  })
  const [result, setResult] = useState<Result | null>(null)
  const [member, setMember] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (r.ok) setMember(true) }).catch(() => {})
  }, [])

  const run = () => setResult(calc(inp))

  // ─── 입력 ───
  if (!result) return (
    <div className="max-w-[440px] mx-auto px-4">
      <div className="text-center pt-4 pb-6 space-y-2">
        <h2 className="text-[24px] font-[900] text-gray-900 leading-tight">은퇴까지<br/>얼마를 모아야 할까?</h2>
        <p className="text-[12px] text-gray-500">6개만 입력하면 바로 계산됩니다</p>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FI l="현재 나이" v={inp.age} u="세" set={v => setInp({...inp, age: v})} min={20} max={70} />
          <FI l="은퇴 나이" v={inp.retireAge} u="세" set={v => setInp({...inp, retireAge: v})} min={inp.age + 1} max={80} />
        </div>

        <div>
          <label className="block text-[11px] font-[600] text-gray-500 mb-1.5">은퇴 후 원하는 생활 수준</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(LIVING).map(([k, v]) => (
              <button key={k} type="button" onClick={() => setInp({...inp, monthlyNeed: k})}
                className={`p-3 rounded-xl border text-left transition ${inp.monthlyNeed === k ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white active:bg-gray-50'}`}>
                <p className={`text-[13px] font-[700] ${inp.monthlyNeed === k ? 'text-green-700' : 'text-gray-800'}`}>{v.label}</p>
                <p className="text-[11px] text-gray-500">월 {ww(v.monthly)}</p>
                <p className="text-[9px] text-gray-400">{v.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <FI l="현재 저축/투자 총액" v={inp.currentSaved} u="만원" set={v => setInp({...inp, currentSaved: v})} step={500} min={0}
          sub="예금+적금+투자+퇴직금 합산 (부동산 제외)" />
        <div className="flex gap-1.5 flex-wrap">
          {[1000,3000,5000,10000,30000,50000].map(v => (
            <button key={v} type="button" onClick={() => setInp({...inp, currentSaved: v})}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${inp.currentSaved === v ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 active:bg-gray-200'}`}>{w(v * 1e4)}</button>
          ))}
        </div>

        <FI l="매월 저축/투자 금액" v={inp.monthlySave} u="만원" set={v => setInp({...inp, monthlySave: v})} step={10} min={0} />
        <FI l="예상 국민연금 수령액" v={inp.pensionExpect} u="만원/월" set={v => setInp({...inp, pensionExpect: v})} step={10} min={0}
          sub="국민연금공단 조회 권장. 모르면 평균 67만원" />

        <button onClick={run} className="w-full py-4 bg-green-600 text-white font-[800] rounded-xl text-[15px] hover:bg-green-700 transition mt-2 active:scale-[0.98]">
          계산하기
        </button>
        <p className="text-[10px] text-center text-gray-400">연 수익률 5%, 물가상승률 3%, 기대수명 85세 기준</p>
      </div>
    </div>
  )

  // ─── 결과 ───
  const r = result
  const ok = r.surplus >= 0
  const pct = Math.min(Math.round(r.totalHave / r.gap * 100), 999)

  return (
    <div className="max-w-[440px] mx-auto px-4">
      {/* 핵심 한 줄 */}
      <div className={`rounded-2xl p-5 text-center ${ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <p className="text-[11px] text-gray-500 mb-1">은퇴까지 {r.retireYrs}년, 은퇴 후 {r.liveYrs}년</p>
        <p className={`text-[28px] font-[900] ${ok ? 'text-green-700' : 'text-red-700'}`}>
          {ok ? '준비 완료' : `${ww(Math.abs(r.surplus))} 부족`}
        </p>
        <p className="text-[12px] text-gray-600 mt-1">
          {ok ? `${ww(r.surplus)} 여유 있습니다` : `매월 ${ww(r.extraPerMonth)} 추가 저축 필요`}
        </p>
      </div>

      {/* 프로그레스 바 */}
      <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-gray-500">달성률</span>
          <span className={`font-[800] ${pct >= 100 ? 'text-green-600' : pct >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>0원</span>
          <span>목표 {ww(r.gap)}</span>
        </div>
      </div>

      {/* 필요 vs 준비 */}
      <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <p className="text-[13px] font-[700] text-gray-900">필요한 돈</p>
        <Row l={`월 생활비 (${LIVING[inp.monthlyNeed]?.label})`} v={ww(r.monthlyNeedVal)} />
        <Row l={`은퇴 후 ${r.liveYrs}년간 총 필요`} v={ww(r.totalNeed)} />
        <Row l={`물가 반영 (${r.retireYrs}년 후 가치)`} v={ww(r.totalNeedInfl)} bold />
        <Row l={`국민연금 총 수령 (${r.liveYrs}년)`} v={`-${ww(r.pension)}`} green />
        <div className="border-t border-gray-100 pt-2">
          <Row l="내가 채워야 할 금액" v={ww(r.gap)} bold />
        </div>
      </div>

      <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <p className="text-[13px] font-[700] text-gray-900">준비된 돈</p>
        <Row l={`현재 자산 ${ww(inp.currentSaved * 1e4)} → 복리 성장`} v={ww(r.currentGrow)} />
        <Row l={`매월 ${ww(inp.monthlySave * 1e4)} × ${r.retireYrs}년 적립`} v={ww(r.saveGrow)} />
        <div className="border-t border-gray-100 pt-2">
          <Row l="은퇴 시점 총 자산" v={ww(r.totalHave)} bold />
        </div>
      </div>

      {/* 부족 시 해결 방법 */}
      {!ok && (
        <div className="mt-3 bg-white border border-red-200 rounded-2xl p-4">
          <p className="text-[13px] font-[700] text-red-700 mb-2">부족분 해결 방법</p>
          <div className="space-y-2">
            <Tip text={`매월 ${ww(r.extraPerMonth)} 추가 저축 (현재 + ${ww(r.extraPerMonth)})`} />
            <Tip text={`은퇴 나이를 ${inp.retireAge + 3}세로 늦추기`} />
            <Tip text={`생활 수준을 한 단계 낮추기`} />
            <Tip text={`수익률 높은 투자 포트폴리오 구성`} />
          </div>
        </div>
      )}

      {/* 카페 가입 유도 */}
      {!member && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-[13px] font-[700] text-gray-900">맞춤 노후 설계가 필요하다면</p>
          <p className="text-[11px] text-gray-500 mt-1">세금 분석, 투자 시나리오, 연금 최적화</p>
          <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer"
            className="inline-block mt-3 px-6 py-2.5 bg-[#03C75A] text-white font-[700] rounded-xl text-[13px] active:bg-[#02b050]">
            노후연구소 카페 가입하기
          </a>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 -mx-4 px-4 py-3 flex gap-2 z-40 mt-4">
        <button onClick={() => setResult(null)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-[13px] font-bold active:bg-gray-50">다시 계산</button>
        <button onClick={() => share(r, inp)} className="flex-[2] py-3 bg-green-600 text-white rounded-xl text-[13px] font-[800] active:bg-green-700">결과 공유하기</button>
      </div>
      <div className="h-16" />
    </div>
  )
}

// ─── 공유 ───
function share(r: Result, inp: Input) {
  const ok = r.surplus >= 0
  const txt = `[노후 자금 계산기]\n\n${inp.age}세 → ${inp.retireAge}세 은퇴\n월 생활비: ${ww(r.monthlyNeedVal)}\n\n필요 자금: ${ww(r.gap)}\n준비 자금: ${ww(r.totalHave)}\n\n${ok ? `✅ ${ww(r.surplus)} 여유` : `❌ ${ww(Math.abs(r.surplus))} 부족 (월 ${ww(r.extraPerMonth)} 추가 필요)`}\n\n나도 계산해보기:\nhttps://nohu-lab.vercel.app/programs/retirement-simulator\n\n노후연구소 카페\ncafe.naver.com/eovhskfktmak`
  if (navigator.share) navigator.share({ title: '노후 자금 계산기', text: txt }).catch(() => {})
  else { navigator.clipboard.writeText(txt); alert('클립보드에 복사되었습니다') }
}

// ─── UI ───
function FI({ l, v, u, set, step = 1, min = 0, max, sub }: { l: string; v: number; u: string; set: (v: number) => void; step?: number; min?: number; max?: number; sub?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-[600] text-gray-500 mb-1">{l}</label>
      <div className="relative">
        <input type="number" value={v} onChange={e => set(+e.target.value)} step={step} min={min} max={max}
          className="w-full px-3 py-3 rounded-xl border border-gray-200 text-gray-900 text-[17px] font-[700] focus:ring-2 focus:ring-green-500 outline-none pr-16 bg-white" />
        <span className="absolute right-3 top-3.5 text-[11px] text-gray-400">{u}</span>
      </div>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Row({ l, v, bold, green }: { l: string; v: string; bold?: boolean; green?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <p className={`text-[11px] ${bold ? 'font-[700] text-gray-900' : 'text-gray-600'}`}>{l}</p>
      <p className={`text-[12px] shrink-0 tabular-nums ${bold ? 'font-[800] text-gray-900' : green ? 'font-[600] text-green-600' : 'font-[500] text-gray-800'}`}>{v}</p>
    </div>
  )
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-[11px] text-gray-700">
      <span className="shrink-0 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-[8px] font-bold text-red-600 mt-0.5">!</span>
      <span>{text}</span>
    </div>
  )
}

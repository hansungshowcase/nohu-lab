'use client'

import { useState, useMemo } from 'react'

// ─── 계산 로직 ───

// 소득세 간이세액표 기반 근사 (월 세전급여 → 월 실수령액)
function calcMonthlyNet(grossMonthly: number): number {
  // 4대보험 요율 (2025 기준 근사)
  const nationalPension = Math.min(grossMonthly * 0.045, 265500) // 국민연금 4.5%
  const healthInsurance = grossMonthly * 0.03545 // 건강보험 3.545%
  const longTermCare = healthInsurance * 0.1281 // 장기요양 12.81%
  const employment = grossMonthly * 0.009 // 고용보험 0.9%

  const socialTotal = nationalPension + healthInsurance + longTermCare + employment

  // 소득세 근사 (간이세액표 근사)
  const taxableAnnual = grossMonthly * 12
  let incomeTax = 0
  if (taxableAnnual <= 14_000_000) incomeTax = 0
  else if (taxableAnnual <= 50_000_000) incomeTax = (taxableAnnual - 14_000_000) * 0.06
  else if (taxableAnnual <= 88_000_000) incomeTax = 2_160_000 + (taxableAnnual - 50_000_000) * 0.15
  else if (taxableAnnual <= 150_000_000) incomeTax = 7_860_000 + (taxableAnnual - 88_000_000) * 0.24
  else if (taxableAnnual <= 300_000_000) incomeTax = 22_740_000 + (taxableAnnual - 150_000_000) * 0.35
  else incomeTax = 75_240_000 + (taxableAnnual - 300_000_000) * 0.38

  const monthlyIncomeTax = incomeTax / 12
  const localTax = monthlyIncomeTax * 0.1

  return Math.round(grossMonthly - socialTotal - monthlyIncomeTax - localTax)
}

// 국민연금 예상 수령액 (간이 계산)
function calcPension(grossMonthly: number, yearsWorked: number): number {
  // A값 (전체가입자 평균소득월액) 약 280만원 기준
  const A = 2_800_000
  const B = Math.min(grossMonthly, 5_900_000) // 상한
  // 기본연금액 = (A + B) × 가입기간 × 연금수급계수
  const basicPension = (A + B) * yearsWorked * 0.008 // 약 0.8% per year (20년 기준)

  // 최소/최대 보정
  return Math.round(Math.max(basicPension, 300_000))
}

interface SimResult {
  monthlyNet: number           // 현재 월 실수령액
  annualGross: number          // 연봉
  totalSaved: number           // 은퇴 시점 총 저축
  monthlyPension: number       // 국민연금 예상 수령
  monthlyRetirement: number    // 퇴직연금 월 환산
  monthlyTotal: number         // 은퇴 후 총 월수입
  retirementYears: number      // 은퇴 후 생존 연수
  savingsDepletionAge: number  // 저축 소진 나이
  lifestyle: string            // 생활 수준 판정
  lifestyleColor: string
  breakdown: {
    pension: number
    retirementPay: number
    savingsIncome: number
  }
  yearlyData: {
    age: number
    savings: number
    income: number
    expense: number
  }[]
}

function simulate(
  grossMonthly: number,
  currentAge: number,
  retireAge: number,
  savingsRate: number,     // 저축률 (%)
  monthlyExpense: number,  // 은퇴 후 예상 월 생활비
  investReturn: number,    // 연평균 투자수익률 (%)
): SimResult {
  const monthlyNet = calcMonthlyNet(grossMonthly)
  const annualGross = grossMonthly * 12
  const monthlySavings = Math.round(monthlyNet * (savingsRate / 100))

  // 은퇴까지 저축 (복리)
  const yearsToRetire = retireAge - currentAge
  const monthlyReturn = investReturn / 100 / 12
  let totalSaved = 0
  for (let m = 0; m < yearsToRetire * 12; m++) {
    totalSaved = totalSaved * (1 + monthlyReturn) + monthlySavings
  }
  totalSaved = Math.round(totalSaved)

  // 국민연금 (가입기간 = 근무연수)
  const yearsWorked = Math.max(yearsToRetire, 10)
  const monthlyPension = calcPension(grossMonthly, Math.min(yearsWorked, 40))

  // 퇴직금 (월급 × 근속연수, 퇴직연금으로 수령 시 20년 분할)
  const retirementLumpsum = grossMonthly * yearsToRetire
  const monthlyRetirement = Math.round(retirementLumpsum / (20 * 12))

  // 은퇴 후 월 수입
  const monthlyTotal = monthlyPension + monthlyRetirement

  // 부족분은 저축에서 충당
  const monthlyDeficit = Math.max(monthlyExpense - monthlyTotal, 0)

  // 저축 소진 시뮬레이션 (은퇴 후 연 2% 수익률 가정)
  const retireReturn = 0.02 / 12
  let savings = totalSaved
  const yearlyData: SimResult['yearlyData'] = []
  let depletionAge = 100

  for (let age = retireAge; age <= 100; age++) {
    yearlyData.push({
      age,
      savings: Math.round(savings),
      income: monthlyTotal,
      expense: monthlyExpense,
    })
    for (let m = 0; m < 12; m++) {
      savings = savings * (1 + retireReturn) - monthlyDeficit
      if (savings <= 0) {
        savings = 0
        depletionAge = age
        break
      }
    }
    if (savings <= 0) {
      // 나머지 연도 채우기
      for (let a = age + 1; a <= 100; a++) {
        yearlyData.push({ age: a, savings: 0, income: monthlyTotal, expense: monthlyExpense })
      }
      break
    }
  }

  // 생활 수준 판정
  let lifestyle: string
  let lifestyleColor: string
  const ratio = monthlyTotal / monthlyExpense
  if (ratio >= 1) {
    lifestyle = '여유로운 노후'
    lifestyleColor = 'text-green-700'
  } else if (ratio >= 0.7) {
    lifestyle = '적정 수준'
    lifestyleColor = 'text-green-600'
  } else if (ratio >= 0.5) {
    lifestyle = '다소 부족'
    lifestyleColor = 'text-yellow-600'
  } else {
    lifestyle = '준비 필요'
    lifestyleColor = 'text-red-600'
  }

  return {
    monthlyNet,
    annualGross,
    totalSaved,
    monthlyPension,
    monthlyRetirement,
    monthlyTotal,
    retirementYears: 100 - retireAge,
    savingsDepletionAge: depletionAge,
    lifestyle,
    lifestyleColor,
    breakdown: {
      pension: monthlyPension,
      retirementPay: monthlyRetirement,
      savingsIncome: monthlyDeficit > 0 ? 0 : Math.round((totalSaved * 0.02) / 12),
    },
    yearlyData,
  }
}

// ─── 포맷 함수 ───
function won(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + '억원'
  if (n >= 10_000) return Math.round(n / 10_000).toLocaleString() + '만원'
  return n.toLocaleString() + '원'
}

// ─── 바 차트 ───
function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{won(value)}</span>
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── 저축 그래프 (텍스트 기반) ───
function SavingsChart({ data }: { data: SimResult['yearlyData'] }) {
  const maxSavings = Math.max(...data.map((d) => d.savings), 1)
  const step = data.length > 20 ? 5 : 1

  return (
    <div className="space-y-1">
      {data.filter((_, i) => i % step === 0).map((d) => {
        const pct = (d.savings / maxSavings) * 100
        return (
          <div key={d.age} className="flex items-center gap-2 text-xs">
            <span className="w-8 text-right text-gray-500">{d.age}세</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${d.savings > 0 ? 'bg-green-400' : 'bg-red-300'}`}
                style={{ width: `${Math.max(pct, d.savings > 0 ? 1 : 0)}%` }}
              />
            </div>
            <span className="w-20 text-right text-gray-700">{won(d.savings)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── 메인 컴포넌트 ───
export default function RetirementSimulator() {
  const [grossMonthly, setGrossMonthly] = useState(3_000_000)
  const [currentAge, setCurrentAge] = useState(35)
  const [retireAge, setRetireAge] = useState(65)
  const [savingsRate, setSavingsRate] = useState(30)
  const [monthlyExpense, setMonthlyExpense] = useState(2_000_000)
  const [investReturn, setInvestReturn] = useState(5)
  const [showResult, setShowResult] = useState(false)

  const result = useMemo(
    () => simulate(grossMonthly, currentAge, retireAge, savingsRate, monthlyExpense, investReturn),
    [grossMonthly, currentAge, retireAge, savingsRate, monthlyExpense, investReturn]
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setShowResult(true)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 세전 월급 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            세전 월급여 (원)
          </label>
          <input
            type="number"
            value={grossMonthly}
            onChange={(e) => setGrossMonthly(Number(e.target.value))}
            step={100000}
            min={1000000}
            className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            실수령액 약 {won(calcMonthlyNet(grossMonthly))} · 연봉 약 {won(grossMonthly * 12)}
          </p>
        </div>

        {/* 나이 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">현재 나이</label>
            <input
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              min={20} max={64}
              className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">은퇴 예정 나이</label>
            <input
              type="number"
              value={retireAge}
              onChange={(e) => setRetireAge(Number(e.target.value))}
              min={currentAge + 1} max={80}
              className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* 저축률 슬라이더 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            월 저축률: <span className="text-green-700 font-bold">{savingsRate}%</span>
            <span className="text-gray-500 font-normal"> ({won(Math.round(calcMonthlyNet(grossMonthly) * savingsRate / 100))}/월)</span>
          </label>
          <input
            type="range"
            value={savingsRate}
            onChange={(e) => setSavingsRate(Number(e.target.value))}
            min={0} max={80} step={5}
            className="w-full accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0%</span><span>40%</span><span>80%</span>
          </div>
        </div>

        {/* 은퇴 후 월 생활비 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            은퇴 후 예상 월 생활비
          </label>
          <input
            type="number"
            value={monthlyExpense}
            onChange={(e) => setMonthlyExpense(Number(e.target.value))}
            step={100000}
            min={500000}
            className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
          />
          <div className="flex gap-2 mt-2">
            {[1500000, 2000000, 2500000, 3000000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMonthlyExpense(v)}
                className={`px-2 py-1 rounded text-xs ${monthlyExpense === v ? 'bg-green-600 text-white' : 'bg-green-50 text-gray-700 hover:bg-green-100'}`}
              >
                {won(v)}
              </button>
            ))}
          </div>
        </div>

        {/* 투자수익률 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            예상 연 투자수익률: <span className="text-green-700 font-bold">{investReturn}%</span>
          </label>
          <input
            type="range"
            value={investReturn}
            onChange={(e) => setInvestReturn(Number(e.target.value))}
            min={0} max={12} step={0.5}
            className="w-full accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0% (예금)</span><span>5% (펀드)</span><span>12% (공격투자)</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition text-base"
        >
          노후 시뮬레이션 실행
        </button>
      </form>

      {/* ─── 결과 ─── */}
      {showResult && (
        <div className="space-y-6 border-t border-green-200 pt-6">
          {/* 종합 판정 */}
          <div className="bg-white rounded-xl border border-green-200 p-6 text-center">
            <div className="text-4xl mb-2">
              {result.lifestyle === '여유로운 노후' ? '😊' : result.lifestyle === '적정 수준' ? '🙂' : result.lifestyle === '다소 부족' ? '😐' : '😟'}
            </div>
            <div className={`text-2xl font-bold mb-1 ${result.lifestyleColor}`}>
              {result.lifestyle}
            </div>
            <p className="text-sm text-gray-600">
              은퇴 후 월 수입 <b>{won(result.monthlyTotal)}</b> / 필요 생활비 <b>{won(monthlyExpense)}</b>
            </p>
            {result.savingsDepletionAge < 100 && (
              <p className="text-sm text-red-600 mt-2 font-medium">
                저축이 {result.savingsDepletionAge}세에 소진됩니다
              </p>
            )}
            {result.savingsDepletionAge >= 100 && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                100세까지 저축이 유지됩니다
              </p>
            )}
          </div>

          {/* 현재 → 은퇴 요약 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg border border-green-100 p-4">
              <div className="text-xs text-gray-500">현재 실수령액</div>
              <div className="text-lg font-bold text-gray-900">{won(result.monthlyNet)}</div>
            </div>
            <div className="bg-white rounded-lg border border-green-100 p-4">
              <div className="text-xs text-gray-500">은퇴 시 총 저축</div>
              <div className="text-lg font-bold text-gray-900">{won(result.totalSaved)}</div>
            </div>
            <div className="bg-white rounded-lg border border-green-100 p-4">
              <div className="text-xs text-gray-500">국민연금 (예상)</div>
              <div className="text-lg font-bold text-gray-900">{won(result.monthlyPension)}/월</div>
            </div>
            <div className="bg-white rounded-lg border border-green-100 p-4">
              <div className="text-xs text-gray-500">퇴직연금 (20년 분할)</div>
              <div className="text-lg font-bold text-gray-900">{won(result.monthlyRetirement)}/월</div>
            </div>
          </div>

          {/* 은퇴 후 수입 구성 */}
          <div className="bg-white rounded-xl border border-green-200 p-5 space-y-3">
            <h3 className="font-bold text-gray-900">은퇴 후 월 수입 구성</h3>
            <Bar label="국민연금" value={result.breakdown.pension} max={monthlyExpense} color="bg-green-500" />
            <Bar label="퇴직연금" value={result.breakdown.retirementPay} max={monthlyExpense} color="bg-green-400" />
            <Bar label="필요 생활비" value={monthlyExpense} max={monthlyExpense} color="bg-gray-300" />
            <div className="text-xs text-gray-500 pt-2 border-t border-green-100">
              부족분 <b>{won(Math.max(monthlyExpense - result.monthlyTotal, 0))}</b>/월은 저축에서 충당
            </div>
          </div>

          {/* 저축 잔고 추이 */}
          <div className="bg-white rounded-xl border border-green-200 p-5 space-y-3">
            <h3 className="font-bold text-gray-900">은퇴 후 저축 잔고 추이</h3>
            <SavingsChart data={result.yearlyData} />
          </div>

          {/* 팁 */}
          <div className="bg-green-50 rounded-xl p-5 space-y-2">
            <h3 className="font-bold text-gray-900">💡 노후 준비 팁</h3>
            <ul className="text-sm text-gray-800 space-y-1 list-disc list-inside">
              {savingsRate < 20 && <li>저축률을 20% 이상으로 높이면 노후 자금이 크게 늘어납니다</li>}
              {investReturn < 4 && <li>장기 투자(인덱스 펀드 등)로 수익률을 높이는 것을 고려해보세요</li>}
              {monthlyExpense > result.monthlyTotal && (
                <li>은퇴 후 생활비를 {won(result.monthlyTotal)} 이하로 조정하면 저축 소진을 방지할 수 있습니다</li>
              )}
              <li>국민연금 수령 시기를 늦추면 (최대 70세) 월 수령액이 최대 36% 증가합니다</li>
              <li>개인연금(IRP, 연금저축)을 추가하면 세액공제 + 추가 노후자금 확보 가능</li>
              {retireAge < 60 && <li>조기 은퇴 시 국민연금 수령까지 공백기가 생길 수 있습니다</li>}
            </ul>
          </div>

          <p className="text-xs text-gray-400 text-center">
            ※ 이 시뮬레이션은 간이 추정치이며, 실제 국민연금·세금·물가상승률과 다를 수 있습니다.
            정확한 상담은 국민연금공단(1355)을 이용하세요.
          </p>
        </div>
      )}
    </div>
  )
}

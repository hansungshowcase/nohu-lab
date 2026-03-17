'use client'

import { useState, useMemo } from 'react'

// 출생연도별 정상 수령 개시 나이
function getNormalAge(birthYear: number): number {
  if (birthYear <= 1952) return 60
  if (birthYear <= 1956) return 61
  if (birthYear <= 1960) return 62
  if (birthYear <= 1964) return 63
  if (birthYear <= 1968) return 64
  return 65
}

// 조기수령: 1년당 6% 감액 (월 0.5%)
// 연기수령: 1년당 7.2% 증액 (월 0.6%)
interface PensionOption {
  label: string
  startAge: number
  monthlyAmount: number
  rate: number // 정상 대비 비율
  type: 'early' | 'normal' | 'deferred'
  yearsDiff: number
}

function calculateOptions(normalAge: number, baseAmount: number): PensionOption[] {
  const options: PensionOption[] = []

  // 조기수령 (1~5년 앞당김)
  for (let y = 5; y >= 1; y--) {
    const rate = 1 - y * 0.06
    options.push({
      label: `${y}년 조기 (${normalAge - y}세)`,
      startAge: normalAge - y,
      monthlyAmount: Math.round(baseAmount * rate),
      rate,
      type: 'early',
      yearsDiff: -y,
    })
  }

  // 정상수령
  options.push({
    label: `정상 수령 (${normalAge}세)`,
    startAge: normalAge,
    monthlyAmount: baseAmount,
    rate: 1,
    type: 'normal',
    yearsDiff: 0,
  })

  // 연기수령 (1~5년 늦춤)
  for (let y = 1; y <= 5; y++) {
    const rate = 1 + y * 0.072
    options.push({
      label: `${y}년 연기 (${normalAge + y}세)`,
      startAge: normalAge + y,
      monthlyAmount: Math.round(baseAmount * rate),
      rate,
      type: 'deferred',
      yearsDiff: y,
    })
  }

  return options
}

// 두 옵션 간 손익분기 나이 계산
function getBreakEvenAge(optA: PensionOption, optB: PensionOption): number | null {
  // optA가 먼저 시작, optB가 나중에 시작하되 월액이 더 큰 경우
  const early = optA.startAge < optB.startAge ? optA : optB
  const late = optA.startAge < optB.startAge ? optB : optA

  if (late.monthlyAmount <= early.monthlyAmount) return null

  // early가 late.startAge까지 혼자 받는 누적액
  const headStart = (late.startAge - early.startAge) * 12 * early.monthlyAmount
  // late.startAge 이후 매월 차이
  const monthlyDiff = late.monthlyAmount - early.monthlyAmount
  if (monthlyDiff <= 0) return null

  const monthsToBreakEven = Math.ceil(headStart / monthlyDiff)
  const breakEvenAge = late.startAge + monthsToBreakEven / 12

  return Math.round(breakEvenAge * 10) / 10
}

// 특정 나이까지 누적 수령액
function getCumulative(option: PensionOption, targetAge: number): number {
  if (targetAge <= option.startAge) return 0
  const months = Math.floor((targetAge - option.startAge) * 12)
  return months * option.monthlyAmount
}

const formatMoney = (n: number) => n.toLocaleString() + '원'

export default function PensionTiming() {
  const [birthYear, setBirthYear] = useState('')
  const [monthlyPension, setMonthlyPension] = useState('')
  const [lifeExpectancy, setLifeExpectancy] = useState('85')
  const [calculated, setCalculated] = useState(false)

  const birthYearNum = parseInt(birthYear)
  const baseAmount = parseInt(monthlyPension.replace(/,/g, ''))
  const lifeExp = parseInt(lifeExpectancy)

  const normalAge = useMemo(() => {
    if (!birthYearNum || birthYearNum < 1930 || birthYearNum > 2000) return 0
    return getNormalAge(birthYearNum)
  }, [birthYearNum])

  const options = useMemo(() => {
    if (!normalAge || !baseAmount || baseAmount <= 0) return []
    return calculateOptions(normalAge, baseAmount)
  }, [normalAge, baseAmount])

  const normalOption = options.find((o) => o.type === 'normal')

  // 기대수명까지 누적액 기준 최적 옵션
  const bestOption = useMemo(() => {
    if (!options.length || !lifeExp) return null
    let best = options[0]
    let bestCum = getCumulative(options[0], lifeExp)
    for (const opt of options) {
      const cum = getCumulative(opt, lifeExp)
      if (cum > bestCum) {
        best = opt
        bestCum = cum
      }
    }
    return best
  }, [options, lifeExp])

  // 비교 나이 목록 (5세 단위)
  const comparisonAges = useMemo(() => {
    if (!normalAge) return []
    const ages: number[] = []
    const start = normalAge - 5
    for (let a = start; a <= 95; a += 5) {
      if (a >= 60) ages.push(a)
    }
    return ages
  }, [normalAge])

  // 주요 옵션 3개 (5년 조기, 정상, 5년 연기) 간 손익분기
  const breakEvens = useMemo(() => {
    if (!options.length || !normalOption) return []
    const early5 = options.find((o) => o.yearsDiff === -5)
    const defer5 = options.find((o) => o.yearsDiff === 5)
    const results: { pair: string; age: number | null }[] = []

    if (early5) {
      results.push({
        pair: `${early5.label} vs ${normalOption.label}`,
        age: getBreakEvenAge(early5, normalOption),
      })
    }
    if (defer5) {
      results.push({
        pair: `${normalOption.label} vs ${defer5.label}`,
        age: getBreakEvenAge(normalOption, defer5),
      })
    }
    if (early5 && defer5) {
      results.push({
        pair: `${early5.label} vs ${defer5.label}`,
        age: getBreakEvenAge(early5, defer5),
      })
    }
    return results
  }, [options, normalOption])

  function handleCalculate() {
    if (!birthYearNum || birthYearNum < 1930 || birthYearNum > 2000) return
    if (!baseAmount || baseAmount <= 0) return
    setCalculated(true)
  }

  function handleMonthlyChange(val: string) {
    const num = val.replace(/[^0-9]/g, '')
    if (num) {
      setMonthlyPension(parseInt(num).toLocaleString())
    } else {
      setMonthlyPension('')
    }
    setCalculated(false)
  }

  // 누적 수령액 바 차트에서 최대값
  const maxCumulative = useMemo(() => {
    if (!options.length || !lifeExp) return 0
    return Math.max(...options.map((o) => getCumulative(o, lifeExp)))
  }, [options, lifeExp])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 입력 폼 */}
      <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              출생연도
            </label>
            <input
              type="number"
              value={birthYear}
              onChange={(e) => { setBirthYear(e.target.value); setCalculated(false) }}
              placeholder="예: 1965"
              min={1930}
              max={2000}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[14px] placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              예상 월 수령액
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={monthlyPension}
                onChange={(e) => handleMonthlyChange(e.target.value)}
                placeholder="예: 1,000,000"
                className="w-full px-3.5 py-3 pr-8 rounded-xl border border-gray-200 bg-white text-gray-900 text-[14px] placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">원</span>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              기대수명
            </label>
            <select
              value={lifeExpectancy}
              onChange={(e) => { setLifeExpectancy(e.target.value); setCalculated(false) }}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[14px] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all"
            >
              {[75, 80, 85, 90, 95, 100].map((age) => (
                <option key={age} value={age}>{age}세</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[12px] text-gray-400">
          * 예상 월 수령액은 정상 수령 나이 기준 금액입니다. 국민연금공단(NPS)에서 확인 가능합니다.
        </p>

        <button
          onClick={handleCalculate}
          disabled={!birthYear || !monthlyPension}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 text-white font-semibold text-[14px] rounded-xl transition-all duration-200 shadow-md shadow-orange-500/20 disabled:shadow-none"
        >
          황금 타이밍 계산하기
        </button>
      </div>

      {calculated && options.length > 0 && normalOption && bestOption && (
        <>
          {/* 정상 수령 나이 안내 */}
          <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                {normalAge}
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">정상 수령 개시 나이: {normalAge}세</p>
                <p className="text-[12px] text-gray-500">{birthYearNum}년생 기준 · 월 {formatMoney(baseAmount)}</p>
              </div>
            </div>
          </div>

          {/* 황금 타이밍 결과 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 mb-1">황금 타이밍</h3>
                <p className="text-[14px] text-gray-700">
                  기대수명 <strong>{lifeExp}세</strong> 기준, <strong className="text-orange-600">{bestOption.label}</strong>이
                  가장 유리합니다.
                </p>
                <p className="text-[13px] text-gray-500 mt-1">
                  월 수령액 <strong>{formatMoney(bestOption.monthlyAmount)}</strong>
                  {bestOption.type === 'early' && ` (${Math.abs(bestOption.yearsDiff * 6)}% 감액)`}
                  {bestOption.type === 'deferred' && ` (${(bestOption.yearsDiff * 7.2).toFixed(1)}% 증액)`}
                  {' · '}총 누적 <strong>{formatMoney(getCumulative(bestOption, lifeExp))}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 손익분기점 */}
          {breakEvens.length > 0 && (
            <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">손익분기 나이</h3>
              <div className="space-y-3">
                {breakEvens.map((be, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-[13px] text-gray-600">{be.pair}</span>
                    <span className="text-[14px] font-bold text-orange-600">
                      {be.age ? `${be.age}세` : '-'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-3">
                * 손익분기 나이 이후부터 늦게 받기 시작한 쪽의 누적액이 더 많아집니다.
              </p>
            </div>
          )}

          {/* 수령 옵션 비교표 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">전체 옵션 비교</h3>
            <div className="space-y-2.5">
              {options.map((opt) => {
                const cum = getCumulative(opt, lifeExp)
                const barWidth = maxCumulative > 0 ? (cum / maxCumulative) * 100 : 0
                const isBest = opt === bestOption
                return (
                  <div
                    key={opt.label}
                    className={`rounded-xl p-3.5 transition-all ${
                      isBest
                        ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 shadow-sm'
                        : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {isBest && <span className="text-[12px]">🏆</span>}
                        <span className={`text-[13px] font-semibold ${isBest ? 'text-orange-700' : 'text-gray-700'}`}>
                          {opt.label}
                        </span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${
                          opt.type === 'early'
                            ? 'bg-blue-50 text-blue-600'
                            : opt.type === 'deferred'
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {opt.type === 'early' ? `${Math.abs(opt.yearsDiff * 6)}% 감액` : opt.type === 'deferred' ? `${(opt.yearsDiff * 7.2).toFixed(1)}% 증액` : '기준'}
                        </span>
                      </div>
                      <span className={`text-[13px] font-bold ${isBest ? 'text-orange-600' : 'text-gray-600'}`}>
                        월 {formatMoney(opt.monthlyAmount)}
                      </span>
                    </div>
                    {/* 누적액 바 */}
                    <div className="h-5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isBest
                            ? 'bg-gradient-to-r from-orange-400 to-amber-500'
                            : opt.type === 'early'
                            ? 'bg-blue-300'
                            : opt.type === 'deferred'
                            ? 'bg-purple-300'
                            : 'bg-green-300'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-2 text-[11px] font-semibold text-gray-600">
                        {(cum / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}만원
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">
              * 기대수명 {lifeExp}세까지의 누적 수령액 기준 (물가상승·투자수익 미반영)
            </p>
          </div>

          {/* 나이별 누적 비교 테이블 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6 overflow-x-auto">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">나이별 누적 수령액 비교</h3>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-2 text-gray-500 font-semibold">나이</th>
                  <th className="text-right py-2 px-2 text-blue-600 font-semibold">5년 조기</th>
                  <th className="text-right py-2 px-2 text-green-600 font-semibold">정상</th>
                  <th className="text-right py-2 px-2 text-purple-600 font-semibold">5년 연기</th>
                </tr>
              </thead>
              <tbody>
                {comparisonAges.map((age) => {
                  const early5 = options.find((o) => o.yearsDiff === -5)
                  const defer5 = options.find((o) => o.yearsDiff === 5)
                  if (!early5 || !defer5) return null
                  const vals = [
                    getCumulative(early5, age),
                    getCumulative(normalOption, age),
                    getCumulative(defer5, age),
                  ]
                  const maxVal = Math.max(...vals)
                  return (
                    <tr key={age} className="border-b border-gray-50">
                      <td className="py-2.5 pr-2 font-semibold text-gray-700">{age}세</td>
                      {vals.map((v, i) => (
                        <td
                          key={i}
                          className={`text-right py-2.5 px-2 ${
                            v === maxVal && v > 0 ? 'font-bold text-orange-600' : 'text-gray-500'
                          }`}
                        >
                          {v > 0 ? `${(v / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}만` : '-'}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 안내 */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-[12px] text-gray-500 space-y-1.5">
            <p className="font-semibold text-gray-700 text-[13px] mb-2">참고사항</p>
            <p>• 조기수령: 1년 앞당길 때마다 <strong>6%</strong> 감액 (최대 5년, 30% 감액)</p>
            <p>• 연기수령: 1년 늦출 때마다 <strong>7.2%</strong> 증액 (최대 5년, 36% 증액)</p>
            <p>• 조기수령은 소득이 있는 경우 제한될 수 있습니다 (소득활동에 따른 감액)</p>
            <p>• 실제 수령액은 물가상승률에 따라 매년 조정됩니다</p>
            <p>• 정확한 예상 수령액은 <a href="https://www.nps.or.kr" target="_blank" rel="noopener noreferrer" className="text-orange-500 underline hover:text-orange-600">국민연금공단</a>에서 확인하세요</p>
          </div>

          {/* 초기화 */}
          <button
            onClick={() => {
              setBirthYear('')
              setMonthlyPension('')
              setLifeExpectancy('85')
              setCalculated(false)
            }}
            className="px-4 py-2 text-sm bg-orange-100 text-gray-700 rounded-lg hover:bg-orange-200 transition"
          >
            초기화
          </button>
        </>
      )}
    </div>
  )
}

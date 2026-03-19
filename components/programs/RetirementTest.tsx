'use client'

import { useState, useCallback, useEffect } from 'react'
import { questions, calculateScores } from './retirement-test/questions'
import { getResultByScore, ResultCode } from './retirement-test/results'
import ResultCard from './retirement-test/ResultCard'
import ShareButtons from './retirement-test/ShareButtons'
import AnalyzingScreen from './retirement-test/AnalyzingScreen'
import { getCrossInsights, getDeepAdvice, getRetirementFundCalc } from './retirement-test/ResultCardA4'

type Phase = 'intro' | 'quiz' | 'analyzing' | 'result'

const FREE_LIMIT = 2
const STORAGE_KEY = 'retirement-test-count'
const CAFE_URL = 'https://cafe.naver.com/eovhskfktmak'

// 연령대별 평균 순자산 (통계청 2025 가계금융복지조사, 만원)
const AGE_ASSET_DATA: Record<string, { avg: number; median: number; label: string }> = {
  '30': { avg: 21000, median: 12000, label: '30대' },
  '40': { avg: 48000, median: 30000, label: '40대' },
  '50': { avg: 55000, median: 35000, label: '50대' },
  '60': { avg: 54000, median: 32000, label: '60대' },
}

function getAssetPercentile(age: number, asset: number): number {
  // 순자산 분포 근사 (로그정규분포 기반, 통계청 데이터)
  const group = age < 40 ? '30' : age < 50 ? '40' : age < 60 ? '50' : '60'
  const data = AGE_ASSET_DATA[group]
  if (!data) return 50
  const ratio = asset / data.avg
  if (ratio >= 3) return 95
  if (ratio >= 2) return 90
  if (ratio >= 1.5) return 80
  if (ratio >= 1) return 60
  if (ratio >= 0.7) return 45
  if (ratio >= 0.5) return 30
  if (ratio >= 0.3) return 15
  return 5
}

function getTestCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function incrementTestCount(): void {
  if (typeof window === 'undefined') return
  try {
    const current = getTestCount()
    localStorage.setItem(STORAGE_KEY, String(current + 1))
  } catch {
    // 시크릿 모드/인앱 브라우저에서 localStorage 접근 불가 시 무시
  }
}

export default function RetirementTest() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [testCount, setTestCount] = useState(0)
  const [isMember, setIsMember] = useState(false)
  const [userAge, setUserAge] = useState('')
  const [userIncome, setUserIncome] = useState('')
  const [userAsset, setUserAsset] = useState('')


  useEffect(() => {
    setTestCount(getTestCount())
    const controller = new AbortController()
    fetch('/api/auth/me', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        if (user && user.tier >= 1) setIsMember(true)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setIsMember(false)
      })
    return () => controller.abort()
  }, [])

  const handleStart = useCallback(() => {
    if (!isMember) {
      const count = getTestCount()
      if (count >= FREE_LIMIT) {
        setShowLimitModal(true)
        return
      }
    }
    setPhase('quiz')
    setCurrentQ(0)
    setAnswers({})
  }, [isMember])

  const handleAnswer = useCallback((questionId: number, score: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: score }
      return next
    })
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1)
    } else {
      setPhase('analyzing')
    }
  }, [currentQ])

  const handleAnalysisComplete = useCallback(() => {
    if (!isMember) {
      incrementTestCount()
      setTestCount(getTestCount())
    }
    setPhase('result')
  }, [isMember])

  const handlePrev = useCallback(() => {
    if (currentQ > 0) {
      setCurrentQ((prev) => prev - 1)
    }
  }, [currentQ])

  // Limit modal
  const limitModal = showLimitModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-bold">무료 체험이 끝났어요!</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-center text-gray-700 text-sm leading-relaxed">
            무료 테스트 <strong>{FREE_LIMIT}회</strong>를 모두 사용하셨습니다.
          </p>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-orange-800 font-bold text-base mb-1">
              카페 회원가입하고 무제한으로 이용하세요!
            </p>
            <p className="text-orange-600 text-xs">
              가입 즉시 무제한 테스트 + 상세 리포트 다운로드
            </p>
          </div>
          <a
            href={CAFE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white text-center text-base font-bold rounded-xl transition"
          >
            카페 회원가입 하러가기
          </a>
          <button
            onClick={() => setShowLimitModal(false)}
            className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  ) : null

  // Intro screen
  if (phase === 'intro') {
    const remaining = Math.max(0, FREE_LIMIT - testCount)

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-8 text-center">
            <div className="text-5xl mb-4">🏦</div>
            <h2 className="text-2xl font-bold">나의 노후 준비 점수는?</h2>
            <p className="text-orange-100 mt-2 text-sm">
              20개 질문으로 알아보는 나의 노후 준비 상태
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              {[
                { icon: '💰', label: '재정 준비도' },
                { icon: '🏃', label: '생활/건강' },
                { icon: '🏠', label: '주거/자산' },
                { icon: '🧠', label: '마인드/지식' },
              ].map((cat) => (
                <div
                  key={cat.label}
                  className="bg-orange-50 rounded-xl p-3"
                >
                  <div className="text-2xl">{cat.icon}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {cat.label}
                  </div>
                </div>
              ))}
            </div>
            {/* 개인정보 입력 */}
            <div className="space-y-3 text-left">
              <div className="text-sm font-semibold text-gray-700 text-center">맞춤 분석을 위한 정보 (선택)</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">나이</label>
                  <div className="relative">
                    <input type="number" value={userAge} onChange={e => setUserAge(e.target.value)} placeholder="45" min={20} max={80}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-base focus:ring-2 focus:ring-orange-500 outline-none" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">세</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">월소득</label>
                  <div className="relative">
                    <input type="number" value={userIncome} onChange={e => setUserIncome(e.target.value)} placeholder="400"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-base focus:ring-2 focus:ring-orange-500 outline-none" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">순자산</label>
                  <div className="relative">
                    <input type="number" value={userAsset} onChange={e => setUserAsset(e.target.value)} placeholder="30000"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-base focus:ring-2 focus:ring-orange-500 outline-none" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만원</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center">입력 시 동년배 순위 비교 + 맞춤 재무 계획을 제공합니다</p>
            </div>

            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>소요 시간: 약 2분</p>
              <p>총 20문항 · {isMember ? '회원 무제한 이용' : `비회원 ${FREE_LIMIT}회 무료`}</p>
            </div>
            {isMember ? (
              <div className="text-center text-xs text-orange-600 font-medium">
                회원님은 무제한 이용 가능합니다
              </div>
            ) : remaining > 0 ? (
              <div className="text-center text-xs text-orange-600 font-medium">
                무료 테스트 {remaining}회 남음
              </div>
            ) : (
              <div className="text-center text-xs text-orange-500 font-medium">
                무료 체험이 종료되었습니다
              </div>
            )}
            <button
              onClick={handleStart}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold rounded-xl transition"
            >
              테스트 시작하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz screen
  if (phase === 'quiz') {
    const q = questions[currentQ]
    const progress = ((currentQ + 1) / questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{q.categoryLabel}</span>
            <span>
              {currentQ + 1} / {questions.length}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Q{currentQ + 1}. {q.text}
          </h3>
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = answers[q.id] === opt.score
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(q.id, opt.score)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition font-medium text-sm ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                      : 'border-gray-100 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50/50'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs text-gray-500 mr-3">
                    {idx + 1}
                  </span>
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQ > 0 && (
            <button
              onClick={handlePrev}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              ← 이전
            </button>
          )}
        </div>
      </div>
    )
  }

  // Analyzing screen
  if (phase === 'analyzing') {
    return <AnalyzingScreen onComplete={handleAnalysisComplete} />
  }

  // Result screen
  const { total, categories } = calculateScores(answers)
  const maxTotal = 80
  const result = getResultByScore(total)

  const scoreParams = categories
    .map((c) => `${c.key[0]}=${c.score}`)
    .join('&')
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/programs/retirement-test/result/${result.code}?s=${total}&${scoreParams}`
      : ''

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Result card */}
      <ResultCard
        total={total}
        maxTotal={maxTotal}
        result={result}
        categories={categories}
      />

      {/* 동년배 비교 분석 */}
      {userAge && userAsset && (() => {
        const age = parseInt(userAge) || 0
        const asset = parseInt(userAsset) || 0
        const income = parseInt(userIncome) || 0
        if (age < 20 || age > 80) return null
        const percentile = getAssetPercentile(age, asset)
        const group = age < 40 ? '30' : age < 50 ? '40' : age < 60 ? '50' : '60'
        const data = AGE_ASSET_DATA[group]
        const retireAge = 65
        const yearsLeft = Math.max(0, retireAge - age)
        const monthlyNeed = 298 // 부부 적정 생활비
        const retireYears = 25
        const totalNeed = monthlyNeed * 12 * retireYears
        const currentGap = Math.max(0, totalNeed - asset)
        const monthlySaveSimple = yearsLeft > 0 ? Math.round(currentGap / yearsLeft / 12) : 0
        const r5 = 0.05 / 12
        const n5 = yearsLeft * 12
        const monthlySaveInvest = yearsLeft > 0 && n5 > 0 ? Math.round(currentGap / ((Math.pow(1 + r5, n5) - 1) / r5)) : 0
        const pensionExpected = income > 0 ? Math.round(income * 0.43 * 0.6) : 67 // 소득대체율 43% x 수급률

        return (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
              <div className="text-sm opacity-80 mb-1">{data.label} 동년배 자산 순위</div>
              <div className="text-4xl sm:text-5xl font-black">{percentile >= 50 ? `상위 ${100 - percentile}%` : `하위 ${percentile}%`}</div>
              <div className="text-sm opacity-80 mt-2">
                내 순자산 {asset >= 10000 ? `${(asset/10000).toFixed(1)}억` : `${asset.toLocaleString()}만`}원
                &nbsp;|&nbsp; {data.label} 평균 {(data.avg/10000).toFixed(1)}억원
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* 자산 위치 바 */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>하위</span>
                  <span>내 위치</span>
                  <span>상위</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full" style={{ width: '100%' }} />
                  <div className="absolute top-0 h-full w-1 bg-blue-800 rounded" style={{ left: `${percentile}%` }} />
                </div>
              </div>

              {/* 핵심 수치 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500">은퇴까지</div>
                  <div className="text-xl font-bold text-blue-700">{yearsLeft}년</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500">예상 국민연금 (월)</div>
                  <div className="text-xl font-bold text-blue-700">{pensionExpected}만원</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500">추가 필요 자금</div>
                  <div className="text-xl font-bold text-orange-700">{currentGap >= 10000 ? `${(currentGap/10000).toFixed(1)}억` : `${currentGap.toLocaleString()}만`}원</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500">매월 저축 필요</div>
                  <div className="text-xl font-bold text-orange-700">{monthlySaveInvest > 0 ? `${monthlySaveInvest.toLocaleString()}만원` : '-'}</div>
                  <div className="text-[10px] text-gray-400">연 5% 투자 시</div>
                </div>
              </div>

              {/* 맞춤 코멘트 */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                {percentile >= 70 ? (
                  <p><strong className="text-blue-700">동년배 상위권입니다.</strong> 자산 관리는 잘 되고 있으니, 연금 수령 시기 최적화와 절세 전략에 집중하세요. 연기연금(연 7.2% 증액)과 IRP 세액공제(연 148.5만원)를 적극 활용하세요.</p>
                ) : percentile >= 40 ? (
                  <p><strong className="text-orange-700">동년배 평균 수준입니다.</strong> 지금부터 월 {monthlySaveInvest}만원씩 투자하면 은퇴 시 목표 달성이 가능합니다. 연금저축(월 50만원, 연 99만원 절세) + 매월 자동이체가 핵심입니다.</p>
                ) : (
                  <p><strong className="text-red-600">동년배 대비 자산이 부족합니다.</strong> 즉시 행동이 필요합니다. ①불필요한 지출 20% 줄이기 ②연금저축 개설(월 50만원) ③퇴직연금 TDF 전환. 단순 저축 시 월 {monthlySaveSimple}만원, 투자 시 월 {monthlySaveInvest}만원이면 따라잡을 수 있습니다.</p>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* 교차 분석 인사이트 */}
      {(() => {
        const insights = getCrossInsights(categories)
        return insights.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">교차 분석 인사이트</h3>
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i} className="bg-orange-50 rounded-xl p-4">
                  <div className="font-semibold text-gray-900 mb-1">{ins.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{ins.insight}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null
      })()}

      {/* 필요 노후자금 + 월 저축 계획 */}
      {(() => {
        const fund = getRetirementFundCalc(total, answers)
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">나의 노후자금 계산</h3>
            <p className="text-xs text-gray-400 mb-4">2026년 국민연금연구원 통계 기반 (65세~90세, {fund.years}년)</p>

            <div className="grid grid-cols-2 gap-3 text-center mb-4">
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">적정 월 생활비</div>
                <div className="text-xl sm:text-2xl font-bold text-orange-700">{fund.monthly}만원</div>
                <div className="text-[10px] text-gray-400">최소 {fund.monthlyMin}만원</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">{fund.years}년간 필요 총액</div>
                <div className="text-xl sm:text-2xl font-bold text-orange-700">{(fund.totalNeeded / 10000).toFixed(1)}억원</div>
                <div className="text-[10px] text-gray-400">최소 {(fund.totalNeededMin / 10000).toFixed(1)}억원</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">예상 연금 수령</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-700">{(fund.pensionEstimate / 10000).toFixed(1)}억원</div>
                <div className="text-[10px] text-gray-400">국민+개인연금 합산</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">추가 확보 필요</div>
                <div className="text-xl sm:text-2xl font-bold text-red-600">{(fund.gap / 10000).toFixed(1)}억원</div>
                <div className="text-[10px] text-gray-400">최소 {(fund.gapMin / 10000).toFixed(1)}억원</div>
              </div>
            </div>

            {fund.gap > 0 && (
              <>
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-5 text-white text-center mb-3">
                  <div className="text-sm opacity-90 mb-1">지금부터 매월 저축해야 할 금액</div>
                  <div className="flex items-center justify-center gap-4">
                    <div>
                      <div className="text-2xl font-bold">{fund.monthlySave20.toLocaleString()}만원</div>
                      <div className="text-[10px] opacity-75">20년 단순 저축</div>
                    </div>
                    <div className="text-lg opacity-50">→</div>
                    <div>
                      <div className="text-2xl font-bold">{fund.monthlySaveInvest.toLocaleString()}만원</div>
                      <div className="text-[10px] opacity-75">연 5% 투자 시</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                  <div className="font-semibold text-gray-800 mb-2">절세 전략으로 부담 줄이기</div>
                  <div>1. 연금저축 월 50만원 (연 600만원) → 세액공제 16.5% = <strong className="text-orange-600">연 99만원 절세</strong></div>
                  <div>2. IRP 월 25만원 추가 (연 300만원) → 합산 <strong className="text-orange-600">연 148.5만원 절세</strong></div>
                  <div>3. 퇴직연금 DC형 → TDF 전환으로 수익률 연 2~3%p 개선 가능</div>
                </div>
              </>
            )}
          </div>
        )
      })()}

      {/* 4대 영역 심층 조언 */}
      {(() => {
        const icons: Record<string, string> = { '[F]': '💰', '[L]': '🏃', '[H]': '🏠', '[M]': '🧠' }
        const colors: Record<string, string> = { '[F]': '#ea580c', '[L]': '#2563eb', '[H]': '#16a34a', '[M]': '#7c3aed' }
        return (
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-lg font-bold text-gray-900">영역별 맞춤 실천 가이드</h3>
            {getDeepAdvice(total, categories, answers).map((adv, i) => {
              const tag = adv.title.match(/\[[A-Z]\]/)?.[0] || ''
              const icon = icons[tag] || '📋'
              const color = colors[tag] || '#ea580c'
              const title = adv.title.replace(/\[[A-Z]\]\s*/, '')
              return (
                <details key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                    <span className="text-2xl">{icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm">{title}</div>
                      <div className="text-xs mt-0.5" style={{ color }}>{adv.advice.slice(0, 40)}...</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </summary>
                  <div className="px-4 pb-4 pt-0">
                    <div className="h-px bg-gray-100 mb-3" />
                    <p className="text-sm text-gray-700 leading-relaxed">{adv.advice}</p>
                  </div>
                </details>
              )
            })}
          </div>
        )
      })()}

      {/* 나의 연금 수령 타임라인 */}
      {userAge && (() => {
        const age = parseInt(userAge) || 45
        const income = parseInt(userIncome) || 300
        const nps = Math.round(income * 0.43 * 0.6) // 국민연금 예상
        const personalPension = answers[2] >= 3 ? 50 : answers[2] >= 2 ? 25 : 0
        const retirePension = answers[16] >= 3 ? 40 : answers[16] >= 2 ? 20 : 0
        const timeline = [
          { age: 55, label: '개인연금 수령 시작', amount: personalPension, icon: '1', desc: `연금저축/IRP에서 월 ${personalPension}만원 수령 가능 (연금소득세 3.3~5.5%)` },
          { age: 60, label: '퇴직연금 수령 가능', amount: retirePension, icon: '2', desc: `퇴직연금 연금 수령 시 퇴직소득세 60~70%만 과세 (일시금 대비 30~40% 절세)` },
          { age: 65, label: '국민연금 수령 시작', amount: nps, icon: '3', desc: `예상 월 ${nps}만원 (소득대체율 43% 기준). 연기 시 연 7.2% 증액` },
        ].filter(t => t.age > age || t.amount > 0)
        const totalMonthly = nps + personalPension + retirePension

        return (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">나의 연금 수령 타임라인</h3>
            <div className="space-y-0">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">{t.icon}</div>
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-orange-200 my-1" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{t.age}세</span>
                      <span className="text-sm text-orange-600 font-semibold">{t.label}</span>
                    </div>
                    <div className="text-lg font-bold text-orange-700 mt-0.5">월 {t.amount}만원</div>
                    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-orange-50 rounded-xl p-4 mt-2 text-center">
              <div className="text-xs text-gray-500">65세 이후 예상 총 월 연금</div>
              <div className="text-3xl font-black text-orange-700">{totalMonthly}만원</div>
              <div className="text-xs text-gray-400 mt-1">적정 생활비 298만원 대비 {totalMonthly >= 298 ? '충분' : `${298 - totalMonthly}만원 부족`}</div>
            </div>
          </div>
        )
      })()}

      {/* 나의 노후 준비 로드맵 */}
      {userAge && (() => {
        const age = parseInt(userAge) || 40
        const roadmap = [
          { age: Math.max(age, 30), title: '지금 즉시', items: ['연금저축 계좌 개설 (월 50만원 자동이체)', 'IRP 추가 개설 (월 25만원)', '퇴직연금 TDF로 전환 신청'], color: '#dc2626' },
          { age: Math.max(age + 5, 40), title: `${Math.max(age + 5, 40)}세`, items: ['비상자금 6개월치 확보', '보장성 보험 점검 (실손+암)', '부채 상환 계획 수립'], color: '#ea580c' },
          { age: Math.max(age + 10, 50), title: `${Math.max(age + 10, 50)}세`, items: ['은퇴 후 주거 계획 확정', '퇴직 후 소득원 준비 (부업/자격증)', '건강검진 정밀화 (매년)'], color: '#ca8a04' },
          { age: 55, title: '55세', items: ['개인연금 수령 개시', '퇴직연금 연금 전환 준비', '은퇴 3년치 생활비 별도 확보'], color: '#2563eb' },
          { age: 65, title: '65세', items: ['국민연금 수령 (또는 연기 결정)', '건강보험 피부양자 자격 관리', '자산 인출 순서 최적화'], color: '#16a34a' },
        ].filter(r => r.age >= age)

        return (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 animate-slide-up" style={{ animationDelay: '600ms' }}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">나의 노후 준비 로드맵</h3>
            <div className="space-y-0">
              {roadmap.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: step.color }} />
                    {i < roadmap.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="font-bold text-sm" style={{ color: step.color }}>{step.title}</div>
                    <div className="mt-1 space-y-1">
                      {step.items.map((item, j) => (
                        <div key={j} className="text-xs text-gray-600 flex gap-1.5">
                          <span className="text-gray-300 shrink-0">-</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* 이번 달 행동 플랜 */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white animate-slide-up" style={{ animationDelay: '700ms' }}>
        <h3 className="text-lg font-bold mb-4">이번 달 바로 실행할 3가지</h3>
        <div className="space-y-3">
          {[
            { check: total < 49, text: '국민연금공단(1355)에 전화해서 내 예상 수령액 확인하기', sub: '5분이면 됩니다. nps.or.kr에서도 조회 가능' },
            { check: answers[2] <= 2, text: '연금저축 계좌 개설하고 월 50만원 자동이체 설정하기', sub: '연 99만원 세액공제. 증권사 앱에서 10분 완료' },
            { check: answers[16] <= 2, text: '퇴직연금 운용현황 확인하고 TDF로 전환 검토하기', sub: '회사 HR팀에 DB/DC 여부, 적립금 확인 요청' },
            { check: true, text: '배우자와 30분 은퇴 후 생활에 대해 대화하기', sub: '월 생활비, 살고 싶은 곳, 하고 싶은 일 이야기' },
          ].filter(a => a.check).slice(0, 3).map((action, i) => (
            <div key={i} className="bg-white/15 backdrop-blur rounded-xl p-3">
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                <div>
                  <div className="font-semibold text-sm">{action.text}</div>
                  <div className="text-xs opacity-80 mt-0.5">{action.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share buttons */}
      <ShareButtons
        shareUrl={shareUrl}
        total={total}
        grade={result.grade}
        resultCode={result.code}
        categories={categories}
      />

      {/* Retry */}
      <div className="text-center">
        <button
          onClick={handleStart}
          className="px-6 py-2.5 text-sm text-gray-500 hover:text-gray-700 underline transition"
        >
          다시 테스트하기
        </button>
      </div>

      {limitModal}
    </div>
  )
}

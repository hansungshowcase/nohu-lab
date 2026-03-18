'use client'

import { useState, useCallback, useEffect } from 'react'
import { questions, calculateScores } from './retirement-test/questions'
import { getResultByScore, ResultCode } from './retirement-test/results'
import ResultCard from './retirement-test/ResultCard'
import ShareButtons from './retirement-test/ShareButtons'
import AnalyzingScreen from './retirement-test/AnalyzingScreen'
import { getCrossInsights, getDeepAdvice, getRiskAssessment, getCrevasseAnalysis, getRetirementFundCalc, getScenarios, getResources } from './retirement-test/ResultCardA4'

type Phase = 'intro' | 'quiz' | 'analyzing' | 'result'

const FREE_LIMIT = 2
const STORAGE_KEY = 'retirement-test-count'
const CAFE_URL = 'https://cafe.naver.com/eovhskfktmak'

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Result card */}
      <ResultCard
        total={total}
        maxTotal={maxTotal}
        result={result}
        categories={categories}
      />

      {/* 교차 분석 인사이트 */}
      {(() => {
        const insights = getCrossInsights(categories)
        return insights.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
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

      {/* 4대 영역 심층 조언 */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">4대 영역 심층 분석</h3>
        <div className="space-y-4">
          {getDeepAdvice(total, categories, answers).map((adv, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4">
              <div className="font-semibold text-orange-700 mb-2">{adv.title}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{adv.advice}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3대 리스크 평가 */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">3대 은퇴 리스크 평가</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {getRiskAssessment(categories, answers).map((risk, i) => (
            <div key={i} className="rounded-xl p-4 text-center" style={{ backgroundColor: `${risk.color}10` }}>
              <div className="text-sm font-semibold mb-1" style={{ color: risk.color }}>{risk.name}</div>
              <div className="text-lg font-bold mb-2" style={{ color: risk.color }}>{risk.level}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{risk.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 소득 크레바스 진단 */}
      {(() => {
        const crevasse = getCrevasseAnalysis(answers)
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">소득 크레바스 진단</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: crevasse.color }}>{crevasse.level}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{crevasse.detail}</p>
            <div className="space-y-2">
              {crevasse.strategy.map((s, i) => (
                <div key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-orange-500 shrink-0">{'>'}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* 필요 노후자금 산출 */}
      {(() => {
        const fund = getRetirementFundCalc(total, answers)
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">필요 노후자금 산출</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="text-xs text-gray-500">월 생활비</div>
                <div className="text-xl font-bold text-orange-700">{fund.monthly}만원</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="text-xs text-gray-500">필요 총액 ({fund.years}년)</div>
                <div className="text-xl font-bold text-orange-700">{(fund.totalNeeded / 10000).toFixed(1)}억원</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="text-xs text-gray-500">예상 연금 수령</div>
                <div className="text-xl font-bold text-blue-700">{(fund.pensionEstimate / 10000).toFixed(1)}억원</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <div className="text-xs text-gray-500">추가 확보 필요</div>
                <div className="text-xl font-bold text-red-600">{(fund.gap / 10000).toFixed(1)}억원</div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 시나리오 분석 */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">은퇴 후 시나리오 분석</h3>
        <div className="space-y-3">
          {getScenarios(total, categories).map((sc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `${sc.color}10` }}>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shrink-0" style={{ backgroundColor: sc.color }}>{sc.label}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: sc.color }}>{sc.monthly}</div>
                <div className="text-xs text-gray-500">{sc.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 추천 자원 */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">추천 자원</h3>
        <div className="space-y-3">
          {getResources(categories).map((res, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3">
              <div className="font-semibold text-sm text-gray-900">{res.name}</div>
              <div className="text-xs text-orange-600 font-medium">{res.url}</div>
              <div className="text-xs text-gray-500 mt-0.5">{res.desc}</div>
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

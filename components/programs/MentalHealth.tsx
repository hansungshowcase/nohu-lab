'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  SCALES, calculateScore, getLevel, getMaxScore, hasSuicideRisk,
  getHighScoringItems, getOverallRisk,
  FUNCTIONAL_IMPAIRMENT_QUESTION, FUNCTIONAL_IMPAIRMENT_OPTIONS,
} from './mental-health/questions'
import { TIPS } from './mental-health/tips'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from 'recharts'

type Phase = 'intro' | 'quiz' | 'functional' | 'result'

const DISCLAIMER = '본 검사는 의학적 진단이 아닌 자가 참고용입니다. 정확한 진단은 정신건강의학과 전문의 상담을 권장합니다.'
const KAKAO_KEY = '3913fde247b12ce25084eb42a9b17ed9'
const FREE_LIMIT = 2
const STORAGE_KEY = 'mental-health-count'
const CAFE_URL = 'https://cafe.naver.com/eovhskfktmak'

function getTestCount(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
}

function incrementTestCount(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(getTestCount() + 1))
}

interface KakaoWindow extends Window {
  Kakao?: {
    isInitialized: () => boolean
    init: (key: string) => void
    Share: { sendDefault: (opts: Record<string, unknown>) => void }
  }
}

export default function MentalHealth() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentScaleIdx, setCurrentScaleIdx] = useState(0)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [functionalImpairment, setFunctionalImpairment] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 회원 여부 확인
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => { if (user && user.tier >= 1) setIsMember(true) })
      .catch((err) => { if (err.name !== 'AbortError') setIsMember(false) })
    return () => controller.abort()
  }, [])

  // 전체 검사 (모든 스케일)
  const activeScales = SCALES

  const totalQuestions = useMemo(() => {
    return activeScales.reduce((sum, s) => sum + s.questions.length, 0)
  }, [activeScales])

  const globalIdx = useMemo(() => {
    let idx = 0
    for (let i = 0; i < currentScaleIdx; i++) {
      idx += activeScales[i].questions.length
    }
    return idx + currentQIdx
  }, [currentScaleIdx, currentQIdx, activeScales])

  const currentScale = activeScales[currentScaleIdx]
  const currentQuestion = currentScale?.questions[currentQIdx]
  const answerKey = currentScale && currentQuestion ? `${currentScale.id}-${currentQuestion.id}` : ''

  const includesDepression = true

  // cleanup timer on unmount
  useEffect(() => {
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current) }
  }, [])

  function startQuiz() {
    if (!isMember && getTestCount() >= FREE_LIMIT) {
      setShowLimitModal(true)
      return
    }
    setPhase('quiz')
    setCurrentScaleIdx(0)
    setCurrentQIdx(0)
    setAnswers({})
    setFunctionalImpairment(null)
    setIsTransitioning(false)
  }

  const advanceToNext = useCallback(() => {
    setIsTransitioning(false)
    if (currentQIdx < currentScale.questions.length - 1) {
      setCurrentQIdx((p) => p + 1)
    } else if (currentScaleIdx < activeScales.length - 1) {
      setCurrentScaleIdx((p) => p + 1)
      setCurrentQIdx(0)
    } else {
      setPhase('functional')
    }
  }, [currentQIdx, currentScale, currentScaleIdx, activeScales])

  function handleAnswer(value: number) {
    if (isTransitioning) return
    setAnswers((prev) => ({ ...prev, [answerKey]: value }))
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    setIsTransitioning(true)
    autoAdvanceTimer.current = setTimeout(advanceToNext, 300)
  }

  function goPrev() {
    if (isTransitioning) return
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    setIsTransitioning(false)
    if (currentQIdx > 0) {
      setCurrentQIdx((p) => p - 1)
    } else if (currentScaleIdx > 0) {
      setCurrentScaleIdx((p) => p - 1)
      setCurrentQIdx(activeScales[currentScaleIdx - 1].questions.length - 1)
    }
  }

  function restart() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    setPhase('intro')
    setAnswers({})
    setCurrentScaleIdx(0)
    setCurrentQIdx(0)
    setFunctionalImpairment(null)
    setIsTransitioning(false)
  }

  // 카카오톡 공유
  function shareKakao(overallLabel: string, resultsSummary: string) {
    const w = window as KakaoWindow
    const url = `${window.location.origin}/programs/mental-health`

    if (w.Kakao) {
      if (!w.Kakao.isInitialized()) w.Kakao.init(KAKAO_KEY)
      try {
        w.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '🧠 심리 상태 자가진단 결과',
            description: `종합 판정: ${overallLabel}\n${resultsSummary}`,
            imageUrl: 'https://retireplan.kr/api/og',
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: '나도 검사해보기', link: { mobileWebUrl: url, webUrl: url } }],
        })
        return
      } catch { /* fallback below */ }
    }

    // fallback: Web Share API
    if (navigator.share) {
      navigator.share({
        title: '심리 상태 자가진단 결과',
        text: `종합 판정: ${overallLabel}\n${resultsSummary}`,
        url,
      }).catch(() => {})
    }
  }

  // === INTRO ===
  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto px-4 space-y-5 animate-fade-in">
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl">🧠</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">심리 상태 자가진단</h2>
          <p className="text-gray-500 text-[14px] sm:text-[15px] leading-relaxed">
            5개 영역 · {totalQuestions}문항 · 약 5분 소요
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-3">
          <h3 className="font-semibold text-gray-900 text-[15px]">검사 영역</h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { icon: '😔', label: '우울' },
              { icon: '😰', label: '불안' },
              { icon: '🤯', label: '스트레스' },
              { icon: '💛', label: '자존감' },
              { icon: '🌙', label: '수면' },
            ].map((item) => (
              <div key={item.label} className="bg-orange-50/50 rounded-xl py-2.5 px-1">
                <div className="text-xl sm:text-2xl">{item.icon}</div>
                <div className="text-[11px] sm:text-[12px] text-gray-600 font-medium mt-1">{item.label}</div>
              </div>
            ))}
          </div>
          <ul className="space-y-1.5 text-[13px] text-gray-500 mt-2">
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              정신건강의학과에서 사용하는 공인 척도 기반
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              결과는 저장되지 않습니다
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-[12px] sm:text-[13px] text-amber-800 flex items-start gap-2">
            <span className="text-amber-500 leading-none">⚠️</span>
            {DISCLAIMER}
          </p>
        </div>

        {!isMember && (
          <p className="text-center text-[12px] text-gray-400">
            비회원 무료 체험 {Math.max(0, FREE_LIMIT - getTestCount())}회 남음 (총 {FREE_LIMIT}회)
          </p>
        )}

        <button
          onClick={startQuiz}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-200 active:scale-[0.98] text-[15px]"
        >
          검사 시작하기
        </button>

        {/* 제한 모달 */}
        {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6" onClick={() => setShowLimitModal(false)}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-5xl">🔒</div>
              <h3 className="text-lg font-bold text-gray-900">무료 체험이 끝났습니다</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                비회원은 <strong>{FREE_LIMIT}회</strong>까지 무료로 이용할 수 있습니다.<br />
                카페 가입 후 무제한으로 이용하세요!
              </p>
              <a
                href={CAFE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-[15px] rounded-xl shadow-md transition-all"
              >
                카페 가입하러 가기
              </a>
              <button
                onClick={() => setShowLimitModal(false)}
                className="text-[13px] text-gray-400 hover:text-gray-600 transition"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // === QUIZ ===
  if (phase === 'quiz') {
    const progress = ((globalIdx + 1) / totalQuestions) * 100
    const likertOptions = currentScale.likertOptions

    return (
      <div className="max-w-lg mx-auto px-4 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-gray-500">
            <span className="font-medium text-orange-600">{currentScale.name}</span>
            <span>{globalIdx + 1} / {totalQuestions}</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Scale description */}
        {currentQIdx === 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5 sm:p-3">
            <p className="text-[12px] sm:text-[13px] text-orange-700">{currentScale.description}</p>
          </div>
        )}

        {/* Question */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 min-h-0 sm:min-h-[320px] flex flex-col">
          <div className="flex-1">
            <div className="text-[12px] sm:text-[13px] text-gray-400 mb-2 sm:mb-3">
              Q{currentQIdx + 1}.
            </div>
            <h3 className="text-[15px] sm:text-[17px] font-semibold text-gray-900 leading-relaxed mb-4 sm:mb-6">
              {currentQuestion.text}
            </h3>

            <div className="space-y-2">
              {likertOptions.map((opt) => {
                const selected = answers[answerKey] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    disabled={isTransitioning}
                    className={`w-full text-left px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-medium transition-all duration-200 ${
                      selected
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-[0.98]'
                        : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-700 border border-transparent hover:border-orange-200'
                    } ${isTransitioning ? 'pointer-events-none' : ''}`}
                  >
                    <span className="mr-2 opacity-60">{opt.value}.</span>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-start items-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-50">
            <button
              onClick={goPrev}
              disabled={globalIdx === 0 || isTransitioning}
              className="px-3 sm:px-4 py-2 text-[13px] sm:text-[14px] text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← 이전
            </button>
          </div>
        </div>
      </div>
    )
  }

  // === FUNCTIONAL IMPAIRMENT ===
  if (phase === 'functional') {
    return (
      <div className="max-w-lg mx-auto px-4 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-gray-500">
            <span className="font-medium text-orange-600">기능 장해 평가</span>
            <span>추가 문항</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-orange-400 rounded-full" />
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5 sm:p-3">
          <p className="text-[12px] sm:text-[13px] text-orange-700">이 문항은 점수에 포함되지 않으며 참고용입니다.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 min-h-0 sm:min-h-[280px] flex flex-col">
          <div className="flex-1">
            <h3 className="text-[15px] sm:text-[17px] font-semibold text-gray-900 leading-relaxed mb-4 sm:mb-6">
              {FUNCTIONAL_IMPAIRMENT_QUESTION}
            </h3>

            <div className="space-y-2">
              {FUNCTIONAL_IMPAIRMENT_OPTIONS.map((opt) => {
                const selected = functionalImpairment === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFunctionalImpairment(opt.value)
                      if (!isMember) incrementTestCount()
                      setTimeout(() => setPhase('result'), 300)
                    }}
                    className={`w-full text-left px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-medium transition-all duration-200 ${
                      selected
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-[0.98]'
                        : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-700 border border-transparent hover:border-orange-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-start items-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-50">
            <button
              onClick={() => {
                setPhase('quiz')
                const lastScale = activeScales.length - 1
                setCurrentScaleIdx(lastScale)
                setCurrentQIdx(activeScales[lastScale].questions.length - 1)
              }}
              className="px-3 sm:px-4 py-2 text-[13px] sm:text-[14px] text-gray-500 hover:text-gray-700 transition"
            >
              ← 이전
            </button>
          </div>
        </div>
      </div>
    )
  }

  // === RESULT ===
  const results = activeScales.map((scale) => {
    const score = calculateScore(scale.id, answers)
    const level = getLevel(scale.id, score)
    const maxScore = getMaxScore(scale.id)
    return {
      scaleId: scale.id,
      scaleName: scale.name.replace(/ \(.*\)/, ''),
      scaleFullName: scale.name,
      score,
      maxScore,
      level: level!,
      percentage: Math.round((score / maxScore) * 100),
      highItems: getHighScoringItems(scale.id, answers, 2),
    }
  })

  const suicideRisk = hasSuicideRisk(answers)
  const overallRisk = getOverallRisk(results.map((r) => ({ scaleId: r.scaleId, score: r.score })))

  const radarData = results.map((r) => ({
    subject: r.scaleName,
    score: r.percentage,
    fullMark: 100,
  }))

  const functionalLabels = ['전혀 어렵지 않았다', '약간 어려웠다', '많이 어려웠다', '매우 많이 어려웠다']

  const today = new Date()
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`

  const resultsSummary = results.map((r) => `${r.scaleName}: ${r.level.label}`).join(' / ')

  return (
    <div className="max-w-lg mx-auto px-4 space-y-4 sm:space-y-6 animate-fade-in">
      {/* 결과지 헤더 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h2 className="text-[16px] sm:text-xl font-bold text-gray-900">종합 심리 선별검사 결과</h2>
          <span className="text-[11px] text-gray-400 shrink-0 ml-2">{dateStr}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {results.map((r) => (
            <span key={r.scaleId} className="text-[10px] sm:text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{r.scaleFullName}</span>
          ))}
        </div>
      </div>

      {/* 자살위험 경고 */}
      {suicideRisk && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-lg sm:text-xl">🚨</span>
            <h3 className="font-bold text-red-700 text-[14px] sm:text-[15px]">주의가 필요합니다</h3>
          </div>
          <p className="text-[13px] sm:text-[14px] text-red-700 leading-relaxed">
            자해 또는 자살에 대한 생각이 있으신 것으로 나타났습니다.
          </p>
          <div className="bg-white rounded-lg p-3 space-y-1 mt-2">
            <p className="text-[13px] sm:text-[14px] font-semibold text-gray-900">자살예방 상담전화: <span className="text-red-600">1393</span> (24시간)</p>
            <p className="text-[13px] sm:text-[14px] font-semibold text-gray-900">정신건강 위기상담: <span className="text-red-600">1577-0199</span></p>
          </div>
        </div>
      )}

      {/* 종합 소견 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-[15px]">종합 소견</h3>
          <div className="px-3 py-1 rounded-lg text-[12px] sm:text-[13px] font-bold text-white" style={{ backgroundColor: overallRisk.color }}>
            {overallRisk.label}
          </div>
        </div>
        <p className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed">{overallRisk.description}</p>

        {/* 요약 테이블 */}
        <div className="bg-gray-50 rounded-xl overflow-hidden">
          <table className="w-full text-[12px] sm:text-[13px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">영역</th>
                <th className="text-center py-2 px-2 text-gray-500 font-medium">점수</th>
                <th className="text-center py-2 px-2 text-gray-500 font-medium">판정</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.scaleId} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 px-3 font-medium text-gray-800">{r.scaleName}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{r.score}/{r.maxScore}</td>
                  <td className="py-2 px-2 text-center">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold text-white" style={{ backgroundColor: r.level.color }}>
                      {r.level.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 sm:p-4">
        <h3 className="font-semibold text-gray-900 text-[13px] sm:text-[14px] mb-1 px-1">영역별 분포</h3>
        <div className="w-full" style={{ aspectRatio: '1 / 0.85' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="60%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 영역별 상세 */}
      <div className="space-y-3">
        {results.map((r) => {
          const tipData = TIPS[r.scaleId]?.[r.level.label]
          const scale = SCALES.find((s) => s.id === r.scaleId)!

          return (
            <div key={r.scaleId} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-[14px] sm:text-[15px]">{r.scaleFullName}</h3>
                <div className="px-2.5 py-0.5 rounded-lg text-[11px] sm:text-[13px] font-bold text-white" style={{ backgroundColor: r.level.color }}>
                  {r.level.label}
                </div>
              </div>

              {/* Score bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[12px] sm:text-[13px]">
                  <span className="text-gray-500">{r.score}점 / {r.maxScore}점</span>
                  <span className="text-gray-400">{r.percentage}%</span>
                </div>
                <div className="w-full h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${r.percentage}%`, backgroundColor: r.level.color }} />
                </div>
              </div>

              {/* 심각도 분포 바 */}
              <div className="space-y-0.5">
                <p className="text-[11px] text-gray-400">심각도 분포</p>
                <div className="flex rounded-lg overflow-hidden h-5 sm:h-6">
                  {scale.levels.map((lvl, i) => {
                    const width = ((lvl.max - lvl.min + 1) / (r.maxScore + 1)) * 100
                    const isActive = r.score >= lvl.min && r.score <= lvl.max
                    return (
                      <div key={i} className="relative flex items-center justify-center" style={{ width: `${width}%`, backgroundColor: lvl.color, opacity: isActive ? 1 : 0.25 }}>
                        {isActive && <span className="text-white text-[8px] sm:text-[10px] font-bold">▼{r.score}</span>}
                      </div>
                    )
                  })}
                </div>
                <div className="flex">
                  {scale.levels.map((lvl, i) => {
                    const width = ((lvl.max - lvl.min + 1) / (r.maxScore + 1)) * 100
                    return <div key={i} style={{ width: `${width}%` }} className="text-[8px] sm:text-[10px] text-gray-400 truncate leading-tight">{lvl.label.replace(/\s/g, '')}</div>
                  })}
                </div>
              </div>

              {/* 주요 증상 항목 */}
              {r.highItems.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium">주요 증상 항목</p>
                  {r.highItems.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-start gap-2 bg-orange-50/50 rounded-lg p-2">
                      <div className="flex gap-0.5 mt-0.5 shrink-0">
                        {Array.from({ length: item.maxScore }, (_, j) => (
                          <div key={j} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${j < item.score ? 'bg-orange-500' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-[11px] sm:text-[12px] text-gray-700 leading-relaxed">{item.questionText}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 임상 해석 */}
              {tipData && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                  <p className="text-[13px] sm:text-[14px] font-medium text-gray-800">{tipData.title}</p>
                  <p className="text-[12px] sm:text-[13px] text-gray-500">{tipData.description}</p>
                  <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-2 sm:p-2.5 mt-1">
                    <span className="text-orange-500 text-[12px] sm:text-[13px] mt-0.5 shrink-0">→</span>
                    <p className="text-[12px] sm:text-[13px] text-orange-700 font-medium">{tipData.recommendation}</p>
                  </div>
                  <ul className="space-y-1 mt-1.5">
                    {tipData.tips.map((tip, i) => (
                      <li key={i} className="text-[12px] sm:text-[13px] text-gray-600 flex items-start gap-1.5">
                        <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 기능 장해 */}
      {functionalImpairment !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-1.5">
          <h3 className="font-semibold text-gray-900 text-[13px] sm:text-[14px]">기능 장해 평가</h3>
          <p className="text-[12px] sm:text-[13px] text-gray-500">
            일상 기능 어려움: <span className="font-semibold text-gray-800">{functionalLabels[functionalImpairment]}</span>
          </p>
          {functionalImpairment >= 2 && (
            <p className="text-[12px] sm:text-[13px] text-orange-600 font-medium">전문가 상담을 적극 권장합니다.</p>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
        <p className="text-[12px] sm:text-[13px] text-amber-800 flex items-start gap-2">
          <span className="text-amber-500 leading-none">⚠️</span>
          {DISCLAIMER}
        </p>
      </div>

      {/* 공유 + 재검사 */}
      <div className="space-y-2.5">
        <button
          onClick={() => shareKakao(overallRisk.label, resultsSummary)}
          className="w-full py-3 sm:py-3.5 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] text-[14px] sm:text-[15px] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
          카카오톡으로 공유하기
        </button>
        <button
          onClick={restart}
          className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-200 active:scale-[0.98] text-[14px] sm:text-[15px]"
        >
          다시 검사하기
        </button>
      </div>
    </div>
  )
}

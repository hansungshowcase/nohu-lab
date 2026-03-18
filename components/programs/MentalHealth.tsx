'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  SCALES, calculateScore, getLevel, getMaxScore, hasSuicideRisk,
  getOverallRisk,
  FUNCTIONAL_IMPAIRMENT_QUESTION, FUNCTIONAL_IMPAIRMENT_OPTIONS,
} from './mental-health/questions'
import { TIPS } from './mental-health/tips'

type Phase = 'intro' | 'quiz' | 'functional' | 'result'

const DISCLAIMER = '본 검사는 선별 목적의 자가 참고용으로, 의학적 진단을 대체하지 않습니다. 정확한 진단 및 치료를 위해 정신건강의학과 전문의 상담을 권장합니다.'
const KAKAO_KEY = '3913fde247b12ce25084eb42a9b17ed9'
const FREE_LIMIT = 2
const STORAGE_KEY = 'mental-health-count'
const CAFE_URL = 'https://cafe.naver.com/eovhskfktmak'

function getTestCount(): number {
  if (typeof window === 'undefined') return 0
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0 }
  catch { return 0 }
}

function incrementTestCount(): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, String(getTestCount() + 1)) }
  catch { /* Safari private */ }
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
  const transitionLock = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => { if (user && user.tier >= 1) setIsMember(true) })
      .catch((err) => { if (err.name !== 'AbortError') setIsMember(false) })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current) }
  }, [])

  const activeScales = SCALES

  const totalQuestions = useMemo(() => activeScales.reduce((s, sc) => s + sc.questions.length, 0), [activeScales])

  const globalIdx = useMemo(() => {
    let idx = 0
    for (let i = 0; i < currentScaleIdx; i++) idx += activeScales[i].questions.length
    return idx + currentQIdx
  }, [currentScaleIdx, currentQIdx, activeScales])

  const currentScale = activeScales[currentScaleIdx]
  const currentQuestion = currentScale?.questions[currentQIdx]
  const answerKey = currentScale && currentQuestion ? `${currentScale.id}-${currentQuestion.id}` : ''

  function startQuiz() {
    if (!isMember && getTestCount() >= FREE_LIMIT) { setShowLimitModal(true); return }
    setPhase('quiz'); setCurrentScaleIdx(0); setCurrentQIdx(0); setAnswers({}); setFunctionalImpairment(null); setIsTransitioning(false); transitionLock.current = false
  }

  const advanceToNext = useCallback(() => {
    transitionLock.current = false; setIsTransitioning(false)
    if (!currentScale) return
    if (currentQIdx < currentScale.questions.length - 1) setCurrentQIdx((p) => p + 1)
    else if (currentScaleIdx < activeScales.length - 1) { setCurrentScaleIdx((p) => p + 1); setCurrentQIdx(0) }
    else setPhase('functional')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentQIdx, currentScale, currentScaleIdx, activeScales])

  function handleAnswer(value: number) {
    if (transitionLock.current) return
    transitionLock.current = true
    setAnswers((prev) => ({ ...prev, [answerKey]: value }))
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    setIsTransitioning(true)
    autoAdvanceTimer.current = setTimeout(advanceToNext, 300)
  }

  function goPrev() {
    if (transitionLock.current) return
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    transitionLock.current = false; setIsTransitioning(false)
    if (currentQIdx > 0) setCurrentQIdx((p) => p - 1)
    else if (currentScaleIdx > 0) { setCurrentScaleIdx((p) => p - 1); setCurrentQIdx(activeScales[currentScaleIdx - 1].questions.length - 1) }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function restart() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    transitionLock.current = false
    setPhase('intro'); setAnswers({}); setCurrentScaleIdx(0); setCurrentQIdx(0); setFunctionalImpairment(null); setIsTransitioning(false)
  }

  function shareKakao(overallLabel: string, resultsSummary: string) {
    const w = window as KakaoWindow
    const url = `${window.location.origin}/programs/mental-health`
    if (w.Kakao) {
      if (!w.Kakao.isInitialized()) w.Kakao.init(KAKAO_KEY)
      try {
        w.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '심리 상태 자가진단 결과',
            description: `종합 판정: ${overallLabel} | ${resultsSummary}`,
            imageUrl: `${window.location.origin}/api/og`,
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: '나도 검사해보기', link: { mobileWebUrl: url, webUrl: url } }],
        })
        return
      } catch { /* fallback */ }
    }
    if (navigator.share) {
      navigator.share({ title: '심리 상태 자가진단', text: `종합: ${overallLabel} | ${resultsSummary}`, url }).catch(() => {})
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
          <p className="text-gray-500 text-[14px] sm:text-[15px]">5개 영역 · {totalQuestions}문항 · 약 5분</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-3">
          <div className="grid grid-cols-5 gap-2 text-center">
            {[{ icon: '😔', label: '우울' }, { icon: '😰', label: '불안' }, { icon: '🤯', label: '스트레스' }, { icon: '💛', label: '자존감' }, { icon: '🌙', label: '수면' }].map((item) => (
              <div key={item.label} className="bg-orange-50/50 rounded-xl py-2.5 px-1">
                <div className="text-xl sm:text-2xl">{item.icon}</div>
                <div className="text-[11px] sm:text-[12px] text-gray-600 font-medium mt-1">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-gray-500 text-center">정신건강의학과 공인 척도 기반 · 결과 미저장</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-[12px] sm:text-[13px] text-amber-800">{DISCLAIMER}</p>
        </div>

        {!isMember && (
          <p className="text-center text-[12px] text-gray-400">비회원 무료 {Math.max(0, FREE_LIMIT - getTestCount())}회 남음</p>
        )}

        <button onClick={startQuiz} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] text-[15px] transition-all">
          검사 시작하기
        </button>

        {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6" onClick={() => setShowLimitModal(false)}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="text-5xl">🔒</div>
              <h3 className="text-lg font-bold text-gray-900">무료 체험이 끝났습니다</h3>
              <p className="text-[14px] text-gray-500">카페 가입 후 무제한으로 이용하세요!</p>
              <a href={CAFE_URL} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-[15px] rounded-xl shadow-md transition-all">카페 가입하러 가기</a>
              <button onClick={() => setShowLimitModal(false)} className="text-[13px] text-gray-400 py-3 px-4 min-h-[44px]">닫기</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // === QUIZ ===
  if (phase === 'quiz') {
    const progress = ((globalIdx + 1) / totalQuestions) * 100
    return (
      <div className="max-w-lg mx-auto px-4 space-y-4 animate-fade-in">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-gray-500">
            <span className="font-medium text-orange-600">{currentScale.name}</span>
            <span>{globalIdx + 1} / {totalQuestions}</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {currentQIdx === 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5 sm:p-3">
            <p className="text-[12px] sm:text-[13px] text-orange-700">{currentScale.description}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col">
          <div className="flex-1">
            <p className="text-[12px] text-gray-400 mb-2">Q{currentQIdx + 1}.</p>
            <h3 className="text-[15px] sm:text-[17px] font-semibold text-gray-900 leading-relaxed mb-4 sm:mb-6">{currentQuestion.text}</h3>
            <div className="space-y-2">
              {currentScale.likertOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  disabled={isTransitioning}
                  className={`w-full text-left px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl text-[13px] sm:text-[14px] font-medium transition-all duration-200 ${
                    answers[answerKey] === opt.value
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-[0.98]'
                      : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-700 border border-transparent hover:border-orange-200'
                  } ${isTransitioning ? 'pointer-events-none' : ''}`}
                >
                  <span className="mr-2 opacity-60">{opt.value}.</span>{opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50">
            <button onClick={goPrev} disabled={globalIdx === 0 || isTransitioning} className="px-3 py-3 text-[13px] text-gray-500 hover:text-gray-700 disabled:opacity-30 transition">← 이전</button>
          </div>
        </div>
      </div>
    )
  }

  // === FUNCTIONAL ===
  if (phase === 'functional') {
    return (
      <div className="max-w-lg mx-auto px-4 space-y-4 animate-fade-in">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-gray-500">
            <span className="font-medium text-orange-600">기능 장해 평가</span>
            <span>추가 문항</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-orange-400 rounded-full" />
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5">
          <p className="text-[12px] sm:text-[13px] text-orange-700">점수에 포함되지 않는 참고 문항입니다.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col">
          <h3 className="text-[15px] sm:text-[17px] font-semibold text-gray-900 leading-relaxed mb-4 sm:mb-6">{FUNCTIONAL_IMPAIRMENT_QUESTION}</h3>
          <div className="space-y-2">
            {FUNCTIONAL_IMPAIRMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                disabled={transitionLock.current}
                onClick={() => {
                  if (transitionLock.current) return; transitionLock.current = true
                  setFunctionalImpairment(opt.value)
                  if (!isMember) incrementTestCount()
                  setTimeout(() => { transitionLock.current = false; setPhase('result') }, 300)
                }}
                className={`w-full text-left px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl text-[13px] sm:text-[14px] font-medium transition-all duration-200 ${
                  functionalImpairment === opt.value
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-[0.98]'
                    : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-700 border border-transparent hover:border-orange-200'
                }`}
              >{opt.label}</button>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50">
            <button onClick={() => { setPhase('quiz'); const l = activeScales.length - 1; setCurrentScaleIdx(l); setCurrentQIdx(activeScales[l].questions.length - 1) }} className="px-3 py-3 text-[13px] text-gray-500 hover:text-gray-700 transition">← 이전</button>
          </div>
        </div>
      </div>
    )
  }

  // === RESULT (병원 결과지 형식) ===
  const results = activeScales.map((scale) => {
    const score = calculateScore(scale.id, answers)
    const level = getLevel(scale.id, score)
    const maxScore = getMaxScore(scale.id)
    return { scaleId: scale.id, scaleName: scale.name.replace(/ \(.*\)/, ''), scaleCode: scale.name.match(/\((.+)\)/)?.[1] || '', score, maxScore, level: level! }
  })

  const suicideRisk = hasSuicideRisk(answers)
  const overallRisk = getOverallRisk(results.map((r) => ({ scaleId: r.scaleId, score: r.score })))
  const functionalLabels = ['전혀 어렵지 않았다', '약간 어려웠다', '많이 어려웠다', '매우 많이 어려웠다']

  const today = new Date()
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`
  const resultsSummary = results.map((r) => `${r.scaleName}: ${r.level.label}`).join(' / ')

  return (
    <div className="max-w-lg mx-auto px-4 space-y-4 animate-fade-in">

      {/* ── 결과지 헤더 ── */}
      <div className="border-b-2 border-gray-800 pb-3">
        <h2 className="text-center text-[17px] sm:text-[20px] font-bold text-gray-900 tracking-tight">정신건강 선별검사 결과</h2>
        <div className="flex justify-between mt-2 text-[12px] sm:text-[13px] text-gray-500">
          <span>검사일: {dateStr}</span>
          <span>노후연구소</span>
        </div>
      </div>

      {/* ── 실시된 검사 ── */}
      <div className="space-y-1">
        <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-800">실시된 검사</h3>
        <p className="text-[12px] sm:text-[13px] text-gray-600">{results.map((r) => `${r.scaleName}(${r.scaleCode})`).join(', ')}</p>
      </div>

      {/* ── 자살위험 경고 ── */}
      {suicideRisk && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 space-y-2">
          <h3 className="font-bold text-red-700 text-[14px]">긴급 주의사항</h3>
          <p className="text-[13px] text-red-700">자해 또는 자살 관련 문항에 양성 응답이 확인되었습니다. 아래 연락처로 즉시 상담받으시기를 권고합니다.</p>
          <div className="text-[13px] text-red-800 font-medium space-y-0.5">
            <p>자살예방 상담전화 1393 (24시간)</p>
            <p>정신건강 위기상담 1577-0199</p>
          </div>
        </div>
      )}

      {/* ── 검사 결과 테이블 ── */}
      <div className="space-y-1.5">
        <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-800">검사 결과</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-[12px] sm:text-[13px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2.5 px-3 font-semibold text-gray-700 border-b border-gray-200">검사 영역</th>
                <th className="text-center py-2.5 px-2 font-semibold text-gray-700 border-b border-gray-200 w-[70px]">점수</th>
                <th className="text-center py-2.5 px-2 font-semibold text-gray-700 border-b border-gray-200 w-[90px]">심각도</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.scaleId} className={i < results.length - 1 ? 'border-b border-gray-100' : ''}>
                  <td className="py-2.5 px-3 text-gray-800">{r.scaleName}<span className="text-gray-400 ml-1">({r.scaleCode})</span></td>
                  <td className="py-2.5 px-2 text-center text-gray-700 font-medium">{r.score}<span className="text-gray-400">/{r.maxScore}</span></td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="font-semibold" style={{ color: r.level.color }}>{r.level.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {functionalImpairment !== null && (
          <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">기능 장해 수준: {functionalLabels[functionalImpairment]}</p>
        )}
      </div>

      {/* ── 종합 소견 ── */}
      <div className="space-y-2">
        <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-800">종합 소견</h3>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] sm:text-[13px] font-bold text-white px-2.5 py-0.5 rounded" style={{ backgroundColor: overallRisk.color }}>
              {overallRisk.label}
            </span>
          </div>
          <p className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed">{overallRisk.description}</p>
        </div>
      </div>

      {/* ── 영역별 해석 ── */}
      <div className="space-y-3">
        <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-800">영역별 결과 해석</h3>
        {results.map((r) => {
          const tipData = TIPS[r.scaleId]?.[r.level.label]
          if (!tipData) return null
          return (
            <div key={r.scaleId} className="border border-gray-100 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] sm:text-[14px] font-semibold text-gray-800">{r.scaleName}</span>
                <span className="text-[12px] font-semibold" style={{ color: r.level.color }}>{r.score}점 · {r.level.label}</span>
              </div>
              <p className="text-[12px] sm:text-[13px] text-gray-600 leading-relaxed">{tipData.description}</p>
              <div className="bg-orange-50 rounded-lg p-2.5">
                <p className="text-[12px] sm:text-[13px] text-orange-700 font-medium">{tipData.recommendation}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 권고사항 ── */}
      <div className="space-y-2">
        <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-800">권고사항</h3>
        <div className="space-y-1.5">
          {results.filter((r) => { const t = TIPS[r.scaleId]?.[r.level.label]; return t && t.tips.length > 0 }).map((r) => {
            const tipData = TIPS[r.scaleId]![r.level.label]
            return (
              <div key={r.scaleId}>
                <p className="text-[12px] sm:text-[13px] font-medium text-gray-700 mb-1">[{r.scaleName}]</p>
                <ul className="space-y-0.5">
                  {tipData.tips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="text-[12px] sm:text-[13px] text-gray-600 flex items-start gap-1.5">
                      <span className="text-gray-400 shrink-0">-</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 면책 조항 ── */}
      <div className="border-t border-gray-200 pt-3">
        <p className="text-[11px] sm:text-[12px] text-gray-400 leading-relaxed">{DISCLAIMER}</p>
      </div>

      {/* ── 공유 / 재검사 ── */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={() => shareKakao(overallRisk.label, resultsSummary)}
          className="w-full py-3 sm:py-3.5 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-semibold rounded-xl active:scale-[0.98] text-[14px] sm:text-[15px] flex items-center justify-center gap-2 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
          카카오톡으로 공유하기
        </button>
        <button onClick={restart} className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] text-[14px] sm:text-[15px] transition-all">
          다시 검사하기
        </button>
      </div>
    </div>
  )
}

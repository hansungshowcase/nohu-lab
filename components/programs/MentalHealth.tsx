'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  SCALES, calculateScore, getLevel, getMaxScore, hasSuicideRisk,
  getOverallRisk,
  FUNCTIONAL_IMPAIRMENT_QUESTION, FUNCTIONAL_IMPAIRMENT_OPTIONS,
} from './mental-health/questions'
import { TIPS, getCrossInterpretation } from './mental-health/tips'

type Phase = 'intro' | 'quiz' | 'functional' | 'analyzing' | 'result'

const DISCLAIMER = '본 검사는 선별 목적의 자가 참고용으로, 의학적 진단을 대체하지 않습니다. 정확한 진단 및 치료를 위해 정신건강의학과 전문의 상담을 권장합니다.'
const KAKAO_KEY = '3913fde247b12ce25084eb42a9b17ed9'
const FREE_LIMIT = 2
const STORAGE_KEY = 'mental-health-count'
const CAFE_URL = 'https://cafe.naver.com/eovhskfktmak'

function getTestCount(): number {
  if (typeof window === 'undefined') return 0
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0 } catch { return 0 }
}
function incrementTestCount(): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, String(getTestCount() + 1)) } catch {}
}

interface KakaoWindow extends Window {
  Kakao?: { isInitialized: () => boolean; init: (k: string) => void; Share: { sendDefault: (o: Record<string, unknown>) => void } }
}

// 심각도별 색상 (빨강 대신 부드러운 톤)
const SEVERITY_COLORS = ['#22c55e', '#d4a017', '#c2751a', '#a8423f', '#8b2252']

function AnalyzingScreen({ steps, onComplete }: { steps: string[]; onComplete: () => void }) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepDuration = 2800 / steps.length
    const stepTimer = setInterval(() => {
      setCurrent((prev) => {
        if (prev >= steps.length - 1) { clearInterval(stepTimer); return prev }
        return prev + 1
      })
    }, stepDuration)
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(progressTimer); return 100 }
        return prev + 1.2
      })
    }, 30)
    const doneTimer = setTimeout(onComplete, 3200)
    return () => { clearInterval(stepTimer); clearInterval(progressTimer); clearTimeout(doneTimer) }
  }, [steps.length, onComplete])

  return (
    <div className="max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="w-20 h-20 mb-6 relative">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
      </div>
      <h3 className="text-[17px] sm:text-[19px] font-bold text-gray-900 mb-3">검사 결과 분석 중</h3>
      <div className="w-full max-w-xs mb-4">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-100" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <p className="text-[12px] text-gray-400 text-right mt-1">{Math.min(Math.round(progress), 100)}%</p>
      </div>
      <div className="h-6">
        <p className="text-[13px] sm:text-[14px] text-gray-500 animate-pulse">{steps[Math.min(current, steps.length - 1)]}</p>
      </div>
    </div>
  )
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
  const [saving, setSaving] = useState(false)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transitionLock = useRef(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // URL 파라미터로 공유된 결과 읽기
  const [sharedScores] = useState<Record<string, number> | null>(() => {
    if (typeof window === 'undefined') return null
    const p = new URLSearchParams(window.location.search)
    const d = p.get('d'), a = p.get('a'), s = p.get('s'), se = p.get('se'), i = p.get('i')
    if (d !== null && a !== null && s !== null && se !== null && i !== null) {
      return { depression: +d, anxiety: +a, stress: +s, selfesteem: +se, insomnia: +i }
    }
    return null
  })

  useEffect(() => {
    const c = new AbortController()
    fetch('/api/auth/me', { signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { if (u && u.tier >= 1) setIsMember(true) })
      .catch((e) => { if (e.name !== 'AbortError') setIsMember(false) })
    return () => c.abort()
  }, [])

  useEffect(() => () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current) }, [])

  const activeScales = SCALES
  const totalQuestions = useMemo(() => activeScales.reduce((s, sc) => s + sc.questions.length, 0), [activeScales])
  const globalIdx = useMemo(() => {
    let idx = 0; for (let i = 0; i < currentScaleIdx; i++) idx += activeScales[i].questions.length
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
    if (transitionLock.current) return; transitionLock.current = true
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

  function getResultUrl(scores: { depression: number; anxiety: number; stress: number; selfesteem: number; insomnia: number }) {
    return `${window.location.origin}/programs/mental-health?d=${scores.depression}&a=${scores.anxiety}&s=${scores.stress}&se=${scores.selfesteem}&i=${scores.insomnia}`
  }

  function shareKakao(overallLabel: string, summary: string, scores: { depression: number; anxiety: number; stress: number; selfesteem: number; insomnia: number }) {
    const w = window as KakaoWindow
    const url = getResultUrl(scores)
    if (w.Kakao) {
      if (!w.Kakao.isInitialized()) w.Kakao.init(KAKAO_KEY)
      try { w.Kakao.Share.sendDefault({ objectType: 'feed', content: { title: '심리 상태 자가진단 결과', description: `종합: ${overallLabel} | ${summary}`, imageUrl: `${window.location.origin}/api/og`, link: { mobileWebUrl: url, webUrl: url } }, buttons: [{ title: '결과 보기', link: { mobileWebUrl: url, webUrl: url } }] }); return } catch {}
    }
    if (navigator.share) navigator.share({ title: '심리 상태 자가진단 결과', text: `종합: ${overallLabel} | ${summary}`, url }).catch(() => {})
  }

  async function saveImage() {
    if (!resultRef.current || saving) return
    setSaving(true)
    try {
      const { toPng } = await import('html-to-image')
      const node = resultRef.current
      // 전체 높이 캡처 (스크롤 짤림 방지)
      const dataUrl = await toPng(node, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: node.scrollWidth,
        height: node.scrollHeight,
        style: { overflow: 'visible', maxHeight: 'none' },
        filter: (el: HTMLElement) => !el.classList?.contains('no-print'),
      })
      // 모바일: Web Share API
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        try {
          const res = await fetch(dataUrl); const blob = await res.blob()
          const file = new File([blob], 'mental-health-result.png', { type: 'image/png' })
          await navigator.share({ files: [file], title: '심리 자가진단 결과' })
          setSaving(false); return
        } catch (err) { if (err instanceof Error && err.name === 'AbortError') { setSaving(false); return } }
      }
      // PC: 다운로드
      const link = document.createElement('a'); link.href = dataUrl; link.download = 'mental-health-result.png'
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
    } catch { alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.') }
    setSaving(false)
  }

  // === SHARED RESULT (URL 파라미터로 공유된 결과) ===
  if (sharedScores && phase === 'intro') {
    const sharedResults = activeScales.map((scale) => {
      const score = sharedScores[scale.id as keyof typeof sharedScores] ?? 0
      const level = getLevel(scale.id, score)
      const maxScore = getMaxScore(scale.id)
      const levelIdx = scale.levels.findIndex((l) => score >= l.min && score <= l.max)
      return { scaleId: scale.id, scaleName: scale.name.replace(/ \(.*\)/, ''), scaleCode: scale.name.match(/\((.+)\)/)?.[1] || '', score, maxScore, level: level!, levelIdx: Math.max(levelIdx, 0) }
    })
    const sharedOverall = getOverallRisk(sharedResults.map((r) => ({ scaleId: r.scaleId, score: r.score })))
    const sharedCross = getCrossInterpretation(sharedResults.map((r) => ({ scaleId: r.scaleId, levelIdx: r.levelIdx })))
    const sharedSummary = sharedResults.map((r) => `${r.scaleName} ${r.level.label}`).join(' · ')
    const today = new Date()
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`

    return (
      <div className="max-w-lg mx-auto px-4 py-2 space-y-5 animate-fade-in" ref={resultRef}>
        <div className="text-center border-b-2 border-gray-300 pb-4">
          <p className="text-[11px] sm:text-[12px] text-gray-400 mb-1">노후연구소</p>
          <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900">정신건강 선별검사 결과</h2>
          <p className="text-[13px] sm:text-[14px] text-gray-400 mt-1">{dateStr}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4">
          <div className="text-center">
            <p className="text-[13px] text-gray-400 mb-2">종합 판정</p>
            <div className="inline-block px-5 py-2 rounded-full text-[18px] sm:text-[20px] font-bold text-white" style={{ backgroundColor: sharedOverall.color }}>{sharedOverall.label}</div>
          </div>
          <p className="text-[14px] sm:text-[15px] text-gray-700 leading-[1.8]">{sharedOverall.description}</p>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="text-left py-3 px-4 text-[13px] sm:text-[14px] font-semibold text-gray-600">영역</th><th className="text-center py-3 px-3 text-[13px] sm:text-[14px] font-semibold text-gray-600 w-[65px]">점수</th><th className="text-left py-3 px-3 text-[13px] sm:text-[14px] font-semibold text-gray-600">판정</th></tr></thead>
            <tbody>
              {sharedResults.map((r, i) => (
                <tr key={r.scaleId} className={i < sharedResults.length - 1 ? 'border-b border-gray-100' : ''}>
                  <td className="py-3 px-4 text-[14px] sm:text-[15px] text-gray-800 font-medium">{r.scaleName}</td>
                  <td className="py-3 px-3 text-center text-[14px] sm:text-[15px] text-gray-700">{r.score}<span className="text-gray-300">/{r.maxScore}</span></td>
                  <td className="py-3 px-3"><span className="text-[13px] sm:text-[14px] font-semibold" style={{ color: SEVERITY_COLORS[Math.min(r.levelIdx, 4)] }}>{r.level.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sharedCross.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900">복합 소견</h3>
            {sharedCross.map((note, i) => (
              <div key={i} className="bg-amber-50/40 border border-amber-200/50 rounded-xl p-4 sm:p-5 flex gap-3">
                <span className="text-amber-500 text-[18px] shrink-0 mt-0.5">⚡</span>
                <p className="text-[13px] sm:text-[14px] text-gray-700 leading-[1.85]">{note}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3">
          <p className="text-[12px] sm:text-[13px] text-amber-700 leading-relaxed">{DISCLAIMER}</p>
        </div>

        <div className="space-y-2.5 pb-4">
          <button onClick={startQuiz} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] text-[14px] sm:text-[15px] transition-all">나도 검사해보기</button>
        </div>
      </div>
    )
  }

  // === INTRO ===
  if (phase === 'intro') return (
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
          {[{ i: '😔', l: '우울' }, { i: '😰', l: '불안' }, { i: '🤯', l: '스트레스' }, { i: '💛', l: '자존감' }, { i: '🌙', l: '수면' }].map((x) => (
            <div key={x.l} className="bg-orange-50/50 rounded-xl py-2.5 px-1"><div className="text-xl sm:text-2xl">{x.i}</div><div className="text-[11px] sm:text-[12px] text-gray-600 font-medium mt-1">{x.l}</div></div>
          ))}
        </div>
        <p className="text-[13px] text-gray-500 text-center">정신건강의학과 공인 척도 기반 · 결과 미저장</p>
      </div>
      <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3">
        <p className="text-[12px] sm:text-[13px] text-amber-700 leading-relaxed">{DISCLAIMER}</p>
      </div>
      {!isMember && <p className="text-center text-[12px] text-gray-400">비회원 무료 {Math.max(0, FREE_LIMIT - getTestCount())}회 남음</p>}
      <button onClick={startQuiz} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] text-[15px] transition-all">검사 시작하기</button>
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
          <p className="text-[12px] text-gray-400 mb-2">Q{currentQIdx + 1}.</p>
          <h3 className="text-[15px] sm:text-[17px] font-semibold text-gray-900 leading-relaxed mb-4 sm:mb-6">{currentQuestion.text}</h3>
          <div className="space-y-2">
            {currentScale.likertOptions.map((opt) => (
              <button key={opt.value} onClick={() => handleAnswer(opt.value)} disabled={isTransitioning}
                className={`w-full text-left px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl text-[13px] sm:text-[14px] font-medium transition-all duration-150 ease-out ${answers[answerKey] === opt.value ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-[0.97]' : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100 active:scale-[0.97] border border-transparent hover:border-orange-200'} ${isTransitioning ? 'pointer-events-none' : ''}`}>
                <span className="mr-2 opacity-60">{opt.value}.</span>{opt.label}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50">
            <button onClick={goPrev} disabled={globalIdx === 0 || isTransitioning} className="px-3 py-3 text-[13px] text-gray-500 hover:text-gray-700 disabled:opacity-30 transition">← 이전</button>
          </div>
        </div>
      </div>
    )
  }

  // === FUNCTIONAL ===
  if (phase === 'functional') return (
    <div className="max-w-lg mx-auto px-4 space-y-4 animate-fade-in">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-gray-500">
          <span className="font-medium text-orange-600">기능 장해 평가</span><span>추가 문항</span>
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
            <button key={opt.value} disabled={transitionLock.current}
              onClick={() => { if (transitionLock.current) return; transitionLock.current = true; setFunctionalImpairment(opt.value); if (!isMember) incrementTestCount(); setTimeout(() => { transitionLock.current = false; setPhase('analyzing') }, 300) }}
              className={`w-full text-left px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl text-[13px] sm:text-[14px] font-medium transition-all duration-150 ease-out ${functionalImpairment === opt.value ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-[0.97]' : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100 active:scale-[0.97] border border-transparent hover:border-orange-200'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-50">
          <button onClick={() => { setPhase('quiz'); const l = activeScales.length - 1; setCurrentScaleIdx(l); setCurrentQIdx(activeScales[l].questions.length - 1) }} className="px-3 py-3 text-[13px] text-gray-500 hover:text-gray-700 transition">← 이전</button>
        </div>
      </div>
    </div>
  )

  // === ANALYZING ===
  if (phase === 'analyzing') {
    const steps = ['응답 데이터 수집 중...', '우울·불안 척도 분석 중...', '스트레스·자존감 평가 중...', '수면 상태 분석 중...', '교차 영역 종합 분석 중...', '결과 보고서 생성 중...']
    return <AnalyzingScreen steps={steps} onComplete={() => setPhase('result')} />
  }

  // === RESULT ===
  const results = activeScales.map((scale) => {
    const score = calculateScore(scale.id, answers)
    const level = getLevel(scale.id, score)
    const maxScore = getMaxScore(scale.id)
    const levelIdx = scale.levels.findIndex((l) => score >= l.min && score <= l.max)
    return { scaleId: scale.id, scaleName: scale.name.replace(/ \(.*\)/, ''), scaleCode: scale.name.match(/\((.+)\)/)?.[1] || '', score, maxScore, level: level!, levelIdx: Math.max(levelIdx, 0) }
  })

  const suicideRisk = hasSuicideRisk(answers)
  const overallRisk = getOverallRisk(results.map((r) => ({ scaleId: r.scaleId, score: r.score })))
  const crossNotes = getCrossInterpretation(results.map((r) => ({ scaleId: r.scaleId, levelIdx: r.levelIdx })))
  const functionalLabels = ['전혀 어렵지 않았다', '약간 어려웠다', '많이 어려웠다', '매우 많이 어려웠다']
  const today = new Date()
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`
  const resultsSummary = results.map((r) => `${r.scaleName} ${r.level.label}`).join(' · ')

  return (
    <div className="max-w-lg mx-auto px-4 py-2 space-y-5 animate-fade-in" ref={resultRef}>

      {/* ── 헤더 ── */}
      <div className="text-center border-b-2 border-gray-300 pb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <p className="text-[11px] sm:text-[12px] text-gray-400 mb-1">노후연구소</p>
        <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900">정신건강 선별검사 결과</h2>
        <p className="text-[13px] sm:text-[14px] text-gray-400 mt-1">{dateStr}</p>
      </div>

      {/* ── 자살위험 ── */}
      {suicideRisk && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4 space-y-2">
          <h3 className="font-bold text-red-800 text-[15px] sm:text-[16px]">긴급 안내</h3>
          <p className="text-[14px] sm:text-[15px] text-red-700 leading-relaxed">자해 또는 자살 관련 문항에 양성 응답이 확인되었습니다. 힘든 상황이시라면 아래 전문 상담 연락처로 즉시 도움을 받으시기 바랍니다.</p>
          <div className="text-[14px] sm:text-[15px] font-semibold text-red-800 space-y-1">
            <p>자살예방 상담전화 <span className="underline">1393</span> (24시간)</p>
            <p>정신건강 위기상담 <span className="underline">1577-0199</span></p>
          </div>
        </div>
      )}

      {/* ── 종합 판정 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="text-center">
          <p className="text-[13px] text-gray-400 mb-2">종합 판정</p>
          <div className="inline-block px-5 py-2 rounded-full text-[18px] sm:text-[20px] font-bold text-white" style={{ backgroundColor: overallRisk.color }}>
            {overallRisk.label}
          </div>
        </div>
        <p className="text-[15px] sm:text-[16px] text-gray-700 leading-[1.85]">{overallRisk.description}</p>
      </div>

      {/* ── 검사 결과 요약 ── */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: '350ms' }}>
        <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-900">검사 결과</h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-[13px] sm:text-[14px] font-semibold text-gray-600">영역</th>
                <th className="text-center py-3 px-3 text-[13px] sm:text-[14px] font-semibold text-gray-600 w-[65px]">점수</th>
                <th className="text-left py-3 px-3 text-[13px] sm:text-[14px] font-semibold text-gray-600">판정</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.scaleId} className={i < results.length - 1 ? 'border-b border-gray-100' : ''}>
                  <td className="py-3 px-4 text-[14px] sm:text-[15px] text-gray-800 font-medium">{r.scaleName}</td>
                  <td className="py-3 px-3 text-center text-[14px] sm:text-[15px] text-gray-700">{r.score}<span className="text-gray-300">/{r.maxScore}</span></td>
                  <td className="py-3 px-3">
                    <span className="text-[13px] sm:text-[14px] font-semibold" style={{ color: SEVERITY_COLORS[Math.min(r.levelIdx, 4)] }}>
                      {r.level.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {functionalImpairment !== null && (
          <p className="text-[13px] sm:text-[14px] text-gray-500 px-1">기능 장해: <span className="text-gray-700 font-medium">{functionalLabels[functionalImpairment]}</span></p>
        )}
      </div>

      {/* ── 영역별 소견 ── */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-900">영역별 소견</h3>
        {results.map((r) => {
          const tipData = TIPS[r.scaleId]?.[r.level.label]
          if (!tipData) return null
          const sevColor = SEVERITY_COLORS[Math.min(r.levelIdx, 4)]
          return (
            <div key={r.scaleId} className="rounded-xl overflow-hidden" style={{ borderLeft: `4px solid ${sevColor}` }}>
              <div className="bg-white border border-gray-200 border-l-0 rounded-r-xl p-4 sm:p-5 space-y-3">
                {/* 영역 이름 + 점수 */}
                <div className="flex items-center justify-between">
                  <h4 className="text-[15px] sm:text-[16px] font-bold text-gray-900">{r.scaleName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] sm:text-[16px] font-bold" style={{ color: sevColor }}>{r.score}<span className="text-[12px] text-gray-400 font-normal">/{r.maxScore}</span></span>
                    <span className="text-[12px] sm:text-[13px] font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: sevColor }}>{r.level.label}</span>
                  </div>
                </div>
                {/* 소견 */}
                <p className="text-[14px] sm:text-[15px] text-gray-600 leading-[1.8]">{tipData.description}</p>
                {/* 권고 */}
                <div className="bg-gray-50 rounded-lg p-3.5 sm:p-4">
                  <p className="text-[14px] sm:text-[15px] text-gray-800 leading-[1.8]">
                    <span className="font-bold text-orange-600 mr-1">→</span>{tipData.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 복합 소견 ── */}
      {crossNotes.length > 0 && (
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '650ms' }}>
          <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-900">복합 소견</h3>
          {crossNotes.map((note, i) => (
            <div key={i} className="bg-amber-50/40 border border-amber-200/50 rounded-xl p-4 sm:p-5 flex gap-3">
              <span className="text-amber-500 text-[18px] shrink-0 mt-0.5">⚡</span>
              <p className="text-[14px] sm:text-[15px] text-gray-700 leading-[1.85]">{note}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── 면책 ── */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-[12px] sm:text-[13px] text-gray-400 leading-relaxed">{DISCLAIMER}</p>
      </div>

      {/* ── 공유 / 이미지 / 재검사 ── */}
      <div className="space-y-2.5 pb-4">
        <button onClick={() => { const scores = { depression: results[0].score, anxiety: results[1].score, stress: results[2].score, selfesteem: results[3].score, insomnia: results[4].score }; shareKakao(overallRisk.label, resultsSummary, scores) }}
          className="w-full py-3.5 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-semibold rounded-xl active:scale-[0.98] text-[14px] sm:text-[15px] flex items-center justify-center gap-2 transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
          카카오톡으로 결과 공유하기
        </button>
        <button onClick={saveImage} disabled={saving}
          className="w-full py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl active:scale-[0.98] text-[14px] sm:text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-50">
          {saving ? '저장 중...' : '📷 결과 이미지 저장'}
        </button>
        <button onClick={restart} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] text-[14px] sm:text-[15px] transition-all">
          다시 검사하기
        </button>
      </div>
    </div>
  )
}

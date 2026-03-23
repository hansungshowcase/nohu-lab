'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import {
  generateMemoryBoard, getMemoryDifficulty, scoreMemory,
  generateMathProblems, scoreMath,
  generateReactionTargets, scoreReaction,
  calculateBrainAge, getAutoLevel,
  type MemoryCard, type BrainResult,
} from './brain-training/games'
import {
  hasPlayedToday, markPlayedToday, updateStreak,
  getStreak, getHistory, saveRecord, getLastScore,
} from './brain-training/storage'
import ResultCard from './brain-training/ResultCard'

interface KakaoWindow extends Window {
  Kakao?: {
    isInitialized: () => boolean
    init: (k: string) => void
    Share: { sendDefault: (o: Record<string, unknown>) => void }
  }
}

const KAKAO_KEY = '3913fde247b12ce25084eb42a9b17ed9'

type Phase = 'intro' | 'memory' | 'math' | 'reaction' | 'analyzing' | 'result'

export default function BrainTraining() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [realAge, setRealAge] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [playedToday, setPlayedToday] = useState(false)
  const [streak, setStreak] = useState(0)

  const memoryScoreRef = useRef(0)
  const mathScoreRef = useRef(0)
  const reactionScoreRef = useRef(0)

  const level = useMemo(() => getAutoLevel(getLastScore()), [])
  const [result, setResult] = useState<BrainResult | null>(null)
  const [saving, setSaving] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const [historyData, setHistoryData] = useState(() => getHistory())

  // URL 파라미터 공유 결과
  const [sharedResult] = useState<BrainResult | null>(() => {
    if (typeof window === 'undefined') return null
    const p = new URLSearchParams(window.location.search)
    const m = p.get('m'), c = p.get('c'), r = p.get('r'), a = p.get('a')
    if (m !== null && c !== null && r !== null && a !== null) {
      return calculateBrainAge(+m, +c, +r, +a)
    }
    return null
  })

  useEffect(() => {
    setPlayedToday(hasPlayedToday())
    setStreak(getStreak())
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
    const age = parseInt(realAge, 10)
    if (!age || age < 10 || age > 100) return
    if (!isMember && playedToday) return
    setPhase('memory')
  }, [realAge, isMember, playedToday])

  const handleMemoryComplete = useCallback((score: number) => {
    memoryScoreRef.current = score
    setPhase('math')
  }, [])

  const handleMathComplete = useCallback((score: number) => {
    mathScoreRef.current = score
    setPhase('reaction')
  }, [])

  const handleReactionComplete = useCallback((score: number) => {
    reactionScoreRef.current = score
    setPhase('analyzing')
  }, [])

  const handleAnalysisComplete = useCallback(() => {
    const age = parseInt(realAge, 10) || 50
    const ms = memoryScoreRef.current
    const cs = mathScoreRef.current
    const rs = reactionScoreRef.current
    const r = calculateBrainAge(ms, cs, rs, age)
    setResult(r)

    if (!isMember) markPlayedToday()
    updateStreak()
    saveRecord({
      brainAge: r.brainAge,
      memoryScore: r.memoryScore,
      mathScore: r.mathScore,
      reactionScore: r.reactionScore,
      totalScore: r.totalScore,
    })
    setStreak(getStreak())
    setHistoryData(getHistory())
    setPlayedToday(true)
    setPhase('result')
  }, [realAge, isMember])

  function getResultUrl() {
    if (!result) return ''
    return `${window.location.origin}/programs/brain-training?m=${result.memoryScore}&c=${result.mathScore}&r=${result.reactionScore}&a=${parseInt(realAge, 10) || 50}`
  }

  async function saveImage() {
    if (!resultRef.current || saving) return
    setSaving(true)
    try {
      let dataUrl = ''
      const node = resultRef.current
      try {
        const { toPng } = await import('html-to-image')
        dataUrl = await toPng(node, {
          quality: 0.95, pixelRatio: 2, backgroundColor: '#ffffff', cacheBust: true,
          width: node.scrollWidth, height: node.scrollHeight,
          style: { overflow: 'visible', maxHeight: 'none' },
          filter: (el: HTMLElement) => !el.classList?.contains('no-print'),
        })
      } catch {
        try {
          const html2canvas = (await import('html2canvas')).default
          const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false })
          dataUrl = canvas.toDataURL('image/png', 0.95)
        } catch { throw new Error('캡처 실패') }
      }
      if (!dataUrl || !dataUrl.startsWith('data:image')) throw new Error('이미지 생성 실패')
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      if (isMobile && navigator.share) {
        try {
          const file = new File([blob], 'brain-age-result.png', { type: 'image/png' })
          await navigator.share({ files: [file], title: '뇌나이 측정 결과' })
          return
        } catch (e) { if ((e as Error).name === 'AbortError') return }
      }
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `brain-age-${new Date().toISOString().split('T')[0]}.png`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(blobUrl) }, 3000)
    } catch { alert('이미지 저장에 실패했습니다.\n스크린샷(전원+볼륨↓)을 이용해주세요.') }
    setSaving(false)
  }

  async function shareKakao() {
    if (!result) return
    const w = window as KakaoWindow
    const url = getResultUrl()
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
            title: `🧠 내 뇌나이는 ${result.brainAge}세!`,
            description: `기억력 ${result.memoryScore} | 계산력 ${result.mathScore} | 반응속도 ${result.reactionScore} | 또래 상위 ${100 - result.percentile}%`,
            imageUrl: `${window.location.origin}/api/og`,
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: '나도 측정하기', link: { mobileWebUrl: url, webUrl: url } }],
        })
        return
      } catch { /* fallback */ }
    }
    const text = `🧠 내 뇌나이는 ${result.brainAge}세! (또래 상위 ${100 - result.percentile}%)\n${url}`
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea')
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px'
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    alert('카카오톡 SDK를 불러오지 못했습니다.\n결과 링크가 클립보드에 복사되었습니다.')
  }

  // ── 공유 결과 표시 ──
  if (sharedResult && phase === 'intro') {
    const sharedAge = new URLSearchParams(window.location.search).get('a') || '50'
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">친구의 브레인 트레이닝 결과</p>
        </div>
        <ResultCard result={sharedResult} realAge={parseInt(sharedAge, 10)} streak={0} history={[]} />
        <button
          onClick={() => window.location.assign('/programs/brain-training')}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-[15px] min-h-[44px] active:scale-[0.98] transition-transform shadow-lg shadow-orange-200"
        >
          나도 측정하기
        </button>
      </div>
    )
  }

  // ── 인트로 ──
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="text-5xl mb-3">🧠</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">브레인 트레이닝</h1>
            <p className="text-sm mt-2 opacity-90 font-medium">매일 5분, 3가지 미니게임으로 뇌나이를 측정하세요</p>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🃏', name: '기억력', desc: '카드 짝 맞추기' },
                { icon: '➕', name: '계산력', desc: '암산 속도 측정' },
                { icon: '⚡', name: '반응속도', desc: '순간 반응 테스트' },
              ].map((g) => (
                <div key={g.name} className="text-center p-3 bg-orange-50 rounded-xl">
                  <div className="text-2xl mb-1">{g.icon}</div>
                  <p className="text-xs font-bold text-gray-800">{g.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{g.desc}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">나이를 입력하세요</label>
              <input
                type="number"
                inputMode="numeric"
                value={realAge}
                onChange={(e) => setRealAge(e.target.value)}
                placeholder="예: 55"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 min-h-[44px]"
              />
            </div>

            {streak > 0 && (
              <div className="flex items-center justify-center gap-2 py-2 bg-orange-50 rounded-xl">
                <span className="text-lg">🔥</span>
                <span className="text-sm font-bold text-orange-600">{streak}일 연속 도전 중!</span>
              </div>
            )}

            {isMember ? (
              <p className="text-center text-xs text-orange-600 font-medium">회원님은 무제한 이용 가능합니다</p>
            ) : playedToday ? (
              <p className="text-center text-xs text-orange-500 font-medium">
                오늘의 무료 측정을 이미 사용했습니다<br />
                <span className="text-gray-400">내일 다시 도전하거나, 회원가입하면 무제한!</span>
              </p>
            ) : (
              <p className="text-center text-xs text-gray-500">비회원은 하루 1회 무료 · 회원은 무제한</p>
            )}

            <button
              onClick={handleStart}
              disabled={!realAge || parseInt(realAge, 10) < 10 || (!isMember && playedToday)}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-xl text-lg min-h-[44px] active:scale-[0.98] transition-all shadow-lg shadow-orange-200 disabled:opacity-40 disabled:shadow-none animate-subtle-pulse"
            >
              {!isMember && playedToday ? '내일 다시 도전!' : '🧠 측정 시작하기'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── 게임 페이즈 ──
  if (phase === 'memory') return <MemoryGame level={level} onComplete={handleMemoryComplete} />
  if (phase === 'math') return <MathGame level={level} onComplete={handleMathComplete} />
  if (phase === 'reaction') return <ReactionGame level={level} onComplete={handleReactionComplete} />
  if (phase === 'analyzing') return <AnalyzingPhase onComplete={handleAnalysisComplete} />

  // ── 결과 ──
  if (!result) return null
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <ResultCard ref={resultRef} result={result} realAge={parseInt(realAge, 10) || 50} streak={streak} history={historyData} />
      <div className="space-y-3 no-print animate-slide-up" style={{ animationDelay: '200ms' }}>
        <button onClick={shareKakao}
          className="w-full py-3.5 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-semibold rounded-xl active:scale-[0.98] text-[14px] sm:text-[15px] flex items-center justify-center gap-2 transition-all min-h-[44px]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
          카카오톡으로 공유하기
        </button>
        <button onClick={saveImage} disabled={saving}
          className="w-full py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl active:scale-[0.98] text-[14px] sm:text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[44px]">
          {saving ? '저장 중...' : '📷 결과 이미지 저장'}
        </button>
        <button
          onClick={() => { setPhase('intro'); setResult(null); setPlayedToday(hasPlayedToday()) }}
          className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl active:scale-[0.98] text-[14px] sm:text-[15px] min-h-[44px] transition-all">
          🔄 다시 측정하기
        </button>
      </div>
    </div>
  )
}


/* ════════════════════════════════════════════
   미니게임 1: 기억력 카드 뒤집기
   ════════════════════════════════════════════ */
function MemoryGame({ level, onComplete }: { level: number; onComplete: (score: number) => void }) {
  const diff = useMemo(() => getMemoryDifficulty(level), [level])
  const [cards, setCards] = useState<MemoryCard[]>(() => generateMemoryBoard(diff.pairs))
  const [selected, setSelected] = useState<number[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [matchedCount, setMatchedCount] = useState(0)
  const [previewing, setPreviewing] = useState(true)
  const [locked, setLocked] = useState(false)
  const startTime = useRef(0)
  const completedRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewing(false)
      startTime.current = Date.now()
    }, diff.previewMs)
    return () => clearTimeout(timer)
  }, [diff.previewMs])

  useEffect(() => {
    if (matchedCount === diff.pairs && !completedRef.current) {
      completedRef.current = true
      const timeMs = Date.now() - startTime.current
      const score = scoreMemory(mistakes, timeMs, diff.pairs)
      setTimeout(() => onComplete(score), 500)
    }
  }, [matchedCount, diff.pairs, mistakes, onComplete])

  function handleFlip(id: number) {
    if (locked || previewing) return
    const card = cards[id]
    if (!card || card.flipped || card.matched) return

    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c)
    setCards(newCards)
    const newSelected = [...selected, id]
    setSelected(newSelected)

    if (newSelected.length === 2) {
      setLocked(true)
      const [firstId, secondId] = newSelected
      const firstCard = newCards.find((c) => c.id === firstId)!
      const secondCard = newCards.find((c) => c.id === secondId)!

      if (firstCard.emoji === secondCard.emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
          ))
          setMatchedCount((p) => p + 1)
          setSelected([])
          setLocked(false)
        }, 400)
      } else {
        setMistakes((p) => p + 1)
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
          ))
          setSelected([])
          setLocked(false)
        }, 700)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <GameHeader
        title="🃏 기억력 테스트"
        subtitle={previewing ? '카드 위치를 기억하세요!' : '같은 그림 카드를 찾아 짝을 맞추세요'}
        step={1}
      />

      {previewing && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-orange-700">카드를 기억하세요...</span>
          </div>
        </div>
      )}

      <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            disabled={locked || previewing || card.matched}
            className={`aspect-square rounded-xl text-2xl sm:text-3xl font-bold flex items-center justify-center transition-all duration-300 min-h-[44px] ${
              card.matched
                ? 'bg-green-100 border-2 border-green-300 scale-95 opacity-60'
                : card.flipped || previewing
                  ? 'bg-white border-2 border-orange-300 shadow-md scale-105'
                  : 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-sm hover:shadow-md active:scale-95'
            }`}
          >
            {card.flipped || card.matched || previewing ? card.emoji : '?'}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-sm text-gray-500 px-1">
        <span>✅ {matchedCount}/{diff.pairs} 매칭</span>
        <span>❌ {mistakes}회 실수</span>
      </div>
    </div>
  )
}


/* ════════════════════════════════════════════
   미니게임 2: 암산 속도
   ════════════════════════════════════════════ */
function MathGame({ level, onComplete }: { level: number; onComplete: (score: number) => void }) {
  const TOTAL = 10
  const problems = useMemo(() => generateMathProblems(level, TOTAL), [level])
  const [current, setCurrent] = useState(0)
  const correctRef = useRef(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const responseTimes = useRef<number[]>([])
  const questionStart = useRef(Date.now())

  useEffect(() => {
    questionStart.current = Date.now()
  }, [current])

  function handleAnswer(selected: number) {
    if (isTransitioning) return
    setIsTransitioning(true)

    const elapsed = Date.now() - questionStart.current
    responseTimes.current.push(elapsed)

    if (selected === problems[current].answer) {
      correctRef.current += 1
    }

    setTimeout(() => {
      if (current < TOTAL - 1) {
        setCurrent((p) => p + 1)
        setIsTransitioning(false)
      } else {
        const avgTime = responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length
        const score = scoreMath(correctRef.current, TOTAL, avgTime)
        onComplete(score)
      }
    }, 300)
  }

  const progress = ((current + 1) / TOTAL) * 100
  const q = problems[current]

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <GameHeader title="➕ 계산력 테스트" subtitle="정답을 골라주세요" step={2} />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium text-orange-600">문제 {current + 1}</span>
          <span>{current + 1} / {TOTAL}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <p className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">{q.question}</p>
          <p className="text-lg text-gray-400 mt-1">= ?</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              disabled={isTransitioning}
              className={`py-4 rounded-xl text-xl font-bold min-h-[44px] transition-all active:scale-95 ${
                isTransitioning
                  ? 'bg-gray-100 text-gray-400 pointer-events-none'
                  : 'bg-orange-50 text-gray-800 border-2 border-orange-200 hover:bg-orange-100 hover:border-orange-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


/* ════════════════════════════════════════════
   미니게임 3: 반응속도 테스트
   ════════════════════════════════════════════ */
function ReactionGame({ level, onComplete }: { level: number; onComplete: (score: number) => void }) {
  const TOTAL = 10
  const targets = useMemo(() => generateReactionTargets(level, TOTAL), [level])
  const [current, setCurrent] = useState(0)
  const [showTarget, setShowTarget] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const falsePositivesRef = useRef(0)
  const missesRef = useRef(0)
  const reactionTimes = useRef<number[]>([])
  const targetShownAt = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const missTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const doneRef = useRef(false)

  const finishGame = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    const avgReaction = reactionTimes.current.length > 0
      ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
      : 1500
    const score = scoreReaction(avgReaction, falsePositivesRef.current, missesRef.current, TOTAL)
    onComplete(score)
  }, [onComplete])

  const goNext = useCallback(() => {
    if (current >= TOTAL - 1) {
      finishGame()
      return
    }
    setCurrent((p) => p + 1)
  }, [current, finishGame])

  useEffect(() => {
    if (doneRef.current || current >= TOTAL) return
    setShowTarget(false)
    setFeedback(null)

    const target = targets[current]
    timerRef.current = setTimeout(() => {
      setShowTarget(true)
      targetShownAt.current = Date.now()

      if (target.type === 'go') {
        missTimerRef.current = setTimeout(() => {
          missesRef.current += 1
          setFeedback('⏰ 시간 초과!')
          setTimeout(() => goNext(), 500)
        }, 2000)
      } else {
        missTimerRef.current = setTimeout(() => {
          setFeedback('✅ 정확!')
          setTimeout(() => goNext(), 300)
        }, 2000)
      }
    }, target.delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (missTimerRef.current) clearTimeout(missTimerRef.current)
    }
  }, [current, targets, goNext])

  function handleTap() {
    if (doneRef.current) return
    if (missTimerRef.current) clearTimeout(missTimerRef.current)

    if (!showTarget) {
      falsePositivesRef.current += 1
      setFeedback('⚠️ 너무 빨라요!')
      setTimeout(() => setFeedback(null), 500)
      return
    }

    const target = targets[current]
    if (target.type === 'go') {
      const reactionTime = Date.now() - targetShownAt.current
      reactionTimes.current.push(reactionTime)
      setFeedback(`⚡ ${reactionTime}ms`)
      setTimeout(() => goNext(), 400)
    } else {
      falsePositivesRef.current += 1
      setFeedback('❌ 참아야 해요!')
      setTimeout(() => goNext(), 500)
    }
  }

  const progress = ((current + 1) / TOTAL) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <GameHeader title="⚡ 반응속도 테스트" subtitle="초록색 원이 나타나면 터치! 빨간색은 참기!" step={3} />

      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 터치</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> 참기</span>
      </div>

      <button
        onClick={handleTap}
        className="w-full aspect-[4/3] rounded-2xl border-2 border-gray-200 flex flex-col items-center justify-center gap-3 transition-all active:scale-[0.98] bg-gray-50 hover:bg-gray-100 relative overflow-hidden"
      >
        {showTarget && targets[current] ? (
          <div className={`w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center text-white text-4xl font-black animate-fade-in ${
            targets[current].type === 'go' ? 'rounded-full bg-green-500 shadow-lg shadow-green-200' : 'rounded-2xl bg-red-500 shadow-lg shadow-red-200'
          }`}>
            {targets[current].type === 'go' ? '터치!' : '참기'}
          </div>
        ) : (
          <div className="text-gray-300">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center">
              <span className="text-lg text-gray-400 font-medium">준비...</span>
            </div>
          </div>
        )}

        {feedback && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white rounded-full shadow-md text-sm font-bold text-gray-700 animate-fade-in">
            {feedback}
          </div>
        )}
      </button>
    </div>
  )
}


/* ════════════════════════════════════════════
   공통 컴포넌트
   ════════════════════════════════════════════ */

function GameHeader({ title, subtitle, step }: { title: string; subtitle: string; step: number }) {
  return (
    <div className="text-center space-y-1">
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center gap-1 ${s === step ? 'text-orange-600 font-bold' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              s < step ? 'bg-orange-500 text-white' : s === step ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-gray-100 text-gray-400'
            }`}>
              {s < step ? '✓' : s}
            </div>
            {s < 3 && <div className={`w-6 h-0.5 ${s < step ? 'bg-orange-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <h2 className="text-xl font-black text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}

function AnalyzingPhase({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = useMemo(() => [
    { icon: '🃏', label: '기억력 데이터 분석 중...' },
    { icon: '➕', label: '계산력 점수 산출 중...' },
    { icon: '⚡', label: '반응속도 평가 중...' },
    { icon: '🧠', label: '뇌나이 종합 계산 중...' },
    { icon: '📊', label: '또래 비교 리포트 생성 중...' },
  ], [])

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 100 / (4000 / 40)))
    }, 40)

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev >= steps.length - 1 ? prev : prev + 1))
    }, 700)

    const completeTimer = setTimeout(onComplete, 4000)

    return () => {
      clearInterval(progressTimer)
      clearInterval(stepTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, steps.length])

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              {steps[currentStep].icon}
            </div>
          </div>

          <div className="w-full max-w-xs mb-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-100" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div className="text-xs text-gray-400 text-right mt-1">{Math.min(Math.round(progress), 100)}%</div>
          </div>

          <div className="w-full max-w-xs space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-3 transition-all duration-300 ${idx <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all duration-300 ${
                  idx < currentStep ? 'bg-orange-500 text-white' : idx === currentStep ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-gray-100 text-gray-400'
                }`}>
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <span className={`text-sm ${idx === currentStep ? 'text-gray-900 font-medium' : idx < currentStep ? 'text-orange-600' : 'text-gray-400'}`}>
                  {step.icon} {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

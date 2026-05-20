'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  calculateBrainAge,
  generateMathProblems,
  generateMemoryBoard,
  generateReactionTargets,
  getAutoLevel,
  getMemoryDifficulty,
  scoreMath,
  scoreMemory,
  scoreReaction,
  type BrainResult,
} from './brain-training/games'
import {
  getHistory,
  getLastScore,
  getStreak,
  hasPlayedToday,
  markPlayedToday,
  saveRecord,
  updateStreak,
} from './brain-training/storage'
import ResultCard from './brain-training/ResultCard'

interface KakaoWindow extends Window {
  Kakao?: {
    isInitialized: () => boolean
    init: (key: string) => void
    Share: { sendDefault: (payload: Record<string, unknown>) => void }
  }
}

const KAKAO_KEY = '3913fde247b12ce25084eb42a9b17ed9'

type Phase = 'intro' | 'memory' | 'memory-done' | 'math' | 'math-done' | 'reaction' | 'analyzing' | 'result'

const levelLabels: Record<number, string> = {
  1: 'Starter',
  2: 'Focus',
  3: 'Elite',
}

export default function BrainTraining() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [realAge, setRealAge] = useState('')
  const [playedToday, setPlayedToday] = useState(false)
  const [streak, setStreak] = useState(0)
  const [historyData, setHistoryData] = useState(() => getHistory())
  const [result, setResult] = useState<BrainResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const memoryScoreRef = useRef(0)
  const mathScoreRef = useRef(0)
  const reactionScoreRef = useRef(0)
  const resultRef = useRef<HTMLDivElement>(null)
  const level = useMemo(() => getAutoLevel(getLastScore()), [])

  const [sharedResult] = useState<BrainResult | null>(() => {
    if (typeof window === 'undefined') return null
    const p = new URLSearchParams(window.location.search)
    const memory = p.get('m')
    const math = p.get('c')
    const reaction = p.get('r')
    const age = p.get('a')
    if (memory !== null && math !== null && reaction !== null && age !== null) {
      return calculateBrainAge(+memory, +math, +reaction, +age)
    }
    return null
  })

  useEffect(() => {
    setPlayedToday(hasPlayedToday())
    setStreak(getStreak())
    setHistoryData(getHistory())
  }, [])

  const handleStart = useCallback(() => {
    const age = parseInt(realAge, 10)
    if (!age || age < 10 || age > 100) return
    memoryScoreRef.current = 0
    mathScoreRef.current = 0
    reactionScoreRef.current = 0
    setResult(null)
    setPhase('memory')
  }, [realAge])

  const handleAnalysisComplete = useCallback(() => {
    const age = parseInt(realAge, 10) || 50
    const nextResult = calculateBrainAge(
      memoryScoreRef.current,
      mathScoreRef.current,
      reactionScoreRef.current,
      age
    )
    setResult(nextResult)
    markPlayedToday()
    updateStreak()
    saveRecord({
      brainAge: nextResult.brainAge,
      memoryScore: nextResult.memoryScore,
      mathScore: nextResult.mathScore,
      reactionScore: nextResult.reactionScore,
      totalScore: nextResult.totalScore,
    })
    setPlayedToday(true)
    setStreak(getStreak())
    setHistoryData(getHistory())
    setPhase('result')
  }, [realAge])

  function getResultUrl(activeResult = result) {
    if (!activeResult || typeof window === 'undefined') return ''
    return `${window.location.origin}/programs/brain-training?m=${activeResult.memoryScore}&c=${activeResult.mathScore}&r=${activeResult.reactionScore}&a=${parseInt(realAge, 10) || 50}`
  }

  async function copyLink() {
    const url = getResultUrl()
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function saveImage() {
    if (!resultRef.current || saving) return
    setSaving(true)
    let host: HTMLDivElement | null = null
    try {
      const node = resultRef.current
      const width = Math.ceil(Math.max(node.scrollWidth, node.getBoundingClientRect().width, 340))
      host = document.createElement('div')
      host.style.position = 'fixed'
      host.style.left = '-10000px'
      host.style.top = '0'
      host.style.width = `${width}px`
      host.style.background = '#ffffff'
      host.style.pointerEvents = 'none'
      const clone = node.cloneNode(true) as HTMLDivElement
      clone.style.width = `${width}px`
      clone.style.maxWidth = 'none'
      clone.style.height = 'auto'
      clone.style.overflow = 'visible'
      clone.querySelectorAll<HTMLElement>('*').forEach((el) => {
        el.style.animation = 'none'
        el.style.transition = 'none'
        if (el.style.overflow === 'hidden') el.style.overflow = 'visible'
      })
      host.appendChild(clone)
      document.body.appendChild(host)

      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
      if (fonts) await fonts.ready
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      const { domToBlob } = await import('modern-screenshot')
      const blob = await domToBlob(clone, {
        scale: Math.min(2, Math.max(1.5, window.devicePixelRatio || 1.5)),
        width,
        height: Math.ceil(Math.max(clone.scrollHeight, clone.offsetHeight, 1)),
        backgroundColor: '#ffffff',
        type: 'image/png',
      })
      if (!blob) throw new Error('image blob failed')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'brain-training-result.png'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 1000)
    } catch {
      alert('이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      if (host) document.body.removeChild(host)
      setSaving(false)
    }
  }

  async function shareKakao() {
    if (!result) return
    const url = getResultUrl()
    const w = window as KakaoWindow
    if (!w.Kakao) {
      for (let i = 0; i < 15; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 200))
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
            title: `나의 두뇌 나이 ${result.brainAge}세`,
            description: `기억력 ${result.memoryScore} · 계산력 ${result.mathScore} · 반응속도 ${result.reactionScore} · 상위 ${Math.max(1, 100 - result.percentile)}%`,
            imageUrl: `${window.location.origin}/api/og`,
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: '결과 보기', link: { mobileWebUrl: url, webUrl: url } }],
        })
        return
      } catch {
        // Use copy fallback below.
      }
    }
    await copyLink()
  }

  if (sharedResult && phase === 'intro') {
    const sharedAge = parseInt(new URLSearchParams(window.location.search).get('a') || '50', 10)
    return (
      <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Shared Brain Report</p>
          <h1 className="mt-2 text-2xl font-black text-gray-950">공유된 브레인 트레이닝 결과</h1>
        </div>
        <ResultCard ref={resultRef} result={sharedResult} realAge={sharedAge} streak={0} history={[]} />
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={saveImage}
            disabled={saving}
            className="min-h-[52px] rounded-xl bg-gray-950 px-5 py-4 text-[15px] font-black text-white shadow-lg shadow-gray-900/20 transition active:scale-[0.98] disabled:bg-gray-300"
          >
            {saving ? '저장 중...' : '이미지 저장'}
          </button>
          <button
            onClick={() => window.location.assign('/programs/brain-training')}
            className="min-h-[52px] rounded-xl bg-emerald-500 px-5 py-4 text-[15px] font-black text-white shadow-lg shadow-emerald-500/20 transition active:scale-[0.98]"
          >
            나도 측정하기
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'intro') {
    const ageNumber = parseInt(realAge, 10)
    const canStart = Boolean(ageNumber && ageNumber >= 10 && ageNumber <= 100)

    return (
      <div className="mx-auto max-w-5xl animate-fade-in">
        <section className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="relative overflow-hidden rounded-2xl bg-[#111827] p-6 text-white shadow-2xl shadow-gray-900/15 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-300 via-sky-300 to-amber-300" />
            <div className="absolute -right-20 top-8 h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-200">5 Minute Cognitive Challenge</p>
              <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                매일 다시 하고 싶은 두뇌 컨디션 게임
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                기억력, 계산력, 반응속도를 짧고 몰입감 있게 측정합니다. 결과는 두뇌 나이, 또래 대비 순위, 오늘의 강화 포인트로 정리됩니다.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: '🧩', title: 'Memory', body: '패턴 기억' },
                  { icon: '⌁', title: 'Logic', body: '빠른 계산' },
                  { icon: '⚡', title: 'Reaction', body: '순간 반응' },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
                    <div className="text-2xl">{item.icon}</div>
                    <p className="mt-3 text-sm font-black">{item.title}</p>
                    <p className="mt-1 text-xs text-white/60">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-900/5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Today</p>
                <h2 className="mt-1 text-xl font-black text-gray-950">훈련 시작</h2>
              </div>
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right ring-1 ring-emerald-100">
                <p className="text-[11px] font-bold text-emerald-700">난이도</p>
                <p className="text-sm font-black text-emerald-800">{levelLabels[level]}</p>
              </div>
            </div>

            <label className="mt-6 block text-sm font-bold text-gray-800" htmlFor="brain-age">
              실제 나이
            </label>
            <input
              id="brain-age"
              type="number"
              inputMode="numeric"
              value={realAge}
              onChange={(event) => setRealAge(event.target.value)}
              placeholder="예: 55"
              className="mt-2 w-full min-h-[56px] rounded-xl border border-gray-200 bg-gray-50 px-4 text-center text-2xl font-black text-gray-950 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
            <p className="mt-2 text-center text-xs text-gray-400">회원, 비회원 모두 제한 없이 이용할 수 있습니다.</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="연속 훈련" value={`${streak}일`} />
              <Metric label="오늘 기록" value={playedToday ? '완료' : '대기'} />
            </div>

            {historyData.length > 0 && (
              <div className="mt-5 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
                <p className="text-xs font-bold text-gray-400">최근 점수</p>
                <div className="mt-2 flex items-end gap-2">
                  {historyData.map((day) => (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                      <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-lime-300" style={{ height: `${Math.max(10, day.totalScore)}px` }} />
                      <span className="text-[10px] font-bold text-gray-500">{day.totalScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={!canStart}
              className="mt-6 w-full min-h-[58px] rounded-xl bg-gray-950 px-5 py-4 text-lg font-black text-white shadow-xl shadow-gray-900/20 transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            >
              브레인 트레이닝 시작
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (phase === 'memory') {
    return <MemoryGame level={level} onComplete={(score) => { memoryScoreRef.current = score; setPhase('memory-done') }} />
  }
  if (phase === 'memory-done') {
    return <GameCompleteScreen icon="🧩" name="기억력" score={memoryScoreRef.current} step={1} onNext={() => setPhase('math')} />
  }
  if (phase === 'math') {
    return <MathGame level={level} onComplete={(score) => { mathScoreRef.current = score; setPhase('math-done') }} />
  }
  if (phase === 'math-done') {
    return <GameCompleteScreen icon="⌁" name="계산력" score={mathScoreRef.current} step={2} onNext={() => setPhase('reaction')} />
  }
  if (phase === 'reaction') {
    return <ReactionGame level={level} onComplete={(score) => { reactionScoreRef.current = score; setPhase('analyzing') }} />
  }
  if (phase === 'analyzing') return <AnalyzingPhase onComplete={handleAnalysisComplete} />

  if (!result) return null
  return (
    <div className="mx-auto max-w-2xl space-y-4 animate-fade-in">
      <ResultCard ref={resultRef} result={result} realAge={parseInt(realAge, 10) || 50} streak={streak} history={historyData} />
      <div className="grid gap-3 sm:grid-cols-3">
        <button onClick={shareKakao} className="min-h-[50px] rounded-xl bg-[#FEE500] px-4 py-3 text-sm font-black text-[#3C1E1E] transition active:scale-[0.98]">
          카카오 공유
        </button>
        <button onClick={saveImage} disabled={saving} className="min-h-[50px] rounded-xl bg-gray-950 px-4 py-3 text-sm font-black text-white transition active:scale-[0.98] disabled:bg-gray-300">
          {saving ? '저장 중...' : '이미지 저장'}
        </button>
        <button onClick={copyLink} className="min-h-[50px] rounded-xl bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition active:scale-[0.98]">
          {copied ? '복사 완료' : '링크 복사'}
        </button>
      </div>
      <button
        onClick={() => { setPhase('intro'); setResult(null); setPlayedToday(hasPlayedToday()) }}
        className="w-full min-h-[48px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 transition active:scale-[0.98]"
      >
        다시 측정하기
      </button>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
      <p className="text-xs font-bold text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-black text-gray-950">{value}</p>
    </div>
  )
}

function GameHeader({ title, subtitle, step }: { title: string; subtitle: string; step: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${item < step ? 'bg-emerald-500 text-white' : item === step ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {item < step ? '✓' : item}
            </div>
            {item < 3 && <div className={`h-0.5 w-8 ${item < step ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-950">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

function MemoryGame({ level, onComplete }: { level: number; onComplete: (score: number) => void }) {
  const diff = useMemo(() => getMemoryDifficulty(level), [level])
  const [previewing, setPreviewing] = useState(true)
  const [matchedCount, setMatchedCount] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [, forceRender] = useState(0)
  const gameRef = useRef({
    cards: generateMemoryBoard(diff.pairs),
    selected: [] as number[],
    locked: false,
    mistakes: 0,
    matched: 0,
    startTime: 0,
    completed: false,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewing(false)
      gameRef.current.startTime = Date.now()
    }, diff.previewMs)
    return () => clearTimeout(timer)
  }, [diff.previewMs])

  function handleFlip(id: number) {
    const game = gameRef.current
    if (game.locked || previewing || game.completed) return
    const card = game.cards.find((item) => item.id === id)
    if (!card || card.matched || card.flipped) return
    card.flipped = true
    game.selected.push(id)
    forceRender((value) => value + 1)

    if (game.selected.length !== 2) return
    game.locked = true
    const first = game.cards.find((item) => item.id === game.selected[0])!
    const second = game.cards.find((item) => item.id === game.selected[1])!

    if (first.emoji === second.emoji) {
      setTimeout(() => {
        first.matched = true
        second.matched = true
        first.flipped = false
        second.flipped = false
        game.matched += 1
        game.selected = []
        game.locked = false
        setMatchedCount(game.matched)
        forceRender((value) => value + 1)
        if (game.matched === diff.pairs && !game.completed) {
          game.completed = true
          onComplete(scoreMemory(game.mistakes, Date.now() - game.startTime, diff.pairs))
        }
      }, 380)
      return
    }

    game.mistakes += 1
    setMistakes(game.mistakes)
    setTimeout(() => {
      first.flipped = false
      second.flipped = false
      game.selected = []
      game.locked = false
      forceRender((value) => value + 1)
    }, 650)
  }

  const progress = Math.round((matchedCount / diff.pairs) * 100)

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in no-select">
      <GameHeader title="기억력 챌린지" subtitle={previewing ? '카드의 위치를 구역으로 묶어 기억하세요.' : '같은 그림을 빠르게 찾아 짝을 맞추세요.'} step={1} />
      <GameStats items={[['진행률', `${progress}%`], ['실수', `${mistakes}`], ['난이도', levelLabels[level]]]} />
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {gameRef.current.cards.map((card) => {
          const revealed = previewing || card.flipped || card.matched
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className={`aspect-square rounded-2xl border text-3xl font-black shadow-sm transition active:scale-95 sm:text-4xl ${revealed ? 'border-gray-200 bg-white' : 'border-gray-950 bg-gray-950 text-white'} ${card.matched ? 'ring-4 ring-emerald-200' : ''}`}
            >
              {revealed ? card.emoji : '◇'}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MathGame({ level, onComplete }: { level: number; onComplete: (score: number) => void }) {
  const total = 10
  const problems = useMemo(() => generateMathProblems(level, total), [level])
  const [current, setCurrent] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [locked, setLocked] = useState(false)
  const correctRef = useRef(0)
  const responseTimes = useRef<number[]>([])
  const startedAt = useRef(Date.now())

  useEffect(() => {
    startedAt.current = Date.now()
  }, [current])

  function handleAnswer(answer: number) {
    if (locked) return
    setLocked(true)
    responseTimes.current.push(Date.now() - startedAt.current)
    const correct = answer === problems[current].answer
    if (correct) correctRef.current += 1
    setFeedback(correct ? 'correct' : 'wrong')

    setTimeout(() => {
      setFeedback(null)
      if (current < total - 1) {
        setCurrent((value) => value + 1)
        setLocked(false)
        return
      }
      const avgTime = responseTimes.current.reduce((sum, item) => sum + item, 0) / responseTimes.current.length
      onComplete(scoreMath(correctRef.current, total, avgTime))
    }, 420)
  }

  const problem = problems[current]

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in no-select">
      <GameHeader title="계산력 스프린트" subtitle="정답을 빠르게 고르되, 끝자리와 대략값을 함께 확인하세요." step={2} />
      <GameStats items={[['문항', `${current + 1}/${total}`], ['정답', `${correctRef.current}`], ['난이도', levelLabels[level]]]} />
      <div className={`overflow-hidden rounded-2xl border bg-white shadow-xl shadow-gray-900/5 transition ${feedback === 'correct' ? 'ring-4 ring-emerald-200' : feedback === 'wrong' ? 'ring-4 ring-rose-200' : 'border-gray-200'}`}>
        <div className="bg-gray-950 px-5 py-8 text-center text-white">
          <p className="text-5xl font-black tracking-tight sm:text-6xl">{problem.question}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          {problem.options.map((option) => (
            <button
              key={`${current}-${option}`}
              onClick={() => handleAnswer(option)}
              disabled={locked}
              className="min-h-[68px] rounded-xl border border-gray-200 bg-gray-50 text-2xl font-black text-gray-950 transition hover:border-emerald-300 hover:bg-white active:scale-95 disabled:opacity-50"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReactionGame({ level, onComplete }: { level: number; onComplete: (score: number) => void }) {
  const total = 10
  const targets = useMemo(() => generateReactionTargets(level, total), [level])
  const [current, setCurrent] = useState(0)
  const [showTarget, setShowTarget] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const falsePositivesRef = useRef(0)
  const missesRef = useRef(0)
  const reactionTimes = useRef<number[]>([])
  const shownAt = useRef(0)
  const appearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const missTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const doneRef = useRef(false)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    const avg = reactionTimes.current.length
      ? reactionTimes.current.reduce((sum, item) => sum + item, 0) / reactionTimes.current.length
      : 1500
    onComplete(scoreReaction(avg, falsePositivesRef.current, missesRef.current, total))
  }, [onComplete])

  const next = useCallback(() => {
    if (current >= total - 1) finish()
    else setCurrent((value) => value + 1)
  }, [current, finish])

  useEffect(() => {
    if (doneRef.current) return
    setShowTarget(false)
    setFeedback(null)
    const target = targets[current]
    appearTimer.current = setTimeout(() => {
      setShowTarget(true)
      shownAt.current = Date.now()
      missTimer.current = setTimeout(() => {
        if (target.type === 'go') missesRef.current += 1
        setFeedback(target.type === 'go' ? '시간 초과' : '정확히 참았어요')
        setTimeout(next, 450)
      }, 1750)
    }, target.delay)

    return () => {
      if (appearTimer.current) clearTimeout(appearTimer.current)
      if (missTimer.current) clearTimeout(missTimer.current)
    }
  }, [current, next, targets])

  function handleTap() {
    if (doneRef.current) return
    if (!showTarget) {
      falsePositivesRef.current += 1
      setFeedback('너무 빨랐어요')
      setTimeout(() => setFeedback(null), 420)
      return
    }
    if (missTimer.current) clearTimeout(missTimer.current)
    const target = targets[current]
    if (target.type === 'go') {
      const reaction = Date.now() - shownAt.current
      reactionTimes.current.push(reaction)
      setFeedback(`${reaction}ms`)
      setTimeout(next, 360)
    } else {
      falsePositivesRef.current += 1
      setFeedback('참아야 하는 신호예요')
      setTimeout(next, 520)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in no-select">
      <GameHeader title="반응속도 테스트" subtitle="초록 원은 터치, 빨간 사각형은 참으세요." step={3} />
      <GameStats items={[['라운드', `${current + 1}/${total}`], ['실수', `${falsePositivesRef.current + missesRef.current}`], ['난이도', levelLabels[level]]]} />
      <button
        onClick={handleTap}
        className="relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 text-white shadow-2xl shadow-gray-900/15 transition active:scale-[0.99]"
      >
        <div className="absolute inset-x-10 top-8 h-20 rounded-full bg-emerald-300/20 blur-3xl" />
        {showTarget ? (
          <div className={`relative flex h-36 w-36 items-center justify-center text-5xl font-black shadow-2xl ${targets[current].type === 'go' ? 'rounded-full bg-emerald-400 shadow-emerald-300/40' : 'rounded-3xl bg-rose-500 shadow-rose-300/40'}`}>
            {targets[current].type === 'go' ? 'GO' : 'STOP'}
          </div>
        ) : (
          <div className="relative text-center">
            <div className="mx-auto h-28 w-28 rounded-full border-4 border-dashed border-white/15" />
            <p className="mt-4 text-sm font-bold text-white/50">신호를 기다리세요</p>
          </div>
        )}
        {feedback && (
          <div className="absolute bottom-6 rounded-full bg-white px-5 py-2 text-sm font-black text-gray-950 shadow-lg">
            {feedback}
          </div>
        )}
      </button>
    </div>
  )
}

function GameStats({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-[11px] font-bold text-gray-400">{label}</p>
          <p className="mt-1 text-base font-black text-gray-950">{value}</p>
        </div>
      ))}
    </div>
  )
}

function GameCompleteScreen({ icon, name, score, step, onNext }: { icon: string; name: string; score: number; step: number; onNext: () => void }) {
  const label = score >= 90 ? '탁월합니다' : score >= 75 ? '좋은 흐름입니다' : score >= 55 ? '안정적입니다' : '다음 판에서 끌어올릴 수 있어요'
  const next = step === 1 ? '계산력 스프린트' : '반응속도 테스트'

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-900/10 ring-1 ring-gray-200">
        <div className="bg-gray-950 p-7 text-center text-white">
          <div className="text-4xl">{icon}</div>
          <p className="mt-3 text-sm font-bold text-white/60">{name} 완료</p>
          <div className="mt-2 text-6xl font-black">{score}</div>
          <p className="mt-2 text-sm font-bold text-emerald-200">{label}</p>
        </div>
        <div className="space-y-4 p-5">
          <GameHeader title="" subtitle="" step={step + 1} />
          <button onClick={onNext} className="w-full min-h-[56px] rounded-xl bg-emerald-500 px-5 py-4 text-lg font-black text-white shadow-lg shadow-emerald-500/20 transition active:scale-[0.98]">
            다음: {next}
          </button>
        </div>
      </div>
    </div>
  )
}

function AnalyzingPhase({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const steps = useMemo(() => ['기억 패턴 정리', '계산 정확도 보정', '반응속도 분포 분석', '두뇌 나이 산출', '개인 리포트 생성'], [])

  useEffect(() => {
    const progressTimer = setInterval(() => setProgress((value) => Math.min(100, value + 2.2)), 45)
    const doneTimer = setTimeout(onComplete, 3200)
    return () => {
      clearInterval(progressTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  const activeStep = Math.min(steps.length - 1, Math.floor(progress / 22))

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="rounded-2xl bg-gray-950 p-7 text-white shadow-2xl shadow-gray-900/20">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-4xl ring-1 ring-white/15">
          🧠
        </div>
        <h2 className="mt-6 text-center text-2xl font-black">결과를 분석하고 있습니다</h2>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-amber-300 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-5 space-y-2">
          {steps.map((step, index) => (
            <div key={step} className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${index <= activeStep ? 'bg-white/10 text-white' : 'text-white/35'}`}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-black">{index < activeStep ? '✓' : index + 1}</span>
              <span className="text-sm font-bold">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// ─── 타입 ───

interface Input {
  age: number
  monthlyNet: number
  monthlySave: number
  currentAssets: number
  retireAge: number
}

interface Grade {
  letter: string; name: string; color: string; bg: string; border: string
  emoji: string; summary: string; shock: string; detail: string[]
}

interface LifeItem { icon: string; label: string; desc: string; amount: number }

interface Comparison { add: number; monthly: number; grade: Grade }

interface Result {
  monthly: number; total: number; pension: number; grade: Grade
  life: LifeItem[]; comparisons: Comparison[]; percentile: number
  budgetBreakdown: { label: string; amount: number; icon: string }[]
  realityChecks: string[]
  ageGroup: number
}

// ─── 계산 ───

const RETURN = 0.05
const LIFE_EXP = 85

function estimatePension(net: number, years: number): number {
  const gross = net * 1.25
  const A = 2_800_000, B = Math.min(gross, 5_900_000)
  const y = Math.min(Math.max(years, 10), 40)
  return Math.round(Math.max((A + B) * y * 0.008, 300_000))
}

function calc(input: Input, extra = 0) {
  const yrs = input.retireAge - input.age
  const mr = RETURN / 12, months = yrs * 12
  const save = input.monthlySave + extra
  const assetG = input.currentAssets * Math.pow(1 + RETURN, yrs)
  const saveG = save > 0 ? save * ((Math.pow(1 + mr, months) - 1) / mr) : 0
  const sev = input.monthlyNet * 1.1 * yrs
  const total = Math.round(assetG + saveG + sev)
  const retYrs = LIFE_EXP - input.retireAge
  const fromAssets = Math.round(total / (retYrs * 12))
  const pension = estimatePension(input.monthlyNet, yrs)
  return { monthly: fromAssets + pension, total, pension }
}

function getGrade(m: number): Grade {
  if (m >= 4_000_000) return {
    letter: 'S', name: '자유로운 은퇴자', color: 'text-amber-600', bg: 'from-amber-400 to-yellow-500',
    border: 'border-amber-400', emoji: '👑', summary: '하고 싶은 거 다 하며 삽니다',
    shock: '축하합니다! 당신은 경제적 자유를 달성한 소수입니다.',
    detail: ['해외여행 연 2회 이상', '취미·문화생활 자유', '의료비 걱정 없음', '자녀·손주에게 여유 있는 지원']
  }
  if (m >= 3_000_000) return {
    letter: 'A', name: '안정적 은퇴자', color: 'text-green-600', bg: 'from-green-400 to-emerald-500',
    border: 'border-green-400', emoji: '😊', summary: '큰 걱정 없이 살 수 있어요',
    shock: '괜찮은 수준이지만, 물가 상승을 고려하면 방심은 금물입니다.',
    detail: ['외식 주 1~2회', '국내여행 분기 1회', '의료비 감당 가능', '경조사 부담 적음']
  }
  if (m >= 2_000_000) return {
    letter: 'B', name: '알뜰 은퇴자', color: 'text-blue-600', bg: 'from-blue-400 to-cyan-500',
    border: 'border-blue-400', emoji: '🙂', summary: '아끼면서 살면 괜찮아요',
    shock: '생존은 가능하지만, "즐기는 노후"와는 거리가 있습니다. 지금이 마지막 골든타임일 수 있어요.',
    detail: ['외식은 특별한 날만', '여행은 1년에 1~2번', '큰 병원비는 저축 소진', '생활비 계산이 일상']
  }
  if (m >= 1_500_000) return {
    letter: 'C', name: '빠듯한 은퇴자', color: 'text-orange-600', bg: 'from-orange-400 to-amber-500',
    border: 'border-orange-400', emoji: '😰', summary: '지출을 꽤 조절해야 해요',
    shock: '솔직히 말씀드리면, 이대로면 노후가 상당히 팍팍합니다. 외식은 사치가 되고, 아프면 병원비가 두려워집니다.',
    detail: ['외식 거의 불가', '여행은 꿈도 못 꿈', '병원비가 공포', '경조사비 = 생활비 위기']
  }
  return {
    letter: 'D', name: '위기의 은퇴자', color: 'text-red-600', bg: 'from-red-500 to-rose-600',
    border: 'border-red-500', emoji: '🚨', summary: '지금 당장 전략이 필요해요',
    shock: '경고합니다. 현재 페이스대로면 기초생활 유지도 힘든 수준입니다. 라면으로 끼니를 때우고, 아파도 병원을 참아야 하는 현실이 올 수 있습니다. 하지만 지금 시작하면 아직 늦지 않았습니다.',
    detail: ['식비조차 빠듯', '의료비 감당 불가', '자녀에게 손 벌려야 함', '사회적 고립 위험']
  }
}

function getLife(m: number): LifeItem[] {
  if (m >= 4_000_000) return [
    { icon: '☕', label: '아침', desc: '동네 카페에서 모닝커피와 브런치', amount: 400_000 },
    { icon: '🍽️', label: '점심', desc: '친구들과 맛집 탐방, 주 3회 외식', amount: 600_000 },
    { icon: '🎨', label: '오후', desc: '골프, 요가, 그림 클래스 수강', amount: 500_000 },
    { icon: '🥩', label: '저녁', desc: '가족과 외식, 좋은 식재료로 요리', amount: 500_000 },
    { icon: '🏥', label: '건강', desc: '종합검진 + 치과 + 한의원 자유롭게', amount: 300_000 },
    { icon: '✈️', label: '여행', desc: '연 2회 해외, 국내여행은 수시로', amount: 800_000 },
    { icon: '🎁', label: '여유', desc: '손주 용돈, 기부, 자기계발도 OK', amount: 400_000 },
  ]
  if (m >= 3_000_000) return [
    { icon: '☕', label: '아침', desc: '집에서 내린 커피, 가끔 카페도', amount: 100_000 },
    { icon: '🍽️', label: '점심', desc: '주 1~2회 외식 가능', amount: 400_000 },
    { icon: '🚶', label: '오후', desc: '산책 + 월 1~2회 문화생활', amount: 200_000 },
    { icon: '🍳', label: '저녁', desc: '직접 요리, 가끔 배달도 OK', amount: 400_000 },
    { icon: '🏥', label: '건강', desc: '병원 걱정 없음, 정기검진 가능', amount: 250_000 },
    { icon: '🚌', label: '여행', desc: '연 1회 해외, 국내 분기 1회', amount: 500_000 },
    { icon: '🎁', label: '여유', desc: '경조사비 부담 없는 수준', amount: 150_000 },
  ]
  if (m >= 2_000_000) return [
    { icon: '🏠', label: '아침', desc: '집에서 간단한 아침 (카페는 특별한 날만)', amount: 50_000 },
    { icon: '🍱', label: '점심', desc: '도시락·집밥 위주, 외식은 월 3~4회', amount: 350_000 },
    { icon: '🚶', label: '오후', desc: '동네 산책, 무료 문화행사 위주', amount: 80_000 },
    { icon: '🛒', label: '저녁', desc: '마트 할인시간에 장보기', amount: 350_000 },
    { icon: '🏥', label: '건강', desc: '감기는 OK, 큰 수술은 저축 필요', amount: 150_000 },
    { icon: '🚌', label: '여행', desc: '국내여행 연 1~2회, 해외는 3년에 1회', amount: 200_000 },
    { icon: '😅', label: '현실', desc: '경조사비가 부담스러운 달이 있음', amount: 100_000 },
  ]
  if (m >= 1_500_000) return [
    { icon: '🍚', label: '아침', desc: '밥에 반찬 하나, 외식은 생각도 못 함', amount: 30_000 },
    { icon: '🍚', label: '점심', desc: '경로식당 또는 집에서 간단히', amount: 250_000 },
    { icon: '🏠', label: '오후', desc: 'TV 시청이 유일한 여가', amount: 30_000 },
    { icon: '🛒', label: '저녁', desc: '전단지 최저가만 골라서 장보기', amount: 250_000 },
    { icon: '😰', label: '건강', desc: '아파도 참다가 가는 편, 큰 병은 공포', amount: 100_000 },
    { icon: '❌', label: '여행', desc: '여행은 사실상 불가능', amount: 0 },
    { icon: '😓', label: '현실', desc: '경조사 가면 한 달 생활이 흔들림', amount: 80_000 },
  ]
  return [
    { icon: '😢', label: '아침', desc: '라면이나 죽으로 끼니 해결', amount: 20_000 },
    { icon: '🍚', label: '점심', desc: '무료급식소 또는 경로식당에 의존', amount: 150_000 },
    { icon: '🏠', label: '오후', desc: '외출 자제, 집에서 TV만', amount: 0 },
    { icon: '🛒', label: '저녁', desc: '마감 할인 도시락으로 연명', amount: 100_000 },
    { icon: '🚨', label: '건강', desc: '병원비가 무서워서 아파도 참는 생활', amount: 50_000 },
    { icon: '❌', label: '여행', desc: '교통비조차 아낌, 외출 최소화', amount: 0 },
    { icon: '😭', label: '현실', desc: '자녀에게 손 벌리거나 기초생활수급 신청', amount: 0 },
  ]
}

function getPercentile(age: number, monthly: number): number {
  const avg: Record<number, number> = { 20: 2_800_000, 30: 2_400_000, 40: 2_200_000, 50: 2_000_000, 60: 1_800_000 }
  const a = avg[Math.floor(age / 10) * 10] || 2_200_000
  const z = (monthly - a) / (a * 0.4)
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422802 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return Math.round(Math.min(Math.max((z > 0 ? 1 - p : p) * 100, 1), 99))
}

function won(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + '억'
  if (n >= 10_000) return Math.round(n / 10_000).toLocaleString() + '만'
  return n.toLocaleString()
}
function wonW(n: number) { return won(n) + '원' }

// ─── 분석 단계 ───

const ANALYSIS_STEPS = [
  { text: '기본 정보 분석 중', icon: '📋' },
  { text: '국민연금 수령액 계산 중', icon: '🏛️' },
  { text: '투자 수익률 시뮬레이션 중', icon: '📈' },
  { text: '은퇴 후 생활비 산출 중', icon: '🧮' },
  { text: '또래 데이터와 비교 분석 중', icon: '👥' },
  { text: '최종 결과 생성 중', icon: '✨' },
]

// ─── 메인 ───

export default function RetirementSimulator() {
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input')
  const [screen, setScreen] = useState(0)
  const [input, setInput] = useState<Input>({ age: 35, monthlyNet: 300, monthlySave: 50, currentAssets: 3000, retireAge: 65 })
  const [result, setResult] = useState<Result | null>(null)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isMember, setIsMember] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [revealShock, setRevealShock] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') setIsShared(new URLSearchParams(window.location.search).has('shared'))
    fetch('/api/auth/me').then(r => { if (r.ok) setIsMember(true) }).catch(() => {})
  }, [])

  function gate(fn: () => void) {
    if (isMember) fn(); else setShowGate(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('analyzing')
    setAnalysisStep(0)
    setAnalysisProgress(0)
    setRevealShock(false)

    // 분석 애니메이션
    let s = 0
    const totalDuration = 4000
    const stepDuration = totalDuration / ANALYSIS_STEPS.length
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 1.5, 100))
    }, totalDuration / 70)

    const stepInterval = setInterval(() => {
      s++
      if (s < ANALYSIS_STEPS.length) {
        setAnalysisStep(s)
      } else {
        clearInterval(stepInterval)
        clearInterval(progressInterval)
        setAnalysisProgress(100)
        // 계산 실행
        const realInput: Input = {
          ...input,
          monthlyNet: input.monthlyNet * 10000,
          monthlySave: input.monthlySave * 10000,
          currentAssets: input.currentAssets * 10000,
        }
        const base = calc(realInput)
        const grade = getGrade(base.monthly)
        const ageGroup = Math.floor(input.age / 10) * 10

        const r: Result = {
          monthly: base.monthly,
          total: base.total,
          pension: base.pension,
          grade,
          life: getLife(base.monthly),
          comparisons: [30, 50, 100].map(add => {
            const c = calc(realInput, add * 10000)
            return { add, monthly: c.monthly, grade: getGrade(c.monthly) }
          }),
          percentile: getPercentile(input.age, base.monthly),
          budgetBreakdown: getLife(base.monthly),
          realityChecks: getRealityChecks(base.monthly, input.age, input.retireAge),
          ageGroup,
        }
        setResult(r)
        setTimeout(() => setStep('result'), 500)
      }
    }, stepDuration)
  }

  function getRealityChecks(monthly: number, age: number, retireAge: number): string[] {
    const checks: string[] = []
    if (monthly < 2_000_000) checks.push('현재 한국 1인 가구 평균 생활비는 약 180만원입니다. 기본 생활도 빠듯할 수 있습니다.')
    if (monthly < 1_500_000) checks.push('2024년 기준 최저생계비는 1인 가구 약 113만원입니다. 여기에 가깝습니다.')
    if (retireAge - age < 15) checks.push(`은퇴까지 ${retireAge - age}년밖에 남지 않았습니다. 매달 저축을 늘리는 것이 급선무입니다.`)
    if (monthly >= 3_000_000) checks.push('상위권이지만, 연 3%의 물가상승률을 감안하면 20년 후 실질 가치는 절반 수준입니다.')
    checks.push(`평균 수명 ${LIFE_EXP}세 기준이며, 더 오래 사실 경우 자금이 더 빨리 소진됩니다.`)
    return checks
  }

  // 카드 이미지 다운로드
  const downloadCard = useCallback(() => {
    if (!result) return
    const canvas = document.createElement('canvas')
    const s = 2
    canvas.width = 640 * s; canvas.height = 440 * s
    const ctx = canvas.getContext('2d')!
    ctx.scale(s, s)

    // 배경
    const colors: Record<string, [string, string]> = {
      S: ['#f59e0b', '#d97706'], A: ['#22c55e', '#16a34a'], B: ['#3b82f6', '#2563eb'],
      C: ['#f97316', '#ea580c'], D: ['#ef4444', '#dc2626'],
    }
    const grad = ctx.createLinearGradient(0, 0, 640, 440)
    const [c1, c2] = colors[result.grade.letter] || ['#22c55e', '#16a34a']
    grad.addColorStop(0, c1); grad.addColorStop(1, c2)
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.roundRect(0, 0, 640, 440, 28); ctx.fill()

    // 배경 대문자
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = 'bold 240px sans-serif'
    ctx.fillText(result.grade.letter, 390, 280)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('노후연구소 은퇴 시뮬레이터', 36, 44)

    ctx.font = 'bold 80px sans-serif'
    ctx.fillText(`${result.grade.letter}등급`, 36, 155)

    ctx.font = 'bold 30px sans-serif'
    ctx.fillText(result.grade.name, 36, 200)

    ctx.font = '20px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText('은퇴 후 월 사용 가능 금액', 36, 260)

    ctx.font = 'bold 48px sans-serif'
    ctx.fillStyle = '#fff'
    ctx.fillText(wonW(result.monthly), 36, 315)

    ctx.font = '18px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    const lines = wrapText(ctx, `"${result.grade.summary}"`, 560)
    lines.forEach((line, i) => ctx.fillText(line, 36, 360 + i * 24))

    ctx.font = '13px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText('nohu-lab.vercel.app  |  너도 테스트해봐!', 36, 420)

    const link = document.createElement('a')
    link.download = `은퇴등급_${result.grade.letter}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [result])

  function handleShare() {
    if (!result) return
    const url = window.location.origin + '/programs/retirement-simulator?shared=true'
    const text = `🏖️ 나의 은퇴 등급: ${result.grade.letter}등급 "${result.grade.name}"\n은퇴 후 월 ${wonW(result.monthly)}으로 생활하게 됩니다.\n\n너도 테스트해봐 👉 ${url}`
    if (navigator.share) {
      navigator.share({ title: `은퇴 등급 ${result.grade.letter}등급`, text, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
      alert('공유 링크가 복사되었습니다!')
    }
  }

  // ─── 입력 화면 ───
  if (step === 'input') return (
    <div className="max-w-md mx-auto space-y-5">
      {isShared && (
        <div className="bg-green-100 border border-green-300 rounded-xl p-3 text-sm text-green-800 text-center">
          친구가 공유한 은퇴 시뮬레이터입니다!<br />
          <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer" className="underline font-bold">노후연구소 카페 가입하고 더 많은 도구 이용하기</a>
        </div>
      )}
      <div className="text-center space-y-1">
        <div className="text-5xl">🔮</div>
        <h2 className="text-xl font-bold text-gray-900">당신의 은퇴 후, 어떤 하루를 보내게 될까?</h2>
        <p className="text-gray-500 text-sm">딱 5가지만 입력하면 30초 안에 알 수 있어요</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="현재 나이" value={input.age} unit="세" onChange={v => setInput({...input, age: v})} min={20} max={70} />
          <Field label="희망 은퇴 나이" value={input.retireAge} unit="세" onChange={v => setInput({...input, retireAge: v})} min={input.age+1} max={80} />
        </div>
        <Field label="월 실수령액 (세후)" value={input.monthlyNet} unit="만원" onChange={v => setInput({...input, monthlyNet: v})} step={10} min={100} />
        <Field label="매월 저축·투자 금액" value={input.monthlySave} unit="만원" onChange={v => setInput({...input, monthlySave: v})} step={10} min={0} />
        <div>
          <Field label="현재 모아둔 총 자산" value={input.currentAssets} unit="만원" onChange={v => setInput({...input, currentAssets: v})} step={100} min={0} />
          <div className="flex gap-2 mt-2">
            {[1000, 3000, 5000, 10000, 30000].map(v => (
              <button key={v} type="button" onClick={() => setInput({...input, currentAssets: v})}
                className={`px-2 py-1 rounded text-xs ${input.currentAssets === v ? 'bg-green-600 text-white' : 'bg-green-50 text-gray-600'}`}>
                {won(v * 10000)}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition text-lg">
          내 은퇴 후 생활 분석하기 →
        </button>
      </form>
    </div>
  )

  // ─── 분석 중 화면 ───
  if (step === 'analyzing') return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="text-5xl animate-pulse">{ANALYSIS_STEPS[analysisStep]?.icon}</div>
        <h2 className="text-xl font-bold text-gray-900">분석하고 있습니다</h2>
        <p className="text-sm text-gray-500">잠시만 기다려주세요...</p>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
            style={{ width: `${analysisProgress}%` }} />
        </div>
        <div className="space-y-2">
          {ANALYSIS_STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${
              i < analysisStep ? 'text-green-600' : i === analysisStep ? 'text-gray-900 font-medium' : 'text-gray-300'}`}>
              <span className="w-5 text-center">
                {i < analysisStep ? '✓' : i === analysisStep ? <span className="inline-block animate-spin">⏳</span> : '○'}
              </span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ─── 결과 화면 ───
  if (!result) return null

  const screens = [
    { label: '은퇴 후 하루', icon: '🌅' },
    { label: '등급 카드', icon: '🏆' },
    { label: '추가 저축', icon: '💰' },
    { label: '또래 비교', icon: '👥' },
  ]

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* 탭 */}
      <div className="flex gap-1 bg-green-50 rounded-xl p-1 sticky top-0 z-10">
        {screens.map((s, i) => (
          <button key={i} onClick={() => setScreen(i)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
              screen === i ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
            <span className="block text-sm">{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {/* ─── 1. 은퇴 후 하루 ─── */}
      {screen === 0 && (
        <div className="space-y-4">
          <div className="text-center py-3">
            <p className="text-sm text-gray-500">은퇴 후 월 사용 가능 금액</p>
            <p className="text-4xl font-black text-gray-900">{wonW(result.monthly)}</p>
            <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold ${result.grade.color} bg-opacity-10`}
              style={{ backgroundColor: `currentColor`, color: 'white' }}>
              <span className={`${result.grade.color}`} style={{ color: 'inherit' }}>{result.grade.emoji} {result.grade.letter}등급 · {result.grade.name}</span>
            </div>
          </div>

          {/* 충격 메시지 */}
          <div className={`rounded-xl p-4 border-2 ${result.grade.border} bg-white`}>
            {!revealShock ? (
              <button onClick={() => setRevealShock(true)}
                className="w-full text-center py-2 text-gray-700 font-medium animate-pulse">
                🔍 당신의 은퇴 현실을 직시하세요 (터치)
              </button>
            ) : (
              <div className="space-y-3">
                <p className={`font-bold text-base ${result.grade.color}`}>{result.grade.emoji} 솔직한 진단</p>
                <p className="text-gray-800 text-sm leading-relaxed">{result.grade.shock}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.grade.detail.map((d, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{d}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 하루 일과 */}
          <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
            <div className="bg-green-50 px-4 py-3">
              <h3 className="font-bold text-gray-900">🌅 당신의 은퇴 후 하루</h3>
            </div>
            {result.life.map((item, i) => (
              <div key={i} className="px-4 py-3 border-t border-green-50 flex items-start gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                    {item.amount > 0 && <span className="text-xs text-gray-400 shrink-0">월 {won(item.amount)}원</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 현실 체크 */}
          <div className="bg-red-50 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-red-800 text-sm">⚠️ 현실 체크</h3>
            {result.realityChecks.map((c, i) => (
              <p key={i} className="text-xs text-red-700 flex gap-2">
                <span className="shrink-0">•</span><span>{c}</span>
              </p>
            ))}
          </div>

          {/* 자산 요약 */}
          <div className="grid grid-cols-3 gap-2">
            <MiniCard label="은퇴 시 총 자산" value={wonW(result.total)} />
            <MiniCard label="국민연금" value={`${wonW(result.pension)}/월`} />
            <MiniCard label="자산 인출" value={`${wonW(result.monthly - result.pension)}/월`} />
          </div>
        </div>
      )}

      {/* ─── 2. 등급 카드 ─── */}
      {screen === 1 && (
        <div className="space-y-4">
          <div ref={cardRef}
            className={`bg-gradient-to-br ${result.grade.bg} rounded-2xl p-6 text-white relative overflow-hidden`}
            style={{ aspectRatio: '640/440' }}>
            <div className="absolute right-[-30px] top-[-20px] text-[200px] font-black opacity-10 leading-none select-none">{result.grade.letter}</div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <p className="text-sm opacity-80 font-medium">노후연구소 은퇴 시뮬레이터</p>
              <div>
                <p className="text-6xl font-black leading-none">{result.grade.letter}등급</p>
                <p className="text-2xl font-bold mt-2">{result.grade.name}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">은퇴 후 월 사용 가능 금액</p>
                <p className="text-3xl font-bold mt-0.5">{wonW(result.monthly)}</p>
                <p className="text-sm opacity-70 mt-2">&ldquo;{result.grade.summary}&rdquo;</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-green-200 p-4 space-y-3">
            <h3 className="font-bold text-gray-900">📊 등급 기준</h3>
            {[
              { l: 'S', n: '자유로운 은퇴자', r: '400만원 이상', c: 'bg-amber-400' },
              { l: 'A', n: '안정적 은퇴자', r: '300~400만원', c: 'bg-green-400' },
              { l: 'B', n: '알뜰 은퇴자', r: '200~300만원', c: 'bg-blue-400' },
              { l: 'C', n: '빠듯한 은퇴자', r: '150~200만원', c: 'bg-orange-400' },
              { l: 'D', n: '위기의 은퇴자', r: '150만원 미만', c: 'bg-red-400' },
            ].map(g => (
              <div key={g.l} className={`flex items-center gap-3 text-sm ${result.grade.letter === g.l ? 'font-bold' : 'text-gray-500'}`}>
                <span className={`w-8 h-8 ${g.c} text-white rounded-lg flex items-center justify-center font-black text-sm ${result.grade.letter === g.l ? 'ring-2 ring-offset-1 ring-gray-900' : ''}`}>{g.l}</span>
                <span className="flex-1">{g.n}</span>
                <span className="text-xs">{g.r}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => gate(downloadCard)} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm">
              📥 카드 이미지 저장
            </button>
            <button onClick={() => gate(handleShare)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium text-sm">
              🔗 친구에게 공유
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. 추가 저축 비교 ─── */}
      {screen === 2 && (
        <div className="space-y-3">
          <div className="text-center py-2">
            <h2 className="text-lg font-bold text-gray-900">만약 매달 조금 더 모으면?</h2>
            <p className="text-sm text-gray-500">작은 차이가 노후를 바꿉니다</p>
          </div>

          <div className={`rounded-xl border-2 ${result.grade.border} bg-white p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">현재 페이스</p>
                <p className="text-base font-bold text-gray-900">{result.grade.emoji} {result.grade.letter}등급 · {result.grade.name}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{wonW(result.monthly)}</p>
                <p className="text-xs text-gray-400">/월</p>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-300 text-lg">▼</div>

          {result.comparisons.map((c) => {
            const diff = c.monthly - result.monthly
            const up = c.grade.letter !== result.grade.letter
            return (
              <div key={c.add} className={`rounded-xl border bg-white p-4 ${up ? `${c.grade.border} ring-1 ring-green-100` : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-bold">💰 월 {c.add}만원 추가 시</p>
                    <p className="text-base font-bold text-gray-900">
                      {c.grade.emoji} {c.grade.letter}등급 · {c.grade.name}
                      {up && <span className="ml-1 text-green-600 text-xs bg-green-50 px-1.5 py-0.5 rounded-full">등급 UP!</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{wonW(c.monthly)}</p>
                    <p className="text-xs text-green-600 font-medium">+{wonW(diff)}/월</p>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="bg-green-50 rounded-xl p-4 space-y-2 text-sm text-gray-700">
            <p className="font-bold text-gray-900">💡 이 금액, 어디서 만들까?</p>
            <ul className="space-y-1 text-xs">
              <li>☕ 커피 하루 1잔 줄이기 → <b>월 10~15만원</b></li>
              <li>📱 통신비 알뜰 요금제 변경 → <b>월 3~5만원</b></li>
              <li>🚗 자차 대신 대중교통 주 2회 → <b>월 10~20만원</b></li>
              <li>🍽️ 외식 주 1회 줄이기 → <b>월 8~15만원</b></li>
              <li>📺 안 보는 구독 서비스 정리 → <b>월 3~5만원</b></li>
            </ul>
          </div>
        </div>
      )}

      {/* ─── 4. 또래 비교 ─── */}
      {screen === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-green-200 p-6 text-center space-y-2">
            <p className="text-sm text-gray-500">{result.ageGroup}대 이용자 중</p>
            <p className="text-7xl font-black text-gray-900 leading-none py-2">
              상위 <span className={result.percentile <= 30 ? 'text-green-600' : result.percentile <= 60 ? 'text-yellow-600' : 'text-red-600'}>{result.percentile}%</span>
            </p>
            <p className="text-base text-gray-700 font-medium">
              {result.percentile <= 10 ? '🎉 상위 10%! 노후 준비의 모범 사례입니다' :
               result.percentile <= 25 ? '👏 훌륭합니다! 또래보다 확실히 앞서 있어요' :
               result.percentile <= 40 ? '😊 평균 이상! 꾸준히 하면 안정적인 노후' :
               result.percentile <= 60 ? '🙂 평균 수준이에요. 조금만 더 노력하면...' :
               result.percentile <= 80 ? '😐 또래보다 준비가 부족합니다. 지금이 기회!' :
               '😰 솔직히, 또래 대비 많이 뒤처져 있습니다. 오늘부터 시작하세요'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-green-200 p-4 space-y-3">
            <p className="text-sm font-bold text-gray-900">{result.ageGroup}대 은퇴 준비 분포</p>
            <div className="h-10 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full relative overflow-visible">
              <div className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${100 - result.percentile}%`, transform: 'translateX(-50%)' }}>
                <div className="w-1 h-full bg-gray-900 rounded-full" />
                <span className="mt-1 text-xs font-bold bg-gray-900 text-white px-2 py-0.5 rounded-full whitespace-nowrap">← 나</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>상위 (잘 준비됨)</span><span>하위 (준비 부족)</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-green-200 p-4 space-y-2">
            <p className="text-sm font-bold text-gray-900">{result.ageGroup}대 평균 데이터</p>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">평균 은퇴 후 월 수입</p>
                <p className="text-base font-bold text-gray-900">
                  {result.ageGroup === 20 ? '280' : result.ageGroup === 30 ? '240' : result.ageGroup === 40 ? '220' : result.ageGroup === 50 ? '200' : '180'}만원
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">나의 은퇴 후 월 수입</p>
                <p className={`text-base font-bold ${result.grade.color}`}>{won(result.monthly)}원</p>
              </div>
            </div>
          </div>

          {result.percentile > 50 && (
            <div className="bg-red-50 rounded-xl p-4 text-center text-sm">
              <p className="font-bold text-red-800">🚨 또래의 절반 이상보다 뒤처져 있습니다</p>
              <p className="text-red-700 text-xs mt-1">매월 저축을 {result.comparisons[0].add}만원만 늘려도 순위가 크게 올라갑니다</p>
            </div>
          )}
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flex gap-2 pt-2 pb-4">
        <button onClick={() => { setStep('input'); setResult(null) }}
          className="flex-1 py-3 bg-white border border-green-200 text-gray-700 rounded-xl font-medium text-sm">
          ↩ 다시 해보기
        </button>
        <button onClick={() => gate(handleShare)}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium text-sm">
          🔗 친구도 테스트해보게 하기
        </button>
      </div>

      {/* 카페 가입 유도 모달 */}
      {showGate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setShowGate(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-5xl">🔒</div>
            <h3 className="text-xl font-bold text-gray-900">결과 저장·공유는<br />카페 회원만 가능해요!</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              노후연구소 카페에 <b>무료 가입</b>하시면<br />
              등급 카드 저장, 결과 공유, 더 많은<br />재무 분석 도구를 이용할 수 있습니다.
            </p>
            <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer"
              className="block w-full py-3.5 bg-[#03C75A] text-white font-bold rounded-xl text-base hover:bg-[#02b351] transition">
              네이버 카페 무료 가입하기
            </a>
            <p className="text-xs text-gray-400">가입 후 닉네임으로 로그인하면 잠금이 해제됩니다</p>
            <button onClick={() => setShowGate(false)} className="text-sm text-gray-400 hover:text-gray-600">
              나중에 할게요
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 서브 컴포넌트 ───

function Field({ label, value, unit, onChange, step = 1, min = 0, max }: {
  label: string; value: number; unit: string; onChange: (v: number) => void; step?: number; min?: number; max?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input type="number" value={value} onChange={e => onChange(+e.target.value)}
          step={step} min={min} max={max}
          className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-green-500 outline-none pr-14" />
        <span className="absolute right-3 top-3.5 text-sm text-gray-400">{unit}</span>
      </div>
    </div>
  )
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-green-100 p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split('')
  const lines: string[] = []
  let line = ''
  for (const ch of words) {
    if (ctx.measureText(line + ch).width > maxW) { lines.push(line); line = ch }
    else line += ch
  }
  if (line) lines.push(line)
  return lines
}

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ─── 계산 ───

interface Input {
  age: number
  monthlyNet: number      // 월 실수령액
  monthlySave: number     // 매월 저축/투자
  currentAssets: number   // 현재 자산
  retireAge: number       // 희망 은퇴 나이
}

interface Result {
  monthlyAvailable: number   // 은퇴 후 월 사용 가능 금액
  totalAtRetire: number      // 은퇴 시점 총 자산
  pension: number            // 국민연금
  grade: Grade
  lifestyle: LifestyleDay
  comparisons: Comparison[]
  percentile: number
}

interface Grade {
  letter: string
  name: string
  color: string
  bgColor: string
  borderColor: string
  summary: string
  emoji: string
}

interface LifestyleDay {
  morning: string
  lunch: string
  afternoon: string
  evening: string
  medical: string
  travel: string
  extra: string
}

interface Comparison {
  addAmount: number
  grade: Grade
  monthlyAvailable: number
}

const ANNUAL_RETURN = 0.05
const LIFE_EXPECTANCY = 85

function estimatePension(monthlyNet: number, yearsWorked: number): number {
  // 국민연금 간이 추정 (실수령 기준이므로 세전 역산)
  const grossEstimate = monthlyNet * 1.25
  const A = 2_800_000
  const B = Math.min(grossEstimate, 5_900_000)
  const years = Math.min(Math.max(yearsWorked, 10), 40)
  const basic = (A + B) * years * 0.008
  return Math.round(Math.max(basic, 300_000))
}

function calcResult(input: Input, extraSave = 0): { monthlyAvailable: number; totalAtRetire: number; pension: number } {
  const yearsToRetire = input.retireAge - input.age
  const monthlyReturn = ANNUAL_RETURN / 12
  const months = yearsToRetire * 12
  const save = input.monthlySave + extraSave

  // 복리 성장
  const assetGrowth = input.currentAssets * Math.pow(1 + ANNUAL_RETURN, yearsToRetire)
  const savingsGrowth = save * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn)
  const severance = input.monthlyNet * 1.1 * yearsToRetire // 퇴직금 근사

  const totalAtRetire = Math.round(assetGrowth + savingsGrowth + severance)

  const retireYears = LIFE_EXPECTANCY - input.retireAge
  const monthlyFromAssets = Math.round(totalAtRetire / (retireYears * 12))

  const pension = estimatePension(input.monthlyNet, yearsToRetire)
  const monthlyAvailable = monthlyFromAssets + pension

  return { monthlyAvailable, totalAtRetire, pension }
}

function getGrade(monthly: number): Grade {
  if (monthly >= 4_000_000) return { letter: 'S', name: '자유로운 은퇴자', color: 'text-yellow-600', bgColor: 'bg-gradient-to-br from-yellow-400 to-amber-500', borderColor: 'border-yellow-400', summary: '하고 싶은 거 다 하며 삽니다', emoji: '👑' }
  if (monthly >= 3_000_000) return { letter: 'A', name: '안정적 은퇴자', color: 'text-green-600', bgColor: 'bg-gradient-to-br from-green-400 to-emerald-500', borderColor: 'border-green-400', summary: '큰 걱정 없이 살 수 있어요', emoji: '😊' }
  if (monthly >= 2_000_000) return { letter: 'B', name: '알뜰 은퇴자', color: 'text-blue-600', bgColor: 'bg-gradient-to-br from-blue-400 to-cyan-500', borderColor: 'border-blue-400', summary: '아끼면서 살면 괜찮아요', emoji: '🙂' }
  if (monthly >= 1_500_000) return { letter: 'C', name: '빠듯한 은퇴자', color: 'text-orange-600', bgColor: 'bg-gradient-to-br from-orange-400 to-amber-500', borderColor: 'border-orange-400', summary: '지출을 꽤 조절해야 해요', emoji: '😐' }
  return { letter: 'D', name: '위기의 은퇴자', color: 'text-red-600', bgColor: 'bg-gradient-to-br from-red-400 to-rose-500', borderColor: 'border-red-400', summary: '지금 당장 전략이 필요해요', emoji: '😰' }
}

function getLifestyle(monthly: number): LifestyleDay {
  if (monthly >= 4_000_000) return {
    morning: '☕ 동네 카페에서 모닝커피 (외식 예산 월 40만원)',
    lunch: '🍽️ 친구들과 점심 약속 자유롭게 (식비 월 80만원)',
    afternoon: '🎨 문화센터 수업 + 취미 클래스 (여가비 월 30만원)',
    evening: '🥩 가족과 외식 주 2~3회',
    medical: '🏥 정기 건강검진 + 치과도 걱정 없이 (의료비 월 25만원)',
    travel: '✈️ 연 2회 해외여행, 국내여행 수시로',
    extra: '🎁 손주 용돈, 경조사비도 넉넉하게',
  }
  if (monthly >= 3_000_000) return {
    morning: '☕ 집에서 내린 커피, 가끔 카페도 (외식 예산 월 25만원)',
    lunch: '🍽️ 주 1~2회 외식 가능 (식비 월 60만원)',
    afternoon: '🚶 동네 산책 + 월 1회 문화생활 (여가비 월 15만원)',
    evening: '🍳 직접 요리하되 가끔 배달도 OK',
    medical: '🏥 감기, 치과 걱정 없음 (의료비 월 20만원)',
    travel: '✈️ 연 1회 해외여행, 국내여행 분기 1회',
    extra: '🎁 경조사비는 부담 없는 수준',
  }
  if (monthly >= 2_000_000) return {
    morning: '☕ 집에서 커피 (카페는 특별한 날만)',
    lunch: '🍱 집밥 위주, 외식은 월 3~4회 (식비 월 45만원)',
    afternoon: '🚶 동네 산책, 무료 문화행사 위주 (여가비 월 8만원)',
    evening: '🛒 마트 할인시간에 장보기',
    medical: '🏥 감기는 OK, 큰 수술은 저축 깨야 함 (의료비 월 15만원)',
    travel: '🚌 국내여행 연 1~2회, 해외여행은 3년에 1회',
    extra: '😅 경조사비가 부담스러운 달이 있음',
  }
  if (monthly >= 1_500_000) return {
    morning: '🏠 집에서 간단한 아침 (외식 거의 불가)',
    lunch: '🍚 집밥 또는 경로식당 (식비 월 35만원)',
    afternoon: '🚶 동네 산책이 유일한 여가 (여가비 월 3만원)',
    evening: '🛒 전단지 보고 최저가 장보기',
    medical: '🏥 아파도 참다가 가는 편 (의료비 월 10만원)',
    travel: '🚌 여행은 사실상 어려움',
    extra: '😓 경조사비 부담에 관계가 줄어듦',
  }
  return {
    morning: '🏠 라면이나 죽으로 아침 해결',
    lunch: '🍚 무료 급식소 또는 경로식당 의존',
    afternoon: '🏠 집에서 TV 시청 (외출 자제)',
    evening: '🛒 마트 마감 할인 도시락',
    medical: '🏥 병원비가 무서워서 참는 경우 多',
    travel: '❌ 여행 불가, 교통비도 아낌',
    extra: '😢 자녀에게 손 벌리게 될 수 있음',
  }
}

function getPercentile(age: number, monthlyAvailable: number): number {
  // 연령대별 평균 은퇴 후 월 수입 (통계청 기반 근사)
  const avgByAge: Record<string, number> = {
    '20': 2_800_000, '30': 2_400_000, '40': 2_200_000,
    '50': 2_000_000, '60': 1_800_000,
  }
  const ageGroup = String(Math.floor(age / 10) * 10)
  const avg = avgByAge[ageGroup] || 2_200_000
  const stdDev = avg * 0.4

  // 정규분포 CDF 근사
  const z = (monthlyAvailable - avg) / stdDev
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422802 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  const cdf = z > 0 ? 1 - p : p
  return Math.round(Math.min(Math.max(cdf * 100, 1), 99))
}

function won(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + '억'
  if (n >= 10_000) return Math.round(n / 10_000).toLocaleString() + '만'
  return n.toLocaleString()
}

function wonFull(n: number): string {
  return won(n) + '원'
}

// ─── 컴포넌트 ───

export default function RetirementSimulator() {
  const [step, setStep] = useState<'input' | 'result'>('input')
  const [screen, setScreen] = useState(0)
  const [input, setInput] = useState<Input>({
    age: 35,
    monthlyNet: 300,
    monthlySave: 50,
    currentAssets: 3000,
    retireAge: 65,
  })
  const [result, setResult] = useState<Result | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isShared, setIsShared] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [showJoinPrompt, setShowJoinPrompt] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsShared(new URLSearchParams(window.location.search).has('shared'))
    }
    // 로그인 여부 확인
    fetch('/api/auth/me')
      .then((r) => { if (r.ok) setIsMember(true) })
      .catch(() => {})
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const realInput: Input = {
      ...input,
      monthlyNet: input.monthlyNet * 10000,
      monthlySave: input.monthlySave * 10000,
      currentAssets: input.currentAssets * 10000,
    }

    const base = calcResult(realInput)
    const grade = getGrade(base.monthlyAvailable)
    const lifestyle = getLifestyle(base.monthlyAvailable)
    const percentile = getPercentile(input.age, base.monthlyAvailable)

    const comparisons: Comparison[] = [30, 50, 100].map((add) => {
      const r = calcResult(realInput, add * 10000)
      return { addAmount: add, grade: getGrade(r.monthlyAvailable), monthlyAvailable: r.monthlyAvailable }
    })

    setResult({
      monthlyAvailable: base.monthlyAvailable,
      totalAtRetire: base.totalAtRetire,
      pension: base.pension,
      grade,
      lifestyle,
      comparisons,
      percentile,
    })
    setStep('result')
    setScreen(0)
  }

  function requireMember(action: () => void) {
    if (isMember) {
      action()
    } else {
      setShowJoinPrompt(true)
    }
  }

  function handleShare() {
    requireMember(() => {
      const url = window.location.origin + '/programs/retirement-simulator?shared=true'
      if (navigator.share) {
        navigator.share({
          title: `나의 은퇴 등급: ${result?.grade.letter}등급 - ${result?.grade.name}`,
          text: `은퇴 후 월 ${wonFull(result?.monthlyAvailable || 0)}으로 생활! 너도 테스트해봐 👉`,
          url,
        }).catch(() => {})
      } else {
        navigator.clipboard.writeText(
          `🏖️ 나의 은퇴 등급: ${result?.grade.letter}등급 "${result?.grade.name}"\n은퇴 후 월 ${wonFull(result?.monthlyAvailable || 0)}으로 생활하게 됩니다.\n\n너도 테스트해봐 👉 ${url}`
        )
        alert('공유 링크가 복사되었습니다!')
      }
    })
  }

  const downloadCard = useCallback(() => {
    if (!result) return
    if (!isMember) { setShowJoinPrompt(true); return }
    const canvas = document.createElement('canvas')
    const scale = 2
    canvas.width = 600 * scale
    canvas.height = 400 * scale
    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)

    // 배경
    const grad = ctx.createLinearGradient(0, 0, 600, 400)
    const colors: Record<string, [string, string]> = {
      S: ['#f59e0b', '#d97706'], A: ['#22c55e', '#16a34a'],
      B: ['#3b82f6', '#2563eb'], C: ['#f97316', '#ea580c'], D: ['#ef4444', '#dc2626'],
    }
    const [c1, c2] = colors[result.grade.letter] || ['#22c55e', '#16a34a']
    grad.addColorStop(0, c1)
    grad.addColorStop(1, c2)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(0, 0, 600, 400, 24)
    ctx.fill()

    // 텍스트
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = 'bold 200px sans-serif'
    ctx.fillText(result.grade.letter, 380, 220)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('노후연구소 은퇴 시뮬레이터', 32, 45)

    ctx.font = 'bold 72px sans-serif'
    ctx.fillText(`${result.grade.letter}등급`, 32, 140)

    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(result.grade.name, 32, 185)

    ctx.font = '22px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(`은퇴 후 월 사용 가능 금액`, 32, 240)

    ctx.font = 'bold 40px sans-serif'
    ctx.fillStyle = '#fff'
    ctx.fillText(`${wonFull(result.monthlyAvailable)}`, 32, 290)

    ctx.font = '18px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(`"${result.grade.summary}"`, 32, 335)

    ctx.font = '14px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText('nohu-lab.vercel.app', 32, 375)

    const link = document.createElement('a')
    link.download = `은퇴등급_${result.grade.letter}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [result, isMember])

  // ─── 입력 화면 ───
  if (step === 'input') {
    return (
      <div className="max-w-md mx-auto space-y-5">
        {isShared && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-sm text-green-800 text-center">
            친구가 공유한 은퇴 시뮬레이터입니다!<br />
            <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer" className="underline font-bold">
              노후연구소 카페 가입하고 더 많은 도구 이용하기
            </a>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-600 text-sm">5가지만 입력하면 30초 안에 결과가 나와요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">현재 나이</label>
              <div className="relative">
                <input type="number" value={input.age} onChange={(e) => setInput({ ...input, age: +e.target.value })}
                  min={20} max={70}
                  className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-green-500 outline-none" />
                <span className="absolute right-3 top-3 text-gray-400 text-sm">세</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">희망 은퇴 나이</label>
              <div className="relative">
                <input type="number" value={input.retireAge} onChange={(e) => setInput({ ...input, retireAge: +e.target.value })}
                  min={input.age + 1} max={80}
                  className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-green-500 outline-none" />
                <span className="absolute right-3 top-3 text-gray-400 text-sm">세</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">월 실수령액</label>
            <div className="relative">
              <input type="number" value={input.monthlyNet} onChange={(e) => setInput({ ...input, monthlyNet: +e.target.value })}
                step={10} min={100}
                className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-green-500 outline-none" />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">만원</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">매월 저축/투자 금액</label>
            <div className="relative">
              <input type="number" value={input.monthlySave} onChange={(e) => setInput({ ...input, monthlySave: +e.target.value })}
                step={10} min={0}
                className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-green-500 outline-none" />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">만원</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">현재 모아둔 자산</label>
            <div className="relative">
              <input type="number" value={input.currentAssets} onChange={(e) => setInput({ ...input, currentAssets: +e.target.value })}
                step={100} min={0}
                className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-green-500 outline-none" />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">만원</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[1000, 3000, 5000, 10000].map((v) => (
                <button key={v} type="button" onClick={() => setInput({ ...input, currentAssets: v })}
                  className={`px-2 py-1 rounded text-xs ${input.currentAssets === v ? 'bg-green-600 text-white' : 'bg-green-50 text-gray-700'}`}>
                  {won(v * 10000)}
                </button>
              ))}
            </div>
          </div>

          <button type="submit"
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition text-lg mt-2">
            내 은퇴 후 생활 보기
          </button>
        </form>
      </div>
    )
  }

  // ─── 결과 화면 ───
  if (!result) return null

  const screens = [
    { label: '하루 생활', icon: '🌅' },
    { label: '등급 카드', icon: '🏆' },
    { label: '추가 저축', icon: '📊' },
    { label: '또래 비교', icon: '👥' },
  ]

  const ageGroup = Math.floor(input.age / 10) * 10

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* 탭 네비게이션 */}
      <div className="flex gap-1 bg-green-50 rounded-xl p-1">
        {screens.map((s, i) => (
          <button key={i} onClick={() => setScreen(i)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${screen === i ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
            <span className="block text-base">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* 화면 1: 은퇴 후 하루 */}
      {screen === 0 && (
        <div className="space-y-4">
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">은퇴 후 월 사용 가능 금액</p>
            <p className="text-3xl font-bold text-gray-900">{wonFull(result.monthlyAvailable)}</p>
            <p className={`text-sm font-medium ${result.grade.color} mt-1`}>{result.grade.emoji} {result.grade.name}</p>
          </div>

          <div className="bg-white rounded-xl border border-green-200 divide-y divide-green-100">
            <h3 className="px-4 py-3 font-bold text-gray-900 text-base">🌅 당신의 은퇴 후 하루</h3>
            {[
              { time: '아침', desc: result.lifestyle.morning },
              { time: '점심', desc: result.lifestyle.lunch },
              { time: '오후', desc: result.lifestyle.afternoon },
              { time: '저녁', desc: result.lifestyle.evening },
              { time: '의료', desc: result.lifestyle.medical },
              { time: '여행', desc: result.lifestyle.travel },
              { time: '기타', desc: result.lifestyle.extra },
            ].map(({ time, desc }) => (
              <div key={time} className="px-4 py-3 flex gap-3">
                <span className="text-xs font-medium text-green-600 w-8 pt-0.5 shrink-0">{time}</span>
                <span className="text-sm text-gray-800">{desc}</span>
              </div>
            ))}
          </div>

          <div className="bg-green-50 rounded-xl p-4 text-center text-sm text-gray-700">
            국민연금 예상 <b>{wonFull(result.pension)}</b>/월 포함<br />
            은퇴 시점 총 자산 약 <b>{wonFull(result.totalAtRetire)}</b>
          </div>
        </div>
      )}

      {/* 화면 2: 등급 카드 */}
      {screen === 1 && (
        <div className="space-y-4">
          <div ref={cardRef} className={`${result.grade.bgColor} rounded-2xl p-6 text-white relative overflow-hidden aspect-[3/2]`}>
            {/* 배경 글자 */}
            <div className="absolute right-[-20px] top-[-20px] text-[180px] font-black opacity-15 leading-none select-none">
              {result.grade.letter}
            </div>
            {/* 내용 */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              <p className="text-sm opacity-80 font-medium">노후연구소 은퇴 시뮬레이터</p>
              <div>
                <p className="text-5xl font-black">{result.grade.letter}등급</p>
                <p className="text-xl font-bold mt-1">{result.grade.name}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">은퇴 후 월 사용 가능 금액</p>
                <p className="text-2xl font-bold">{wonFull(result.monthlyAvailable)}</p>
                <p className="text-sm opacity-80 mt-1">&ldquo;{result.grade.summary}&rdquo;</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={downloadCard}
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition">
              📥 카드 이미지 저장
            </button>
            <button onClick={handleShare}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition">
              🔗 공유하기
            </button>
          </div>
        </div>
      )}

      {/* 화면 3: 추가 저축 비교 */}
      {screen === 2 && (
        <div className="space-y-3">
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">매월 조금만 더 모으면 은퇴가 달라집니다</p>
          </div>

          {/* 현재 */}
          <div className={`rounded-xl border-2 ${result.grade.borderColor} bg-white p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">지금 그대로</p>
                <p className="text-lg font-bold text-gray-900">{result.grade.letter}등급 · {result.grade.name}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{wonFull(result.monthlyAvailable)}</p>
                <p className="text-xs text-gray-500">/월</p>
              </div>
            </div>
          </div>

          {/* 비교 */}
          {result.comparisons.map((c) => {
            const diff = c.monthlyAvailable - result.monthlyAvailable
            const upgraded = c.grade.letter !== result.grade.letter
            return (
              <div key={c.addAmount} className={`rounded-xl border bg-white p-4 ${upgraded ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-medium">월 {c.addAmount}만원 추가 저축 시</p>
                    <p className="text-lg font-bold text-gray-900">
                      {c.grade.letter}등급 · {c.grade.name}
                      {upgraded && <span className="text-green-600 text-sm ml-1">⬆ UP!</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{wonFull(c.monthlyAvailable)}</p>
                    <p className="text-xs text-green-600">+{wonFull(diff)}</p>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="bg-green-50 rounded-xl p-4 text-center text-sm text-gray-700">
            💡 월 {result.comparisons[0].addAmount}만원은<br />
            커피 하루 1잔 줄이면 만들 수 있는 금액이에요
          </div>
        </div>
      )}

      {/* 화면 4: 또래 비교 */}
      {screen === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-green-200 p-6 text-center space-y-4">
            <p className="text-sm text-gray-500">{ageGroup}대 이용자 중</p>
            <div className="relative">
              <p className="text-6xl font-black text-gray-900">상위 {result.percentile}%</p>
            </div>
            <p className="text-sm text-gray-600">
              {result.percentile <= 20 ? '👏 훌륭합니다! 노후 준비가 잘 되어 있어요' :
               result.percentile <= 40 ? '😊 평균 이상! 조금만 더 노력하면 안정적이에요' :
               result.percentile <= 60 ? '🙂 평균 수준이에요. 저축을 조금 늘려보세요' :
               result.percentile <= 80 ? '😐 또래보다 준비가 부족해요. 지금부터 시작하세요' :
               '😰 또래 대비 준비가 많이 부족합니다. 전략이 필요해요'}
            </p>
          </div>

          {/* 바 */}
          <div className="bg-white rounded-xl border border-green-200 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">{ageGroup}대 은퇴 준비 분포</p>
            <div className="h-8 bg-gray-100 rounded-full relative overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full" />
              <div className="absolute top-0 h-full flex items-center" style={{ left: `${100 - result.percentile}%` }}>
                <div className="w-1 h-full bg-gray-900" />
                <span className="ml-1 text-xs font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded whitespace-nowrap">나</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>상위</span><span>하위</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4 text-center text-sm text-gray-700">
            같은 {ageGroup}대, 은퇴 후 월 평균 사용 금액<br />
            <b>약 {ageGroup === 20 ? '280' : ageGroup === 30 ? '240' : ageGroup === 40 ? '220' : ageGroup === 50 ? '200' : '180'}만원</b>
          </div>
        </div>
      )}

      {/* 하단 공유/다시하기 */}
      <div className="flex gap-2 pt-2">
        <button onClick={() => { setStep('input'); setResult(null) }}
          className="flex-1 py-3 bg-white border border-green-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-green-50 transition">
          다시 해보기
        </button>
        <button onClick={handleShare}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition">
          🔗 친구도 테스트해보게 하기
        </button>
      </div>

      {isShared && !showJoinPrompt && (
        <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center text-sm text-green-800">
          <b>노후연구소 카페</b>에 가입하면<br />더 많은 재무 도구를 이용할 수 있어요!<br />
          <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer"
            className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
            카페 가입하기
          </a>
        </div>
      )}

      {/* 카페 가입 유도 모달 */}
      {showJoinPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowJoinPrompt(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl">🔒</div>
            <h3 className="text-xl font-bold text-gray-900">결과를 저장하고 공유하려면<br />카페 회원가입이 필요해요!</h3>
            <p className="text-sm text-gray-600">
              노후연구소 카페에 가입하면<br />
              결과 이미지 저장, 공유, 더 많은 재무 도구를<br />무료로 이용할 수 있습니다.
            </p>
            <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer"
              className="block w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition text-base">
              노후연구소 카페 가입하기
            </a>
            <button onClick={() => setShowJoinPrompt(false)}
              className="block w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition">
              나중에 할게요
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

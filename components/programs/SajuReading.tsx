'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { calculateSaju, SajuResult, BRANCHES_ANIMAL } from './saju/sajuEngine'
import SajuAnalyzingScreen from './saju/SajuAnalyzingScreen'
import SajuResultCard from './saju/SajuResultCard'
import SajuShareButtons from './saju/SajuShareButtons'

type Phase = 'intro' | 'input' | 'analyzing' | 'result'

const HOUR_OPTIONS = [
  { value: -1, label: '모름 / 입력 안 함' },
  { value: 0, label: '자시 (23:00 ~ 01:00)' },
  { value: 1, label: '축시 (01:00 ~ 03:00)' },
  { value: 3, label: '인시 (03:00 ~ 05:00)' },
  { value: 5, label: '묘시 (05:00 ~ 07:00)' },
  { value: 7, label: '진시 (07:00 ~ 09:00)' },
  { value: 9, label: '사시 (09:00 ~ 11:00)' },
  { value: 11, label: '오시 (11:00 ~ 13:00)' },
  { value: 13, label: '미시 (13:00 ~ 15:00)' },
  { value: 15, label: '신시 (15:00 ~ 17:00)' },
  { value: 17, label: '유시 (17:00 ~ 19:00)' },
  { value: 19, label: '술시 (19:00 ~ 21:00)' },
  { value: 21, label: '해시 (21:00 ~ 23:00)' },
]

export default function SajuReading() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>}>
      <SajuReadingInner />
    </Suspense>
  )
}

function SajuReadingInner() {
  const searchParams = useSearchParams()
  const isSharedLink = searchParams.has('y') && searchParams.has('m') && searchParams.has('d')
  const [phase, setPhase] = useState<Phase>('intro')
  const [result, setResult] = useState<SajuResult | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthHour, setBirthHour] = useState(-1)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [error, setError] = useState('')
  const monthRef = useRef<HTMLInputElement>(null)
  const dayRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const y = searchParams.get('y')
    const m = searchParams.get('m')
    const d = searchParams.get('d')
    const h = searchParams.get('h')
    const g = searchParams.get('g')
    if (y && m && d) {
      const yy = parseInt(y, 10), mm = parseInt(m, 10), dd = parseInt(d, 10)
      if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return
      if (yy < 1920 || yy > new Date().getFullYear() || mm < 1 || mm > 12 || dd < 1 || dd > 31) return
      const testDate = new Date(yy, mm - 1, dd)
      if (testDate.getMonth() !== mm - 1 || testDate > new Date()) return
      const hour = h && h !== '' ? parseInt(h, 10) : null
      if (hour !== null && (isNaN(hour) || hour < 0 || hour > 23)) return
      const gen = g === 'f' ? 'female' : 'male'
      try {
        const saju = calculateSaju(yy, mm, dd, hour, gen)
        setResult(saju)
        setBirthYear(y)
        setBirthMonth(m)
        setBirthDay(d)
        if (h && h !== '') setBirthHour(parseInt(h, 10))
        setGender(gen)
        setPhase('result')
      } catch {
        // 비정상 입력 → 인트로 화면 유지
      }
    }
  }, [searchParams])

  const validate = (): boolean => {
    const y = parseInt(birthYear, 10)
    const m = parseInt(birthMonth, 10)
    const d = parseInt(birthDay, 10)
    if (!y || y < 1920 || y > new Date().getFullYear()) {
      setError('올바른 출생 연도를 입력하세요 (1920~현재)')
      return false
    }
    if (!m || m < 1 || m > 12) {
      setError('올바른 월을 입력하세요 (1~12)')
      return false
    }
    if (!d || d < 1 || d > 31) {
      setError('올바른 일을 입력하세요 (1~31)')
      return false
    }
    const testDate = new Date(y, m - 1, d)
    if (testDate.getMonth() !== m - 1) {
      setError('존재하지 않는 날짜입니다')
      return false
    }
    if (testDate > new Date()) {
      setError('미래 날짜는 입력할 수 없습니다')
      return false
    }
    setError('')
    return true
  }

  const handleStart = () => {
    if (!validate()) return
    const y = parseInt(birthYear, 10)
    const m = parseInt(birthMonth, 10)
    const d = parseInt(birthDay, 10)
    const hour = birthHour >= 0 ? birthHour : null
    try {
      const saju = calculateSaju(y, m, d, hour, gender)
      setResult(saju)
      setPhase('analyzing')
    } catch {
      setError('사주 계산에 실패했습니다. 입력값을 확인해주세요.')
    }
  }

  const handleAnalyzeComplete = useCallback(() => {
    setPhase('result')
  }, [])

  const handleRetry = () => {
    setResult(null)
    setPhase('input')
    setError('')
  }

  const handlePrint = () => {
    window.print()
  }

  // ── 인트로 화면 ──
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-4 space-y-4 sm:space-y-6 animate-fadeIn">
        <div className="text-center py-4 sm:py-6">
          <div className="text-5xl sm:text-7xl mb-3 sm:mb-4 animate-bounce">🔮</div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            AI 사주풀이
          </h2>
          <p className="text-gray-500 text-base sm:text-lg">
            생년월일로 알아보는 나의 타고난 운명
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 sm:mb-4">이런 걸 알 수 있어요</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { emoji: '🧬', text: '타고난 성격 유형' },
              { emoji: '☯️', text: '오행 밸런스 분석' },
              { emoji: '💰', text: '재물운' },
              { emoji: '❤️', text: '연애운' },
              { emoji: '💼', text: '직업운' },
              { emoji: '🗓️', text: '이달의 운세' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg sm:text-xl">{item.emoji}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-sm text-orange-700">
            ⏱️ 소요시간 약 <strong>30초</strong> · 무료 · 회원가입 불필요
          </p>
        </div>

        <button
          onClick={() => setPhase('input')}
          className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-base sm:text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl active:scale-[0.98]"
        >
          🔮 사주풀이 시작하기
        </button>

        <p className="text-center text-xs text-gray-300">
          전통 사주명리학 기반 · 재미로 봐주세요
        </p>
      </div>
    )
  }

  // ── 입력 화면 ──
  if (phase === 'input') {
    const yearNum = parseInt(birthYear, 10) || 0
    const monthNum = parseInt(birthMonth, 10) || 0
    const dayNum = parseInt(birthDay, 10) || 0
    // 입춘(2/4) 기준 보정: 1/1~2/3 출생은 전년도 띠
    const effectiveYear = (monthNum >= 1 && monthNum <= 2 && (monthNum < 2 || dayNum < 4) && yearNum > 1920) ? yearNum - 1 : yearNum
    const animalIdx = effectiveYear >= 1920 ? ((effectiveYear - 4) % 12 + 12) % 12 : -1
    const animalHint = animalIdx >= 0 ? `${BRANCHES_ANIMAL[animalIdx]}띠` : ''

    return (
      <div className="max-w-2xl mx-auto px-4 space-y-4 sm:space-y-6 animate-fadeIn">
        <div className="text-center py-2">
          <div className="text-4xl sm:text-5xl mb-2">📅</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">생년월일을 입력하세요</h2>
          <p className="text-sm text-gray-400 mt-1">양력 기준으로 입력해주세요</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="saju-year" className="block text-sm font-medium text-gray-700 mb-1">
              출생 연도 {animalHint && <span className="text-orange-500 text-xs">({animalHint})</span>}
            </label>
            <input
              id="saju-year"
              type="tel"
              inputMode="numeric"
              placeholder="예: 1990 (4자리)"
              value={birthYear}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                setBirthYear(v)
                if (v.length === 4) monthRef.current?.focus()
              }}
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-center tracking-widest"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="saju-month" className="block text-sm font-medium text-gray-700 mb-1">월</label>
              <input
                id="saju-month"
                ref={monthRef}
                type="tel"
                inputMode="numeric"
                placeholder="1~12"
                value={birthMonth}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                  setBirthMonth(v)
                  const n = parseInt(v, 10)
                  if (v.length === 2 || (v.length === 1 && n >= 2)) dayRef.current?.focus()
                }}
                maxLength={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-center tracking-widest"
              />
            </div>
            <div>
              <label htmlFor="saju-day" className="block text-sm font-medium text-gray-700 mb-1">일</label>
              <input
                id="saju-day"
                ref={dayRef}
                type="tel"
                inputMode="numeric"
                placeholder="1~31"
                value={birthDay}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                  setBirthDay(v)
                }}
                maxLength={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-center tracking-widest"
              />
            </div>
          </div>

          <div>
            <label htmlFor="saju-hour" className="block text-sm font-medium text-gray-700 mb-1">
              태어난 시간 <span className="text-gray-400 text-xs">(선택사항)</span>
            </label>
            <select
              id="saju-hour"
              value={birthHour}
              onChange={e => setBirthHour(parseInt(e.target.value, 10))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
            >
              {HOUR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">시간을 모르면 &apos;모름&apos;으로 두셔도 됩니다</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGender('male')}
                className={`py-3.5 rounded-xl text-sm font-medium transition border-2 ${
                  gender === 'male'
                    ? 'bg-orange-50 border-orange-400 text-orange-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                👨 남성
              </button>
              <button
                onClick={() => setGender('female')}
                className={`py-3.5 rounded-xl text-sm font-medium transition border-2 ${
                  gender === 'female'
                    ? 'bg-pink-50 border-pink-400 text-pink-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                👩 여성
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-base sm:text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl active:scale-[0.98]"
        >
          🔮 사주 분석하기
        </button>

        <button
          onClick={() => setPhase('intro')}
          className="w-full py-3.5 text-gray-400 text-sm hover:text-gray-600 transition"
        >
          ← 돌아가기
        </button>
      </div>
    )
  }

  // ── 분석 중 ──
  if (phase === 'analyzing') {
    return <SajuAnalyzingScreen onComplete={handleAnalyzeComplete} />
  }

  // ── 결과 화면 ──
  if (phase === 'result' && result) {
    return (
      <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4 animate-fadeIn">
        <SajuResultCard ref={cardRef} result={result} />

        <div className="no-print space-y-4 px-1">
          <SajuShareButtons result={result} cardRef={cardRef} />

          <div className="flex gap-2.5">
            <button
              onClick={handlePrint}
              className="flex-1 py-3.5 bg-gradient-to-b from-emerald-50 to-emerald-100/50 border border-emerald-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] text-emerald-700 rounded-2xl text-sm font-semibold transition-all duration-200 hidden sm:flex items-center justify-center gap-2"
            >
              <span className="text-base">🖨️</span> A4 인쇄
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] text-white rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="text-base">🔄</span> 다시 풀기
            </button>
          </div>

          <p className="text-center text-xs text-gray-300 pb-4">
            본 결과는 전통 사주명리학을 기반으로 한 재미 콘텐츠입니다
          </p>

          {isSharedLink && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-200 text-center">
              <p className="text-base font-bold text-orange-800 mb-1">내 사주도 궁금하다면?</p>
              <p className="text-sm text-gray-600 mb-4">무료로 바로 확인해보세요</p>
              <a
                href="/programs/saju-reading"
                className="inline-block px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.97]"
              >
                나도 사주풀이 해보기
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

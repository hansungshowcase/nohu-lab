'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { calculateSaju, SajuResult, BRANCHES_ANIMAL } from './saju/sajuEngine'
import SajuAnalyzingScreen from './saju/SajuAnalyzingScreen'
import SajuResultCard from './saju/SajuResultCard'
import SajuShareButtons from './saju/SajuShareButtons'

type Phase = 'intro' | 'input' | 'analyzing' | 'result' | 'locked'

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

const SAJU_USAGE_KEY = 'saju_usage_count'
const MAX_FREE_USES = 2
const CAFE_JOIN_URL = 'https://cafe.naver.com/eovhskfktmak'

function getUsageCount(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(SAJU_USAGE_KEY) || '0', 10)
}

function incrementUsage(): number {
  const count = getUsageCount() + 1
  localStorage.setItem(SAJU_USAGE_KEY, String(count))
  return count
}

export default function SajuReading() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>}>
      <SajuReadingInner />
    </Suspense>
  )
}

function SajuReadingInner() {
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<Phase>('intro')
  const [result, setResult] = useState<SajuResult | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isMember, setIsMember] = useState(false)

  // 입력 상태
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthHour, setBirthHour] = useState(-1)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ year?: string; month?: string; day?: string }>({})


  // 회원 여부 확인
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(data => {
        if (data.memberId && data.memberId !== 'guest') {
          setIsMember(true)
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setIsMember(false)
      })
    return () => controller.abort()
  }, [])

  // URL 파라미터로부터 자동 실행 (공유 링크)
  useEffect(() => {
    const y = searchParams.get('y')
    const m = searchParams.get('m')
    const d = searchParams.get('d')
    const h = searchParams.get('h')
    const g = searchParams.get('g')
    if (y && m && d) {
      const hour = h ? parseInt(h) : null
      const gen = g === 'f' ? 'female' : 'male'
      const saju = calculateSaju(parseInt(y), parseInt(m), parseInt(d), hour, gen)
      setResult(saju)
      setBirthYear(y)
      setBirthMonth(m)
      setBirthDay(d)
      if (h) setBirthHour(parseInt(h))
      setGender(gen)
      setPhase('result')
    }
  }, [searchParams])

  const validate = (): boolean => {
    const y = parseInt(birthYear)
    const m = parseInt(birthMonth)
    const d = parseInt(birthDay)
    const errors: { year?: string; month?: string; day?: string } = {}
    let valid = true

    if (!birthYear.trim()) {
      errors.year = '출생 연도를 입력하세요'
      valid = false
    } else if (!y || y < 1920 || y > new Date().getFullYear()) {
      errors.year = '1920~현재 사이의 연도를 입력하세요'
      valid = false
    }

    if (!birthMonth.trim()) {
      errors.month = '월을 입력하세요'
      valid = false
    } else if (!m || m < 1 || m > 12) {
      errors.month = '1~12 사이의 월을 입력하세요'
      valid = false
    }

    if (!birthDay.trim()) {
      errors.day = '일을 입력하세요'
      valid = false
    } else if (!d || d < 1 || d > 31) {
      errors.day = '1~31 사이의 일을 입력하세요'
      valid = false
    }

    if (valid) {
      const testDate = new Date(y, m - 1, d)
      if (testDate.getMonth() !== m - 1) {
        errors.day = '존재하지 않는 날짜입니다'
        valid = false
      }
    }

    setFieldErrors(errors)
    setError('')
    return valid
  }

  const handleStart = () => {
    if (!validate()) return

    // 사용 횟수 체크 (회원은 무제한)
    if (!isMember) {
      const usage = getUsageCount()
      if (usage >= MAX_FREE_USES) {
        setPhase('locked')
        return
      }
    }

    const y = parseInt(birthYear)
    const m = parseInt(birthMonth)
    const d = parseInt(birthDay)
    const hour = birthHour >= 0 ? birthHour : null
    const saju = calculateSaju(y, m, d, hour, gender)
    setResult(saju)
    setPhase('analyzing')

    // 사용 횟수 증가
    if (!isMember) {
      incrementUsage()
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

  // ── 인트로 화면 ──
  if (phase === 'intro') {
    const remaining = isMember ? '무제한' : `${Math.max(0, MAX_FREE_USES - getUsageCount())}회`

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-4">
          <div className="text-6xl mb-4">🔮</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI 사주풀이
          </h2>
          <p className="text-gray-500">
            생년월일로 알아보는 나의 타고난 운명
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">이런 걸 알 수 있어요</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '💰', text: '재물운 분석' },
              { emoji: '❤️', text: '연애·결혼운' },
              { emoji: '🏥', text: '건강 주의사항' },
              { emoji: '📈', text: '인생 흐름 분석' },
              { emoji: '🔮', text: '신살 해석' },
              { emoji: '⚠️', text: '조심할 것' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">{item.emoji}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-700">
            ⏱️ 소요시간 약 <strong>30초</strong> · 남은 횟수: <strong>{remaining}</strong>
          </p>
        </div>

        <button
          onClick={() => setPhase('input')}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-lg hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-200"
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
    const yearNum = parseInt(birthYear) || 0
    const animalIdx = yearNum >= 1900 && yearNum <= 2100 ? ((yearNum - 4) % 12 + 12) % 12 : -1
    const animalHint = animalIdx >= 0 ? `${BRANCHES_ANIMAL[animalIdx]}띠` : ''

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-2">
          <div className="text-4xl mb-2">📅</div>
          <h2 className="text-xl font-bold text-gray-900">생년월일을 입력하세요</h2>
          <p className="text-sm text-gray-400 mt-1">양력 기준으로 입력해주세요</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출생 연도 {animalHint && <span className="text-orange-500 text-xs">({animalHint})</span>}
            </label>
            <input
              type="number"
              placeholder="예: 1990"
              value={birthYear}
              onChange={e => { setBirthYear(e.target.value); setFieldErrors(prev => ({ ...prev, year: undefined })) }}
              className={`w-full px-4 py-3.5 border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 ${fieldErrors.year ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
              min={1920}
              max={new Date().getFullYear()}
            />
            {fieldErrors.year && <p className="text-red-500 text-xs mt-1">⚠️ {fieldErrors.year}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
              <input
                type="number"
                placeholder="1~12"
                value={birthMonth}
                onChange={e => { setBirthMonth(e.target.value); setFieldErrors(prev => ({ ...prev, month: undefined })) }}
                className={`w-full px-4 py-3.5 border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 ${fieldErrors.month ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
                min={1} max={12}
              />
              {fieldErrors.month && <p className="text-red-500 text-xs mt-1">⚠️ {fieldErrors.month}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">일</label>
              <input
                type="number"
                placeholder="1~31"
                value={birthDay}
                onChange={e => { setBirthDay(e.target.value); setFieldErrors(prev => ({ ...prev, day: undefined })) }}
                className={`w-full px-4 py-3.5 border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 ${fieldErrors.day ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
                min={1} max={31}
              />
              {fieldErrors.day && <p className="text-red-500 text-xs mt-1">⚠️ {fieldErrors.day}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태어난 시간 <span className="text-gray-400 text-xs">(선택사항)</span>
            </label>
            <select
              value={birthHour}
              onChange={e => setBirthHour(parseInt(e.target.value))}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
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

        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-lg hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-200"
        >
          🔮 사주 분석하기
        </button>

        <button
          onClick={() => setPhase('intro')}
          className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition"
        >
          ← 돌아가기
        </button>
      </div>
    )
  }

  // ── 잠금 화면 (무료 횟수 소진) ──
  if (phase === 'locked') {
    return (
      <div className="max-w-2xl mx-auto text-center py-8 space-y-6">
        <div className="text-6xl">🔒</div>
        <h2 className="text-xl font-bold text-gray-900">무료 체험이 끝났습니다</h2>
        <p className="text-gray-500 text-sm">
          노후연구소 카페에 가입하면<br />사주풀이를 <strong className="text-orange-600">무제한</strong>으로 이용할 수 있습니다
        </p>

        <a
          href={CAFE_JOIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl text-lg hover:from-orange-600 hover:to-amber-700 transition shadow-lg shadow-orange-200"
        >
          가입하고 무제한으로 이용하세요
        </a>

        <p className="text-xs text-gray-400">
          가입 후 카페 닉네임으로 로그인하면 무제한 이용이 가능합니다
        </p>

        <button
          onClick={() => setPhase('intro')}
          className="text-gray-400 text-sm hover:text-gray-600 transition"
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
      <div className="max-w-2xl mx-auto space-y-6">
        <SajuResultCard ref={cardRef} result={result} />

        <SajuShareButtons result={result} cardRef={cardRef} />

        <button
          onClick={handleRetry}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition"
        >
          🔄 다시 풀어보기
        </button>

        <p className="text-center text-xs text-gray-300 pb-4">
          본 결과는 전통 사주명리학을 기반으로 한 재미 콘텐츠입니다
        </p>
      </div>
    )
  }

  return null
}

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
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>}>
      <SajuReadingInner />
    </Suspense>
  )
}

function SajuReadingInner() {
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<Phase>('intro')
  const [result, setResult] = useState<SajuResult | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthHour, setBirthHour] = useState(-1)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [error, setError] = useState('')

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
    setError('')
    return true
  }

  const handleStart = () => {
    if (!validate()) return
    const y = parseInt(birthYear)
    const m = parseInt(birthMonth)
    const d = parseInt(birthDay)
    const hour = birthHour >= 0 ? birthHour : null
    const saju = calculateSaju(y, m, d, hour, gender)
    setResult(saju)
    setPhase('analyzing')
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
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <div className="text-center py-6">
          <div className="text-7xl mb-4 animate-bounce">🔮</div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            AI 사주풀이
          </h2>
          <p className="text-gray-500 text-lg">
            생년월일로 알아보는 나의 타고난 운명
          </p>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">이런 걸 알 수 있어요</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { emoji: '🧬', text: '타고난 성격 유형' },
              { emoji: '☯️', text: '오행 밸런스 분석' },
              { emoji: '💰', text: '재물운 & 연애운' },
              { emoji: '🗓️', text: '올해 운세' },
              { emoji: '💕', text: '궁합 힌트' },
              { emoji: '🍀', text: '맞춤 개운법' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xl">{item.emoji}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-700">
            ⏱️ 소요시간 약 <strong>30초</strong> · 무료 · 회원가입 불필요
          </p>
        </div>

        <button
          onClick={() => setPhase('input')}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl text-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
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
    const animalIdx = yearNum >= 1920 ? ((yearNum - 4) % 12 + 12) % 12 : -1
    const animalHint = animalIdx >= 0 ? `${BRANCHES_ANIMAL[animalIdx]}띠` : ''

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <div className="text-center py-2">
          <div className="text-5xl mb-2">📅</div>
          <h2 className="text-2xl font-bold text-gray-900">생년월일을 입력하세요</h2>
          <p className="text-sm text-gray-400 mt-1">양력 기준으로 입력해주세요</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출생 연도 {animalHint && <span className="text-purple-500 text-xs">({animalHint})</span>}
            </label>
            <input
              type="number"
              placeholder="예: 1990"
              value={birthYear}
              onChange={e => setBirthYear(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              min={1920}
              max={new Date().getFullYear()}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
              <input
                type="number"
                placeholder="1~12"
                value={birthMonth}
                onChange={e => setBirthMonth(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                min={1} max={12}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">일</label>
              <input
                type="number"
                placeholder="1~31"
                value={birthDay}
                onChange={e => setBirthDay(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                min={1} max={31}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태어난 시간 <span className="text-gray-400 text-xs">(선택사항)</span>
            </label>
            <select
              value={birthHour}
              onChange={e => setBirthHour(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
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
                className={`py-3 rounded-xl text-sm font-medium transition border-2 ${
                  gender === 'male'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                👨 남성
              </button>
              <button
                onClick={() => setGender('female')}
                className={`py-3 rounded-xl text-sm font-medium transition border-2 ${
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
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl text-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
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

  // ── 분석 중 ──
  if (phase === 'analyzing') {
    return <SajuAnalyzingScreen onComplete={handleAnalyzeComplete} />
  }

  // ── 결과 화면 ──
  if (phase === 'result' && result) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
        <SajuResultCard ref={cardRef} result={result} />

        <div className="no-print space-y-3">
          <SajuShareButtons result={result} cardRef={cardRef} />

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
            >
              🖨️ A4 인쇄하기
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
            >
              🔄 다시 풀어보기
            </button>
          </div>

          <p className="text-center text-xs text-gray-300 pb-4">
            본 결과는 전통 사주명리학을 기반으로 한 재미 콘텐츠입니다
          </p>
        </div>
      </div>
    )
  }

  return null
}

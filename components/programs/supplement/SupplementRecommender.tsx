'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  type Answers,
  type RecommendedSupplement,
  type TimeSlot,
  encodeAnswers,
  decodeAnswers,
  getRecommendations,
  getCombinationTips,
  getSchedule,
  getPharmacistComment,
  getCautions,
  timeSlotLabels,
  concernOptions,
  medicationOptions,
} from './supplementData'
import SupplementShareButtons from './SupplementShareButtons'

type Phase = 'intro' | 'questions' | 'analyzing' | 'result'
type Step = 1 | 2 | 3 | 4

const defaultAnswers: Answers = {
  gender: 'm',
  age: '40',
  pregnant: 'n',
  sleep: '3',
  exercise: '2',
  alcohol: '1',
  smoking: '1',
  sunlight: '2',
  concerns: [],
  medications: [],
}

export default function SupplementRecommender() {
  const searchParams = useSearchParams()
  const isSharedLink = searchParams.has('g') && searchParams.has('age')

  const [phase, setPhase] = useState<Phase>(isSharedLink ? 'analyzing' : 'intro')
  const [step, setStep] = useState<Step>(1)
  const [answers, setAnswers] = useState<Answers>(() => {
    if (isSharedLink) {
      return decodeAnswers(searchParams) || defaultAnswers
    }
    return defaultAnswers
  })
  const [results, setResults] = useState<RecommendedSupplement[]>([])

  // 공유 링크 접속 시 바로 분석
  useEffect(() => {
    if (isSharedLink && phase === 'analyzing') {
      const decoded = decodeAnswers(searchParams)
      if (decoded) {
        setAnswers(decoded)
        const recs = getRecommendations(decoded)
        const timer = setTimeout(() => {
          setResults(recs)
          setPhase('result')
        }, 2500)
        return () => clearTimeout(timer)
      }
    }
  }, [isSharedLink, phase, searchParams])

  const handleStart = useCallback(() => {
    setPhase('questions')
    setStep(1)
  }, [])

  const handleNextStep = useCallback(() => {
    if (step < 4) {
      setStep((s) => (s + 1) as Step)
    } else {
      // 분석 시작
      setPhase('analyzing')
      const recs = getRecommendations(answers)
      setTimeout(() => {
        setResults(recs)
        setPhase('result')
      }, 3000)
    }
  }, [step, answers])

  const handlePrevStep = useCallback(() => {
    if (step > 1) setStep((s) => (s - 1) as Step)
  }, [step])

  const handleRestart = useCallback(() => {
    setPhase('intro')
    setStep(1)
    setAnswers(defaultAnswers)
    setResults([])
    // URL 파라미터 제거
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?${encodeAnswers(answers)}`
    : ''

  // ── Phase: Intro ──
  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <div className="text-center py-6">
          <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-4xl mb-4">
            💊
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">맞춤 영양제 추천</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            나이·생활습관·건강 고민을 분석하여<br />
            약사가 추천하는 영양제 조합을 알려드립니다
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">📋 검사 항목</h3>
          {[
            { step: '1', title: '기본 정보', desc: '성별, 연령대', icon: '👤' },
            { step: '2', title: '생활 습관', desc: '수면, 운동, 음주, 흡연, 햇빛', icon: '🏃' },
            { step: '3', title: '건강 고민', desc: '피로, 수면, 관절, 눈 등', icon: '🩺' },
            { step: '4', title: '현재 복용 약물', desc: '상호작용 체크', icon: '💊' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  Step {item.step}. {item.title}
                </div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="w-full px-4 py-4 min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-lg transition animate-subtle-pulse"
        >
          상담 시작하기
        </button>

        <p className="text-center text-xs text-gray-400">약 2분 소요 · 무료</p>
      </div>
    )
  }

  // ── Phase: Questions ──
  if (phase === 'questions') {
    return (
      <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Step {step} / 4</span>
            <span>{step === 1 ? '기본 정보' : step === 2 ? '생활 습관' : step === 3 ? '건강 고민' : '복용 약물'}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && <Step1Questions answers={answers} setAnswers={setAnswers} />}
        {step === 2 && <Step2Questions answers={answers} setAnswers={setAnswers} />}
        {step === 3 && <Step3Questions answers={answers} setAnswers={setAnswers} />}
        {step === 4 && <Step4Questions answers={answers} setAnswers={setAnswers} />}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={handlePrevStep}
              className="flex-1 px-4 py-3 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              ← 이전
            </button>
          )}
          <button
            onClick={handleNextStep}
            className="flex-1 px-4 py-3 min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition"
          >
            {step === 4 ? '분석 시작 →' : '다음 →'}
          </button>
        </div>
      </div>
    )
  }

  // ── Phase: Analyzing ──
  if (phase === 'analyzing') {
    return <AnalyzingScreen />
  }

  // ── Phase: Result ──
  return (
    <ResultScreen
      answers={answers}
      results={results}
      shareUrl={shareUrl}
      onRestart={handleRestart}
    />
  )
}

// ══════════════════════════════════════════
// Step 1: 기본 정보
// ══════════════════════════════════════════
function Step1Questions({ answers, setAnswers }: { answers: Answers; setAnswers: React.Dispatch<React.SetStateAction<Answers>> }) {
  return (
    <div className="space-y-5 animate-slide-up">
      <h3 className="text-lg font-bold text-gray-900">👤 기본 정보</h3>

      {/* 성별 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">성별</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'm', label: '🙋‍♂️ 남성' },
            { value: 'f', label: '🙋‍♀️ 여성' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAnswers((a) => ({ ...a, gender: opt.value as 'm' | 'f', pregnant: opt.value === 'm' ? 'n' : a.pregnant }))}
              className={`px-4 py-3 min-h-[44px] rounded-xl font-medium text-sm transition border-2 ${
                answers.gender === opt.value
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 연령대 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">연령대</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { value: '20', label: '20대' },
            { value: '30', label: '30대' },
            { value: '40', label: '40대' },
            { value: '50', label: '50대' },
            { value: '60', label: '60대+' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAnswers((a) => ({ ...a, age: opt.value as Answers['age'] }))}
              className={`px-3 py-3 min-h-[44px] rounded-xl font-medium text-sm transition border-2 ${
                answers.age === opt.value
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 임신/수유 (여성만) */}
      {answers.gender === 'f' && (
        <div className="space-y-2 animate-fade-in">
          <label className="text-sm font-medium text-gray-700">임신 또는 수유 중이신가요?</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'y', label: '예' },
              { value: 'n', label: '아니오' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers((a) => ({ ...a, pregnant: opt.value as 'y' | 'n' }))}
                className={`px-4 py-3 min-h-[44px] rounded-xl font-medium text-sm transition border-2 ${
                  answers.pregnant === opt.value
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════
// Step 2: 생활 습관
// ══════════════════════════════════════════
function Step2Questions({ answers, setAnswers }: { answers: Answers; setAnswers: React.Dispatch<React.SetStateAction<Answers>> }) {
  return (
    <div className="space-y-5 animate-slide-up">
      <h3 className="text-lg font-bold text-gray-900">🏃 생활 습관</h3>

      <OptionGroup
        label="평균 수면 시간"
        value={answers.sleep}
        onChange={(v) => setAnswers((a) => ({ ...a, sleep: v as Answers['sleep'] }))}
        options={[
          { value: '1', label: '5시간 이하' },
          { value: '2', label: '6~7시간' },
          { value: '3', label: '7~8시간' },
          { value: '4', label: '8시간 이상' },
        ]}
      />

      <OptionGroup
        label="운동 빈도"
        value={answers.exercise}
        onChange={(v) => setAnswers((a) => ({ ...a, exercise: v as Answers['exercise'] }))}
        options={[
          { value: '1', label: '거의 안 함' },
          { value: '2', label: '주 1~2회' },
          { value: '3', label: '주 3~4회' },
          { value: '4', label: '거의 매일' },
        ]}
      />

      <OptionGroup
        label="음주 빈도"
        value={answers.alcohol}
        onChange={(v) => setAnswers((a) => ({ ...a, alcohol: v as Answers['alcohol'] }))}
        options={[
          { value: '1', label: '안 마심' },
          { value: '2', label: '월 1~2회' },
          { value: '3', label: '주 1~2회' },
          { value: '4', label: '주 3회+' },
        ]}
      />

      <OptionGroup
        label="흡연 여부"
        value={answers.smoking}
        onChange={(v) => setAnswers((a) => ({ ...a, smoking: v as Answers['smoking'] }))}
        options={[
          { value: '1', label: '비흡연' },
          { value: '2', label: '과거 흡연' },
          { value: '3', label: '현재 흡연' },
        ]}
      />

      <OptionGroup
        label="하루 햇빛 노출"
        value={answers.sunlight}
        onChange={(v) => setAnswers((a) => ({ ...a, sunlight: v as Answers['sunlight'] }))}
        options={[
          { value: '1', label: '30분 미만' },
          { value: '2', label: '30분~1시간' },
          { value: '3', label: '1시간 이상' },
        ]}
      />
    </div>
  )
}

// ══════════════════════════════════════════
// Step 3: 건강 고민
// ══════════════════════════════════════════
function Step3Questions({ answers, setAnswers }: { answers: Answers; setAnswers: React.Dispatch<React.SetStateAction<Answers>> }) {
  const toggleConcern = (id: string) => {
    setAnswers((a) => ({
      ...a,
      concerns: a.concerns.includes(id)
        ? a.concerns.filter((c) => c !== id)
        : [...a.concerns, id],
    }))
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <h3 className="text-lg font-bold text-gray-900">🩺 건강 고민</h3>
      <p className="text-sm text-gray-500">해당하는 항목을 모두 선택하세요 (복수 선택 가능)</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {concernOptions.map((opt) => {
          const selected = answers.concerns.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => toggleConcern(opt.id)}
              className={`flex items-center gap-2 px-3 py-3 min-h-[44px] rounded-xl text-sm font-medium transition border-2 text-left ${
                selected
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              <span className="flex-1">{opt.label}</span>
              {selected && <span className="text-orange-500">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// Step 4: 현재 복용 약물
// ══════════════════════════════════════════
function Step4Questions({ answers, setAnswers }: { answers: Answers; setAnswers: React.Dispatch<React.SetStateAction<Answers>> }) {
  const toggleMed = (id: string) => {
    if (id === 'none') {
      setAnswers((a) => ({ ...a, medications: a.medications.includes('none') ? [] : ['none'] }))
      return
    }
    setAnswers((a) => ({
      ...a,
      medications: a.medications.includes(id)
        ? a.medications.filter((m) => m !== id)
        : [...a.medications.filter((m) => m !== 'none'), id],
    }))
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <h3 className="text-lg font-bold text-gray-900">💊 현재 복용 중인 약물</h3>
      <p className="text-sm text-gray-500">해당하는 항목을 모두 선택하세요 (약물 상호작용 체크)</p>

      <div className="grid grid-cols-1 gap-2">
        {medicationOptions.map((opt) => {
          const selected = answers.medications.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => toggleMed(opt.id)}
              className={`flex items-center gap-2 px-3 py-3 min-h-[44px] rounded-xl text-sm font-medium transition border-2 text-left ${
                selected
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              <span className="flex-1">{opt.label}</span>
              {selected && <span className="text-orange-500">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// Analyzing Screen
// ══════════════════════════════════════════
function AnalyzingScreen() {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('입력 정보 분석 중...')

  useEffect(() => {
    const steps = [
      { at: 30, text: '영양 균형 평가 중...' },
      { at: 65, text: '맞춤 처방 작성 중...' },
      { at: 90, text: '복용 시간표 생성 중...' },
    ]

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 2, 100)
        for (const s of steps) {
          if (p < s.at && next >= s.at) setStatusText(s.text)
        }
        return next
      })
    }, 60)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-lg mx-auto text-center py-12 space-y-6 animate-fade-in">
      <div className="w-20 h-20 mx-auto relative">
        <div className="absolute inset-0 border-4 border-orange-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">💊</div>
      </div>

      <div className="space-y-3">
        <p className="text-gray-700 font-medium">{statusText}</p>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">{progress}%</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// Result Screen
// ══════════════════════════════════════════
function ResultScreen({
  answers,
  results,
  shareUrl,
  onRestart,
}: {
  answers: Answers
  results: RecommendedSupplement[]
  shareUrl: string
  onRestart: () => void
}) {
  const ageLabel = answers.age === '60' ? '60대 이상' : `${answers.age}대`
  const genderLabel = answers.gender === 'm' ? '남성' : '여성'
  const topConcerns = answers.concerns.map((c) => {
    const found = concernOptions.find((o) => o.id === c)
    return found ? { label: found.label, icon: found.icon } : null
  }).filter(Boolean) as { label: string; icon: string }[]
  const profileSummary = `${ageLabel} ${genderLabel}`

  const schedule = getSchedule(results)
  const tips = getCombinationTips(results, answers)
  const pharmacistComment = getPharmacistComment(answers, results)
  const cautions = getCautions(answers, results)

  const goodTips = tips.filter(t => t.type === 'good')
  const cautionTips = tips.filter(t => t.type === 'caution')
  const warningTips = tips.filter(t => t.type === 'warning')

  const sleepLabel = { '1': '5시간 이하', '2': '6~7시간', '3': '7~8시간', '4': '8시간 이상' }[answers.sleep]
  const exerciseLabel = { '1': '거의 안 함', '2': '주 1~2회', '3': '주 3~4회', '4': '거의 매일' }[answers.exercise]
  const alcoholLabel = { '1': '안 마심', '2': '월 1~2회', '3': '주 1~2회', '4': '주 3회+' }[answers.alcohol]

  const priorityLabel = (p: RecommendedSupplement['priority']) =>
    p === 'essential' ? '필수' : p === 'recommended' ? '권장' : '선택'

  const priorityColor = (p: RecommendedSupplement['priority']) =>
    p === 'essential'
      ? 'bg-red-100 text-red-700 border-red-200'
      : p === 'recommended'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : 'bg-gray-100 text-gray-600 border-gray-200'

  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* ── 처방전 헤더 ── */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-orange-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 flex items-center gap-2">
          <span className="text-2xl font-bold text-white">℞</span>
          <h2 className="text-lg font-bold text-white">맞춤 영양제 처방전</h2>
        </div>
        <div className="p-5 space-y-3">
          {/* 프로필 요약 */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              {answers.gender === 'm' ? '🙋‍♂️' : '🙋‍♀️'}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">
                {profileSummary}
                {answers.pregnant === 'y' && <span className="ml-1 text-sm text-pink-600">(임신·수유 중)</span>}
              </p>
              <p className="text-xs text-gray-500">
                수면 {sleepLabel} · 운동 {exerciseLabel} · 음주 {alcoholLabel}
              </p>
            </div>
          </div>

          {/* 건강 고민 태그 */}
          {topConcerns.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">주요 건강 고민</p>
              <div className="flex flex-wrap gap-1.5">
                {topConcerns.map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700 font-medium">
                    {c.icon} {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 약사의 한마디 ── */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
            👨‍⚕️
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">약사의 한마디</p>
            <p className="text-sm text-amber-900 leading-relaxed">{pharmacistComment}</p>
          </div>
        </div>
      </div>

      {/* ── 추천 영양제 카드 ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-gray-900">💊 추천 영양제 ({results.length}가지)</h3>
          <p className="text-xs text-gray-400">카드를 눌러 상세 정보 확인</p>
        </div>
        {results.map((rec, i) => {
          const isExpanded = expandedCard === rec.supplement.id
          return (
            <div
              key={rec.supplement.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* 카드 헤더 (항상 표시) */}
              <button
                onClick={() => setExpandedCard(isExpanded ? null : rec.supplement.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ backgroundColor: `${rec.supplement.color}15` }}
                  >
                    {rec.supplement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-900 text-base">{rec.supplement.name}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${priorityColor(rec.priority)}`}>
                        {priorityLabel(rec.priority)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{rec.supplement.nameEn}</p>
                    {/* 효능 태그 */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.supplement.benefits.map((b) => (
                        <span key={b} className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-600">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-gray-400 flex-shrink-0 mt-1">
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </div>

                {/* 추천 이유 (항상 표시) */}
                <div className="mt-3 space-y-1">
                  {rec.reasons.map((reason, j) => (
                    <p key={j} className="text-sm text-gray-600 flex items-start gap-1.5">
                      <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                      <span>{reason}</span>
                    </p>
                  ))}
                </div>
              </button>

              {/* 상세 정보 (펼쳤을 때) */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3 animate-fade-in">
                  {/* 설명 */}
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">📖 상세 설명</p>
                    <p className="text-sm text-blue-900 leading-relaxed">{rec.supplement.description}</p>
                  </div>

                  {/* 복용법 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">권장 복용량</p>
                      <p className="text-sm font-semibold text-gray-800">💊 {rec.supplement.dosage}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">복용 시간</p>
                      <p className="text-sm font-semibold text-gray-800">⏰ {rec.supplement.timingNote}</p>
                    </div>
                  </div>

                  {/* 구매 팁 */}
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-green-700 mb-1">🛒 구매 팁</p>
                    <p className="text-sm text-green-800">{rec.supplement.buyTip}</p>
                  </div>

                  {/* 주의사항 */}
                  {rec.supplement.caution && (
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ 주의사항</p>
                      <p className="text-sm text-amber-800">{rec.supplement.caution}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── 복용 시간표 ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4">
        <h3 className="text-base font-bold text-gray-900 mb-1">⏰ 하루 복용 시간표</h3>
        <p className="text-xs text-gray-400 mb-3">시간대별로 나누어 복용하면 흡수율이 높아집니다</p>
        <div className="space-y-2">
          {(Object.keys(timeSlotLabels) as TimeSlot[]).map((slot) => {
            const items = schedule[slot]
            if (items.length === 0) return null
            const info = timeSlotLabels[slot]
            return (
              <div key={slot} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 text-center flex-shrink-0">
                  <div className="text-xl">{info.icon}</div>
                  <div className="text-[10px] font-medium text-gray-500 mt-0.5">{info.label}</div>
                </div>
                <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {items.map((supp) => (
                    <span
                      key={supp.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm"
                      style={{
                        backgroundColor: `${supp.color}18`,
                        color: supp.color === '#78716C' ? '#57534e' : supp.color,
                        border: `1px solid ${supp.color}30`,
                      }}
                    >
                      {supp.icon} {supp.name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 조합 가이드 ── */}
      {tips.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 space-y-3">
          <h3 className="text-base font-bold text-gray-900">🔬 영양제 조합 가이드</h3>

          {goodTips.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1.5">함께 먹으면 좋은 조합</p>
              <div className="space-y-1.5">
                {goodTips.map((tip, i) => (
                  <div key={i} className="p-3 rounded-xl text-sm bg-green-50 text-green-800 border border-green-100">
                    {tip.icon} {tip.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {cautionTips.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-1.5">시간 간격이 필요한 조합</p>
              <div className="space-y-1.5">
                {cautionTips.map((tip, i) => (
                  <div key={i} className="p-3 rounded-xl text-sm bg-amber-50 text-amber-800 border border-amber-100">
                    {tip.icon} {tip.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {warningTips.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 mb-1.5">약물 상호작용 주의</p>
              <div className="space-y-1.5">
                {warningTips.map((tip, i) => (
                  <div key={i} className="p-3 rounded-xl text-sm bg-red-50 text-red-800 border border-red-100">
                    {tip.icon} {tip.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 복용 시 주의사항 ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">🚨 복용 시 주의사항</h3>
        <div className="space-y-2">
          {cautions.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-red-400 mt-0.5 flex-shrink-0 text-xs">●</span>
              <span className="leading-relaxed">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 공유 버튼 ── */}
      <SupplementShareButtons
        shareUrl={shareUrl}
        profileSummary={profileSummary}
        recommendCount={results.length}
        onRestart={onRestart}
      />
    </div>
  )
}

// ══════════════════════════════════════════
// Reusable: Option Group (단일 선택)
// ══════════════════════════════════════════
function OptionGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className={`grid gap-2 ${options.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-3 min-h-[44px] rounded-xl text-sm font-medium transition border-2 ${
              value === opt.value
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

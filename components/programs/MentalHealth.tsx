'use client'

import { useState, useMemo } from 'react'
import { SCALES, LIKERT_OPTIONS, calculateScore, getLevel, getMaxScore } from './mental-health/questions'
import { TIPS } from './mental-health/tips'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from 'recharts'

type Phase = 'intro' | 'select' | 'quiz' | 'result'
type TestType = 'depression' | 'anxiety' | 'stress' | 'all'

const TEST_OPTIONS: { id: TestType; label: string; icon: string; desc: string }[] = [
  { id: 'depression', label: '우울', icon: '😔', desc: 'PHQ-9 (9문항)' },
  { id: 'anxiety', label: '불안', icon: '😰', desc: 'GAD-7 (7문항)' },
  { id: 'stress', label: '스트레스', icon: '🤯', desc: 'PSS-10 (10문항)' },
  { id: 'all', label: '전체 검사', icon: '📋', desc: '26문항' },
]

const DISCLAIMER = '본 검사는 의학적 진단이 아닌 자가 참고용입니다. 정확한 진단은 전문가 상담을 권장합니다.'

export default function MentalHealth() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [testType, setTestType] = useState<TestType>('all')
  const [currentScaleIdx, setCurrentScaleIdx] = useState(0)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const activeScales = useMemo(() => {
    if (testType === 'all') return SCALES
    return SCALES.filter((s) => s.id === testType)
  }, [testType])

  // 전체 문항 flat list
  const allQuestions = useMemo(() => {
    return activeScales.flatMap((scale) =>
      scale.questions.map((q) => ({ ...q, scaleId: scale.id, scaleName: scale.name }))
    )
  }, [activeScales])

  const totalQuestions = allQuestions.length
  const globalIdx = useMemo(() => {
    let idx = 0
    for (let i = 0; i < currentScaleIdx; i++) {
      idx += activeScales[i].questions.length
    }
    return idx + currentQIdx
  }, [currentScaleIdx, currentQIdx, activeScales])

  const currentScale = activeScales[currentScaleIdx]
  const currentQuestion = currentScale?.questions[currentQIdx]
  const answerKey = currentScale && currentQuestion ? `${currentScale.id}-${currentQuestion.id}` : ''

  function handleSelect(type: TestType) {
    setTestType(type)
    setPhase('quiz')
    setCurrentScaleIdx(0)
    setCurrentQIdx(0)
    setAnswers({})
  }

  function handleAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [answerKey]: value }))
  }

  function goNext() {
    if (answers[answerKey] === undefined) return
    if (currentQIdx < currentScale.questions.length - 1) {
      setCurrentQIdx((p) => p + 1)
    } else if (currentScaleIdx < activeScales.length - 1) {
      setCurrentScaleIdx((p) => p + 1)
      setCurrentQIdx(0)
    } else {
      setPhase('result')
    }
  }

  function goPrev() {
    if (currentQIdx > 0) {
      setCurrentQIdx((p) => p - 1)
    } else if (currentScaleIdx > 0) {
      setCurrentScaleIdx((p) => p - 1)
      setCurrentQIdx(activeScales[currentScaleIdx - 1].questions.length - 1)
    }
  }

  function restart() {
    setPhase('intro')
    setAnswers({})
    setCurrentScaleIdx(0)
    setCurrentQIdx(0)
  }

  // === INTRO ===
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <span className="text-4xl">🧠</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">심리 상태 자가진단</h2>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            우울, 불안, 스트레스 수준을<br />간단하게 체크해보세요
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">검사 안내</h3>
          <ul className="space-y-2 text-[14px] text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              공인된 심리 척도(PHQ-9, GAD-7, PSS-10) 기반
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              우울·불안·스트레스 3개 영역 측정
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              소요 시간: 약 3~5분
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              결과는 저장되지 않으며, 본인만 확인할 수 있습니다
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-[13px] text-amber-800 flex items-start gap-2">
            <span className="text-amber-500 text-lg leading-none">⚠️</span>
            {DISCLAIMER}
          </p>
        </div>

        <button
          onClick={() => setPhase('select')}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98]"
        >
          시작하기
        </button>
      </div>
    )
  }

  // === SELECT ===
  if (phase === 'select') {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-900">검사 영역 선택</h2>
          <p className="text-gray-500 text-[14px]">측정하고 싶은 영역을 선택하세요</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TEST_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="text-3xl mb-3">{opt.icon}</div>
              <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                {opt.label}
              </div>
              <div className="text-[12px] text-gray-400 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setPhase('intro')}
          className="w-full py-2.5 text-gray-500 text-[14px] hover:text-gray-700 transition"
        >
          ← 돌아가기
        </button>
      </div>
    )
  }

  // === QUIZ ===
  if (phase === 'quiz') {
    const progress = ((globalIdx + 1) / totalQuestions) * 100

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px] text-gray-500">
            <span className="font-medium text-emerald-600">{currentScale.name}</span>
            <span>{globalIdx + 1} / {totalQuestions}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Scale description (show once at start of each scale) */}
        {currentQIdx === 0 && activeScales.length > 1 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
            <p className="text-[13px] text-emerald-700">{currentScale.description}</p>
          </div>
        )}

        {/* Question */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 min-h-[280px] flex flex-col">
          <div className="flex-1">
            <div className="text-[13px] text-gray-400 mb-3">
              Q{currentQIdx + 1}.
            </div>
            <h3 className="text-[17px] font-semibold text-gray-900 leading-relaxed mb-6">
              {currentQuestion.text}
            </h3>

            <div className="space-y-2.5">
              {LIKERT_OPTIONS.map((opt) => {
                const selected = answers[answerKey] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                      selected
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200'
                    }`}
                  >
                    <span className="mr-2 opacity-60">{opt.value}.</span>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
            <button
              onClick={goPrev}
              disabled={globalIdx === 0}
              className="px-4 py-2 text-[14px] text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← 이전
            </button>
            <button
              onClick={goNext}
              disabled={answers[answerKey] === undefined}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
            >
              {globalIdx === totalQuestions - 1 ? '결과 보기' : '다음 →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // === RESULT ===
  const results = activeScales.map((scale) => {
    const score = calculateScore(scale.id, answers)
    const level = getLevel(scale.id, score)
    const maxScore = getMaxScore(scale.id)
    return {
      scaleId: scale.id,
      scaleName: scale.name.replace(/ \(.*\)/, ''),
      score,
      maxScore,
      level: level!,
      percentage: Math.round((score / maxScore) * 100),
    }
  })

  const radarData = results.map((r) => ({
    subject: r.scaleName,
    score: r.percentage,
    fullMark: 100,
  }))

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">검사 결과</h2>
        <p className="text-gray-500 text-[14px]">당신의 심리 상태 분석 결과입니다</p>
      </div>

      {/* Radar Chart */}
      {results.length >= 3 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 13, fill: '#374151', fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <Radar
                dataKey="score"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Score Cards */}
      <div className="space-y-3">
        {results.map((r) => {
          const tipData = TIPS[r.scaleId]?.[r.level.label]
          return (
            <div key={r.scaleId} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{r.scaleName}</h3>
                <div
                  className="px-3 py-1 rounded-lg text-[13px] font-bold text-white"
                  style={{ backgroundColor: r.level.color }}
                >
                  {r.level.label}
                </div>
              </div>

              {/* Score bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">{r.score}점 / {r.maxScore}점</span>
                  <span className="text-gray-400">{r.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${r.percentage}%`, backgroundColor: r.level.color }}
                  />
                </div>
              </div>

              {/* Tips */}
              {tipData && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-[14px] font-medium text-gray-800">{tipData.title}</p>
                  <p className="text-[13px] text-gray-500">{tipData.description}</p>
                  <ul className="space-y-1.5 mt-2">
                    {tipData.tips.map((tip, i) => (
                      <li key={i} className="text-[13px] text-gray-600 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-[13px] text-amber-800 flex items-start gap-2">
          <span className="text-amber-500 text-lg leading-none">⚠️</span>
          {DISCLAIMER}
        </p>
      </div>

      {/* Restart */}
      <button
        onClick={restart}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98]"
      >
        다시 검사하기
      </button>
    </div>
  )
}

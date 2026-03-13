'use client'

import { useState, useRef, useCallback } from 'react'
import { questions, calculateScores } from './retirement-test/questions'
import { getResultByScore, ResultCode } from './retirement-test/results'
import ResultCard from './retirement-test/ResultCard'
import ShareButtons from './retirement-test/ShareButtons'

type Phase = 'intro' | 'quiz' | 'result'

export default function RetirementTest() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const cardRef = useRef<HTMLDivElement>(null)

  const handleStart = useCallback(() => {
    setPhase('quiz')
    setCurrentQ(0)
    setAnswers({})
  }, [])

  const handleAnswer = useCallback((questionId: number, score: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: score }
      return next
    })
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1)
    } else {
      setPhase('result')
    }
  }, [currentQ])

  const handlePrev = useCallback(() => {
    if (currentQ > 0) {
      setCurrentQ((prev) => prev - 1)
    }
  }, [currentQ])

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-8 text-center">
            <div className="text-5xl mb-4">🏦</div>
            <h2 className="text-2xl font-bold">나의 노후 준비 점수는?</h2>
            <p className="text-green-100 mt-2 text-sm">
              12개 질문으로 알아보는 나의 노후 준비 상태
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              {[
                { icon: '💰', label: '재정 준비도' },
                { icon: '🏃', label: '생활/건강' },
                { icon: '🏠', label: '주거/자산' },
                { icon: '🧠', label: '마인드/지식' },
              ].map((cat) => (
                <div
                  key={cat.label}
                  className="bg-green-50 rounded-xl p-3"
                >
                  <div className="text-2xl">{cat.icon}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {cat.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>소요 시간: 약 2분</p>
              <p>총 12문항 · 비회원도 가능</p>
            </div>
            <button
              onClick={handleStart}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl transition"
            >
              테스트 시작하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz screen
  if (phase === 'quiz') {
    const q = questions[currentQ]
    const progress = ((currentQ + 1) / questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{q.categoryLabel}</span>
            <span>
              {currentQ + 1} / {questions.length}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Q{currentQ + 1}. {q.text}
          </h3>
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = answers[q.id] === opt.score
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(q.id, opt.score)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition font-medium text-sm ${
                    isSelected
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-100 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50/50'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs text-gray-500 mr-3">
                    {idx + 1}
                  </span>
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQ > 0 && (
            <button
              onClick={handlePrev}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              ← 이전
            </button>
          )}
        </div>
      </div>
    )
  }

  // Result screen
  const { total, categories } = calculateScores(answers)
  const maxTotal = 48
  const result = getResultByScore(total)

  const scoreParams = categories
    .map((c) => `${c.key[0]}=${c.score}`)
    .join('&')
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/programs/retirement-test/result/${result.code}?s=${total}&${scoreParams}`
      : ''

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Result card */}
      <ResultCard
        ref={cardRef}
        total={total}
        maxTotal={maxTotal}
        result={result}
        categories={categories}
      />

      {/* Share buttons */}
      <ShareButtons
        shareUrl={shareUrl}
        total={total}
        grade={result.grade}
        cardRef={cardRef}
      />

      {/* Retry */}
      <div className="text-center">
        <button
          onClick={handleStart}
          className="px-6 py-2.5 text-sm text-gray-500 hover:text-gray-700 underline transition"
        >
          다시 테스트하기
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  { emoji: '📅', text: '사주팔자 배열 중' },
  { emoji: '☯️', text: '음양 조화 분석 중' },
  { emoji: '🌳', text: '오행 기운 측정 중' },
  { emoji: '⭐', text: '십신 관계 해석 중' },
  { emoji: '🔮', text: '용신 판별 중' },
  { emoji: '💫', text: '올해 운세 계산 중' },
  { emoji: '📜', text: '사주 리포트 생성 중' },
]

export default function SajuAnalyzingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 600)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 90)

    const timer = setTimeout(onComplete, 4800)
    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-6xl mb-6 animate-pulse">🔮</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        당신의 사주를 분석하고 있습니다
      </h2>
      <p className="text-gray-500 text-sm mb-8">잠시만 기다려주세요...</p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="h-2 rounded-full transition-all duration-200 bg-gradient-to-r from-purple-500 to-indigo-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3 w-full max-w-xs">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 text-sm transition-all duration-300 ${
              i < currentStep
                ? 'text-green-600'
                : i === currentStep
                ? 'text-gray-900 font-medium'
                : 'text-gray-300'
            }`}
          >
            <span className="text-lg">{i < currentStep ? '✅' : step.emoji}</span>
            <span>{step.text}</span>
            {i === currentStep && (
              <span className="ml-auto">
                <span className="animate-spin inline-block h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

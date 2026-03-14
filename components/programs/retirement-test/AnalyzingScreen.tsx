'use client'

import { useState, useEffect } from 'react'

const steps = [
  { icon: '💰', label: '재정 준비도 분석 중...' },
  { icon: '🏃', label: '생활/건강 점검 중...' },
  { icon: '🏠', label: '주거/자산 평가 중...' },
  { icon: '🧠', label: '마인드/지식 측정 중...' },
  { icon: '🏛️', label: '3층 연금체계 진단 중...' },
  { icon: '⚠️', label: '3대 리스크 평가 중...' },
  { icon: '📊', label: '종합 리포트 생성 중...' },
]

interface AnalyzingScreenProps {
  onComplete: () => void
}

export default function AnalyzingScreen({ onComplete }: AnalyzingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepInterval = 700 // 700ms per step = ~5000ms total
    const progressInterval = 40 // smooth progress bar

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + 100 / (5000 / progressInterval)
      })
    }, progressInterval)

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) return prev
        return prev + 1
      })
    }, stepInterval)

    const completeTimer = setTimeout(() => {
      onComplete()
    }, 5000)

    return () => {
      clearInterval(progressTimer)
      clearInterval(stepTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden p-8">
        <div className="flex flex-col items-center">
          {/* Spinning circle */}
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-100" />
            <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              {steps[currentStep].icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            분석 중입니다
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            당신의 노후 준비 상태를 심층 분석하고 있어요
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-xs mb-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-100"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 text-right mt-1">
              {Math.min(Math.round(progress), 100)}%
            </div>
          </div>

          {/* Steps list */}
          <div className="w-full max-w-xs space-y-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  idx <= currentStep ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all duration-300 ${
                    idx < currentStep
                      ? 'bg-green-500 text-white'
                      : idx === currentStep
                        ? 'bg-green-100 text-green-600 animate-pulse'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-sm ${
                    idx === currentStep
                      ? 'text-gray-900 font-medium'
                      : idx < currentStep
                        ? 'text-green-600'
                        : 'text-gray-400'
                  }`}
                >
                  {step.icon} {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex gap-2 mt-6">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx <= currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

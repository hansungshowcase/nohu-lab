'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  { emoji: '🔮', text: '카드 에너지 감지 중', detail: '선택한 카드의 고유 진동을 읽고 있습니다' },
  { emoji: '✨', text: '카드 영혼 연결 중', detail: '카드와 당신의 에너지를 연결합니다' },
  { emoji: '🌙', text: '달의 위상 확인 중', detail: '천체의 기운이 카드에 미치는 영향 분석' },
  { emoji: '⚡', text: '정방향/역방향 에너지 분석', detail: '카드 방향에 따른 에너지 흐름 파악' },
  { emoji: '🔗', text: '카드 간 관계 분석 중', detail: '선택된 카드들의 시너지와 긴장 관계 확인' },
  { emoji: '💫', text: '원소 조합 해석 중', detail: '불·물·바람·땅의 에너지 균형 분석' },
  { emoji: '🌌', text: '우주적 메시지 수신 중', detail: '카드가 전하는 운명의 메시지를 해독합니다' },
  { emoji: '📜', text: '운명의 메시지 해석 중', detail: '고대 타로의 지혜로 메시지를 풀어냅니다' },
  { emoji: '🎯', text: '행운 요소 계산 중', detail: '오늘의 행운 색상·숫자·방향을 산출합니다' },
  { emoji: '📖', text: '종합 리딩 완성 중', detail: '모든 분석을 통합하여 최종 해석을 준비합니다' },
]

const MYSTICAL_TEXTS = [
  '카드가 속삭이고 있습니다...',
  '별빛이 카드를 비추고 있습니다...',
  '운명의 실이 엮이고 있습니다...',
  '고대의 지혜가 깨어나고 있습니다...',
  '당신의 에너지가 카드와 공명합니다...',
  '숨겨진 진실이 드러나고 있습니다...',
  '타로의 비밀이 열리고 있습니다...',
]

export default function TarotAnalyzing({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [mysticalIdx, setMysticalIdx] = useState(0)
  const [showPulse, setShowPulse] = useState(true)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 1000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 0.8
      })
    }, 80)

    const textInterval = setInterval(() => {
      setMysticalIdx((prev) => (prev + 1) % MYSTICAL_TEXTS.length)
    }, 1800)

    const pulseInterval = setInterval(() => {
      setShowPulse((prev) => !prev)
    }, 1500)

    const timer = setTimeout(onComplete, 11000)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
      clearInterval(textInterval)
      clearInterval(pulseInterval)
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* 메인 아이콘 */}
      <div className="relative mb-8 overflow-hidden p-8">
        <div className={`text-7xl transition-all duration-700 ${showPulse ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}`}>
          🔮
        </div>
        <div className="absolute inset-0 -m-4">
          <div className="w-24 h-24 mx-auto border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
        </div>
        <div className="absolute inset-0 -m-8">
          <div className="w-32 h-32 mx-auto border border-indigo-200 border-b-indigo-500 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
        </div>
      </div>

      <h2 className="text-xl font-black text-gray-900 mb-1">
        타로 카드를 해석하고 있습니다
      </h2>
      <p className="text-purple-500 text-sm mb-6 animate-pulse font-medium">
        {MYSTICAL_TEXTS[mysticalIdx]}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-sm mb-2">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 relative"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <p className="text-right text-xs text-gray-400 mt-1">{Math.min(Math.round(progress), 100)}%</p>
      </div>

      {/* Steps */}
      <div className="space-y-2 w-full max-w-sm mt-4">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 py-1.5 px-3 rounded-lg text-sm transition-all duration-500 ${
              i < currentStep
                ? 'text-green-600 bg-green-50'
                : i === currentStep
                ? 'text-gray-900 font-medium bg-purple-50 border border-purple-200'
                : 'text-gray-300'
            }`}
          >
            <span className="text-base w-6 text-center">{i < currentStep ? '✅' : step.emoji}</span>
            <div className="flex-1">
              <span>{step.text}</span>
              {i === currentStep && (
                <span className="block text-xs text-purple-400 mt-0.5">{step.detail}</span>
              )}
            </div>
            {i === currentStep && (
              <span className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

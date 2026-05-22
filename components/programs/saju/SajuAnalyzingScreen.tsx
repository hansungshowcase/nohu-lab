'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  { emoji: '📅', text: '사주팔자 배열 중', detail: '년·월·일·시 네 기둥(四柱) 설정' },
  { emoji: '☯️', text: '음양 조화 분석 중', detail: '천간·지지의 양과 음의 균형 파악' },
  { emoji: '🌳', text: '오행 기운 측정 중', detail: '목·화·토·금·수 에너지 + 지장간 분석' },
  { emoji: '⭐', text: '십신 관계 해석 중', detail: '비견·식신·재성·관성·인성 배치 분석' },
  { emoji: '🏛️', text: '격국 판별 중', detail: '월지 정기(正氣) 기반 격국 판단' },
  { emoji: '🔮', text: '용신·희신 판별 중', detail: '신강/신약 판단 후 용신 결정' },
  { emoji: '🐎', text: '신살 분석 중', detail: '역마·도화·화개·천을귀인 등 7종 확인' },
  { emoji: '🔄', text: '대운 흐름 계산 중', detail: '과거~미래 80년 대운 흐름 분석' },
  { emoji: '🌐', text: '천간합충 분석 중', detail: '일간과 세운의 합(合)·충(沖) 관계 확인' },
  { emoji: '💫', text: '올해 운세 계산 중', detail: '세운·십신·오행 관계로 운세 도출' },
  { emoji: '📊', text: '종합 리포트 생성 중', detail: '격국·신살·대운·세운 종합 분석' },
  { emoji: '✨', text: '최종 검증 중', detail: '모든 분석의 정확도를 재확인합니다' },
]

const MYSTICAL_TEXTS = [
  '천기(天氣)를 읽고 있습니다...',
  '사주의 비밀이 드러나고 있습니다...',
  '운명의 흐름을 추적합니다...',
  '당신만의 특별한 기운이 느껴집니다...',
  '격국의 품격을 판별하고 있습니다...',
  '대운의 흐름에서 전환점을 찾고 있습니다...',
  '천간과 지지의 관계를 정밀 분석 중...',
  '신살이 가리키는 운명의 방향을 읽습니다...',
]

export default function SajuAnalyzingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [mysticalIdx, setMysticalIdx] = useState(0)
  const [showPulse, setShowPulse] = useState(true)

  useEffect(() => {
    // 스텝 진행 (총 ~15초, 12스텝 × 1.2초)
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 1200)

    // 프로그레스 바 (15초에 맞춤)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 0.6
      })
    }, 80)

    // 신비로운 텍스트 순환
    const textInterval = setInterval(() => {
      setMysticalIdx(prev => (prev + 1) % MYSTICAL_TEXTS.length)
    }, 1800)

    // 펄스 애니메이션
    const pulseInterval = setInterval(() => {
      setShowPulse(prev => !prev)
    }, 1500)

    // 총 16초 후 완료
    const timer = setTimeout(onComplete, 16000)

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
        {/* 회전하는 링 */}
        <div className="absolute inset-0 -m-4">
          <div className="w-24 h-24 mx-auto border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
        </div>
        <div className="absolute inset-0 -m-8">
          <div className="w-32 h-32 mx-auto border border-amber-200 border-b-amber-500 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
        </div>
      </div>

      <h2 className="text-xl font-black text-gray-900 mb-1">
        사주를 분석하고 있습니다
      </h2>
      <p className="text-orange-500 text-sm mb-6 animate-pulse font-medium">
        {MYSTICAL_TEXTS[mysticalIdx]}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-sm mb-2">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 relative"
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
                ? 'text-gray-900 font-medium bg-orange-50 border border-orange-200'
                : 'text-gray-300'
            }`}
          >
            <span className="text-base w-6 text-center">{i < currentStep ? '✅' : step.emoji}</span>
            <div className="flex-1">
              <span>{step.text}</span>
              {i === currentStep && (
                <span className="block text-xs text-orange-400 mt-0.5">{step.detail}</span>
              )}
            </div>
            {i === currentStep && (
              <span className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

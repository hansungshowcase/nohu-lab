'use client'

import { useEffect, useState, useRef } from 'react'

const STEPS = [
  { emoji: '📅', text: '사주팔자 배열 중' },
  { emoji: '☯️', text: '음양 조화 분석 중' },
  { emoji: '🌳', text: '오행 기운 측정 중' },
  { emoji: '⭐', text: '십신 관계 해석 중' },
  { emoji: '🔮', text: '용신 판별 중' },
  { emoji: '💫', text: '올해 운세 계산 중' },
  { emoji: '📜', text: '사주 리포트 생성 중' },
]

const KEYFRAMES = `
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  25% { background-position: 100% 50%; }
  50% { background-position: 100% 0%; }
  75% { background-position: 0% 100%; }
  100% { background-position: 0% 50%; }
}
@keyframes floatRotate {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes fadeOutDown {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-8px); }
}
@keyframes dotPulse {
  0%, 20% { opacity: 0; }
  40% { opacity: 1; }
  60%, 100% { opacity: 0; }
}
@keyframes completeBurst {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes ringExpand {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
  50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.6), 0 0 60px rgba(245, 158, 11, 0.3); }
}
`

export default function SajuAnalyzingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [prevStep, setPrevStep] = useState(-1)
  const [stepKey, setStepKey] = useState(0)
  const styleRef = useRef<HTMLStyleElement | null>(null)

  // Inject keyframes
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = KEYFRAMES
    document.head.appendChild(style)
    styleRef.current = style
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        setPrevStep(prev)
        setStepKey(k => k + 1)
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

    const completeTimer = setTimeout(() => {
      setIsComplete(true)
    }, 4500)

    const timer = setTimeout(onComplete, 5000)
    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
      clearTimeout(completeTimer)
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 overflow-visible"
      style={{
        background: 'linear-gradient(135deg, #fff7ed, #fffbeb, #fff7ed, #fef3c7, #fff7ed)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
      }}
    >
      {/* Floating particles in background */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${8 + i * 4}px`,
            height: `${8 + i * 4}px`,
            background: `radial-gradient(circle, ${
              ['#fb923c', '#f97316', '#fbbf24', '#ea580c', '#f59e0b', '#fdba74'][i]
            }, transparent)`,
            top: `${10 + i * 14}%`,
            left: `${5 + i * 16}%`,
            animation: `floatRotate ${4 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      {/* Central icon */}
      <div className="relative mb-8">
        {/* Expanding ring effect */}
        {!isComplete && (
          <div
            className="absolute inset-0 rounded-full border-2 border-orange-400"
            style={{
              animation: 'ringExpand 2s ease-out infinite',
            }}
          />
        )}

        {/* Glow container */}
        <div
          className="relative rounded-full p-6"
          style={{
            animation: isComplete ? 'completeBurst 0.6s ease-out forwards' : 'glowPulse 2s ease-in-out infinite',
          }}
        >
          <div
            className="text-7xl select-none"
            style={{
              animation: isComplete ? 'none' : 'floatRotate 6s linear infinite',
              display: 'inline-block',
            }}
          >
            {isComplete ? '✨' : '☯️'}
          </div>
        </div>

        {/* Sparkles around icon */}
        {isComplete && (
          <>
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div
                key={deg}
                className="absolute text-xl"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translateY(-50px)`,
                  animation: `sparkle 0.8s ease-out ${i * 0.1}s forwards`,
                }}
              >
                ✦
              </div>
            ))}
          </>
        )}
      </div>

      {/* Title */}
      <h2
        className="text-xl font-bold text-gray-900 mb-2 text-center"
        style={{
          animation: isComplete ? 'completeBurst 0.5s ease-out forwards' : undefined,
        }}
      >
        {isComplete ? '분석이 완료되었습니다!' : '당신의 사주를 분석하고 있습니다'}
      </h2>

      {/* Current step text with fade animation */}
      {!isComplete && (
        <div className="h-6 mb-8 flex items-center justify-center">
          <p
            key={stepKey}
            className="text-orange-600 text-sm font-medium"
            style={{
              animation: 'fadeInUp 0.4s ease-out forwards',
            }}
          >
            {STEPS[currentStep]?.emoji} {STEPS[currentStep]?.text}
            {/* Animated dots */}
            <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '2px' }}>
              {[0, 1, 2].map(d => (
                <span
                  key={d}
                  style={{
                    animation: `dotPulse 1.2s ease-in-out ${d * 0.3}s infinite`,
                    fontWeight: 'bold',
                  }}
                >
                  .
                </span>
              ))}
            </span>
          </p>
        </div>
      )}

      {isComplete && (
        <p
          className="text-orange-600 text-sm font-medium mb-8"
          style={{
            animation: 'fadeInUp 0.4s ease-out 0.2s both',
          }}
        >
          곧 결과를 보여드립니다
        </p>
      )}

      {/* Progress Bar with shimmer */}
      <div className="w-full max-w-xs mb-8">
        <div className="relative bg-gray-200 rounded-full h-3 overflow-hidden">
          {/* Actual progress */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
            style={{
              width: `${progress}%`,
              background: isComplete
                ? 'linear-gradient(90deg, #f97316, #ea580c)'
                : 'linear-gradient(90deg, #f97316, #f59e0b, #fb923c, #f59e0b, #f97316)',
              backgroundSize: isComplete ? '100% 100%' : '200% 100%',
              animation: isComplete ? 'none' : 'shimmer 1.5s linear infinite',
            }}
          />
          {/* Shimmer overlay */}
          {!isComplete && (
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.2s linear infinite',
              }}
            />
          )}
        </div>
        {/* Progress percentage */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
          {isComplete && (
            <span
              className="text-xs text-orange-600 font-bold"
              style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}
            >
              완료!
            </span>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2.5 w-full max-w-xs">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep || isComplete
          const isCurrent = i === currentStep && !isComplete
          const isPending = i > currentStep && !isComplete

          return (
            <div
              key={i}
              className="flex items-center gap-3 text-sm transition-all duration-300"
              style={{
                color: isDone ? '#ea580c' : isCurrent ? '#1f2937' : '#d1d5db',
                fontWeight: isCurrent ? 600 : 400,
                transform: isCurrent ? 'scale(1.03)' : 'scale(1)',
                animation: isDone && i === currentStep - 1 ? 'fadeInUp 0.3s ease-out' : undefined,
              }}
            >
              <span className="text-lg w-7 text-center">
                {isDone ? (
                  <span style={{ animation: i === prevStep ? 'completeBurst 0.3s ease-out' : undefined }}>
                    ✅
                  </span>
                ) : (
                  step.emoji
                )}
              </span>
              <span className="flex-1">{step.text}</span>
              {isCurrent && (
                <span className="flex items-center gap-1">
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
                </span>
              )}
              {isDone && (
                <span className="text-orange-500 text-xs">완료</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

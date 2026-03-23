'use client'

import { forwardRef, useEffect, useState } from 'react'
import type { BrainResult } from './games'
import type { DayRecord } from './storage'

interface ResultCardProps {
  result: BrainResult
  realAge: number
  streak: number
  history: DayRecord[]
}

function getGrade(score: number): { grade: string; label: string; color: string; bgColor: string } {
  if (score >= 90) return { grade: 'S', label: '천재급', color: 'text-amber-500', bgColor: 'from-amber-400 to-yellow-300' }
  if (score >= 80) return { grade: 'A+', label: '매우 우수', color: 'text-emerald-500', bgColor: 'from-emerald-400 to-green-300' }
  if (score >= 70) return { grade: 'A', label: '우수', color: 'text-blue-500', bgColor: 'from-blue-400 to-cyan-300' }
  if (score >= 55) return { grade: 'B+', label: '양호', color: 'text-violet-500', bgColor: 'from-violet-400 to-purple-300' }
  if (score >= 40) return { grade: 'B', label: '보통', color: 'text-orange-500', bgColor: 'from-orange-400 to-amber-300' }
  if (score >= 25) return { grade: 'C', label: '노력 필요', color: 'text-rose-500', bgColor: 'from-rose-400 to-red-300' }
  return { grade: 'D', label: '집중 훈련 필요', color: 'text-gray-500', bgColor: 'from-gray-400 to-gray-300' }
}

function getAdvice(result: BrainResult): string {
  const weakest = [
    { name: '기억력', score: result.memoryScore },
    { name: '계산력', score: result.mathScore },
    { name: '반응속도', score: result.reactionScore },
  ].sort((a, b) => a.score - b.score)[0]

  const tips: Record<string, string> = {
    기억력: '매일 새로운 단어 5개 외우기, 퍼즐 풀기, 독서가 도움됩니다',
    계산력: '장보기 할 때 암산하기, 스도쿠 풀기가 효과적입니다',
    반응속도: '규칙적인 걷기 운동, 충분한 수면이 반응속도를 개선합니다',
  }
  return `${weakest.name}이 가장 약합니다. ${tips[weakest.name]}`
}

const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  function ResultCard({ result, realAge, streak, history }, ref) {
    const ageDiff = realAge - result.brainAge
    const isYounger = ageDiff > 0
    const grade = getGrade(result.totalScore)
    const [animated, setAnimated] = useState(false)

    useEffect(() => {
      const timer = setTimeout(() => setAnimated(true), 100)
      return () => clearTimeout(timer)
    }, [])

    const categories = [
      { name: '기억력', score: result.memoryScore, icon: '🃏', color: 'from-violet-500 to-purple-500', bgLight: 'bg-violet-50', textColor: 'text-violet-600' },
      { name: '계산력', score: result.mathScore, icon: '➕', color: 'from-blue-500 to-cyan-500', bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
      { name: '반응속도', score: result.reactionScore, icon: '⚡', color: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50', textColor: 'text-amber-600' },
    ]

    // 최고 기록 비교
    const bestRecord = history.length > 0 ? Math.max(...history.map((h) => h.totalScore)) : null
    const isNewBest = bestRecord !== null && result.totalScore >= bestRecord

    return (
      <div ref={ref} className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto" style={{ width: '100%' }}>
        {/* 헤더 - 뇌나이 + 등급 */}
        <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-6 sm:p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="absolute top-3 right-3">
            <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center`}>
              <span className="text-2xl font-black">{grade.grade}</span>
            </div>
          </div>
          <p className="text-sm font-medium opacity-90 mb-1">오늘의 뇌나이</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl sm:text-7xl font-black tracking-tight">{result.brainAge}</span>
            <span className="text-2xl font-bold opacity-80">세</span>
          </div>
          <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${isYounger ? 'bg-white/25' : ageDiff === 0 ? 'bg-white/20' : 'bg-red-600/30'}`}>
            {isYounger ? '🎉' : ageDiff === 0 ? '👍' : '💪'}
            {isYounger
              ? `실제보다 ${ageDiff}세 젊음!`
              : ageDiff === 0
                ? '실제 나이와 동일'
                : `실제보다 ${Math.abs(ageDiff)}세 많음`
            }
          </div>
          {isNewBest && (
            <div className="mt-2 text-xs font-bold bg-white/30 px-3 py-1 rounded-full inline-block animate-pulse">
              🏆 개인 최고 기록 갱신!
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* 등급 + 종합 점수 */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grade.bgColor} flex items-center justify-center shadow-sm`}>
              <span className="text-2xl font-black text-white">{grade.grade}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">{result.totalScore}</span>
                <span className="text-sm text-gray-400 font-medium">/ 100점</span>
              </div>
              <p className={`text-sm font-bold ${grade.color}`}>{grade.label}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">또래 {realAge}세 중</p>
              <p className="text-xl font-black text-orange-500">상위</p>
              <p className="text-xl font-black text-orange-500">{Math.max(1, 100 - result.percentile)}%</p>
            </div>
          </div>

          {/* 카테고리별 점수 카드 */}
          <div className="space-y-2.5">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">영역별 분석</p>
            {categories.map((cat, i) => {
              const catGrade = getGrade(cat.score)
              return (
                <div key={cat.name} className={`p-3.5 rounded-xl ${cat.bgLight} border border-gray-100`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-white ${catGrade.color}`}>{catGrade.grade}</span>
                      <span className="text-lg font-black text-gray-900">{cat.score}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all ease-out`}
                      style={{
                        width: animated ? `${cat.score}%` : '0%',
                        transitionDuration: `${800 + i * 200}ms`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI 조언 */}
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
            <div className="flex items-start gap-2">
              <span className="text-lg mt-0.5">💡</span>
              <div>
                <p className="text-xs font-bold text-orange-700 mb-1">맞춤 두뇌 트레이닝 팁</p>
                <p className="text-xs text-orange-600 leading-relaxed">{getAdvice(result)}</p>
              </div>
            </div>
          </div>

          {/* 연속 플레이 배지 */}
          {streak > 0 && (
            <div className="flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex">
                {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                  <span key={i} className="text-lg -ml-1 first:ml-0">🔥</span>
                ))}
              </div>
              <div>
                <span className="text-sm font-black text-orange-700">{streak}일 연속!</span>
                {streak >= 7 && <span className="ml-1 text-xs text-orange-500">🏅 주간 달성</span>}
                {streak >= 30 && <span className="ml-1 text-xs text-orange-500">👑 월간 달성</span>}
              </div>
            </div>
          )}

          {/* 주간 추이 그래프 */}
          {history.length >= 2 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">종합 점수 추이</p>
                <p className="text-[10px] text-gray-400">최근 {history.length}일</p>
              </div>
              <div className="flex items-end gap-1.5 h-20 p-3 bg-gray-50 rounded-xl">
                {history.map((day, i) => {
                  const height = Math.max(day.totalScore, 5)
                  const isToday = i === history.length - 1
                  const prevScore = i > 0 ? history[i - 1].totalScore : day.totalScore
                  const improved = day.totalScore > prevScore
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className={`text-[9px] font-bold ${isToday ? 'text-orange-600' : 'text-gray-500'}`}>
                        {day.totalScore}
                      </span>
                      <div
                        className={`w-full rounded-t-md transition-all duration-700 ${
                          isToday
                            ? 'bg-gradient-to-t from-orange-500 to-amber-400 shadow-sm shadow-orange-200'
                            : improved
                              ? 'bg-gradient-to-t from-green-300 to-emerald-200'
                              : 'bg-gray-200'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <span className={`text-[8px] ${isToday ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                        {isToday ? '오늘' : day.date.slice(5)}
                      </span>
                    </div>
                  )
                })}
              </div>
              {history.length >= 3 && (() => {
                const recent = history[history.length - 1].totalScore
                const first = history[0].totalScore
                const diff = recent - first
                if (diff === 0) return null
                return (
                  <p className={`text-[11px] mt-1.5 text-center font-medium ${diff > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {diff > 0 ? `📈 ${diff}점 향상! 꾸준한 훈련의 효과입니다` : `📉 ${Math.abs(diff)}점 하락 — 오늘부터 다시 도전!`}
                  </p>
                )
              })()}
            </div>
          )}

          {/* 노후연구소 워터마크 */}
          <div className="text-center pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-300 font-medium">retireplan.kr | 노후연구소 브레인 트레이닝</p>
          </div>
        </div>
      </div>
    )
  }
)

export default ResultCard

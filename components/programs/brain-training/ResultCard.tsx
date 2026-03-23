'use client'

import { forwardRef } from 'react'
import type { BrainResult } from './games'
import type { DayRecord } from './storage'

interface ResultCardProps {
  result: BrainResult
  realAge: number
  streak: number
  history: DayRecord[]
}

const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  function ResultCard({ result, realAge, streak, history }, ref) {
    const ageDiff = realAge - result.brainAge
    const isYounger = ageDiff > 0

    const categories = [
      { name: '기억력', score: result.memoryScore, icon: '🃏', color: 'from-violet-500 to-purple-500' },
      { name: '계산력', score: result.mathScore, icon: '➕', color: 'from-blue-500 to-cyan-500' },
      { name: '반응속도', score: result.reactionScore, icon: '⚡', color: 'from-amber-500 to-orange-500' },
    ]

    return (
      <div ref={ref} className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto" style={{ width: '100%' }}>
        {/* 헤더 - 뇌나이 */}
        <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-6 sm:p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <p className="text-sm font-medium opacity-90 mb-1">오늘의 뇌나이</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl sm:text-7xl font-black tracking-tight">{result.brainAge}</span>
            <span className="text-2xl font-bold opacity-80">세</span>
          </div>
          <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${isYounger ? 'bg-white/25' : 'bg-red-600/30'}`}>
            {isYounger ? '🎉' : '💪'}
            {isYounger
              ? `실제보다 ${ageDiff}세 젊음!`
              : ageDiff === 0
                ? '실제 나이와 동일'
                : `실제보다 ${Math.abs(ageDiff)}세 많음`
            }
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* 종합 점수 + 퍼센타일 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">종합 점수</p>
              <p className="text-3xl font-black text-gray-900">{result.totalScore}<span className="text-lg text-gray-400">/100</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">또래 {realAge}세 중</p>
              <p className="text-2xl font-black text-orange-500">상위 {100 - result.percentile}%</p>
            </div>
          </div>

          {/* 카테고리별 점수 바 */}
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">{cat.icon} {cat.name}</span>
                  <span className="text-sm font-bold text-gray-900">{cat.score}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 연속 플레이 배지 */}
          {streak > 0 && (
            <div className="flex items-center justify-center gap-2 py-2">
              <span className="text-lg">{'🔥'.repeat(Math.min(streak, 5))}</span>
              <span className="text-sm font-bold text-orange-600">{streak}일 연속 도전!</span>
            </div>
          )}

          {/* 주간 추이 그래프 */}
          {history.length >= 2 && (
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">📈 뇌나이 추이 (최근 {history.length}일)</p>
              <div className="flex items-end gap-1 h-16">
                {history.map((day, i) => {
                  // 뇌나이가 낮을수록(젊을수록) 높은 바
                  const maxAge = 80
                  const minAge = 20
                  const height = ((maxAge - day.brainAge) / (maxAge - minAge)) * 100
                  const isToday = i === history.length - 1
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold text-gray-500">{day.brainAge}</span>
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${isToday ? 'bg-gradient-to-t from-orange-500 to-amber-400' : 'bg-gray-200'}`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                      <span className="text-[8px] text-gray-400">{day.date.slice(5)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 노후연구소 워터마크 */}
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-300 font-medium">retireplan.kr | 노후연구소</p>
          </div>
        </div>
      </div>
    )
  }
)

export default ResultCard

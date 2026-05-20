'use client'

import { forwardRef, useEffect, useMemo, useState } from 'react'
import type { BrainResult } from './games'
import type { DayRecord } from './storage'

interface ResultCardProps {
  result: BrainResult
  realAge: number
  streak: number
  history: DayRecord[]
}

function getGrade(score: number): { grade: string; label: string; tone: string; bar: string } {
  if (score >= 92) return { grade: 'S', label: '상위권 집중력', tone: 'text-amber-600', bar: 'from-amber-400 to-yellow-300' }
  if (score >= 82) return { grade: 'A+', label: '매우 선명한 컨디션', tone: 'text-emerald-600', bar: 'from-emerald-400 to-teal-300' }
  if (score >= 72) return { grade: 'A', label: '안정적인 두뇌 컨디션', tone: 'text-sky-600', bar: 'from-sky-400 to-cyan-300' }
  if (score >= 58) return { grade: 'B+', label: '좋은 기본기', tone: 'text-indigo-600', bar: 'from-indigo-400 to-violet-300' }
  if (score >= 44) return { grade: 'B', label: '워밍업이 필요한 상태', tone: 'text-orange-600', bar: 'from-orange-400 to-amber-300' }
  return { grade: 'C', label: '회복과 반복 훈련 권장', tone: 'text-rose-600', bar: 'from-rose-400 to-red-300' }
}

function getAdvice(result: BrainResult): { title: string; body: string } {
  const weakest = [
    { key: 'memory', name: '기억력', score: result.memoryScore },
    { key: 'math', name: '계산력', score: result.mathScore },
    { key: 'reaction', name: '반응속도', score: result.reactionScore },
  ].sort((a, b) => a.score - b.score)[0]

  if (weakest.key === 'memory') {
    return {
      title: '오늘의 강화 포인트: 기억력',
      body: '카드 위치를 외울 때 하나씩 보지 말고 2x2 구역으로 묶어 기억하면 재도전 점수가 빠르게 올라갑니다.',
    }
  }
  if (weakest.key === 'math') {
    return {
      title: '오늘의 강화 포인트: 계산력',
      body: '답을 바로 계산하기보다 끝자리와 대략값을 먼저 확인하면 오답 선택을 줄일 수 있습니다.',
    }
  }
  return {
    title: '오늘의 강화 포인트: 반응속도',
    body: '초록 신호만 기다리는 동안 손가락에 힘을 빼고 화면 중앙을 넓게 보면 성급한 터치를 줄일 수 있습니다.',
  }
}

const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  function ResultCard({ result, realAge, streak, history }, ref) {
    const [animated, setAnimated] = useState(false)
    const grade = getGrade(result.totalScore)
    const advice = getAdvice(result)
    const ageDiff = realAge - result.brainAge
    const isYounger = ageDiff > 0

    useEffect(() => {
      const timer = setTimeout(() => setAnimated(true), 120)
      return () => clearTimeout(timer)
    }, [])

    const bestRecord = history.length ? Math.max(...history.map((h) => h.totalScore)) : null
    const isNewBest = bestRecord !== null && result.totalScore >= bestRecord
    const categories = useMemo(() => [
      { name: '기억력', score: result.memoryScore, icon: '🧩', color: 'from-violet-500 to-fuchsia-400' },
      { name: '계산력', score: result.mathScore, icon: '⌁', color: 'from-sky-500 to-cyan-400' },
      { name: '반응속도', score: result.reactionScore, icon: '⚡', color: 'from-emerald-500 to-lime-400' },
    ], [result])

    return (
      <div ref={ref} className="mx-auto w-full max-w-[520px] overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-gray-200">
        <div className="relative overflow-hidden bg-[#111827] px-5 py-6 text-white sm:px-7 sm:py-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-300 via-sky-300 to-amber-300" />
          <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">Brain Index</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">오늘의 두뇌 나이</h2>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black ring-1 ring-white/20">
              {grade.grade}
            </div>
          </div>

          <div className="relative mt-6 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-end gap-1">
                <span className="text-7xl font-black leading-none tracking-tight">{result.brainAge}</span>
                <span className="mb-2 text-2xl font-bold text-white/70">세</span>
              </div>
              <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold ring-1 ring-white/15">
                {isYounger ? `실제보다 ${ageDiff}세 젊게 측정` : ageDiff === 0 ? '실제 나이와 동일' : `실제보다 ${Math.abs(ageDiff)}세 높게 측정`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50">또래 대비</p>
              <p className="text-3xl font-black text-emerald-200">상위 {Math.max(1, 100 - result.percentile)}%</p>
              {isNewBest && <p className="mt-2 text-xs font-bold text-amber-200">개인 최고 기록</p>}
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-[88px_1fr] items-center gap-4 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${grade.bar} text-3xl font-black text-white shadow-lg shadow-gray-900/10`}>
              {grade.grade}
            </div>
            <div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-gray-950">{result.totalScore}</span>
                <span className="mb-1 text-sm font-bold text-gray-400">/100</span>
              </div>
              <p className={`text-sm font-bold ${grade.tone}`}>{grade.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">세 영역을 종합해 산출한 오늘의 컨디션 점수입니다.</p>
            </div>
          </div>

          <div className="space-y-3">
            {categories.map((cat, index) => (
              <div key={cat.name} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg">{cat.icon}</span>
                    <span className="text-sm font-black text-gray-800">{cat.name}</span>
                  </div>
                  <span className="text-xl font-black text-gray-950">{cat.score}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all ease-out`}
                    style={{
                      width: animated ? `${cat.score}%` : '0%',
                      transitionDuration: `${850 + index * 170}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-[#f8fafc] p-4 ring-1 ring-gray-100">
            <p className="text-sm font-black text-gray-900">{advice.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{advice.body}</p>
          </div>

          {streak > 0 && (
            <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
              <div>
                <p className="text-sm font-black text-amber-800">{streak}일 연속 훈련</p>
                <p className="text-xs text-amber-700/75">기록은 기기 안에 안전하게 저장됩니다.</p>
              </div>
              <div className="text-2xl">🔥</div>
            </div>
          )}

          {history.length >= 2 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">최근 기록</p>
                <p className="text-xs text-gray-400">{history.length}회</p>
              </div>
              <div className="flex h-24 items-end gap-2 rounded-2xl bg-gray-50 p-3">
                {history.map((day, index) => {
                  const height = Math.max(8, day.totalScore)
                  const isToday = index === history.length - 1
                  return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                      <span className={`text-[10px] font-bold ${isToday ? 'text-emerald-600' : 'text-gray-400'}`}>{day.totalScore}</span>
                      <div
                        className={`w-full rounded-t-lg ${isToday ? 'bg-gradient-to-t from-emerald-500 to-lime-300' : 'bg-gray-300'}`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[9px] text-gray-400">{isToday ? '오늘' : day.date.slice(5)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 text-center">
            <p className="text-[11px] font-medium text-gray-400">retireplan.kr · Brain Training Report</p>
          </div>
        </div>
      </div>
    )
  }
)

export default ResultCard

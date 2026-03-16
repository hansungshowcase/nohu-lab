'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, ELEMENTS,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  MISSING_ELEMENT_ADVICE,
  getYearFortune,
  getDaeunInterpretation,
} from './sajuData'

interface Props {
  result: SajuResult
}

const BAR_COLORS: Record<number, string> = {
  5: 'bg-emerald-500',
  4: 'bg-green-400',
  3: 'bg-yellow-400',
  2: 'bg-orange-400',
  1: 'bg-red-400',
}

const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster] || DAY_MASTER_PROFILES[0]
  const strength = result.isDayMasterStrong ? STRENGTH_INTERPRETATIONS.strong : STRENGTH_INTERPRETATIONS.weak
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear())
  const maxEl = result.elementCounts.length > 0 ? Math.max(...result.elementCounts) : 1
  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - result.birthYear

  return (
    <div ref={ref} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">

      {/* ═══ 헤더 ═══ */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{profile.emoji}</div>
          <div className="flex-1">
            <p className="text-indigo-300 text-[9px]">노후연구소 AI 사주풀이</p>
            <h2 className="text-sm font-bold leading-tight mt-0.5">
              {STEMS[result.dayMaster]}({STEMS_HANJA[result.dayMaster]}) · {profile.element} · {profile.nature}
            </h2>
            <p className="text-indigo-200 text-[11px] mt-0.5">
              {strength.emoji} {strength.label} — {strength.description}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-indigo-200">
          <span>
            {result.birthYear}.{result.birthMonth}.{result.birthDay}
            {result.birthHour !== null ? ` ${result.birthHour}시` : ''} · {result.gender === 'male' ? '남' : '여'} · {result.animal}띠
          </span>
          <span>{profile.personality.map(k => `#${k}`).join(' ')}</span>
        </div>
        <p className="text-[10px] text-indigo-100 mt-1.5 bg-indigo-500/30 rounded-lg px-2 py-1">
          💡 {strength.advice}
        </p>
      </div>

      <div className="px-3.5 py-2.5 space-y-2">

        {/* ═══ 올해 운세 ═══ */}
        <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-100">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-800">🗓️ {currentYear}년 운세</h3>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`text-base ${i < fortune.stars ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
          </div>
          <div className="text-xs font-bold text-purple-700 mb-0.5">{fortune.title}</div>
          <p className="text-[11px] text-gray-700 leading-relaxed">{fortune.description}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">💡 {fortune.advice}</p>
        </section>

        {/* ═══ 재물·연애·직업·건강 2×2 ═══ */}
        <section>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-yellow-50 rounded-lg p-2.5 border border-yellow-100">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm">💰</span>
                <span className="text-[11px] font-bold text-gray-800">재물운</span>
              </div>
              <p className="text-[10px] text-gray-700 leading-relaxed">{strength.money}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-2.5 border border-pink-100">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm">❤️</span>
                <span className="text-[11px] font-bold text-gray-800">연애운</span>
              </div>
              <p className="text-[10px] text-gray-700 leading-relaxed">{profile.loveStyle}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm">💼</span>
                <span className="text-[11px] font-bold text-gray-800">적합 직업</span>
              </div>
              <p className="text-[10px] text-gray-700 leading-relaxed">{profile.careerFit.join(', ')}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2.5 border border-green-100">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm">🏥</span>
                <span className="text-[11px] font-bold text-gray-800">건강 주의</span>
              </div>
              <p className="text-[10px] text-gray-700 leading-relaxed">{profile.healthTip}</p>
            </div>
          </div>
        </section>

        {/* ═══ 조심할 것 ═══ */}
        <section className="bg-red-50 rounded-lg p-2.5 border border-red-200">
          <h3 className="text-xs font-bold text-red-700 mb-1">⚠️ 이것만은 조심하세요</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {profile.weaknesses.map(w => (
              <span key={w} className="text-[11px] text-red-600">• {w}</span>
            ))}
          </div>
          {result.missingElements.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-red-200 space-y-1">
              {result.missingElements.map(i => (
                <div key={i}>
                  <span className="text-[10px] font-medium text-amber-700">
                    ⚠️ {MISSING_ELEMENT_ADVICE[i].title}
                  </span>
                  <span className="text-[10px] text-amber-600 ml-1">
                    — {MISSING_ELEMENT_ADVICE[i].items.slice(0, 2).join(' · ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ 인생 대운 그래프 ═══ */}
        <section>
          <h3 className="text-xs font-bold text-gray-800 mb-1.5">📈 인생 운세 흐름</h3>
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
            <div className="flex items-end gap-1.5" style={{ height: 80 }}>
              {result.daeun.map((d, i) => {
                const interp = getDaeunInterpretation(d.tenGod)
                const isCurrent = currentAge >= d.startAge && currentAge <= d.endAge
                const barHeight = (interp.stars / 5) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5" style={{ height: '100%', justifyContent: 'flex-end' }}>
                    <span className="text-[9px] leading-none">{interp.emoji}</span>
                    <div
                      className={`w-full rounded-t-md ${BAR_COLORS[interp.stars]} ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1' : 'opacity-80'}`}
                      style={{ height: `${barHeight}%`, minHeight: 4 }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex gap-1.5 mt-1">
              {result.daeun.map((d, i) => {
                const isCurrent = currentAge >= d.startAge && currentAge <= d.endAge
                return (
                  <div key={i} className={`flex-1 text-center text-[8px] ${isCurrent ? 'text-indigo-700 font-bold' : 'text-gray-400'}`}>
                    {d.startAge}세
                  </div>
                )
              })}
            </div>
            {result.daeun.map((d, i) => {
              const isCurrent = currentAge >= d.startAge && currentAge <= d.endAge
              if (!isCurrent) return null
              const interp = getDaeunInterpretation(d.tenGod)
              return (
                <div key={i} className="mt-1.5 bg-indigo-50 rounded-lg p-2 border border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-700">
                    {interp.emoji} 현재 ({d.startAge}~{d.endAge}세) — {interp.title}
                  </p>
                  <p className="text-[10px] text-indigo-600 leading-relaxed mt-0.5">{interp.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ═══ 오행 + 행운 ═══ */}
        <section className="flex gap-3">
          <div className="flex-1">
            <h3 className="text-[11px] font-bold text-gray-700 mb-1">☯️ 오행 밸런스</h3>
            <div className="space-y-0.5">
              {ELEMENTS.map((el, i) => {
                const pct = maxEl > 0 ? (result.elementCounts[i] / maxEl) * 100 : 0
                const colors = ['bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-gray-400', 'bg-blue-500']
                const emojis = ['🌳', '🔥', '🏔️', '⚔️', '💧']
                return (
                  <div key={el} className="flex items-center gap-1">
                    <span className="text-[9px] w-3.5">{emojis[i]}</span>
                    <span className="text-[9px] w-3 text-gray-500">{el}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${colors[i]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="w-[130px]">
            <h3 className="text-[11px] font-bold text-gray-700 mb-1">🍀 행운 키워드</h3>
            <div className="space-y-0 text-[10px] text-gray-600">
              <div>🎨 {profile.luckyColor} · 🔢 {profile.luckyNumber}</div>
              <div>🧭 {profile.luckyDirection}</div>
            </div>
          </div>
        </section>

        {/* ═══ 푸터 ═══ */}
        <div className="text-center pt-0.5">
          <p className="text-[8px] text-gray-300">노후연구소 AI 사주풀이 · nohu-lab.vercel.app · 재미로 봐주세요</p>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA,
  Pillar,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  getYearFortune,
  getDaeunInterpretation,
  SHINSAL_DATA,
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
  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - result.birthYear

  return (
    <div ref={ref} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">

      {/* ═══ 헤더 ═══ */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 sm:px-6 py-5 sm:py-6 text-white">
        <div className="flex items-center gap-3">
          <div className="text-4xl sm:text-5xl">{profile.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="text-indigo-200 text-xs sm:text-sm">노후연구소 AI 사주풀이</p>
            <h2 className="text-lg sm:text-xl font-bold leading-tight mt-0.5">
              {profile.title}
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base mt-0.5">
              {STEMS[result.dayMaster]}({STEMS_HANJA[result.dayMaster]}) · {profile.element} · {strength.label}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2.5 text-xs sm:text-sm text-indigo-100">
          <span>
            {result.birthYear}.{result.birthMonth}.{result.birthDay}
            {result.birthHour !== null ? ` ${result.birthHour}시` : ''} · {result.gender === 'male' ? '남' : '여'} · {result.animal}띠
          </span>
          <span className="truncate ml-2">{profile.personality.map(k => `#${k}`).join(' ')}</span>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-4 sm:space-y-5">

        {/* ═══ 올해 운세 ═══ */}
        <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-5 border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">🗓️ {currentYear}년 나의 운세</h3>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`text-lg sm:text-xl ${i < fortune.stars ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
          </div>
          <div className="text-sm sm:text-base font-bold text-purple-700 mb-1">{fortune.title}</div>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{fortune.description}</p>
          <p className="text-sm sm:text-base text-purple-700 font-medium mt-2">💡 {fortune.advice}</p>
        </section>

        {/* ═══ 재물운 ═══ */}
        <section className="bg-yellow-50 rounded-xl p-4 sm:p-5 border border-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg sm:text-xl">💰</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">재물운</h3>
          </div>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{strength.money}</p>
        </section>

        {/* ═══ 연애운 ═══ */}
        <section className="bg-pink-50 rounded-xl p-4 sm:p-5 border border-pink-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg sm:text-xl">❤️</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">연애운</h3>
          </div>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{profile.loveStyle}</p>
        </section>

        {/* ═══ 건강 주의 ═══ */}
        <section className="bg-green-50 rounded-xl p-4 sm:p-5 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg sm:text-xl">🏥</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">건강 주의</h3>
          </div>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{profile.healthTip}</p>
        </section>

        {/* ═══ 조심할 것 ═══ */}
        <section className="bg-red-50 rounded-xl p-4 sm:p-5 border border-red-200">
          <h3 className="text-base sm:text-lg font-bold text-red-800 mb-2">⚠️ 이것만은 조심하세요</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {profile.weaknesses.map(w => (
              <span key={w} className="text-sm sm:text-base text-red-700">• {w}</span>
            ))}
          </div>
        </section>

        {/* ═══ 신살(神殺) ═══ */}
        {result.shinsal.length > 0 && (
          <section className="bg-violet-50/60 rounded-xl p-4 sm:p-5 border border-violet-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">🔮 나의 신살(神殺)</h3>
            <div className="flex flex-wrap gap-2.5">
              {result.shinsal.map(name => {
                const info = SHINSAL_DATA[name]
                if (!info) return null
                return (
                  <div
                    key={name}
                    className="inline-flex items-center gap-2 bg-white rounded-full px-3.5 py-2 border border-violet-200 shadow-sm"
                  >
                    <span className="text-lg sm:text-xl">{info.emoji}</span>
                    <span className="text-sm sm:text-base font-bold text-indigo-800">{info.title}</span>
                    <span className="text-xs sm:text-sm text-violet-700">{info.shortDesc}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ═══ 인생 운세 흐름 (대운) ═══ */}
        <section>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">📈 앞으로의 인생 흐름</h3>
          <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
            <div className="flex items-end gap-2 sm:gap-2.5" style={{ height: 100 }}>
              {result.daeun.map((d, i) => {
                const interp = getDaeunInterpretation(d.tenGod)
                const isCurrent = currentAge >= d.startAge && currentAge <= d.endAge
                const barHeight = (interp.stars / 5) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5" style={{ height: '100%', justifyContent: 'flex-end' }}>
                    <span className="text-xs sm:text-sm leading-none">{interp.emoji}</span>
                    <div
                      className={`w-full rounded-t-lg ${BAR_COLORS[interp.stars]} ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1' : 'opacity-70'}`}
                      style={{ height: `${barHeight}%`, minHeight: 6 }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2 sm:gap-2.5 mt-2">
              {result.daeun.map((d, i) => {
                const isCurrent = currentAge >= d.startAge && currentAge <= d.endAge
                return (
                  <div key={i} className={`flex-1 text-center text-xs sm:text-sm ${isCurrent ? 'text-indigo-700 font-bold' : 'text-gray-700'}`}>
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
                <div key={i} className="mt-3 bg-indigo-50 rounded-lg p-3 sm:p-4 border border-indigo-100">
                  <p className="text-sm sm:text-base font-bold text-indigo-700">
                    {interp.emoji} 지금 ({d.startAge}~{d.endAge}세) — {interp.title}
                  </p>
                  <p className="text-sm sm:text-base text-indigo-700 leading-relaxed mt-1">{interp.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ═══ 푸터 ═══ */}
        <div className="text-center pt-1">
          <p className="text-xs sm:text-sm text-gray-700">노후연구소 AI 사주풀이 · nohu-lab.vercel.app · 재미로 봐주세요</p>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA,
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
  5: 'bg-amber-500',
  4: 'bg-amber-400',
  3: 'bg-amber-300',
  2: 'bg-amber-200',
  1: 'bg-amber-100',
}

/* ── 순차 fade-in 애니메이션용 인라인 스타일 ── */
const fadeStyle = (index: number): React.CSSProperties => ({
  opacity: 0,
  animation: `sajuFadeUp 0.5s ease-out ${index * 0.12}s forwards`,
})

const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster] || DAY_MASTER_PROFILES[0]
  const strength = result.isDayMasterStrong ? STRENGTH_INTERPRETATIONS.strong : STRENGTH_INTERPRETATIONS.weak
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear())
  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - result.birthYear

  let sectionIdx = 0

  return (
    <div ref={ref} className="bg-[#faf8f5] rounded-2xl overflow-hidden shadow-xl border border-amber-100/60">

      {/* keyframes 정의 */}
      <style>{`
        @keyframes sajuFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ═══ 헤더 ═══ */}
      <div
        className="relative px-5 sm:px-7 py-6 sm:py-7 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          ...fadeStyle(sectionIdx++),
        }}
      >
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-400/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-amber-400/5 translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center gap-4">
          <div className="text-4xl sm:text-5xl flex-shrink-0 drop-shadow-lg">{profile.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-300/80 text-xs sm:text-sm tracking-widest font-medium">
              노후연구소 AI 사주풀이
            </p>
            <h2 className="text-lg sm:text-xl font-bold leading-tight mt-1 text-amber-50">
              {profile.title}
            </h2>
            <p className="text-amber-200/90 text-sm sm:text-base mt-1">
              {STEMS[result.dayMaster]}({STEMS_HANJA[result.dayMaster]}) · {profile.element} · {strength.label}
            </p>
          </div>
        </div>
        <div className="relative flex items-center justify-between mt-3 text-sm text-amber-200/80">
          <span>
            {result.birthYear}.{result.birthMonth}.{result.birthDay}
            {result.birthHour !== null ? ` ${result.birthHour}시` : ''} · {result.gender === 'male' ? '남' : '여'} · {result.animal}띠
          </span>
        </div>
      </div>

      <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4">

        {/* ═══ 올해 운세 (가장 큰 섹션) ═══ */}
        <section
          className="rounded-xl p-5 sm:p-6 border border-amber-200/60"
          style={{
            background: 'linear-gradient(135deg, #fffbf0 0%, #fff7e6 100%)',
            ...fadeStyle(sectionIdx++),
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              🗓️ {currentYear}년 운세
            </h3>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className="text-xl"
                  style={{ color: i < fortune.stars ? '#f59e0b' : '#d1d5db' }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="text-base font-bold text-amber-800 mb-2">{fortune.title}</div>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{fortune.description}</p>
          <div className="mt-3 bg-amber-100/50 rounded-lg px-4 py-3 border border-amber-200/40">
            <p className="text-sm sm:text-base text-amber-900 font-semibold">💡 올해의 조언</p>
            <p className="text-sm sm:text-base text-gray-800 mt-1 leading-relaxed">{fortune.advice}</p>
          </div>
        </section>

        {/* ═══ 재물운 ═══ */}
        <section
          className="rounded-xl p-5 sm:p-6 border border-yellow-200/60 bg-[#fffef8]"
          style={fadeStyle(sectionIdx++)}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xl">💰</span>
            <h3 className="text-lg font-bold text-gray-900">재물운</h3>
          </div>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{strength.money}</p>
        </section>

        {/* ═══ 연애/결혼운 ═══ */}
        <section
          className="rounded-xl p-5 sm:p-6 border border-rose-200/60 bg-[#fff9f9]"
          style={fadeStyle(sectionIdx++)}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xl">❤️</span>
            <h3 className="text-lg font-bold text-gray-900">연애·결혼운</h3>
          </div>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{profile.loveStyle}</p>
        </section>

        {/* ═══ 건강 주의 ═══ */}
        <section
          className="rounded-xl p-5 sm:p-6 border border-orange-200/60 bg-[#fff8f0]"
          style={fadeStyle(sectionIdx++)}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xl">🏥</span>
            <h3 className="text-lg font-bold text-gray-900">건강 주의</h3>
          </div>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{profile.healthTip}</p>
        </section>

        {/* ═══ 조심할 것 ═══ */}
        <section
          className="rounded-xl p-5 sm:p-6 border border-red-200 bg-red-50/70"
          style={fadeStyle(sectionIdx++)}
        >
          <h3 className="text-lg font-bold text-red-900 mb-3">⚠️ 이것만은 조심하세요</h3>
          <div className="space-y-1.5">
            {profile.weaknesses.map(w => (
              <div key={w} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5 flex-shrink-0">●</span>
                <span className="text-sm sm:text-base text-red-800">{w}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 신살(神殺) ═══ */}
        {result.shinsal.length > 0 && (
          <section
            className="rounded-xl p-5 sm:p-6 border border-orange-200/60 bg-orange-50/40"
            style={fadeStyle(sectionIdx++)}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3">🔮 나의 신살(神殺)</h3>
            <div className="space-y-2.5">
              {result.shinsal.map(name => {
                const info = SHINSAL_DATA[name]
                if (!info) return null
                return (
                  <div
                    key={name}
                    className="flex items-start gap-3 bg-white/70 rounded-lg px-4 py-3 border border-orange-100"
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{info.emoji}</span>
                    <div>
                      <span className="text-base font-bold text-orange-900">{info.title}</span>
                      <span className="text-sm text-orange-700 ml-2">{info.shortDesc}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ═══ 인생 흐름 그래프 (대운) ═══ */}
        <section style={fadeStyle(sectionIdx++)}>
          <h3 className="text-lg font-bold text-gray-900 mb-3">📈 인생 흐름</h3>
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200">
            {/* 바 차트 */}
            <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 90 }}>
              {result.daeun.map((d, i) => {
                const interp = getDaeunInterpretation(d.tenGod)
                const isCurrent = currentAge >= d.startAge && currentAge <= d.endAge
                const barHeight = (interp.stars / 5) * 100
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-0.5"
                    style={{ height: '100%', justifyContent: 'flex-end' }}
                  >
                    <span className="text-xs sm:text-sm leading-none">{interp.emoji}</span>
                    <div
                      className={`w-full rounded-t-md ${BAR_COLORS[interp.stars]} transition-all ${
                        isCurrent
                          ? 'ring-2 ring-amber-600 ring-offset-1 shadow-md'
                          : 'opacity-60'
                      }`}
                      style={{ height: `${barHeight}%`, minHeight: 6 }}
                    />
                  </div>
                )
              })}
            </div>
            {/* 나이 라벨 */}
            <div className="flex gap-1.5 sm:gap-2 mt-2">
              {result.daeun.map((d, i) => {
                const isCurrent = currentAge >= d.startAge && currentAge <= d.endAge
                return (
                  <div
                    key={i}
                    className={`flex-1 text-center text-xs sm:text-sm ${
                      isCurrent ? 'text-amber-800 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {d.startAge}세
                  </div>
                )
              })}
            </div>
            {/* 현재 대운 해석 */}
            {result.daeun.map((d, i) => {
              const isCurrent = currentAge >= d.startAge && currentAge <= d.endAge
              if (!isCurrent) return null
              const interp = getDaeunInterpretation(d.tenGod)
              return (
                <div
                  key={i}
                  className="mt-3 rounded-lg p-4 border border-amber-200/60"
                  style={{ background: 'linear-gradient(135deg, #fffbf0, #fff7e6)' }}
                >
                  <p className="text-base font-bold text-amber-900">
                    {interp.emoji} 지금 ({d.startAge}~{d.endAge}세) — {interp.title}
                  </p>
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed mt-1.5">
                    {interp.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ═══ 푸터 ═══ */}
        <div className="text-center pt-2 pb-1" style={fadeStyle(sectionIdx++)}>
          <div className="inline-block bg-orange-50 rounded-full px-4 py-1.5">
            <p className="text-xs text-orange-700">
              노후연구소 AI 사주풀이 · nohu-lab.vercel.app · 재미로 봐주세요
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

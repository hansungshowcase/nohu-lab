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

/* ── 순차 fade-in 애니메이션 ── */
const fadeStyle = (index: number): React.CSSProperties => ({
  opacity: 0,
  animation: `sajuFadeUp 0.5s ease-out ${index * 0.12}s forwards`,
})

/* ── 바 그래프 레벨 라벨 ── */
const LEVEL_LABELS: Record<number, string> = {
  1: '위험',
  2: '주의',
  3: '보통',
  4: '양호',
  5: '최고',
}

/* ── 수평 바 그래프 컴포넌트 (인바디 스타일) ── */
function HorizontalBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100
  const label = LEVEL_LABELS[value] || '보통'
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-5 bg-orange-100 rounded-full overflow-hidden relative">
        {/* 5단계 구분선 */}
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-orange-200/60"
            style={{ left: `${(i / max) * 100}%` }}
          />
        ))}
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #fb923c, #f97316, #ea580c)',
          }}
        />
      </div>
      <span className="text-sm font-bold text-orange-700 w-10 text-right">{label}</span>
    </div>
  )
}

/* ── 섹션 구분선 ── */
function Divider() {
  return <div className="border-t border-orange-200/50 my-1" />
}

/* ── 섹션 헤더 (인바디 스타일 - 번호 뱃지 + 제목 + 가로선) ── */
function SectionHeader({ title, number }: { title: string; number: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center justify-center w-7 h-7 rounded bg-orange-500 text-white text-sm font-bold flex-shrink-0">
        {number}
      </div>
      <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
      <div className="flex-1 h-px bg-orange-200" />
    </div>
  )
}

const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster] || DAY_MASTER_PROFILES[0]
  const strength = result.isDayMasterStrong ? STRENGTH_INTERPRETATIONS.strong : STRENGTH_INTERPRETATIONS.weak
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear())
  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - result.birthYear

  // 운세 지수 (별점 x 20 = 100점 만점)
  const fortuneScore = fortune.stars * 20

  // 분야별 운세 별점 계산
  const moneyStars = Math.max(1, Math.min(5, fortune.stars + (result.isDayMasterStrong ? 0 : -1) + (result.dayMasterElement === 2 ? 1 : 0)))
  const loveStars = Math.max(1, Math.min(5, fortune.stars + (result.shinsal.includes('도화살') ? 1 : 0)))
  const healthStars = Math.max(1, Math.min(5, fortune.stars + (result.isDayMasterStrong ? 1 : -1)))

  let sectionIdx = 0

  return (
    <div ref={ref} className="bg-white rounded-xl overflow-hidden shadow-xl border border-orange-200/60 max-w-2xl mx-auto">

      {/* keyframes */}
      <style>{`
        @keyframes sajuFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ═══ 상단 헤더 (오렌지 그라데이션) ═══ */}
      <div
        className="relative px-5 sm:px-8 py-6 sm:py-8 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
          ...fadeStyle(sectionIdx++),
        }}
      >
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          {/* 제목 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded px-2.5 py-1">
              <span className="text-base sm:text-lg font-bold tracking-wider">四柱命理</span>
            </div>
            <span className="text-orange-100 text-sm sm:text-base font-medium">분석 리포트</span>
          </div>

          {/* 프로필 */}
          <div className="flex items-center gap-4">
            <div className="text-4xl sm:text-5xl flex-shrink-0 drop-shadow-lg bg-white/10 rounded-xl w-16 h-16 flex items-center justify-center">
              {profile.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight text-white">
                {profile.title}
              </h2>
              <p className="text-orange-100 text-sm sm:text-base mt-1 font-medium">
                {STEMS[result.dayMaster]}({STEMS_HANJA[result.dayMaster]}) · {profile.element} · {strength.label}
              </p>
            </div>
          </div>

          {/* 개인정보 바 */}
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-orange-50">
            <span>{result.birthYear}.{result.birthMonth}.{result.birthDay}{result.birthHour !== null ? ` ${result.birthHour}시` : ''}</span>
            <span>·</span>
            <span>{result.gender === 'male' ? '남성' : '여성'}</span>
            <span>·</span>
            <span>{result.animal}띠</span>
            <span>·</span>
            <span>만 {currentAge}세</span>
          </div>
        </div>
      </div>

      {/* ═══ 본문 ═══ */}
      <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-6">

        {/* ═══ 섹션 1: 올해 운세 종합 (인바디 종합점수) ═══ */}
        <section style={fadeStyle(sectionIdx++)}>
          <SectionHeader title={`${currentYear}년 운세 종합`} number={1} />

          <div className="bg-orange-50/60 rounded-xl p-5 sm:p-6 border border-orange-100">
            {/* 큰 점수 + 바 그래프 */}
            <div className="flex items-center gap-5 mb-4">
              <div className="text-center flex-shrink-0">
                <div className="text-4xl sm:text-5xl font-black text-orange-600 leading-none">
                  {fortuneScore}
                </div>
                <div className="text-sm font-bold text-orange-500 mt-1">/ 100점</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-bold text-gray-900 mb-2">{fortune.title}</div>
                <div className="h-6 bg-orange-100 rounded-full overflow-hidden relative">
                  {[20, 40, 60, 80].map(v => (
                    <div key={v} className="absolute top-0 bottom-0 w-px bg-orange-200/80" style={{ left: `${v}%` }} />
                  ))}
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${fortuneScore}%`,
                      background: 'linear-gradient(90deg, #fdba74, #f97316, #ea580c)',
                      transition: 'width 1s ease-out',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-700 mt-1 px-0.5">
                  <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
                </div>
              </div>
            </div>

            {/* 설명 */}
            <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-3">{fortune.description}</p>

            {/* 조언 */}
            <div className="bg-white rounded-lg px-4 py-3 border border-orange-200/60">
              <p className="text-sm font-bold text-orange-800 mb-1">올해의 조언</p>
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{fortune.advice}</p>
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══ 섹션 2: 분야별 운세 (인바디 체성분분석) ═══ */}
        <section style={fadeStyle(sectionIdx++)}>
          <SectionHeader title="분야별 운세 분석" number={2} />

          <div className="space-y-5">
            {/* 재물운 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💰</span>
                <span className="text-base font-bold text-gray-900">재물운</span>
              </div>
              <HorizontalBar value={moneyStars} />
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed mt-3">{strength.money}</p>
            </div>

            {/* 연애운 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💕</span>
                <span className="text-base font-bold text-gray-900">연애·결혼운</span>
              </div>
              <HorizontalBar value={loveStars} />
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed mt-3">{profile.loveStyle}</p>
            </div>

            {/* 건강운 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏥</span>
                <span className="text-base font-bold text-gray-900">건강운</span>
              </div>
              <HorizontalBar value={healthStars} />
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed mt-3">{profile.healthTip}</p>
            </div>
          </div>

          {/* 범례 */}
          <div className="flex items-center justify-center gap-1 mt-4 text-xs text-gray-700">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-1 px-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: `rgba(249, 115, 22, ${i * 0.2})`,
                  }}
                />
                <span>{LEVEL_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ═══ 섹션 3: 조심할 것 ═══ */}
        <section style={fadeStyle(sectionIdx++)}>
          <SectionHeader title="주의사항" number={3} />

          <div className="bg-red-50/60 rounded-xl p-4 sm:p-5 border border-red-200/60">
            <div className="space-y-2">
              {profile.weaknesses.map(w => (
                <div key={w} className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-800 leading-relaxed">{w}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 섹션 4: 신살 (있을 때만) ═══ */}
        {result.shinsal.length > 0 && (
          <>
            <Divider />
            <section style={fadeStyle(sectionIdx++)}>
              <SectionHeader title="신살(神殺)" number={4} />

              <div className="flex flex-wrap gap-2">
                {result.shinsal.map(name => {
                  const info = SHINSAL_DATA[name]
                  if (!info) return null
                  return (
                    <div
                      key={name}
                      className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2"
                    >
                      <span className="text-lg">{info.emoji}</span>
                      <div>
                        <span className="text-sm font-bold text-orange-900">{info.title}</span>
                        <span className="text-sm text-orange-700 ml-1.5">{info.shortDesc}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}

        <Divider />

        {/* ═══ 섹션 5: 인생 흐름 그래프 (대운 바 차트) ═══ */}
        <section style={fadeStyle(sectionIdx++)}>
          <SectionHeader title="인생 흐름 그래프" number={result.shinsal.length > 0 ? 5 : 4} />

          <div className="bg-orange-50/40 rounded-xl p-4 sm:p-5 border border-orange-100">
            {/* 바 차트 */}
            <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 100 }}>
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
                      className={`w-full rounded-t-md transition-all ${
                        isCurrent
                          ? 'ring-2 ring-orange-600 ring-offset-1 shadow-md'
                          : 'opacity-50'
                      }`}
                      style={{
                        height: `${barHeight}%`,
                        minHeight: 6,
                        background: isCurrent
                          ? 'linear-gradient(180deg, #f97316, #ea580c)'
                          : 'linear-gradient(180deg, #fdba74, #fb923c)',
                      }}
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
                      isCurrent ? 'text-orange-800 font-bold' : 'text-gray-700'
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
                  className="mt-4 bg-white rounded-lg p-4 border border-orange-200/60"
                >
                  <p className="text-base font-bold text-orange-900">
                    {interp.emoji} 현재 시기 ({d.startAge}~{d.endAge}세) — {interp.title}
                  </p>
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed mt-1.5">
                    {interp.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

      </div>

      {/* ═══ 하단 푸터 (오렌지 배경 워터마크) ═══ */}
      <div
        className="px-5 sm:px-8 py-4 text-center"
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          ...fadeStyle(sectionIdx++),
        }}
      >
        <p className="text-sm text-white/90 font-medium">
          노후연구소 AI 사주풀이 · nohu-lab.vercel.app
        </p>
        <p className="text-xs text-white/60 mt-0.5">
          본 분석은 재미 목적이며 전문 상담을 대체하지 않습니다
        </p>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

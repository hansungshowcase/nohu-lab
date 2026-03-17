'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES, BRANCHES_HANJA,
  ELEMENTS, getElementEmoji, pillarToString, pillarToHanja, Pillar,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  MISSING_ELEMENT_ADVICE, USEFUL_GOD_TIPS,
  getYearFortune, getViralSummary, getCompatibilityHint,
} from './sajuData'

interface Props {
  result: SajuResult
}

function PillarDisplay({ label, pillar, tenGod }: { label: string; pillar: Pillar; tenGod?: string }) {
  const stemEl = STEM_ELEMENT[pillar.stem]
  const branchEl = BRANCH_ELEMENT[pillar.branch]
  const stemColors = ['text-green-600','text-red-500','text-yellow-600','text-gray-500','text-blue-500']
  const branchColors = ['text-green-600','text-red-500','text-yellow-600','text-gray-500','text-blue-500']

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-gray-400">{label}</span>
      {tenGod && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{tenGod}</span>}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-2 w-16 text-center shadow-sm">
        <div className={`text-2xl font-bold ${stemColors[stemEl]}`}>
          {STEMS_HANJA[pillar.stem]}
        </div>
        <div className="text-[10px] text-gray-400 my-0.5">{STEMS[pillar.stem]}({ELEMENTS[stemEl]})</div>
        <div className="border-t border-gray-100 my-1" />
        <div className={`text-2xl font-bold ${branchColors[branchEl]}`}>
          {BRANCHES_HANJA[pillar.branch]}
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">{BRANCHES[pillar.branch]}({ELEMENTS[branchEl]})</div>
      </div>
    </div>
  )
}

function ElementBar({ element, count, max, idx }: { element: string; count: number; max: number; idx: number }) {
  const colors = ['bg-green-500','bg-red-500','bg-yellow-500','bg-gray-400','bg-blue-500']
  const emojis = ['🌳','🔥','🏔️','⚔️','💧']
  const pct = max > 0 ? (count / max) * 100 : 0

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-6">{emojis[idx]}</span>
      <span className="text-sm w-8 text-gray-600">{element}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[idx]} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm w-8 text-right text-gray-500">{count.toFixed(1)}</span>
    </div>
  )
}

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="text-yellow-400">
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </span>
  )
}

const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const strength = result.isDayMasterStrong
    ? STRENGTH_INTERPRETATIONS.strong
    : STRENGTH_INTERPRETATIONS.weak
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear())
  const viralSummary = getViralSummary(result.dayMaster, result.isDayMasterStrong)
  const maxEl = Math.max(...result.elementCounts)
  const usefulGodTip = USEFUL_GOD_TIPS[result.usefulGod]

  const hasHourPillar = result.hourPillar !== null && result.hourPillar !== undefined
  const pillars: { label: string; pillar: Pillar; tenGod?: string; hidden?: boolean }[] = [
    { label: '시주(時柱)', pillar: result.hourPillar || { stem: 0, branch: 0 }, tenGod: result.tenGods[3] || '', hidden: !hasHourPillar },
    { label: '일주(日柱)', pillar: result.dayPillar, tenGod: '나' },
    { label: '월주(月柱)', pillar: result.monthPillar, tenGod: result.tenGods[1] },
    { label: '년주(年柱)', pillar: result.yearPillar, tenGod: result.tenGods[0] },
  ]

  return (
    <div ref={ref} className="bg-gradient-to-b from-indigo-50 via-white to-purple-50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-center text-white">
        <p className="text-indigo-200 text-xs mb-1">노후연구소 사주풀이</p>
        <div className="text-4xl mb-2">{profile.emoji}</div>
        <h2 className="text-xl font-bold">{profile.title}</h2>
        <p className="text-indigo-200 text-sm mt-1">{viralSummary}</p>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* 사주팔자 표시 */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            📋 나의 사주팔자
          </h3>
          <div className="flex justify-center gap-2">
            {pillars.map((p, i) => (
              result.hourPillar || i > 0 ? (
                <PillarDisplay key={i} label={p.label} pillar={p.pillar} tenGod={p.tenGod} />
              ) : (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400">{p.label}</span>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">-</span>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-2 w-16 text-center">
                    <div className="text-2xl text-gray-300">?</div>
                    <div className="text-[10px] text-gray-300 my-0.5">시간</div>
                    <div className="border-t border-gray-100 my-1" />
                    <div className="text-2xl text-gray-300">?</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">미입력</div>
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-gray-400">
              {result.birthYear}년 {result.birthMonth}월 {result.birthDay}일
              {result.birthHour !== null ? ` ${result.birthHour}시` : ''} 생 · {result.animal}띠 · {result.gender === 'male' ? '남' : '여'}
            </span>
          </div>
        </div>

        {/* 일간 성격 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            🧬 일간(日干) 분석 — {STEMS[result.dayMaster]}{profile.element}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{profile.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.personality.map(k => (
              <span key={k} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full">#{k}</span>
            ))}
          </div>
        </div>

        {/* 신강/신약 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            {strength.emoji} {strength.label}
          </h3>
          <p className="text-sm text-gray-600">{strength.description}</p>
          <p className="text-sm text-purple-600 mt-2 font-medium">{strength.advice}</p>
        </div>

        {/* 오행 밸런스 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            ☯️ 오행 밸런스
          </h3>
          <div className="space-y-2">
            {ELEMENTS.map((el, i) => (
              <ElementBar key={el} element={el} count={result.elementCounts[i]} max={maxEl} idx={i} />
            ))}
          </div>
          {result.missingElements.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700 font-medium">
                ⚠️ 부족한 오행: {result.missingElements.map(i => `${getElementEmoji(i)} ${ELEMENTS[i]}`).join(', ')}
              </p>
              {result.missingElements.map(i => (
                <div key={i} className="mt-2">
                  <ul className="text-xs text-amber-600 space-y-0.5">
                    {MISSING_ELEMENT_ADVICE[i].items.map((item, j) => (
                      <li key={j}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 강점 & 약점 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-xl p-3">
            <h4 className="text-xs font-bold text-green-700 mb-2">💪 강점</h4>
            <ul className="text-xs text-green-600 space-y-1">
              {profile.strengths.map(s => <li key={s}>✓ {s}</li>)}
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <h4 className="text-xs font-bold text-red-700 mb-2">⚡ 주의점</h4>
            <ul className="text-xs text-red-600 space-y-1">
              {profile.weaknesses.map(w => <li key={w}>• {w}</li>)}
            </ul>
          </div>
        </div>

        {/* 재물운 & 연애운 */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-2">💰 재물운</h3>
            <p className="text-sm text-gray-600">{strength.money}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-2">❤️ 연애/관계</h3>
            <p className="text-sm text-gray-600">{profile.loveStyle}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-2">💕 궁합 힌트</h3>
            <p className="text-sm text-gray-600">{getCompatibilityHint(result.dayMaster)}</p>
          </div>
        </div>

        {/* 건강 & 직업 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 mb-2">🏥 건강 조언</h4>
            <p className="text-xs text-gray-500">{profile.healthTip}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 mb-2">💼 적합 직업</h4>
            <ul className="text-xs text-gray-500 space-y-0.5">
              {profile.careerFit.slice(0, 4).map(c => <li key={c}>• {c}</li>)}
            </ul>
          </div>
        </div>

        {/* 올해 운세 */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            🗓️ {new Date().getFullYear()}년 운세
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-purple-700">{fortune.title}</span>
            <StarRating stars={fortune.stars} />
          </div>
          <p className="text-sm text-gray-600 mb-2">{fortune.description}</p>
          <p className="text-xs text-purple-600 font-medium">💡 {fortune.advice}</p>
        </div>

        {/* 용신 개운법 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            🍀 개운법 — 용신: {usefulGodTip.element}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{usefulGodTip.description}</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {usefulGodTip.tips.map((t, i) => <li key={i}>✨ {t}</li>)}
          </ul>
        </div>

        {/* 행운의 요소 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3">🎯 나의 행운 키워드</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">행운의 색</div>
              <div className="text-sm font-bold text-gray-700">🎨 {profile.luckyColor}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">행운의 숫자</div>
              <div className="text-sm font-bold text-gray-700">🔢 {profile.luckyNumber}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">행운의 방향</div>
              <div className="text-sm font-bold text-gray-700">🧭 {profile.luckyDirection}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">띠</div>
              <div className="text-sm font-bold text-gray-700">🐾 {result.animal}띠</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-1">
          <p className="text-xs text-gray-300">노후연구소 사주풀이 · nohu-lab.vercel.app</p>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

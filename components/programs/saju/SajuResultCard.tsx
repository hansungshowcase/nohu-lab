'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES_HANJA,
  ELEMENTS, ELEMENTS_HANJA, Pillar,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  getYearFortune, getViralSummary,
  getUsefulGodAdvice,
  getDaeunInterpretation,
  WOLUN_RATING_LABELS,
} from './sajuData'

interface Props {
  result: SajuResult
}

/* ── 사주 기둥 박스 ── */
function PillarBox({ label, pillar, tenGod, isMe }: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }) {
  const stemEl = STEM_ELEMENT[pillar.stem]
  const branchEl = BRANCH_ELEMENT[pillar.branch]
  const elColors = ['text-green-700','text-red-600','text-yellow-700','text-gray-600','text-blue-700']
  const elBgs = ['bg-green-50','bg-red-50','bg-yellow-50','bg-gray-100','bg-blue-50']
  const yinyang = STEM_YINYANG[pillar.stem] === 1 ? '양' : '음'

  return (
    <div className={`flex flex-col items-center flex-1 min-w-0 ${isMe ? 'relative' : ''}`}>
      {isMe && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs bg-orange-500 text-white px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap font-bold">★ 나</div>}
      <span className="text-xs text-gray-400 mb-0.5 truncate">{label}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded mb-1 truncate ${isMe ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>{tenGod || '-'}</span>
      <div className={`border-2 rounded-xl w-full max-w-[72px] overflow-hidden ${isMe ? 'border-orange-400 shadow-sm shadow-orange-100' : 'border-gray-200'}`}>
        <div className={`${elBgs[stemEl]} p-1.5 sm:p-2 text-center`}>
          <div className={`text-xl sm:text-2xl font-black ${elColors[stemEl]}`}>{STEMS_HANJA[pillar.stem]}</div>
          <div className="text-xs text-gray-500 leading-tight">{STEMS[pillar.stem]}·{ELEMENTS[stemEl]}·{yinyang}</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className={`${elBgs[branchEl]} p-1.5 sm:p-2 text-center`}>
          <div className={`text-xl sm:text-2xl font-black ${elColors[branchEl]}`}>{BRANCHES_HANJA[pillar.branch]}</div>
          <div className="text-xs text-gray-500 truncate">{ELEMENTS[branchEl]}</div>
        </div>
      </div>
    </div>
  )
}

function EmptyPillarBox() {
  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <span className="text-xs text-gray-400 mb-0.5">시주(時)</span>
      <span className="text-xs px-1.5 py-0.5 rounded mb-1 bg-gray-100 text-gray-400">-</span>
      <div className="border-2 border-dashed border-gray-200 rounded-xl w-full max-w-[72px] overflow-hidden">
        <div className="bg-gray-50 p-1.5 sm:p-2 text-center">
          <div className="text-xl sm:text-2xl text-gray-300">?</div>
          <div className="text-xs text-gray-300">미입력</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className="bg-gray-50 p-1.5 sm:p-2 text-center">
          <div className="text-xl sm:text-2xl text-gray-300">?</div>
          <div className="text-xs text-gray-300">-</div>
        </div>
      </div>
    </div>
  )
}

/* ── 오행 밸런스 바 ── */
function ElementBar({ counts, total }: { counts: number[]; total: number }) {
  const colors = ['bg-green-500','bg-red-500','bg-yellow-500','bg-gray-400','bg-blue-500']
  const names = ['목','화','토','금','수']
  const fullNames = ['목(木)','화(火)','토(土)','금(金)','수(水)']
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-4 mb-2.5">
        {counts.map((c, i) => (
          c > 0 && <div key={i} className={`${colors[i]} transition-all`} style={{ width: `${(c/total)*100}%` }} />
        ))}
      </div>
      <div className="flex justify-between text-xs">
        {counts.map((c, i) => (
          <span key={i} className={`${c === 0 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
            <span className="hidden sm:inline">{fullNames[i]}</span>
            <span className="sm:hidden">{names[i]}</span>
            {' '}{c > 0 ? c.toFixed(1) : '-'}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════ */
/* ── 메인 결과 카드 ── */
/* ═══════════════════════════════════════════════ */
const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear(), result.isDayMasterStrong, result.dayMaster)
  const viralSummary = getViralSummary(result.dayMaster, result.isDayMasterStrong)
  const strength = STRENGTH_INTERPRETATIONS[result.isDayMasterStrong ? 'strong' : 'weak']
  const totalElements = result.elementCounts.reduce((a, b) => a + b, 0) || 1
  const year = new Date().getFullYear()
  const usefulGodAdvice = getUsefulGodAdvice(result.usefulGod)

  // 현재 대운
  const currentDaeun = result.daeun.find(d => d.isCurrent)

  const pillars: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }[] = [
    { label: '시주(時)', pillar: result.hourPillar || { stem: 0, branch: 0 }, tenGod: result.tenGods[3] || '' },
    { label: '일주(日)', pillar: result.dayPillar, tenGod: '나', isMe: true },
    { label: '월주(月)', pillar: result.monthPillar, tenGod: result.tenGods[1] },
    { label: '년주(年)', pillar: result.yearPillar, tenGod: result.tenGods[0] },
  ]

  const missingAdvice: Record<number, string> = {
    0: '녹색 옷이나 식물을 가까이 두세요. 동쪽 방향에서 기운을 받으실 수 있습니다.',
    1: '빨간색 소품이나 촛불이 도움이 됩니다. 남쪽으로 에너지를 충전하세요.',
    2: '노란색·갈색 계열을 활용하세요. 등산, 정원 가꾸기 같은 흙과 가까운 활동을 추천합니다.',
    3: '흰색·은색 계열 액세서리가 좋습니다. 서쪽 방향에서 기운을 받으세요.',
    4: '파란색·검정색 계열을 활용하고, 물 가까이에서 재충전하세요.',
  }

  return (
    <div
      ref={ref}
      className="saju-result-card bg-white print:shadow-none print:rounded-none"
      style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}
    >
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          .saju-result-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 px-4 sm:px-6 py-5 sm:py-7 text-white rounded-t-2xl print:rounded-none">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 mb-1.5">
          <p className="text-orange-200 text-xs tracking-[0.15em] uppercase">四柱命理 분석 리포트</p>
          <p className="text-orange-200 text-[11px] sm:text-sm">{result.animal}띠 · {result.gender === 'male' ? '남' : '여'}성 · {result.birthYear}.{String(result.birthMonth).padStart(2,'0')}.{String(result.birthDay).padStart(2,'0')}</p>
        </div>
        <h2 className="text-xl sm:text-2xl font-black leading-snug">{profile.emoji} {profile.title}</h2>
        <p className="text-orange-100 text-sm sm:text-base mt-1">{viralSummary}</p>
      </div>

      <div className="px-3 sm:px-5 py-4 sm:py-5 space-y-5 sm:space-y-6 print:space-y-4">

        {/* ═══ 1. 당신의 사주팔자 ═══ */}
        <div>
          <div className="flex gap-1.5 sm:gap-2 justify-center pt-2 pb-4 px-2 sm:px-1">
            {pillars.map((p, i) => (
              result.hourPillar || i > 0 ? (
                <PillarBox key={i} label={p.label} pillar={p.pillar} tenGod={p.tenGod} isMe={p.isMe} />
              ) : (
                <EmptyPillarBox key={i} />
              )
            ))}
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 sm:p-5 border border-orange-200">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-4xl sm:text-5xl flex-shrink-0">{profile.emoji}</span>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-black text-orange-800 leading-tight">
                  {STEMS_HANJA[result.dayMaster]}{STEMS[result.dayMaster]} · {profile.element}
                </p>
                <p className="text-xs sm:text-sm text-orange-600 mt-0.5">{profile.nature} · {strength.label}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.personality.map(k => (
                    <span key={k} className="text-xs bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-medium">#{k}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-800 leading-[1.9] font-medium">{profile.description}</p>
          </div>
        </div>

        {/* ═══ 2. 오행 밸런스 ═══ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            오행 밸런스
          </h3>
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200">
            <ElementBar counts={result.elementCounts} total={totalElements} />
            {result.missingElements.length > 0 && (
              <div className="mt-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-sm font-bold text-orange-800 mb-1">
                  부족한 기운: {result.missingElements.map(e => `${ELEMENTS[e]}(${ELEMENTS_HANJA[e]})`).join(', ')}
                </p>
                <p className="text-sm text-orange-700 leading-relaxed">
                  {missingAdvice[result.missingElements[0]]}
                </p>
              </div>
            )}
            {result.missingElements.length === 0 && (
              <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm font-bold text-green-800">오행이 고루 갖춰진 균형 잡힌 사주입니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 대운 흐름 ═══ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            대운(大運) 흐름
          </h3>
          <div className="space-y-2">
            <div className="flex gap-1 overflow-x-auto pb-2 pr-3">
              {result.daeun.map((d, i) => (
                <div key={i} className={`flex-shrink-0 text-center rounded-xl p-2 sm:p-2.5 min-w-[60px] sm:min-w-[70px] border-2 ${
                  d.isCurrent ? 'bg-orange-50 border-orange-400 shadow-sm' : 'bg-gray-50 border-gray-200'
                }`}>
                  {d.isCurrent && <p className="text-xs text-orange-500 font-bold mb-0.5">▶ 현재</p>}
                  <p className="text-xs text-gray-500">{d.startAge}~{d.startAge + 9}세</p>
                  <p className="text-sm sm:text-base font-bold text-gray-800">{d.tenGod}</p>
                </div>
              ))}
            </div>
            {currentDaeun && (
              <div className="bg-orange-50 rounded-xl p-3.5 sm:p-4 border border-orange-200">
                <h4 className="text-sm font-black text-orange-800 mb-1.5">
                  현재 대운: {currentDaeun.tenGod}운 ({currentDaeun.startAge}~{currentDaeun.startAge + 9}세)
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getDaeunInterpretation(currentDaeun.tenGod, currentDaeun.element)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 3. 올해 운세 ═══ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            {year}년 운세
          </h3>
          <div className="space-y-3">
            {/* 총운 */}
            <div className="bg-orange-50 rounded-xl p-4 sm:p-5 border border-orange-200">
              <h4 className="text-base sm:text-lg font-black text-orange-800 mb-2">🔮 총운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.overview}</p>
            </div>

            {/* 재물운 */}
            <div className="bg-amber-50 rounded-xl p-4 sm:p-5 border border-amber-200">
              <h4 className="text-base sm:text-lg font-black text-amber-800 mb-2">💰 재물운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.money}</p>
              <p className="text-sm font-medium text-amber-700 bg-amber-100 rounded-lg px-3 py-2 mt-3">💡 {strength.money}</p>
            </div>

            {/* 연애운 */}
            <div className="bg-pink-50 rounded-xl p-4 sm:p-5 border border-pink-200">
              <h4 className="text-base sm:text-lg font-black text-pink-800 mb-2">❤️ 연애운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.love}</p>
              <p className="text-sm font-medium text-pink-700 bg-pink-100 rounded-lg px-3 py-2 mt-3">💡 {strength.relationship}</p>
            </div>

            {/* 직업운 */}
            <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200">
              <h4 className="text-base sm:text-lg font-black text-blue-800 mb-2">💼 직업운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.career}</p>
            </div>

            {/* 건강운 */}
            <div className="bg-green-50 rounded-xl p-4 sm:p-5 border border-green-200">
              <h4 className="text-base sm:text-lg font-black text-green-800 mb-2">🏥 건강운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.health}</p>
            </div>

            {/* 인간관계운 */}
            {fortune.relationship && (
              <div className="bg-violet-50 rounded-xl p-4 sm:p-5 border border-violet-200">
                <h4 className="text-base sm:text-lg font-black text-violet-800 mb-2">🤝 인간관계운</h4>
                <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.relationship}</p>
              </div>
            )}

            {/* 주요 사건 */}
            {fortune.keyEvents && fortune.keyEvents.length > 0 && (
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 sm:p-5 text-white">
                <h4 className="text-base sm:text-lg font-black mb-3">📅 올해 주요 시기</h4>
                <div className="space-y-2">
                  {fortune.keyEvents.map((event, i) => (
                    <div key={i} className="bg-white/15 rounded-lg px-3 py-2">
                      <p className="text-sm text-white/95 leading-relaxed">{event}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 행동지침 */}
            {fortune.action && fortune.action.length > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4 sm:p-5 border border-emerald-200">
                <h4 className="text-base sm:text-lg font-black text-emerald-800 mb-3">✅ 올해 이렇게 하세요</h4>
                <ul className="space-y-2">
                  {fortune.action.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-gray-800 leading-relaxed">
                      <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 주의사항 */}
            {fortune.caution && fortune.caution.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 sm:p-5 border border-red-200">
                <h4 className="text-base sm:text-lg font-black text-red-800 mb-3">⚠️ 이것만은 조심하세요</h4>
                <ul className="space-y-2">
                  {fortune.caution.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-gray-800 leading-relaxed">
                      <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 월운 (Monthly Fortune) ═══ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            {year}년 월별 운세
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {result.wolun.map((w) => {
              const ratingColors: Record<number, string> = {
                5: 'bg-yellow-50 border-yellow-300 text-yellow-800',
                4: 'bg-green-50 border-green-300 text-green-800',
                3: 'bg-gray-50 border-gray-200 text-gray-600',
                2: 'bg-orange-50 border-orange-300 text-orange-800',
                1: 'bg-red-50 border-red-300 text-red-800',
              }
              const ratingEmoji: Record<number, string> = { 5: '🌟', 4: '😊', 3: '😐', 2: '😟', 1: '⚠️' }
              return (
                <div key={w.month} className={`rounded-lg p-2 sm:p-2.5 border text-center ${ratingColors[w.rating] || ratingColors[3]}`}>
                  <p className="text-xs font-bold">{w.month}월 {ratingEmoji[w.rating] || '😐'}</p>
                  <p className="text-xs font-medium mt-0.5 leading-tight">{w.keyword}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ 4. 행운/주의 달 ═══ */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200 text-center">
            <p className="text-xs text-green-600 font-medium mb-1">행운의 달</p>
            <p className="text-base sm:text-lg font-black text-green-800">{fortune.bestMonths}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200 text-center">
            <p className="text-xs text-red-600 font-medium mb-1">주의할 달</p>
            <p className="text-base sm:text-lg font-black text-red-800">{fortune.worstMonths}</p>
          </div>
        </div>

        {/* ═══ 6. 개운법 (용신 기반) ═══ */}
        <div className="bg-orange-50 rounded-2xl p-4 sm:p-5 border border-orange-200">
          <h3 className="text-base sm:text-lg font-black text-orange-800 mb-2">🍀 당신만의 개운법</h3>
          <p className="text-sm text-orange-700 leading-relaxed mb-2">
            당신에게 필요한 기운은 <strong>{ELEMENTS[result.usefulGod]}({ELEMENTS_HANJA[result.usefulGod]})</strong>입니다.
          </p>
          <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{usefulGodAdvice}</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
            <div className="bg-white rounded-lg p-2 sm:p-2.5 border border-orange-100 min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500">행운 색</p>
              <p className="text-xs sm:text-base font-bold text-gray-800 truncate">{profile.luckyColor}</p>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-2.5 border border-orange-100 min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500">행운 방향</p>
              <p className="text-xs sm:text-base font-bold text-gray-800 truncate">{profile.luckyDirection}</p>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-2.5 border border-orange-100 min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500">행운 숫자</p>
              <p className="text-xs sm:text-base font-bold text-gray-800 truncate">{profile.luckyNumber}</p>
            </div>
          </div>
        </div>

        {/* ═══ Footer ═══ */}
        <div className="text-center pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">노후연구소 · retireplan.kr · 사주명리학 기반</p>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

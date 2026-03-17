'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES_HANJA,
  ELEMENTS, ELEMENTS_HANJA, Pillar,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  getYearFortune, getViralSummary, getMonthlyDetail,
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
      {isMe && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap font-bold">★ 나</div>}
      <span className="text-[9px] sm:text-[10px] text-gray-400 mb-0.5 truncate">{label}</span>
      <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded mb-1 truncate ${isMe ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>{tenGod || '-'}</span>
      <div className={`border-2 rounded-xl w-full max-w-[60px] overflow-hidden ${isMe ? 'border-orange-400 shadow-sm shadow-orange-100' : 'border-gray-200'}`}>
        <div className={`${elBgs[stemEl]} p-1 sm:p-1.5 text-center`}>
          <div className={`text-lg sm:text-xl font-black ${elColors[stemEl]}`}>{STEMS_HANJA[pillar.stem]}</div>
          <div className="text-[7px] sm:text-[8px] text-gray-500 truncate">{STEMS[pillar.stem]}·{ELEMENTS[stemEl]}·{yinyang}</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className={`${elBgs[branchEl]} p-1 sm:p-1.5 text-center`}>
          <div className={`text-lg sm:text-xl font-black ${elColors[branchEl]}`}>{BRANCHES_HANJA[pillar.branch]}</div>
          <div className="text-[7px] sm:text-[8px] text-gray-500 truncate">{ELEMENTS[branchEl]}</div>
        </div>
      </div>
    </div>
  )
}

function EmptyPillarBox() {
  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <span className="text-[9px] sm:text-[10px] text-gray-400 mb-0.5">시주(時)</span>
      <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded mb-1 bg-gray-100 text-gray-400">-</span>
      <div className="border-2 border-dashed border-gray-200 rounded-xl w-full max-w-[60px] overflow-hidden">
        <div className="bg-gray-50 p-1 sm:p-1.5 text-center">
          <div className="text-lg sm:text-xl text-gray-300">?</div>
          <div className="text-[7px] sm:text-[8px] text-gray-300">미입력</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className="bg-gray-50 p-1 sm:p-1.5 text-center">
          <div className="text-lg sm:text-xl text-gray-300">?</div>
          <div className="text-[7px] sm:text-[8px] text-gray-300">-</div>
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
      <div className="flex rounded-full overflow-hidden h-3.5 mb-2">
        {counts.map((c, i) => (
          c > 0 && <div key={i} className={`${colors[i]} transition-all`} style={{ width: `${(c/total)*100}%` }} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] sm:text-[11px]">
        {counts.map((c, i) => (
          <span key={i} className={`${c === 0 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
            <span className="hidden sm:inline">{fullNames[i]}</span>
            <span className="sm:hidden">{names[i]}</span>
            {' '}{c > 0 ? c.toFixed(1) : '없음'}
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
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear())
  const viralSummary = getViralSummary(result.dayMaster, result.isDayMasterStrong)
  const currentMonth = new Date().getMonth() + 1
  const monthDetail = getMonthlyDetail(currentMonth, result.dayMasterElement, fortune.stars)
  const strength = STRENGTH_INTERPRETATIONS[result.isDayMasterStrong ? 'strong' : 'weak']
  const totalElements = result.elementCounts.reduce((a, b) => a + b, 0) || 1
  const year = new Date().getFullYear()

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
      className="bg-white print:shadow-none print:rounded-none"
      style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}
    >
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 px-4 sm:px-5 py-5 sm:py-6 text-white rounded-t-2xl print:rounded-none">
        <p className="text-orange-200 text-[9px] sm:text-[10px] tracking-[0.15em] uppercase mb-1">四柱命理 분석 리포트</p>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black leading-tight truncate">{profile.emoji} {profile.title}</h2>
            <p className="text-orange-100 text-[12px] sm:text-sm mt-1 line-clamp-1">{viralSummary}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-base sm:text-lg">{result.birthYear}.{String(result.birthMonth).padStart(2,'0')}.{String(result.birthDay).padStart(2,'0')}</p>
            <p className="text-orange-200 text-[11px] sm:text-xs">{result.animal}띠 · {result.gender === 'male' ? '남' : '여'}성</p>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-5 py-4 sm:py-5 space-y-5 sm:space-y-6 print:space-y-4">

        {/* ═══ 1. 당신의 사주팔자 ═══ */}
        <div>
          <div className="flex gap-1.5 sm:gap-2 justify-center pt-2 pb-4 px-1">
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
              <span className="text-3xl sm:text-4xl flex-shrink-0">{profile.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-black text-orange-800 leading-tight">
                  {STEMS_HANJA[result.dayMaster]}{STEMS[result.dayMaster]} · {profile.element}
                </p>
                <p className="text-[11px] sm:text-xs text-orange-600 mt-0.5">{profile.nature} · {strength.label}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.personality.map(k => (
                    <span key={k} className="text-[10px] sm:text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">#{k}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.85] font-medium">{profile.description}</p>
          </div>
        </div>

        {/* ═══ 2. 오행 밸런스 ═══ */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            오행 밸런스
          </h3>
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200">
            <ElementBar counts={result.elementCounts} total={totalElements} />
            {result.missingElements.length > 0 && (
              <div className="mt-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-[12px] sm:text-[13px] font-bold text-orange-800 mb-1">
                  부족한 기운: {result.missingElements.map(e => `${ELEMENTS[e]}(${ELEMENTS_HANJA[e]})`).join(', ')}
                </p>
                <p className="text-[12px] sm:text-[13px] text-orange-700 leading-relaxed">
                  {missingAdvice[result.missingElements[0]]}
                </p>
              </div>
            )}
            {result.missingElements.length === 0 && (
              <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-[12px] sm:text-[13px] font-bold text-green-800">오행이 고루 갖춰진 균형 잡힌 사주입니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 3. 올해 운세 3대장 ═══ */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            {year}년 운세
          </h3>
          <div className="space-y-3">
            {/* 재물운 */}
            <div className="bg-amber-50 rounded-xl p-4 sm:p-5 border border-amber-200">
              <h4 className="text-sm sm:text-base font-black text-amber-800 mb-2">💰 재물운</h4>
              <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.85]">{fortune.money}</p>
              <p className="text-[12px] sm:text-[13px] font-medium text-amber-700 bg-amber-100 rounded-lg px-3 py-2 mt-3">💡 {strength.money}</p>
            </div>

            {/* 연애운 */}
            <div className="bg-pink-50 rounded-xl p-4 sm:p-5 border border-pink-200">
              <h4 className="text-sm sm:text-base font-black text-pink-800 mb-2">❤️ 연애운</h4>
              <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.85]">{fortune.love}</p>
              <p className="text-[12px] sm:text-[13px] font-medium text-pink-700 bg-pink-100 rounded-lg px-3 py-2 mt-3">💡 {strength.relationship}</p>
            </div>

            {/* 직업운 */}
            <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200">
              <h4 className="text-sm sm:text-base font-black text-blue-800 mb-2">💼 직업운</h4>
              <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.85]">{fortune.career}</p>
            </div>
          </div>
        </div>

        {/* ═══ 4. 이달의 운세 ═══ */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white">
          <h3 className="text-sm sm:text-base font-black mb-3">{currentMonth}월 운세</h3>
          <div className="space-y-2.5">
            <div className="bg-white/15 rounded-xl p-3 sm:p-3.5">
              <div className="text-[11px] sm:text-[12px] font-bold text-yellow-200 mb-1">💰 재물</div>
              <p className="text-[12px] sm:text-[13px] text-white/95 leading-relaxed">{monthDetail.money}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 sm:p-3.5">
              <div className="text-[11px] sm:text-[12px] font-bold text-pink-200 mb-1">❤️ 연애</div>
              <p className="text-[12px] sm:text-[13px] text-white/95 leading-relaxed">{monthDetail.love}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 sm:p-3.5">
              <div className="text-[11px] sm:text-[12px] font-bold text-red-200 mb-1">⚠️ 주의</div>
              <p className="text-[12px] sm:text-[13px] text-white/95 leading-relaxed">{monthDetail.warning}</p>
            </div>
          </div>
        </div>

        {/* ═══ 5. 행운/주의 달 ═══ */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200 text-center">
            <p className="text-[10px] sm:text-[11px] text-green-600 font-medium mb-1">행운의 달</p>
            <p className="text-sm sm:text-base font-black text-green-800">{fortune.bestMonths}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200 text-center">
            <p className="text-[10px] sm:text-[11px] text-red-600 font-medium mb-1">주의할 달</p>
            <p className="text-sm sm:text-base font-black text-red-800">{fortune.worstMonths}</p>
          </div>
        </div>

        {/* ═══ Footer ═══ */}
        <div className="text-center pt-3 border-t border-gray-100">
          <p className="text-[9px] sm:text-[10px] text-gray-400">노후연구소 四柱命理 · nohu-lab.vercel.app · 전통 사주명리학 기반 재미 콘텐츠</p>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

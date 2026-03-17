'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES_HANJA,
  ELEMENTS, Pillar,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES,
  getYearFortune, getViralSummary, getCompatibilityHint, getMonthlyDetail,
  getSinsalReading, getEnergyStageReading,
} from './sajuData'

interface Props {
  result: SajuResult
}

function PillarBox({ label, pillar, tenGod, isMe }: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }) {
  const stemEl = STEM_ELEMENT[pillar.stem]
  const branchEl = BRANCH_ELEMENT[pillar.branch]
  const elColors = ['text-green-700','text-red-600','text-yellow-700','text-gray-600','text-blue-700']
  const elBgs = ['bg-green-50','bg-red-50','bg-yellow-50','bg-gray-50','bg-blue-50']
  const yinyang = STEM_YINYANG[pillar.stem] === 1 ? '양' : '음'

  return (
    <div className={`flex flex-col items-center ${isMe ? 'relative' : ''}`}>
      {isMe && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">★ 나</div>}
      <span className="text-[9px] text-gray-400 mb-0.5">{label}</span>
      <span className={`text-[8px] px-1 py-0.5 rounded mb-0.5 ${isMe ? 'bg-indigo-100 text-indigo-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>{tenGod || '-'}</span>
      <div className={`border rounded-lg w-[52px] sm:w-[56px] overflow-hidden ${isMe ? 'border-indigo-400' : 'border-gray-200'}`}>
        <div className={`${elBgs[stemEl]} p-1 text-center`}>
          <div className={`text-base sm:text-lg font-black ${elColors[stemEl]}`}>{STEMS_HANJA[pillar.stem]}</div>
          <div className="text-[7px] sm:text-[8px] text-gray-500">{STEMS[pillar.stem]}·{ELEMENTS[stemEl]}·{yinyang}</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className={`${elBgs[branchEl]} p-1 text-center`}>
          <div className={`text-base sm:text-lg font-black ${elColors[branchEl]}`}>{BRANCHES_HANJA[pillar.branch]}</div>
          <div className="text-[7px] sm:text-[8px] text-gray-500">{ELEMENTS[branchEl]}</div>
        </div>
      </div>
    </div>
  )
}

function EmptyPillarBox() {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-gray-400 mb-0.5">시주(時)</span>
      <span className="text-[8px] px-1 py-0.5 rounded mb-0.5 bg-gray-100 text-gray-400">-</span>
      <div className="border border-dashed border-gray-200 rounded-lg w-[52px] sm:w-[56px] overflow-hidden">
        <div className="bg-gray-50 p-1 text-center">
          <div className="text-base sm:text-lg text-gray-300">?</div>
          <div className="text-[7px] sm:text-[8px] text-gray-300">미입력</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className="bg-gray-50 p-1 text-center">
          <div className="text-base sm:text-lg text-gray-300">?</div>
        </div>
      </div>
    </div>
  )
}

function FortuneCard({ icon, title, children, bgClass }: { icon: string; title: string; children: React.ReactNode; bgClass?: string }) {
  return (
    <div className={`rounded-xl p-3 sm:p-4 border ${bgClass || 'bg-white border-gray-100'}`}>
      <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-1.5">{icon} {title}</h4>
      <div className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">{children}</div>
    </div>
  )
}

const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear())
  const viralSummary = getViralSummary(result.dayMaster, result.isDayMasterStrong)
  const currentMonth = new Date().getMonth() + 1
  const monthDetail = getMonthlyDetail(currentMonth, result.dayMasterElement, fortune.stars)
  const sinsalReadings = getSinsalReading(result.sinsal)
  const energyStage = getEnergyStageReading(result.sinsal.dayEnergyName)

  const pillars: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }[] = [
    { label: '시주(時)', pillar: result.hourPillar || { stem: 0, branch: 0 }, tenGod: result.tenGods[3] || '' },
    { label: '일주(日)', pillar: result.dayPillar, tenGod: '나', isMe: true },
    { label: '월주(月)', pillar: result.monthPillar, tenGod: result.tenGods[1] },
    { label: '년주(年)', pillar: result.yearPillar, tenGod: result.tenGods[0] },
  ]

  return (
    <div ref={ref} className="bg-white print:shadow-none print:rounded-none" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 6mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .saju-card { font-size: 10px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="saju-card">
        {/* ═══ HEADER ═══ */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-3 sm:px-4 py-3 text-white rounded-t-2xl print:rounded-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-[9px] tracking-widest">四柱命理 분석 리포트</p>
              <h2 className="text-sm sm:text-lg font-black mt-0.5">{profile.emoji} {profile.title}</h2>
              <p className="text-indigo-200 text-[10px]">{viralSummary}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="font-bold text-xs sm:text-sm">{result.birthYear}.{String(result.birthMonth).padStart(2,'0')}.{String(result.birthDay).padStart(2,'0')}</p>
              <p className="text-indigo-200 text-[10px]">{result.animal}띠 · {result.gender === 'male' ? '남' : '여'}성</p>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 py-3 space-y-3 print:space-y-2 print:px-3 print:py-1.5">

          {/* ═══ 1. 나의 타고난 성격 ═══ */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
              <span className="w-0.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
              나의 타고난 성격
            </h3>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="flex gap-1.5 pt-1 mx-auto sm:mx-0">
                {pillars.map((p, i) => (
                  result.hourPillar || i > 0 ? (
                    <PillarBox key={i} label={p.label} pillar={p.pillar} tenGod={p.tenGod} isMe={p.isMe} />
                  ) : (
                    <EmptyPillarBox key={i} />
                  )
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] sm:text-xs font-bold text-indigo-700 mb-1">
                  {STEMS_HANJA[result.dayMaster]}{STEMS[result.dayMaster]} · {profile.element} · {profile.nature}
                </div>
                <div className="flex flex-wrap gap-0.5 mb-1.5">
                  {profile.personality.map(k => (
                    <span key={k} className="text-[9px] sm:text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">#{k}</span>
                  ))}
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed">{profile.description}</p>
              </div>
            </div>
          </div>

          {/* ═══ 2. 올해 재물운 ═══ */}
          <FortuneCard icon="💰" title={`${new Date().getFullYear()}년 재물운`} bgClass="bg-amber-50/60 border-amber-100">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-yellow-400 text-xs">{'★'.repeat(fortune.stars)}{'☆'.repeat(5-fortune.stars)}</span>
              <span className="text-[10px] text-amber-700 font-medium">{fortune.title}</span>
            </div>
            <p>{fortune.money}</p>
          </FortuneCard>

          {/* ═══ 3. 올해 연애운 ═══ */}
          <FortuneCard icon="❤️" title={`${new Date().getFullYear()}년 연애운`} bgClass="bg-pink-50/60 border-pink-100">
            <p>{fortune.love}</p>
          </FortuneCard>

          {/* ═══ 4. 올해 직업운 ═══ */}
          <FortuneCard icon="💼" title={`${new Date().getFullYear()}년 직업운`} bgClass="bg-blue-50/60 border-blue-100">
            <p>{fortune.career}</p>
          </FortuneCard>

          {/* ═══ 5. 올해 건강운 ═══ */}
          <FortuneCard icon="🏥" title={`${new Date().getFullYear()}년 건강운`} bgClass="bg-green-50/60 border-green-100">
            <p>{fortune.health}</p>
          </FortuneCard>

          {/* ═══ 6. 올해 주의사항 ═══ */}
          <div className="bg-red-50 rounded-xl p-3 sm:p-4 border-2 border-red-200">
            <h4 className="text-xs sm:text-sm font-bold text-red-700 mb-1">⚠️ {new Date().getFullYear()}년 주의사항</h4>
            <p className="text-[11px] sm:text-xs text-red-600 leading-relaxed font-medium">{fortune.warning}</p>
          </div>

          {/* ═══ 7. 이달의 운세 ═══ */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-3 sm:p-4 text-white">
            <h3 className="text-xs sm:text-sm font-bold mb-2">📅 {currentMonth}월 — 이달의 운세</h3>
            <div className="space-y-2">
              <div className="bg-white/15 rounded-lg p-2.5">
                <div className="text-[10px] font-bold text-yellow-300 mb-0.5">💰 이달의 재물</div>
                <p className="text-[10px] sm:text-[11px] text-white/90">{monthDetail.money}</p>
              </div>
              <div className="bg-white/15 rounded-lg p-2.5">
                <div className="text-[10px] font-bold text-pink-300 mb-0.5">❤️ 이달의 연애</div>
                <p className="text-[10px] sm:text-[11px] text-white/90">{monthDetail.love}</p>
              </div>
              <div className="bg-white/15 rounded-lg p-2.5">
                <div className="text-[10px] font-bold text-red-300 mb-0.5">⚠️ 이달의 주의</div>
                <p className="text-[10px] sm:text-[11px] text-white/90">{monthDetail.warning}</p>
              </div>
            </div>
          </div>

          {/* ═══ 8. 나의 에너지 상태 (십이운성) ═══ */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-violet-100">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1">
              <span className="w-0.5 h-3.5 bg-violet-500 rounded-full inline-block" />
              나의 에너지 상태
            </h3>
            <div className="flex items-start gap-2">
              <span className="text-2xl">{energyStage.emoji}</span>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-violet-700 mb-0.5">{energyStage.title}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed">{energyStage.description}</p>
              </div>
            </div>
          </div>

          {/* ═══ 9. 나의 숨은 기운 (신살) ═══ */}
          {sinsalReadings.length > 0 && (
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                <span className="w-0.5 h-3.5 bg-amber-500 rounded-full inline-block" />
                🔮 나의 숨은 기운
              </h3>
              <div className="space-y-2">
                {sinsalReadings.map((reading, i) => (
                  <div key={i} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                    <div className="flex items-start gap-2">
                      <span className="text-xl flex-shrink-0">{reading.icon}</span>
                      <div>
                        <p className="text-[11px] sm:text-xs font-bold text-amber-800 mb-0.5">{reading.title}</p>
                        <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed">{reading.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ 10. 연애 성향 & 궁합 ═══ */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
              <span className="w-0.5 h-3.5 bg-pink-500 rounded-full inline-block" />
              💕 연애 성향 & 궁합
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-pink-800 mb-1">❤️ 나의 연애 성향</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed">{profile.loveStyle}</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-rose-800 mb-1">💕 궁합 힌트</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed">{getCompatibilityHint(result.dayMaster)}</p>
              </div>
            </div>
          </div>

          {/* ═══ Footer ═══ */}
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-[8px] text-gray-300">노후연구소 四柱命理 분석 · nohu-lab.vercel.app · 전통 사주명리학 기반 재미 콘텐츠</p>
          </div>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

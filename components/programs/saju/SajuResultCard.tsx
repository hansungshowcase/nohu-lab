'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES, BRANCHES_HANJA,
  ELEMENTS, ELEMENTS_HANJA, Pillar,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG, BRANCHES_ANIMAL,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  getYearFortune, getViralSummary, getCompatibilityHint, getMonthlyDetail,
  getSinsalReading, getEnergyStageReading,
} from './sajuData'

interface Props {
  result: SajuResult
}

/* ── 사주 기둥 박스 ── */
function PillarBox({ label, pillar, tenGod, isMe }: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }) {
  const stemEl = STEM_ELEMENT[pillar.stem]
  const branchEl = BRANCH_ELEMENT[pillar.branch]
  const elColors = ['text-green-700','text-red-600','text-yellow-700','text-gray-600','text-blue-700']
  const elBgs = ['bg-green-50','bg-red-50','bg-yellow-50','bg-gray-50','bg-blue-50']
  const yinyang = STEM_YINYANG[pillar.stem] === 1 ? '양' : '음'

  return (
    <div className={`flex flex-col items-center ${isMe ? 'relative' : ''}`}>
      {isMe && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap font-bold">★ 나</div>}
      <span className="text-[10px] text-gray-400 mb-0.5">{label}</span>
      <span className={`text-[9px] px-1.5 py-0.5 rounded mb-1 ${isMe ? 'bg-indigo-100 text-indigo-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>{tenGod || '-'}</span>
      <div className={`border-2 rounded-xl w-[60px] overflow-hidden ${isMe ? 'border-indigo-400 shadow-sm shadow-indigo-100' : 'border-gray-200'}`}>
        <div className={`${elBgs[stemEl]} p-1.5 text-center`}>
          <div className={`text-xl font-black ${elColors[stemEl]}`}>{STEMS_HANJA[pillar.stem]}</div>
          <div className="text-[8px] text-gray-500">{STEMS[pillar.stem]}·{ELEMENTS[stemEl]}·{yinyang}</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className={`${elBgs[branchEl]} p-1.5 text-center`}>
          <div className={`text-xl font-black ${elColors[branchEl]}`}>{BRANCHES_HANJA[pillar.branch]}</div>
          <div className="text-[8px] text-gray-500">{BRANCHES[pillar.branch]}·{ELEMENTS[branchEl]}</div>
        </div>
      </div>
    </div>
  )
}

function EmptyPillarBox() {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-gray-400 mb-0.5">시주(時)</span>
      <span className="text-[9px] px-1.5 py-0.5 rounded mb-1 bg-gray-100 text-gray-400">-</span>
      <div className="border-2 border-dashed border-gray-200 rounded-xl w-[60px] overflow-hidden">
        <div className="bg-gray-50 p-1.5 text-center">
          <div className="text-xl text-gray-300">?</div>
          <div className="text-[8px] text-gray-300">미입력</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className="bg-gray-50 p-1.5 text-center">
          <div className="text-xl text-gray-300">?</div>
          <div className="text-[8px] text-gray-300">-</div>
        </div>
      </div>
    </div>
  )
}

/* ── 오행 밸런스 바 ── */
function ElementBar({ counts, total }: { counts: number[]; total: number }) {
  const colors = ['bg-green-500','bg-red-500','bg-yellow-500','bg-gray-400','bg-blue-500']
  const names = ['목(木)','화(火)','토(土)','금(金)','수(水)']
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-3 mb-1.5">
        {counts.map((c, i) => (
          c > 0 && <div key={i} className={`${colors[i]} transition-all`} style={{ width: `${(c/total)*100}%` }} />
        ))}
      </div>
      <div className="flex justify-between text-[10px]">
        {counts.map((c, i) => (
          <span key={i} className={`${c === 0 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
            {names[i]} {c > 0 ? c : '없음'}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── 운세 카드 ── */
function FortuneCard({ icon, title, children, bgClass }: { icon: string; title: string; children: React.ReactNode; bgClass?: string }) {
  return (
    <div className={`rounded-xl p-4 border ${bgClass || 'bg-white border-gray-100'}`}>
      <h4 className="text-sm font-bold text-gray-800 mb-2">{icon} {title}</h4>
      <div className="text-[13px] text-gray-700 leading-[1.7]">{children}</div>
    </div>
  )
}

/* ── 섹션 헤더 ── */
function SectionHeader({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
      <span className={`w-1 h-4 ${color} rounded-full inline-block`} />
      {children}
    </h3>
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
  const sinsalReadings = getSinsalReading(result.sinsal)
  const energyStage = getEnergyStageReading(result.sinsal.dayEnergyName)
  const strength = STRENGTH_INTERPRETATIONS[result.isDayMasterStrong ? 'strong' : 'weak']
  const totalElements = result.elementCounts.reduce((a, b) => a + b, 0) || 1

  const pillars: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }[] = [
    { label: '시주(時)', pillar: result.hourPillar || { stem: 0, branch: 0 }, tenGod: result.tenGods[3] || '' },
    { label: '일주(日)', pillar: result.dayPillar, tenGod: '나', isMe: true },
    { label: '월주(月)', pillar: result.monthPillar, tenGod: result.tenGods[1] },
    { label: '년주(年)', pillar: result.yearPillar, tenGod: result.tenGods[0] },
  ]

  // 부족한 오행 보완 조언
  const missingAdvice: Record<number, string> = {
    0: '녹색 옷이나 식물을 가까이하세요. 동쪽 방향이 행운을 불러옵니다.',
    1: '빨간색 소품이나 촛불 명상이 도움됩니다. 남쪽으로 에너지를 충전하세요.',
    2: '노란색·갈색 계열을 활용하세요. 흙과 가까운 활동(등산, 정원 가꾸기)을 추천합니다.',
    3: '흰색·은색 계열 액세서리가 좋습니다. 서쪽 방향에서 기운을 받으세요.',
    4: '파란색·검정색 계열을 활용하고, 물 가까이(수영장, 해변)에서 재충전하세요.',
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
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 px-5 py-5 text-white rounded-t-2xl print:rounded-none">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-[10px] tracking-[0.2em] uppercase">四柱命理 분석 리포트</p>
            <h2 className="text-lg font-black mt-1 leading-tight">{profile.emoji} {profile.title}</h2>
            <p className="text-indigo-200 text-xs mt-0.5">{viralSummary}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <p className="font-bold text-base">{result.birthYear}.{String(result.birthMonth).padStart(2,'0')}.{String(result.birthDay).padStart(2,'0')}</p>
            <p className="text-indigo-200 text-xs">{result.animal}띠 · {result.gender === 'male' ? '남' : '여'}성</p>
            <div className="mt-1 inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
              <span className="text-[10px]">{strength.emoji}</span>
              <span className="text-[10px] font-medium">{strength.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5 print:space-y-3">

        {/* ═══ 1. 나의 타고난 성격 + 사주 기둥 ═══ */}
        <div>
          <SectionHeader color="bg-indigo-500">나의 타고난 성격</SectionHeader>

          {/* 사주 기둥 */}
          <div className="flex gap-2 justify-center pt-2 pb-3">
            {pillars.map((p, i) => (
              result.hourPillar || i > 0 ? (
                <PillarBox key={i} label={p.label} pillar={p.pillar} tenGod={p.tenGod} isMe={p.isMe} />
              ) : (
                <EmptyPillarBox key={i} />
              )
            ))}
          </div>

          {/* 일간 설명 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{profile.emoji}</span>
              <div>
                <p className="text-sm font-bold text-indigo-800">
                  {STEMS_HANJA[result.dayMaster]}{STEMS[result.dayMaster]} · {profile.element} · {profile.nature}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.personality.map(k => (
                    <span key={k} className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">#{k}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[13px] text-gray-700 leading-[1.7]">{profile.description}</p>

            {/* 강점 */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.strengths.map(s => (
                <span key={s} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">✓ {s}</span>
              ))}
            </div>

            {/* 신강/신약 해석 */}
            <div className="mt-3 bg-white rounded-lg p-3 border border-indigo-50">
              <p className="text-xs font-bold text-indigo-700 mb-1">{strength.emoji} {strength.label} — {strength.description}</p>
              <p className="text-[12px] text-gray-600 leading-relaxed">{strength.advice}</p>
            </div>
          </div>
        </div>

        {/* ═══ 2. 오행 밸런스 ═══ */}
        <div>
          <SectionHeader color="bg-emerald-500">☯️ 나의 오행 밸런스</SectionHeader>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <ElementBar counts={result.elementCounts} total={totalElements} />
            {result.missingElements.length > 0 && (
              <div className="mt-3 bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs font-bold text-amber-800 mb-1">
                  ⚡ 부족한 오행: {result.missingElements.map(e => `${ELEMENTS[e]}(${ELEMENTS_HANJA[e]})`).join(', ')}
                </p>
                <p className="text-[12px] text-amber-700 leading-relaxed">
                  {missingAdvice[result.missingElements[0]]}
                </p>
              </div>
            )}
            {result.missingElements.length === 0 && (
              <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-100">
                <p className="text-xs font-bold text-green-800">✨ 오행이 모두 갖춰진 균형 잡힌 사주입니다!</p>
                <p className="text-[12px] text-green-700">큰 결함 없이 안정적인 기운을 타고났습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 3. 올해 재물운 ═══ */}
        <FortuneCard icon="💰" title={`${new Date().getFullYear()}년 재물운`} bgClass="bg-amber-50/70 border-amber-200">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-yellow-500 text-sm tracking-tight">{'★'.repeat(fortune.stars)}{'☆'.repeat(5-fortune.stars)}</span>
            <span className="text-[11px] text-amber-800 font-bold">{fortune.title}</span>
          </div>
          <p>{fortune.money}</p>
          <p className="mt-2 text-[12px] text-amber-700 font-medium bg-amber-100/60 rounded-lg px-3 py-1.5">
            💡 재물 팁: {strength.money}
          </p>
        </FortuneCard>

        {/* ═══ 4. 올해 연애운 ═══ */}
        <FortuneCard icon="❤️" title={`${new Date().getFullYear()}년 연애운`} bgClass="bg-pink-50/70 border-pink-200">
          <p>{fortune.love}</p>
          <p className="mt-2 text-[12px] text-pink-700 font-medium bg-pink-100/60 rounded-lg px-3 py-1.5">
            💡 연애 팁: {strength.relationship}
          </p>
        </FortuneCard>

        {/* ═══ 5. 올해 직업운 ═══ */}
        <FortuneCard icon="💼" title={`${new Date().getFullYear()}년 직업운`} bgClass="bg-blue-50/70 border-blue-200">
          <p>{fortune.career}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.careerFit.map(c => (
              <span key={c} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓ {c}</span>
            ))}
          </div>
        </FortuneCard>

        {/* ═══ 6. 올해 건강운 ═══ */}
        <FortuneCard icon="🏥" title={`${new Date().getFullYear()}년 건강운`} bgClass="bg-green-50/70 border-green-200">
          <p>{fortune.health}</p>
          <p className="mt-2 text-[12px] text-green-700 font-medium bg-green-100/60 rounded-lg px-3 py-1.5">
            💡 건강 팁: {profile.healthTip}
          </p>
        </FortuneCard>

        {/* ═══ 7. 올해 주의사항 ═══ */}
        <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
          <h4 className="text-sm font-bold text-red-700 mb-2">⚠️ {new Date().getFullYear()}년 주의사항</h4>
          <p className="text-[13px] text-red-600 leading-[1.7] font-medium">{fortune.warning}</p>
        </div>

        {/* ═══ 8. 이달의 운세 ═══ */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1">📅 {currentMonth}월 — 이달의 운세</h3>
          <div className="space-y-2.5">
            <div className="bg-white/15 rounded-lg p-3">
              <div className="text-[11px] font-bold text-yellow-300 mb-1">💰 이달의 재물</div>
              <p className="text-[12px] text-white/95 leading-relaxed">{monthDetail.money}</p>
            </div>
            <div className="bg-white/15 rounded-lg p-3">
              <div className="text-[11px] font-bold text-pink-300 mb-1">❤️ 이달의 연애</div>
              <p className="text-[12px] text-white/95 leading-relaxed">{monthDetail.love}</p>
            </div>
            <div className="bg-white/15 rounded-lg p-3">
              <div className="text-[11px] font-bold text-red-300 mb-1">⚠️ 이달의 주의</div>
              <p className="text-[12px] text-white/95 leading-relaxed">{monthDetail.warning}</p>
            </div>
          </div>
        </div>

        {/* ═══ 9. 나의 에너지 상태 (십이운성) ═══ */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
          <SectionHeader color="bg-violet-500">나의 에너지 상태</SectionHeader>
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">{energyStage.emoji}</span>
            <div>
              <p className="text-sm font-bold text-violet-700 mb-1">{energyStage.title}</p>
              <p className="text-[13px] text-gray-700 leading-[1.7]">{energyStage.description}</p>
            </div>
          </div>
        </div>

        {/* ═══ 10. 나의 숨은 기운 (신살) ═══ */}
        {sinsalReadings.length > 0 && (
          <div>
            <SectionHeader color="bg-amber-500">🔮 나의 숨은 기운</SectionHeader>
            <div className="space-y-2.5">
              {sinsalReadings.map((reading, i) => (
                <div key={i} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl flex-shrink-0">{reading.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-amber-800 mb-1">{reading.title}</p>
                      <p className="text-[13px] text-gray-700 leading-[1.7]">{reading.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 11. 연애 성향 & 궁합 ═══ */}
        <div>
          <SectionHeader color="bg-pink-500">💕 연애 성향 & 궁합</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
              <h4 className="text-xs font-bold text-pink-800 mb-1.5">❤️ 나의 연애 성향</h4>
              <p className="text-[13px] text-gray-700 leading-[1.7]">{profile.loveStyle}</p>
            </div>
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
              <h4 className="text-xs font-bold text-rose-800 mb-1.5">💕 궁합 힌트</h4>
              <p className="text-[13px] text-gray-700 leading-[1.7]">{getCompatibilityHint(result.dayMaster)}</p>
            </div>
          </div>
        </div>

        {/* ═══ 12. 행운 정보 ═══ */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
          <SectionHeader color="bg-yellow-500">🍀 나의 행운 포인트</SectionHeader>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg p-3 border border-yellow-100">
              <div className="text-xl mb-1">🎨</div>
              <p className="text-[10px] text-gray-500 mb-0.5">행운의 색</p>
              <p className="text-sm font-bold text-gray-800">{profile.luckyColor}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-yellow-100">
              <div className="text-xl mb-1">🔢</div>
              <p className="text-[10px] text-gray-500 mb-0.5">행운의 숫자</p>
              <p className="text-sm font-bold text-gray-800">{profile.luckyNumber}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-yellow-100">
              <div className="text-xl mb-1">🧭</div>
              <p className="text-[10px] text-gray-500 mb-0.5">행운의 방향</p>
              <p className="text-sm font-bold text-gray-800">{profile.luckyDirection}</p>
            </div>
          </div>
        </div>

        {/* ═══ Footer ═══ */}
        <div className="text-center pt-3 border-t border-gray-100">
          <p className="text-[9px] text-gray-400">노후연구소 四柱命理 분석 · nohu-lab.vercel.app · 전통 사주명리학 기반 재미 콘텐츠</p>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

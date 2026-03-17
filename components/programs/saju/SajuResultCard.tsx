'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES, BRANCHES_HANJA,
  ELEMENTS, ELEMENTS_HANJA, Pillar,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  getYearFortune, getViralSummary, getMonthlyDetail,
  getSinsalReading, getEnergyStageReading, getGongmangReading,
} from './sajuData'

interface Props {
  result: SajuResult
}

/* ── 사주 기둥 박스 (모바일 최적화) ── */
function PillarBox({ label, pillar, tenGod, isMe }: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }) {
  const stemEl = STEM_ELEMENT[pillar.stem]
  const branchEl = BRANCH_ELEMENT[pillar.branch]
  const elColors = ['text-green-700','text-red-600','text-yellow-700','text-gray-600','text-blue-700']
  const elBgs = ['bg-green-50','bg-red-50','bg-yellow-50','bg-gray-50','bg-blue-50']
  const yinyang = STEM_YINYANG[pillar.stem] === 1 ? '양' : '음'

  return (
    <div className={`flex flex-col items-center flex-1 min-w-0 ${isMe ? 'relative' : ''}`}>
      {isMe && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] bg-indigo-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap font-bold">★ 나</div>}
      <span className="text-[9px] sm:text-[10px] text-gray-400 mb-0.5 truncate">{label}</span>
      <span className={`text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded mb-1 truncate ${isMe ? 'bg-indigo-100 text-indigo-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>{tenGod || '-'}</span>
      <div className={`border-2 rounded-xl w-full max-w-[60px] overflow-hidden ${isMe ? 'border-indigo-400 shadow-sm shadow-indigo-100' : 'border-gray-200'}`}>
        <div className={`${elBgs[stemEl]} p-1 sm:p-1.5 text-center`}>
          <div className={`text-lg sm:text-xl font-black ${elColors[stemEl]}`}>{STEMS_HANJA[pillar.stem]}</div>
          <div className="text-[7px] sm:text-[8px] text-gray-500 truncate">{STEMS[pillar.stem]}·{ELEMENTS[stemEl]}·{yinyang}</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className={`${elBgs[branchEl]} p-1 sm:p-1.5 text-center`}>
          <div className={`text-lg sm:text-xl font-black ${elColors[branchEl]}`}>{BRANCHES_HANJA[pillar.branch]}</div>
          <div className="text-[7px] sm:text-[8px] text-gray-500 truncate">{BRANCHES[pillar.branch]}·{ELEMENTS[branchEl]}</div>
        </div>
      </div>
    </div>
  )
}

function EmptyPillarBox() {
  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <span className="text-[9px] sm:text-[10px] text-gray-400 mb-0.5">시주(時)</span>
      <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded mb-1 bg-gray-100 text-gray-400">-</span>
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

/* ── 오행 밸런스 바 (모바일: 짧은 라벨) ── */
function ElementBar({ counts, total }: { counts: number[]; total: number }) {
  const colors = ['bg-green-500','bg-red-500','bg-yellow-500','bg-gray-400','bg-blue-500']
  const names = ['목','화','토','금','수']
  const fullNames = ['목(木)','화(火)','토(土)','금(金)','수(水)']
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-3 mb-1.5">
        {counts.map((c, i) => (
          c > 0 && <div key={i} className={`${colors[i]} transition-all`} style={{ width: `${(c/total)*100}%` }} />
        ))}
      </div>
      <div className="flex justify-between text-[9px] sm:text-[10px]">
        {counts.map((c, i) => (
          <span key={i} className={`${c === 0 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
            <span className="hidden sm:inline">{fullNames[i]}</span>
            <span className="sm:hidden">{names[i]}</span>
            {' '}{c > 0 ? c.toFixed(1) : '없음'}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── 운세 카드 (실행방안 포함, 모바일 패딩 최적화) ── */
function FortuneCard({ icon, title, text, actions, tipLabel, tip, bgClass, actionBg }: {
  icon: string; title: string; text: string; actions: string[];
  tipLabel?: string; tip?: string;
  bgClass?: string; actionBg?: string;
}) {
  return (
    <div className={`rounded-xl p-3 sm:p-4 border ${bgClass || 'bg-white border-gray-100'}`}>
      <h4 className="text-[13px] sm:text-sm font-bold text-gray-800 mb-2">{icon} {title}</h4>
      <p className="text-[12px] sm:text-[13px] text-gray-700 leading-[1.7] mb-3">{text}</p>
      {tip && (
        <p className={`text-[11px] sm:text-[12px] font-medium rounded-lg px-2.5 sm:px-3 py-1.5 mb-3 ${actionBg || 'bg-gray-100 text-gray-700'}`}>
          💡 {tipLabel || '팁'}: {tip}
        </p>
      )}
      <div className={`rounded-lg p-2.5 sm:p-3 ${actionBg || 'bg-gray-50'}`}>
        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 mb-1.5">📋 이렇게 하세요</p>
        <ul className="space-y-1">
          {actions.map((a, i) => (
            <li key={i} className="text-[11px] sm:text-[12px] text-gray-600 leading-relaxed flex items-start gap-1.5">
              <span className="text-[9px] sm:text-[10px] mt-0.5 flex-shrink-0">✅</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ── 섹션 헤더 ── */
function SectionHeader({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] sm:text-sm font-bold text-gray-800 mb-2 sm:mb-2.5 flex items-center gap-1.5">
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
  const year = new Date().getFullYear()
  const gongmangReading = getGongmangReading(result.gongmang)
  const currentDaeun = result.daeun.find(d => d.isCurrent)

  const pillars: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }[] = [
    { label: '시주(時)', pillar: result.hourPillar || { stem: 0, branch: 0 }, tenGod: result.tenGods[3] || '' },
    { label: '일주(日)', pillar: result.dayPillar, tenGod: '나', isMe: true },
    { label: '월주(月)', pillar: result.monthPillar, tenGod: result.tenGods[1] },
    { label: '년주(年)', pillar: result.yearPillar, tenGod: result.tenGods[0] },
  ]

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

      {/* ═══ HEADER (모바일 반응형) ═══ */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 px-3 sm:px-5 py-4 sm:py-5 text-white rounded-t-2xl print:rounded-none">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-indigo-200 text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase">四柱命理 분석 리포트</p>
            <h2 className="text-base sm:text-lg font-black mt-1 leading-tight truncate">{profile.emoji} {profile.title}</h2>
            <p className="text-indigo-200 text-[11px] sm:text-xs mt-0.5 line-clamp-1">{viralSummary}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-sm sm:text-base">{result.birthYear}.{String(result.birthMonth).padStart(2,'0')}.{String(result.birthDay).padStart(2,'0')}</p>
            <p className="text-indigo-200 text-[11px] sm:text-xs">{result.animal}띠 · {result.gender === 'male' ? '남' : '여'}성</p>
            <div className="mt-1 inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
              <span className="text-[9px] sm:text-[10px]">{strength.emoji}</span>
              <span className="text-[9px] sm:text-[10px] font-medium">{strength.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-5 py-3 sm:py-4 space-y-4 sm:space-y-5 print:space-y-3">

        {/* ═══ 1. 나의 타고난 성격 + 사주 기둥 ═══ */}
        <div>
          <SectionHeader color="bg-indigo-500">나의 타고난 성격</SectionHeader>
          <div className="flex gap-1.5 sm:gap-2 justify-center pt-2 pb-3 px-1">
            {pillars.map((p, i) => (
              result.hourPillar || i > 0 ? (
                <PillarBox key={i} label={p.label} pillar={p.pillar} tenGod={p.tenGod} isMe={p.isMe} />
              ) : (
                <EmptyPillarBox key={i} />
              )
            ))}
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-indigo-100">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl sm:text-2xl flex-shrink-0">{profile.emoji}</span>
              <div className="min-w-0">
                <p className="text-[12px] sm:text-sm font-bold text-indigo-800 leading-tight">
                  {STEMS_HANJA[result.dayMaster]}{STEMS[result.dayMaster]} · {profile.element} · {profile.nature}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.personality.map(k => (
                    <span key={k} className="text-[9px] sm:text-[10px] bg-indigo-100 text-indigo-600 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">#{k}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] text-gray-700 leading-[1.7]">{profile.description}</p>
            <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
              {profile.strengths.map(s => (
                <span key={s} className="text-[9px] sm:text-[10px] bg-green-50 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full border border-green-100">✓ {s}</span>
              ))}
            </div>
            <div className="mt-2.5 sm:mt-3 bg-white rounded-lg p-2.5 sm:p-3 border border-indigo-50">
              <p className="text-[11px] sm:text-xs font-bold text-indigo-700 mb-1">{strength.emoji} {strength.label} — {strength.description}</p>
              <p className="text-[11px] sm:text-[12px] text-gray-600 leading-relaxed">{strength.advice}</p>
            </div>
          </div>
        </div>

        {/* ═══ 격국 (Chart Structure) ═══ */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-3 sm:p-4 border border-slate-200">
          <div className="flex items-start gap-2 sm:gap-2.5">
            <span className="text-xl sm:text-2xl flex-shrink-0">🏛️</span>
            <div className="min-w-0">
              <p className="text-[13px] sm:text-sm font-bold text-slate-800 mb-1">{result.gyeokguk.name}</p>
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  result.gyeokguk.quality === 'good' ? 'bg-green-100 text-green-700' :
                  result.gyeokguk.quality === 'challenging' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {result.gyeokguk.quality === 'good' ? '길격(吉格)' : result.gyeokguk.quality === 'challenging' ? '흉격(凶格) — 제화 필요' : '보통격'}
                </span>
              </div>
              <p className="text-[12px] sm:text-[13px] text-gray-700 leading-[1.7]">{result.gyeokguk.description}</p>
            </div>
          </div>
        </div>

        {/* ═══ 2. 오행 밸런스 ═══ */}
        <div>
          <SectionHeader color="bg-emerald-500">☯️ 나의 오행 밸런스</SectionHeader>
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
            <ElementBar counts={result.elementCounts} total={totalElements} />
            {result.missingElements.length > 0 && (
              <div className="mt-2.5 sm:mt-3 bg-amber-50 rounded-lg p-2.5 sm:p-3 border border-amber-100">
                <p className="text-[11px] sm:text-xs font-bold text-amber-800 mb-1">
                  ⚡ 부족한 오행: {result.missingElements.map(e => `${ELEMENTS[e]}(${ELEMENTS_HANJA[e]})`).join(', ')}
                </p>
                <p className="text-[11px] sm:text-[12px] text-amber-700 leading-relaxed">
                  {missingAdvice[result.missingElements[0]]}
                </p>
              </div>
            )}
            {result.missingElements.length === 0 && (
              <div className="mt-2.5 sm:mt-3 bg-green-50 rounded-lg p-2.5 sm:p-3 border border-green-100">
                <p className="text-[11px] sm:text-xs font-bold text-green-800">✨ 오행이 모두 갖춰진 균형 잡힌 사주입니다!</p>
                <p className="text-[11px] sm:text-[12px] text-green-700">큰 결함 없이 안정적인 기운을 타고났습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 3. 올해 재물운 ═══ */}
        <FortuneCard
          icon="💰" title={`${year}년 재물운`}
          text={fortune.money}
          actions={fortune.moneyAction}
          tipLabel="재물 팁" tip={strength.money}
          bgClass="bg-amber-50/70 border-amber-200"
          actionBg="bg-amber-100/50 text-amber-800"
        />

        {/* ═══ 4. 올해 연애운 ═══ */}
        <FortuneCard
          icon="❤️" title={`${year}년 연애운`}
          text={fortune.love}
          actions={fortune.loveAction}
          tipLabel="연애 팁" tip={strength.relationship}
          bgClass="bg-pink-50/70 border-pink-200"
          actionBg="bg-pink-100/50 text-pink-800"
        />

        {/* ═══ 5. 올해 직업운 ═══ */}
        <FortuneCard
          icon="💼" title={`${year}년 직업운`}
          text={fortune.career}
          actions={fortune.careerAction}
          bgClass="bg-blue-50/70 border-blue-200"
          actionBg="bg-blue-100/50 text-blue-800"
        />

        {/* ═══ 6. 올해 건강운 ═══ */}
        <FortuneCard
          icon="🏥" title={`${year}년 건강운`}
          text={fortune.health}
          actions={fortune.healthAction}
          tipLabel="건강 팁" tip={profile.healthTip}
          bgClass="bg-green-50/70 border-green-200"
          actionBg="bg-green-100/50 text-green-800"
        />

        {/* ═══ 7. 올해 주의사항 ═══ */}
        <div className="bg-red-50 rounded-xl p-3 sm:p-4 border-2 border-red-200">
          <h4 className="text-[13px] sm:text-sm font-bold text-red-700 mb-2">⚠️ {year}년 주의사항</h4>
          <p className="text-[12px] sm:text-[13px] text-red-600 leading-[1.7] font-medium">{fortune.warning}</p>
        </div>

        {/* ═══ 8. 올해 사주와의 상호작용 (세운 분석) ═══ */}
        {(result.yearAnalysis.hasCheonganHap || result.yearAnalysis.hasJijiChung || result.yearAnalysis.hasJijiHap) && (
          <div>
            <SectionHeader color="bg-purple-500">🔄 {year}년과 내 사주의 상호작용</SectionHeader>
            <div className="space-y-2">
              {result.yearAnalysis.hasCheonganHap && (
                <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                  <div className="flex items-start gap-2">
                    <span className="text-lg sm:text-xl flex-shrink-0">🤝</span>
                    <div>
                      <p className="text-[12px] sm:text-sm font-bold text-purple-800 mb-1">천간합(天干合) — {result.yearAnalysis.hapTarget}과 합</p>
                      <p className="text-[11px] sm:text-[13px] text-gray-700 leading-[1.7]">
                        올해의 기운이 당신의 {result.yearAnalysis.hapTarget}와 합을 이룹니다. 새로운 인연이나 협력 관계가 생길 수 있어요. 특히 이성 관계에서 강한 끌림이 있을 수 있으며, 사업적 파트너십도 유리합니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {result.yearAnalysis.hasJijiChung && (
                <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200">
                  <div className="flex items-start gap-2">
                    <span className="text-lg sm:text-xl flex-shrink-0">⚡</span>
                    <div>
                      <p className="text-[12px] sm:text-sm font-bold text-red-800 mb-1">지지충(地支衝) — {result.yearAnalysis.chungTarget}과 충돌</p>
                      <p className="text-[11px] sm:text-[13px] text-gray-700 leading-[1.7]">
                        올해의 지지가 당신의 {result.yearAnalysis.chungTarget}와 충돌합니다. {result.yearAnalysis.chungTarget === '일주' ? '배우자나 가까운 사람과의 갈등, 건강 이상에 특히 주의하세요.' : result.yearAnalysis.chungTarget === '월주' ? '직장이나 사회 활동에서 변동이 올 수 있습니다.' : result.yearAnalysis.chungTarget === '년주' ? '부모님이나 어른과의 관계에서 마찰이 생길 수 있어요.' : '자녀나 아랫사람과의 관계에서 갈등이 있을 수 있습니다.'} 교통사고, 낙상에도 주의하세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {result.yearAnalysis.hasJijiHap && (
                <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200">
                  <div className="flex items-start gap-2">
                    <span className="text-lg sm:text-xl flex-shrink-0">💚</span>
                    <div>
                      <p className="text-[12px] sm:text-sm font-bold text-green-800 mb-1">지지합(地支合) — {result.yearAnalysis.hapBranchTarget}과 합</p>
                      <p className="text-[11px] sm:text-[13px] text-gray-700 leading-[1.7]">
                        올해의 지지가 당신의 {result.yearAnalysis.hapBranchTarget}와 합을 이룹니다. 안정적인 인연이 들어오거나 기존 관계가 더 단단해지는 해예요. {result.yearAnalysis.hapBranchTarget === '일주' ? '배우자나 연인과의 관계가 특히 좋아집니다.' : '사회적 관계에서 좋은 협력자를 만날 수 있습니다.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ 건강 위험 분석 (오행 기반) ═══ */}
        {result.yearAnalysis.healthRisk.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-3 sm:p-4 border border-orange-200">
            <h4 className="text-[13px] sm:text-sm font-bold text-orange-800 mb-2">🏥 오행 기반 건강 체크포인트</h4>
            <div className="space-y-2">
              {result.yearAnalysis.healthRisk.map((risk, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[9px] sm:text-[10px] bg-orange-200 text-orange-800 px-1.5 sm:px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5 whitespace-nowrap">{risk.organ}</span>
                  <p className="text-[11px] sm:text-[13px] text-gray-700 leading-[1.6]">{risk.warning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 9. 올해 인생 로드맵 ═══ */}
        <div>
          <SectionHeader color="bg-indigo-500">🗺️ {year}년 인생 로드맵</SectionHeader>
          <div className="space-y-2">
            {[
              { months: '1~3월', label: '1분기 — 기반 다지기', text: fortune.roadmap.q1, from: 'from-emerald-50', to: 'to-green-50', border: 'border-emerald-200', badge: 'bg-emerald-500', title: 'text-emerald-800' },
              { months: '4~6월', label: '2분기 — 본격 실행', text: fortune.roadmap.q2, from: 'from-blue-50', to: 'to-sky-50', border: 'border-blue-200', badge: 'bg-blue-500', title: 'text-blue-800' },
              { months: '7~9월', label: '3분기 — 점검과 조정', text: fortune.roadmap.q3, from: 'from-amber-50', to: 'to-orange-50', border: 'border-amber-200', badge: 'bg-amber-500', title: 'text-amber-800' },
              { months: '10~12월', label: '4분기 — 수확과 준비', text: fortune.roadmap.q4, from: 'from-purple-50', to: 'to-violet-50', border: 'border-purple-200', badge: 'bg-purple-500', title: 'text-purple-800' },
            ].map(q => (
              <div key={q.months} className={`bg-gradient-to-r ${q.from} ${q.to} rounded-xl p-3 sm:p-4 border ${q.border}`}>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                  <span className={`text-[10px] sm:text-xs ${q.badge} text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold whitespace-nowrap`}>{q.months}</span>
                  <span className={`text-[11px] sm:text-xs font-bold ${q.title}`}>{q.label}</span>
                </div>
                <p className="text-[11px] sm:text-[13px] text-gray-700 leading-[1.7]">{q.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-lg p-2.5 sm:p-3 border border-green-100 text-center">
              <p className="text-[9px] sm:text-[10px] text-green-600 font-medium mb-0.5">행운의 달</p>
              <p className="text-[12px] sm:text-sm font-bold text-green-800">{fortune.bestMonths}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5 sm:p-3 border border-red-100 text-center">
              <p className="text-[9px] sm:text-[10px] text-red-600 font-medium mb-0.5">주의할 달</p>
              <p className="text-[12px] sm:text-sm font-bold text-red-800">{fortune.worstMonths}</p>
            </div>
          </div>
        </div>

        {/* ═══ 이달의 운세 ═══ */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-3 sm:p-4 text-white">
          <h3 className="text-[13px] sm:text-sm font-bold mb-2.5 sm:mb-3 flex items-center gap-1">📅 {currentMonth}월 — 이달의 운세</h3>
          <div className="space-y-2 sm:space-y-2.5">
            <div className="bg-white/15 rounded-lg p-2.5 sm:p-3">
              <div className="text-[10px] sm:text-[11px] font-bold text-yellow-300 mb-1">💰 이달의 재물</div>
              <p className="text-[11px] sm:text-[12px] text-white/95 leading-relaxed">{monthDetail.money}</p>
            </div>
            <div className="bg-white/15 rounded-lg p-2.5 sm:p-3">
              <div className="text-[10px] sm:text-[11px] font-bold text-pink-300 mb-1">❤️ 이달의 연애</div>
              <p className="text-[11px] sm:text-[12px] text-white/95 leading-relaxed">{monthDetail.love}</p>
            </div>
            <div className="bg-white/15 rounded-lg p-2.5 sm:p-3">
              <div className="text-[10px] sm:text-[11px] font-bold text-red-300 mb-1">⚠️ 이달의 주의</div>
              <p className="text-[11px] sm:text-[12px] text-white/95 leading-relaxed">{monthDetail.warning}</p>
            </div>
          </div>
        </div>

        {/* ═══ 10. 나의 에너지 상태 (십이운성) ═══ */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-violet-200">
          <SectionHeader color="bg-violet-500">나의 에너지 상태</SectionHeader>
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl flex-shrink-0">{energyStage.emoji}</span>
            <div>
              <p className="text-[12px] sm:text-sm font-bold text-violet-700 mb-1">{energyStage.title}</p>
              <p className="text-[12px] sm:text-[13px] text-gray-700 leading-[1.7]">{energyStage.description}</p>
            </div>
          </div>
        </div>

        {/* ═══ 11. 나의 숨은 기운 (신살) ═══ */}
        {sinsalReadings.length > 0 && (
          <div>
            <SectionHeader color="bg-amber-500">🔮 나의 숨은 기운</SectionHeader>
            <div className="space-y-2 sm:space-y-2.5">
              {sinsalReadings.map((reading, i) => (
                <div key={i} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 border border-amber-200">
                  <div className="flex items-start gap-2 sm:gap-2.5">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{reading.icon}</span>
                    <div>
                      <p className="text-[12px] sm:text-sm font-bold text-amber-800 mb-1">{reading.title}</p>
                      <p className="text-[12px] sm:text-[13px] text-gray-700 leading-[1.7]">{reading.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 12. 공망 분석 ═══ */}
        {gongmangReading && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-3 sm:p-4 border border-gray-200">
            <div className="flex items-start gap-2 sm:gap-2.5">
              <span className="text-xl sm:text-2xl flex-shrink-0">{gongmangReading.icon}</span>
              <div>
                <p className="text-[12px] sm:text-sm font-bold text-gray-800 mb-1">{gongmangReading.title}</p>
                <p className="text-[12px] sm:text-[13px] text-gray-700 leading-[1.7]">{gongmangReading.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ 13. 대운 흐름 (모바일: 2행 4열) ═══ */}
        <div>
          <SectionHeader color="bg-teal-500">🌊 나의 대운(大運) 흐름</SectionHeader>
          <p className="text-[11px] sm:text-[12px] text-gray-500 mb-2 sm:mb-3">10년마다 바뀌는 인생의 큰 물결입니다. {currentDaeun ? `현재 ${currentDaeun.tenGod}운이 흐르고 있습니다.` : ''}</p>
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
            {result.daeun.map((d, i) => {
              const elColors = ['text-green-700','text-red-600','text-yellow-700','text-gray-600','text-blue-700']
              const elBgs = ['bg-green-50','bg-red-50','bg-yellow-50','bg-gray-50','bg-blue-50']
              return (
                <div key={i} className={`rounded-lg p-1.5 sm:p-2 text-center border ${d.isCurrent ? 'border-teal-400 bg-teal-50 ring-1 ring-teal-300' : 'border-gray-100 bg-white'}`}>
                  <p className="text-[8px] sm:text-[9px] text-gray-400">{d.startAge}~{d.startAge + 9}세</p>
                  <div className={`text-sm sm:text-base font-black ${elColors[d.element]}`}>
                    {STEMS_HANJA[d.stem]}{BRANCHES_HANJA[d.branch]}
                  </div>
                  <span className={`text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-full font-medium inline-block ${elBgs[d.element]} ${elColors[d.element]}`}>
                    {d.tenGod}
                  </span>
                  {d.isCurrent && <p className="text-[7px] sm:text-[8px] text-teal-600 font-bold mt-0.5">← 현재</p>}
                </div>
              )
            })}
          </div>
          {currentDaeun && (
            <div className="mt-2.5 sm:mt-3 bg-teal-50 rounded-lg p-2.5 sm:p-3 border border-teal-200">
              <p className="text-[11px] sm:text-xs font-bold text-teal-800 mb-1">🔮 현재 대운: {STEMS[currentDaeun.stem]}{BRANCHES[currentDaeun.branch]} ({currentDaeun.tenGod}운)</p>
              <p className="text-[11px] sm:text-[12px] text-gray-700 leading-relaxed">
                {currentDaeun.tenGod === '비견' || currentDaeun.tenGod === '겁재' ? '자기 실력을 키우고 독립적으로 성장하는 시기입니다. 동업보다는 혼자 힘으로 개척하세요.' :
                 currentDaeun.tenGod === '식신' || currentDaeun.tenGod === '상관' ? '창의력과 표현력이 빛나는 시기입니다. 새로운 사업, 콘텐츠, 예술 활동에서 성과를 낼 수 있어요.' :
                 currentDaeun.tenGod === '편재' || currentDaeun.tenGod === '정재' ? '재물운이 활발한 시기입니다. 투자와 사업에서 좋은 성과를 기대할 수 있으며, 경제적 여유가 생깁니다.' :
                 currentDaeun.tenGod === '편관' || currentDaeun.tenGod === '정관' ? '사회적 지위와 명예가 올라가는 시기입니다. 승진, 합격, 사회적 인정을 받을 수 있어요.' :
                 '학습과 자기계발에 최적인 시기입니다. 자격증 취득, 학위 취득, 전문성 강화에 투자하면 큰 성과를 거둡니다.'}
              </p>
            </div>
          )}
        </div>

        {/* ═══ Footer ═══ */}
        <div className="text-center pt-2 sm:pt-3 border-t border-gray-100">
          <p className="text-[8px] sm:text-[9px] text-gray-400">노후연구소 四柱命理 분석 · nohu-lab.vercel.app · 전통 사주명리학 기반 재미 콘텐츠</p>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

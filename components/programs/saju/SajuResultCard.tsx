'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES, BRANCHES_HANJA,
  ELEMENTS, ELEMENTS_HANJA, Pillar,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  getYearFortune, getViralSummary,
  getUsefulGodAdvice, TEN_GOD_INTERPRETATIONS,
  SINSAL_INTERPRETATIONS, TWELVE_STAGE_INTERPRETATIONS,
  getDaeunInterpretation,
  HAPCHUNG_INTERPRETATIONS, EXTRA_SINSAL_INTERPRETATIONS,
  TWELVE_SINSAL_INTERPRETATIONS, JONGGUK_INTERPRETATIONS,
  JOHU_INTERPRETATIONS, WOLUN_RATING_LABELS,
  ROOT_STRENGTH_LABELS, GONGMANG_SEVERITY_LABELS,
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
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear(), result.isDayMasterStrong, result.dayMaster)
  const viralSummary = getViralSummary(result.dayMaster, result.isDayMasterStrong)
  const strength = STRENGTH_INTERPRETATIONS[result.isDayMasterStrong ? 'strong' : 'weak']
  const totalElements = result.elementCounts.reduce((a, b) => a + b, 0) || 1
  const year = new Date().getFullYear()
  const usefulGodAdvice = getUsefulGodAdvice(result.usefulGod)

  // 십신 분석: 가장 많은 십신 (일주 제외)
  const dominantTenGod = result.yearAnalysis.dominantTenGod
  const dominantTGInfo = TEN_GOD_INTERPRETATIONS[dominantTenGod]

  // 신살 모으기
  const activeSinsal: { key: string; info: typeof SINSAL_INTERPRETATIONS[string] }[] = []
  if (result.sinsal.hasCheoneul) activeSinsal.push({ key: 'cheoneul', info: SINSAL_INTERPRETATIONS.cheoneul })
  if (result.sinsal.hasMunchang) activeSinsal.push({ key: 'munchang', info: SINSAL_INTERPRETATIONS.munchang })
  if (result.sinsal.hasYeokma) activeSinsal.push({ key: 'yeokma', info: SINSAL_INTERPRETATIONS.yeokma })
  if (result.sinsal.hasDohwa) activeSinsal.push({ key: 'dohwa', info: SINSAL_INTERPRETATIONS.dohwa })
  if (result.sinsal.hasHwagae) activeSinsal.push({ key: 'hwagae', info: SINSAL_INTERPRETATIONS.hwagae })
  if (result.sinsal.hasYangin) activeSinsal.push({ key: 'yangin', info: SINSAL_INTERPRETATIONS.yangin })
  if (result.sinsal.hasGeobsal) activeSinsal.push({ key: 'geobsal', info: SINSAL_INTERPRETATIONS.geobsal })

  // 십이운성
  const stageInfo = TWELVE_STAGE_INTERPRETATIONS[result.sinsal.dayEnergyName]

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

        {/* ═══ 격국·십신·운성 ═══ */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            사주 심층 분석
          </h3>
          <div className="space-y-2.5">
            {/* 격국 */}
            <div className="bg-purple-50 rounded-xl p-3.5 sm:p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏛️</span>
                <h4 className="text-[13px] sm:text-sm font-black text-purple-800">{result.gyeokguk.name}</h4>
                <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  result.gyeokguk.quality === 'good' ? 'bg-green-100 text-green-700' :
                  result.gyeokguk.quality === 'challenging' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{result.gyeokguk.quality === 'good' ? '길격' : result.gyeokguk.quality === 'challenging' ? '흉격' : '중격'}</span>
              </div>
              <p className="text-[12px] sm:text-[13px] text-gray-700 leading-relaxed">{result.gyeokguk.description}</p>
            </div>

            {/* 십이운성 */}
            {stageInfo && (
              <div className="bg-indigo-50 rounded-xl p-3.5 sm:p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔄</span>
                  <h4 className="text-[13px] sm:text-sm font-black text-indigo-800">
                    십이운성: {result.sinsal.dayEnergyName}({stageInfo.keyword})
                  </h4>
                </div>
                <p className="text-[12px] sm:text-[13px] text-gray-700 leading-relaxed">{stageInfo.desc}</p>
              </div>
            )}

            {/* 주도 십신 */}
            {dominantTGInfo && (
              <div className="bg-cyan-50 rounded-xl p-3.5 sm:p-4 border border-cyan-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{dominantTGInfo.emoji}</span>
                  <h4 className="text-[13px] sm:text-sm font-black text-cyan-800">
                    주도 십신: {dominantTGInfo.name}
                  </h4>
                  <span className="text-[9px] sm:text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full font-medium">{dominantTGInfo.keyword}</span>
                </div>
                <p className="text-[12px] sm:text-[13px] text-gray-700 leading-relaxed mb-2">{dominantTGInfo.personality}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white/70 rounded-lg p-2.5 border border-cyan-100">
                    <p className="text-[10px] sm:text-[11px] font-bold text-cyan-600 mb-1">💰 재물</p>
                    <p className="text-[11px] sm:text-[12px] text-gray-700 leading-relaxed">{dominantTGInfo.fortune}</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2.5 border border-cyan-100">
                    <p className="text-[10px] sm:text-[11px] font-bold text-cyan-600 mb-1">❤️ 연애</p>
                    <p className="text-[11px] sm:text-[12px] text-gray-700 leading-relaxed">{dominantTGInfo.love}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 신살 (있는 경우에만) ═══ */}
        {activeSinsal.length > 0 && (
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
              타고난 신살(神殺)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeSinsal.map(({ key, info }) => (
                <div key={key} className="bg-gray-50 rounded-xl p-3 sm:p-3.5 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-base">{info.emoji}</span>
                    <span className="text-[12px] sm:text-[13px] font-black text-gray-800">{info.name}</span>
                  </div>
                  <p className="text-[11px] sm:text-[12px] text-gray-600 leading-relaxed mb-1.5">{info.detail}</p>
                  <p className="text-[10px] sm:text-[11px] text-orange-600 font-medium bg-orange-50 rounded-lg px-2 py-1.5">💡 {info.advice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 합충형파해 분석 ═══ */}
        {result.hapChung.details.length > 0 && (
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
              합충형파해(合沖刑破害) 분석
            </h3>
            <div className="space-y-2">
              {result.hapChung.details.map((d, i) => {
                const typeInfo: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
                  'cheongan-hap': { emoji: '🤝', color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' },
                  'jiji-yukap': { emoji: '💞', color: 'text-pink-800', bg: 'bg-pink-50', border: 'border-pink-200' },
                  'samhap': { emoji: '🔺', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                  'chung': { emoji: '⚡', color: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200' },
                  'hyung': { emoji: '🔥', color: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200' },
                  'pa': { emoji: '💔', color: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200' },
                  'hae': { emoji: '😣', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
                }
                const info = typeInfo[d.type] || typeInfo['chung']
                return (
                  <div key={i} className={`${info.bg} rounded-xl p-3 sm:p-3.5 border ${info.border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{info.emoji}</span>
                      <span className={`text-[12px] sm:text-[13px] font-black ${info.color}`}>
                        {d.pillar1} ↔ {d.pillar2}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        d.effect === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{d.effect === 'positive' ? '길' : '흉'}</span>
                    </div>
                    <p className="text-[11px] sm:text-[12px] text-gray-600 leading-relaxed">{d.description}</p>
                    {HAPCHUNG_INTERPRETATIONS[d.type] && (
                      <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1 leading-relaxed">{HAPCHUNG_INTERPRETATIONS[d.type].detail}</p>
                    )}
                  </div>
                )
              })}
              <div className={`rounded-xl p-3 border text-center text-[12px] sm:text-[13px] font-bold ${
                result.hapChung.overallTendency === 'harmonious' ? 'bg-green-50 border-green-200 text-green-800' :
                result.hapChung.overallTendency === 'conflicting' ? 'bg-red-50 border-red-200 text-red-800' :
                result.hapChung.overallTendency === 'mixed' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
                {result.hapChung.overallTendency === 'harmonious' && '🌈 사주 내 합(合)의 기운이 우세하여 조화로운 구조입니다'}
                {result.hapChung.overallTendency === 'conflicting' && '⚡ 사주 내 충극의 기운이 있어 변화와 도전이 많은 구조입니다'}
                {result.hapChung.overallTendency === 'mixed' && '☯️ 합과 충이 공존하여 역동적인 사주 구조입니다'}
                {result.hapChung.overallTendency === 'neutral' && '😌 특별한 합충 없이 안정적인 사주 구조입니다'}
              </div>
            </div>
          </div>
        )}

        {/* ═══ 종격 (특수 격국) ═══ */}
        {result.jongguk && (() => {
          const jongInfo = JONGGUK_INTERPRETATIONS[result.jongguk.type.replace('gyeok', '격').replace('jong', '종')]
          return (
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
                특수 격국 발견
              </h3>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 sm:p-5 border-2 border-amber-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{jongInfo?.emoji || '🌟'}</span>
                  <h4 className="text-[14px] sm:text-base font-black text-amber-900">{result.jongguk!.name}</h4>
                  <span className="text-[9px] sm:text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">특수격</span>
                </div>
                <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.85]">
                  {jongInfo?.description || result.jongguk!.description}
                </p>
                <p className="text-[11px] sm:text-[12px] text-amber-700 mt-2 font-medium">
                  따르는 오행: {ELEMENTS[result.jongguk!.followElement]}({ELEMENTS_HANJA[result.jongguk!.followElement]})
                </p>
              </div>
            </div>
          )
        })()}

        {/* ═══ 투간/통근 분석 ═══ */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            투간·통근(透干·通根) 분석
          </h3>
          <div className="bg-teal-50 rounded-xl p-3.5 sm:p-4 border border-teal-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{
                result.tuganTonggeun.rootStrength === 'strong' ? '🌲' :
                result.tuganTonggeun.rootStrength === 'medium' ? '🌿' :
                result.tuganTonggeun.rootStrength === 'weak' ? '🍀' : '🍂'
              }</span>
              <h4 className="text-[13px] sm:text-sm font-black text-teal-800">
                일간 뿌리: {
                  result.tuganTonggeun.rootStrength === 'strong' ? '깊은 뿌리 (강)' :
                  result.tuganTonggeun.rootStrength === 'medium' ? '적당한 뿌리 (중)' :
                  result.tuganTonggeun.rootStrength === 'weak' ? '약한 뿌리 (약)' : '뿌리 없음'
                }
              </h4>
            </div>
            <p className="text-[12px] sm:text-[13px] text-gray-700 leading-relaxed mb-2">
              {ROOT_STRENGTH_LABELS[result.tuganTonggeun.rootStrength]?.detail || '일간의 통근 상태를 분석합니다.'}
            </p>
            {result.tuganTonggeun.tonggeun.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Array.from(new Set(result.tuganTonggeun.tonggeun.map(t => `${t.stemName}→${t.inBranch}`))).map((label, i) => (
                  <span key={i} className="text-[10px] sm:text-[11px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ 조후용신 ═══ */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            조후용신(調候用神) 분석
          </h3>
          {(() => {
            const johuKey = result.johu.temperature === '더움' ? 'hot' :
              result.johu.temperature === '따뜻함' ? 'warm' :
              result.johu.temperature === '서늘함' ? 'cool' : 'cold'
            const johuInfo = JOHU_INTERPRETATIONS[johuKey]
            return (
              <div className="bg-sky-50 rounded-xl p-3.5 sm:p-4 border border-sky-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{johuInfo?.emoji || '🌡️'}</span>
                  <h4 className="text-[13px] sm:text-sm font-black text-sky-800">
                    태어난 계절: {result.johu.season} ({result.johu.temperature})
                  </h4>
                </div>
                <p className="text-[12px] sm:text-[13px] text-gray-700 leading-relaxed mb-2">
                  {johuInfo?.description || result.johu.explanation}
                </p>
                <div className="bg-white/70 rounded-lg px-3 py-2 border border-sky-100 space-y-1">
                  <p className="text-[11px] sm:text-[12px] text-sky-700 font-bold">
                    조후 필요 오행: {ELEMENTS[result.johu.neededElement]}({ELEMENTS_HANJA[result.johu.neededElement]})
                  </p>
                  {johuInfo?.advice && (
                    <p className="text-[10px] sm:text-[11px] text-sky-600">{johuInfo.advice}</p>
                  )}
                </div>
              </div>
            )
          })()}
        </div>

        {/* ═══ 추가 신살 ═══ */}
        {(() => {
          const es = result.enhancedSinsal
          const extraKeys: { key: string; has: boolean }[] = [
            { key: 'cheonduk', has: es.hasCheonduk },
            { key: 'wolduk', has: es.hasWolduk },
            { key: 'bokseong', has: es.hasBokseong },
            { key: 'taeguk', has: es.hasTaeguk },
            { key: 'hakdang', has: es.hasHakdang },
            { key: 'cheonui', has: es.hasCheonui },
            { key: 'geumyeo', has: es.hasGeumyeo },
            { key: 'hongyeom', has: es.hasHongyeom },
            { key: 'baekho', has: es.hasBaekho },
            { key: 'gwimungwan', has: es.hasGwimungwan },
            { key: 'wonjin', has: es.hasWonjin },
            { key: 'cheonla', has: es.hasCheonla },
            { key: 'jimang', has: es.hasJimang },
            { key: 'gyeokgak', has: es.hasGyeokgak },
          ]
          const extraSinsal = extraKeys
            .filter(({ has }) => has)
            .map(({ key }) => {
              const info = EXTRA_SINSAL_INTERPRETATIONS[key]
              return info ? { key, name: info.name, emoji: info.emoji, isPositive: info.isPositive, detail: info.detail, advice: info.advice } : null
            })
            .filter(Boolean) as { key: string; name: string; emoji: string; isPositive: boolean; detail: string; advice: string }[]

          if (extraSinsal.length === 0) return null
          return (
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
                추가 신살 분석
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extraSinsal.map(({ key, name, emoji, isPositive, detail, advice }) => (
                  <div key={key} className={`rounded-xl p-3 sm:p-3.5 border ${isPositive ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-base">{emoji}</span>
                      <span className={`text-[12px] sm:text-[13px] font-black ${isPositive ? 'text-emerald-800' : 'text-rose-800'}`}>{name}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {isPositive ? '길신' : '흉신'}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-[12px] text-gray-600 leading-relaxed mb-1.5">{detail}</p>
                    {advice && <p className="text-[10px] sm:text-[11px] text-orange-600 font-medium bg-orange-50 rounded-lg px-2 py-1.5">💡 {advice}</p>}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ═══ 12신살 ═══ */}
        {(() => {
          const twInfo = TWELVE_SINSAL_INTERPRETATIONS[result.enhancedSinsal.twelveAnimalSinsal]
          return (
            <div className="bg-violet-50 rounded-xl p-3.5 sm:p-4 border border-violet-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{twInfo?.emoji || '🔮'}</span>
                <h4 className="text-[13px] sm:text-sm font-black text-violet-800">
                  12신살: {result.enhancedSinsal.twelveAnimalSinsal}
                </h4>
                <span className="text-[9px] sm:text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">
                  {twInfo?.keyword || ''}
                </span>
              </div>
              <p className="text-[12px] sm:text-[13px] text-gray-700 leading-relaxed">
                {twInfo?.detail || '12신살 분석 결과입니다.'}
              </p>
            </div>
          )
        })()}

        {/* ═══ 심층 공망 분석 ═══ */}
        {result.enhancedGongmang.severity !== 'none' && (
          <div className="bg-gray-50 rounded-xl p-3.5 sm:p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{
                result.enhancedGongmang.severity === 'high' ? '⚫' :
                result.enhancedGongmang.severity === 'medium' ? '🔘' : '⚪'
              }</span>
              <h4 className="text-[13px] sm:text-sm font-black text-gray-800">
                공망(空亡) 분석: {BRANCHES[result.enhancedGongmang.voidBranches[0]]}·{BRANCHES[result.enhancedGongmang.voidBranches[1]]} 공망
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {result.enhancedGongmang.yearVoid && <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">년주 공망</span>}
              {result.enhancedGongmang.monthVoid && <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">월주 공망</span>}
              {result.enhancedGongmang.hourVoid && <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">시주 공망</span>}
            </div>
            <p className="text-[12px] sm:text-[13px] text-gray-600 leading-relaxed">{
              result.enhancedGongmang.severity === 'high' ? '주요 기둥이 공망에 빠져 해당 영역의 기운이 크게 약해집니다. 노력으로 보완하면 오히려 더 큰 성취를 이룹니다.' :
              result.enhancedGongmang.severity === 'medium' ? '일부 기둥이 공망에 걸려 있지만 다른 기둥이 보완합니다. 해당 영역에서 노력이 더 필요해요.' :
              '공망의 영향이 미미하여 큰 걱정은 필요 없습니다.'
            }</p>
          </div>
        )}

        {/* ═══ 대운 흐름 ═══ */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            대운(大運) 흐름
          </h3>
          <div className="space-y-2">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {result.daeun.map((d, i) => (
                <div key={i} className={`flex-shrink-0 text-center rounded-xl p-2 sm:p-2.5 min-w-[60px] sm:min-w-[70px] border-2 ${
                  d.isCurrent ? 'bg-orange-50 border-orange-400 shadow-sm' : 'bg-gray-50 border-gray-200'
                }`}>
                  {d.isCurrent && <p className="text-[7px] sm:text-[8px] text-orange-500 font-bold mb-0.5">▶ 현재</p>}
                  <p className="text-[9px] sm:text-[10px] text-gray-500">{d.startAge}~{d.startAge + 9}세</p>
                  <p className="text-[12px] sm:text-sm font-bold text-gray-800">{d.tenGod}</p>
                </div>
              ))}
            </div>
            {currentDaeun && (
              <div className="bg-orange-50 rounded-xl p-3.5 sm:p-4 border border-orange-200">
                <h4 className="text-[12px] sm:text-[13px] font-black text-orange-800 mb-1.5">
                  현재 대운: {currentDaeun.tenGod}운 ({currentDaeun.startAge}~{currentDaeun.startAge + 9}세)
                </h4>
                <p className="text-[12px] sm:text-[13px] text-gray-700 leading-relaxed">
                  {getDaeunInterpretation(currentDaeun.tenGod, currentDaeun.element)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 3. 올해 운세 ═══ */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            {year}년 운세
          </h3>
          <div className="space-y-3">
            {/* 총운 */}
            <div className="bg-orange-50 rounded-xl p-4 sm:p-5 border border-orange-200">
              <h4 className="text-sm sm:text-base font-black text-orange-800 mb-2">🔮 총운</h4>
              <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.85]">{fortune.overview}</p>
            </div>

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

            {/* 건강운 */}
            <div className="bg-green-50 rounded-xl p-4 sm:p-5 border border-green-200">
              <h4 className="text-sm sm:text-base font-black text-green-800 mb-2">🏥 건강운</h4>
              <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.85]">{fortune.health}</p>
            </div>

            {/* 인간관계운 */}
            {fortune.relationship && (
              <div className="bg-violet-50 rounded-xl p-4 sm:p-5 border border-violet-200">
                <h4 className="text-sm sm:text-base font-black text-violet-800 mb-2">🤝 인간관계운</h4>
                <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.85]">{fortune.relationship}</p>
              </div>
            )}

            {/* 주요 사건 */}
            {fortune.keyEvents && fortune.keyEvents.length > 0 && (
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 sm:p-5 text-white">
                <h4 className="text-sm sm:text-base font-black mb-3">📅 올해 주요 시기</h4>
                <div className="space-y-2">
                  {fortune.keyEvents.map((event, i) => (
                    <div key={i} className="bg-white/15 rounded-lg px-3 py-2">
                      <p className="text-[12px] sm:text-[13px] text-white/95 leading-relaxed">{event}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 행동지침 */}
            {fortune.action && fortune.action.length > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4 sm:p-5 border border-emerald-200">
                <h4 className="text-sm sm:text-base font-black text-emerald-800 mb-3">✅ 올해 이렇게 하세요</h4>
                <ul className="space-y-2">
                  {fortune.action.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] sm:text-sm text-gray-800 leading-relaxed">
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
                <h4 className="text-sm sm:text-base font-black text-red-800 mb-3">⚠️ 이것만은 조심하세요</h4>
                <ul className="space-y-2">
                  {fortune.caution.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] sm:text-sm text-gray-800 leading-relaxed">
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
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            {year}년 월별 운세
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
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
                <div key={w.month} className={`rounded-lg p-1.5 sm:p-2 border text-center ${ratingColors[w.rating] || ratingColors[3]}`}>
                  <p className="text-[9px] sm:text-[10px] font-bold">{w.month}월</p>
                  <p className="text-sm sm:text-base">{ratingEmoji[w.rating] || '😐'}</p>
                  <p className="text-[8px] sm:text-[9px] font-medium mt-0.5">{w.keyword}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ 4. 행운/주의 달 ═══ */}
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

        {/* ═══ 6. 개운법 (용신 기반) ═══ */}
        <div className="bg-orange-50 rounded-2xl p-4 sm:p-5 border border-orange-200">
          <h3 className="text-sm sm:text-base font-black text-orange-800 mb-2">🍀 당신만의 개운법</h3>
          <p className="text-[12px] sm:text-[13px] text-orange-700 leading-relaxed mb-2">
            당신에게 필요한 기운은 <strong>{ELEMENTS[result.usefulGod]}({ELEMENTS_HANJA[result.usefulGod]})</strong>입니다.
          </p>
          <p className="text-[13px] sm:text-sm text-gray-800 leading-[1.8]">{usefulGodAdvice}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg p-2 border border-orange-100">
              <p className="text-[9px] sm:text-[10px] text-gray-500">행운 색</p>
              <p className="text-[12px] sm:text-sm font-bold text-gray-800">{profile.luckyColor}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-orange-100">
              <p className="text-[9px] sm:text-[10px] text-gray-500">행운 방향</p>
              <p className="text-[12px] sm:text-sm font-bold text-gray-800">{profile.luckyDirection}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-orange-100">
              <p className="text-[9px] sm:text-[10px] text-gray-500">행운 숫자</p>
              <p className="text-[12px] sm:text-sm font-bold text-gray-800">{profile.luckyNumber}</p>
            </div>
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

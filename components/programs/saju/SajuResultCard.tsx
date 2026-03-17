'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES_HANJA,
  ELEMENTS, Pillar,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG, ELEMENTS_HANJA,
  MonthlyFortune, MajorLuck,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, USEFUL_GOD_TIPS,
  getYearFortune, getViralSummary, getCompatibilityHint,
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
      <div className={`border rounded-lg w-[56px] overflow-hidden ${isMe ? 'border-indigo-400' : 'border-gray-200'}`}>
        <div className={`${elBgs[stemEl]} p-1 text-center`}>
          <div className={`text-lg font-black ${elColors[stemEl]}`}>{STEMS_HANJA[pillar.stem]}</div>
          <div className="text-[8px] text-gray-500">{STEMS[pillar.stem]}·{ELEMENTS[stemEl]}·{yinyang}</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className={`${elBgs[branchEl]} p-1 text-center`}>
          <div className={`text-lg font-black ${elColors[branchEl]}`}>{BRANCHES_HANJA[pillar.branch]}</div>
          <div className="text-[8px] text-gray-500">{ELEMENTS[branchEl]}</div>
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
      <div className="border border-dashed border-gray-200 rounded-lg w-[56px] overflow-hidden">
        <div className="bg-gray-50 p-1 text-center">
          <div className="text-lg text-gray-300">?</div>
          <div className="text-[8px] text-gray-300">미입력</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className="bg-gray-50 p-1 text-center">
          <div className="text-lg text-gray-300">?</div>
        </div>
      </div>
    </div>
  )
}

function MonthlyFortuneGrid({ fortunes }: { fortunes: MonthlyFortune[] }) {
  const currentMonth = new Date().getMonth() + 1
  return (
    <div className="grid grid-cols-6 gap-1">
      {fortunes.map(f => (
        <div key={f.month} className={`rounded p-1 text-center border ${
          f.month === currentMonth ? 'border-purple-400 bg-purple-50' :
          f.isBest ? 'border-green-300 bg-green-50' :
          f.isWorst ? 'border-red-300 bg-red-50' :
          'border-gray-100 bg-gray-50'
        }`}>
          <div className="text-[9px] text-gray-500">{f.month}월</div>
          <div className="text-yellow-400 text-[9px] leading-tight">{'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}</div>
          <div className={`text-[7px] font-medium ${
            f.month === currentMonth ? 'text-purple-600' : f.isBest ? 'text-green-600' : f.isWorst ? 'text-red-500' : 'text-gray-400'
          }`}>{f.month === currentMonth ? '📍지금' : f.isBest ? '🍀최고' : f.isWorst ? '⚡주의' : ''}</div>
        </div>
      ))}
    </div>
  )
}

function MajorLuckTimeline({ lucks }: { lucks: MajorLuck[] }) {
  const elColors = ['text-green-600','text-red-500','text-yellow-600','text-gray-500','text-blue-600']
  const elBgs = ['bg-green-50','bg-red-50','bg-yellow-50','bg-gray-50','bg-blue-50']
  return (
    <div className="flex gap-0.5 overflow-x-auto print:overflow-visible print:flex-wrap">
      {lucks.map((l, i) => (
        <div key={i} className={`flex-shrink-0 rounded p-1 text-center min-w-[52px] border ${
          l.isCurrent ? 'border-purple-400 bg-purple-50' : 'border-gray-100 ' + elBgs[l.element]
        }`}>
          <div className="text-[8px] text-gray-400">{l.startAge}~{l.endAge}세</div>
          <div className={`text-[10px] font-black ${l.isCurrent ? 'text-purple-700' : elColors[l.element]}`}>
            {STEMS_HANJA[l.stem]}{BRANCHES_HANJA[l.branch]}
          </div>
          <div className="text-yellow-400 text-[8px]">{'★'.repeat(l.rating)}</div>
          <div className={`text-[7px] font-medium ${l.isCurrent ? 'text-purple-600' : 'text-gray-400'}`}>
            {l.isCurrent ? '📍현재' : l.keyword}
          </div>
        </div>
      ))}
    </div>
  )
}

const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear())
  const viralSummary = getViralSummary(result.dayMaster, result.isDayMasterStrong)
  const usefulGodTip = USEFUL_GOD_TIPS[result.usefulGod]

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
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 py-3 text-white rounded-t-2xl print:rounded-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-[9px] tracking-widest">四柱命理 분석 리포트</p>
              <h2 className="text-base sm:text-lg font-black mt-0.5">{profile.emoji} {profile.title}</h2>
              <p className="text-indigo-200 text-[10px]">{viralSummary}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">{result.birthYear}.{String(result.birthMonth).padStart(2,'0')}.{String(result.birthDay).padStart(2,'0')}</p>
              <p className="text-indigo-200 text-[10px]">{result.animal}띠 · {result.gender === 'male' ? '남' : '여'}성</p>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 py-3 space-y-2.5 print:space-y-2 print:px-3 print:py-1.5">

          {/* ═══ 사주팔자 + 성격 키워드 ═══ */}
          <div className="flex items-start gap-3">
            <div className="flex gap-1.5 pt-1">
              {pillars.map((p, i) => (
                result.hourPillar || i > 0 ? (
                  <PillarBox key={i} label={p.label} pillar={p.pillar} tenGod={p.tenGod} isMe={p.isMe} />
                ) : (
                  <EmptyPillarBox key={i} />
                )
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-indigo-700 mb-1">
                {STEMS_HANJA[result.dayMaster]}{STEMS[result.dayMaster]} · {profile.element} · {profile.nature}
              </div>
              <div className="flex flex-wrap gap-0.5 mb-1.5">
                {profile.personality.map(k => (
                  <span key={k} className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">#{k}</span>
                ))}
              </div>
              <p className="text-[9px] text-gray-600 leading-relaxed line-clamp-3">{profile.description}</p>
            </div>
          </div>

          {/* ═══ 이달의 운세 (가장 궁금한 것) ═══ */}
          {result.currentMonthFortune && (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-2.5 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold">📅 {new Date().getMonth() + 1}월 — 이달의 운세</h3>
                <span className="text-yellow-300 text-[10px]">{'★'.repeat(result.currentMonthFortune.rating)}{'☆'.repeat(5-result.currentMonthFortune.rating)}</span>
              </div>
              <p className="text-[11px] font-bold text-white/90 mt-0.5">{result.currentMonthFortune.keyword}</p>
              <p className="text-[9px] text-white/75 mt-0.5">{result.currentMonthFortune.advice}</p>
            </div>
          )}

          {/* ═══ 올해 운세 ═══ */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-2.5 border border-purple-100">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="text-[10px] font-bold text-gray-800">🗓️ {new Date().getFullYear()}년 운세</h3>
              <span className="text-yellow-400 text-[10px]">{'★'.repeat(fortune.stars)}{'☆'.repeat(5-fortune.stars)}</span>
            </div>
            <p className="text-[10px] font-medium text-purple-700">{fortune.title}</p>
            <p className="text-[9px] text-gray-600 mt-0.5">{fortune.description}</p>
            <p className="text-[9px] text-purple-600 font-medium mt-0.5">💡 {fortune.advice}</p>
          </div>

          {/* ═══ 월별 운세 캘린더 ═══ */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-800 mb-1.5 flex items-center gap-1">
              <span className="w-0.5 h-3 bg-purple-500 rounded-full inline-block" />
              {new Date().getFullYear()}년 월별 운세
            </h3>
            <MonthlyFortuneGrid fortunes={result.monthlyFortunes} />
          </div>

          {/* ═══ 재물운 · 연애운 · 궁합 ═══ */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
              <h4 className="text-[9px] font-bold text-amber-800 mb-0.5">💰 재물운</h4>
              <p className="text-[8px] text-gray-600 leading-relaxed">{profile.loveStyle ? (result.isDayMasterStrong ? '자수성가형! 직접 벌어 직접 쓰는 스타일. 사업이 잘 맞아요.' : '안정 투자가 적합! 적금, 부동산 등 안전한 자산 관리가 어울려요.') : ''}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-2 border border-pink-100">
              <h4 className="text-[9px] font-bold text-pink-800 mb-0.5">❤️ 연애운</h4>
              <p className="text-[8px] text-gray-600 leading-relaxed line-clamp-3">{profile.loveStyle}</p>
            </div>
            <div className="bg-rose-50 rounded-lg p-2 border border-rose-100">
              <h4 className="text-[9px] font-bold text-rose-800 mb-0.5">💕 궁합</h4>
              <p className="text-[8px] text-gray-600 leading-relaxed line-clamp-3">{getCompatibilityHint(result.dayMaster)}</p>
            </div>
          </div>

          {/* ═══ 대운 (인생 흐름) ═══ */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-800 mb-1.5 flex items-center gap-1">
              <span className="w-0.5 h-3 bg-amber-500 rounded-full inline-block" />
              대운(大運) — 인생의 큰 흐름 (10년 주기)
            </h3>
            <MajorLuckTimeline lucks={result.majorLucks} />
          </div>

          {/* ═══ 개운법 + 행운 키워드 ═══ */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2 border border-amber-100">
              <h3 className="text-[9px] font-bold text-gray-800 mb-0.5">
                🍀 개운법 — 용신: {ELEMENTS_HANJA[result.usefulGod]}{usefulGodTip.element}
              </h3>
              <ul className="text-[8px] text-gray-700 space-y-0.5">
                {usefulGodTip.tips.slice(0, 3).map((t, i) => <li key={i}>✨ {t}</li>)}
              </ul>
            </div>
            <div className="rounded-lg p-2 border border-gray-200">
              <h3 className="text-[9px] font-bold text-gray-800 mb-1">🎯 행운 키워드</h3>
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-gray-50 rounded p-1 text-center">
                  <div className="text-[8px] text-gray-400">색</div>
                  <div className="text-[9px] font-bold text-gray-700">{profile.luckyColor}</div>
                </div>
                <div className="bg-gray-50 rounded p-1 text-center">
                  <div className="text-[8px] text-gray-400">숫자</div>
                  <div className="text-[9px] font-bold text-gray-700">{profile.luckyNumber}</div>
                </div>
                <div className="bg-gray-50 rounded p-1 text-center">
                  <div className="text-[8px] text-gray-400">방향</div>
                  <div className="text-[9px] font-bold text-gray-700">{profile.luckyDirection}</div>
                </div>
                <div className="bg-gray-50 rounded p-1 text-center">
                  <div className="text-[8px] text-gray-400">띠궁합</div>
                  <div className="text-[9px] font-bold text-gray-700">{result.animal}띠</div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Footer ═══ */}
          <div className="text-center pt-1 border-t border-gray-100">
            <p className="text-[8px] text-gray-300">노후연구소 四柱命理 분석 · nohu-lab.vercel.app · 전통 사주명리학 기반 재미 콘텐츠</p>
          </div>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES, BRANCHES_HANJA,
  ELEMENTS, getElementEmoji, Pillar,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG, ELEMENTS_HANJA,
  MonthlyFortune, MajorLuck,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  MISSING_ELEMENT_ADVICE, USEFUL_GOD_TIPS,
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
      {isMe && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">★ 나(日干)</div>}
      <span className="text-[10px] text-gray-400 mb-0.5">{label}</span>
      <span className={`text-[9px] px-1.5 py-0.5 rounded mb-1 ${isMe ? 'bg-indigo-100 text-indigo-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>{tenGod || '-'}</span>
      <div className={`border-2 rounded-xl w-[68px] overflow-hidden ${isMe ? 'border-indigo-400 shadow-md shadow-indigo-100' : 'border-gray-200'}`}>
        <div className={`${elBgs[stemEl]} p-2 text-center`}>
          <div className={`text-2xl font-black ${elColors[stemEl]}`}>{STEMS_HANJA[pillar.stem]}</div>
          <div className="text-[9px] text-gray-500">{STEMS[pillar.stem]}·{ELEMENTS[stemEl]}·{yinyang}</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className={`${elBgs[branchEl]} p-2 text-center`}>
          <div className={`text-2xl font-black ${elColors[branchEl]}`}>{BRANCHES_HANJA[pillar.branch]}</div>
          <div className="text-[9px] text-gray-500">{BRANCHES[pillar.branch]}·{ELEMENTS[branchEl]}</div>
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
      <div className="border-2 border-dashed border-gray-200 rounded-xl w-[68px] overflow-hidden">
        <div className="bg-gray-50 p-2 text-center">
          <div className="text-2xl text-gray-300">?</div>
          <div className="text-[9px] text-gray-300">미입력</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className="bg-gray-50 p-2 text-center">
          <div className="text-2xl text-gray-300">?</div>
          <div className="text-[9px] text-gray-300">미입력</div>
        </div>
      </div>
    </div>
  )
}

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const pct = Math.min(Math.max(score, 0), 100)
  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto">
        {/* 배경 원 - div 기반 (html2canvas 호환) */}
        <div className="absolute inset-0 rounded-full border-[5px] border-gray-200" />
        {/* 점수 원 - conic-gradient */}
        <div className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${color} ${pct * 3.6}deg, transparent ${pct * 3.6}deg)`,
            mask: 'radial-gradient(closest-side, transparent 70%, black 71%)',
            WebkitMask: 'radial-gradient(closest-side, transparent 70%, black 71%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-gray-800">{score}</span>
        </div>
      </div>
      <p className="text-[10px] text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  )
}

function ElementBarRow({ element, count, max, idx }: { element: string; count: number; max: number; idx: number }) {
  const colors = ['bg-green-500','bg-red-500','bg-yellow-500','bg-gray-400','bg-blue-500']
  const emojis = ['🌳','🔥','🏔️','⚔️','💧']
  const pct = max > 0 ? Math.min((count / max) * 100, 100) : 0
  const isZero = count < 0.5

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs w-5">{emojis[idx]}</span>
      <span className="text-xs w-5 text-gray-700 font-medium">{element}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div className={`h-full rounded-full ${isZero ? 'bg-red-200' : colors[idx]} transition-all duration-700`}
          style={{ width: `${Math.max(pct, 3)}%` }} />
      </div>
      <span className={`text-xs w-7 text-right font-mono ${isZero ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{count.toFixed(1)}</span>
    </div>
  )
}

function StarRating({ stars }: { stars: number }) {
  return <span className="text-yellow-400 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
}

function MonthlyFortuneGrid({ fortunes }: { fortunes: MonthlyFortune[] }) {
  const currentMonth = new Date().getMonth() + 1
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
      {fortunes.map(f => (
        <div key={f.month} className={`rounded-lg p-1.5 text-center border ${
          f.month === currentMonth ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300' :
          f.isBest ? 'border-green-300 bg-green-50' :
          f.isWorst ? 'border-red-300 bg-red-50' :
          'border-gray-100 bg-gray-50'
        }`}>
          <div className="text-[10px] text-gray-500">{f.month}월</div>
          <div className="text-yellow-400 text-[10px] leading-tight">{'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}</div>
          <div className={`text-[8px] mt-0.5 font-medium ${
            f.isBest ? 'text-green-600' : f.isWorst ? 'text-red-500' : 'text-gray-500'
          }`}>{f.month === currentMonth ? '📍지금' : f.isBest ? '🍀최고' : f.isWorst ? '⚡주의' : ''}</div>
        </div>
      ))}
    </div>
  )
}

function MajorLuckTimeline({ lucks }: { lucks: MajorLuck[] }) {
  const elColors = ['text-green-600','text-red-500','text-yellow-600','text-gray-500','text-blue-600']
  const elBgs = ['bg-green-100','bg-red-100','bg-yellow-100','bg-gray-100','bg-blue-100']
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {lucks.map((l, i) => (
        <div key={i} className={`flex-shrink-0 rounded-lg p-1.5 text-center min-w-[60px] border ${
          l.isCurrent ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300' : 'border-gray-100 ' + elBgs[l.element]
        }`}>
          <div className="text-[9px] text-gray-400">{l.startAge}~{l.endAge}세</div>
          <div className={`text-xs font-black ${l.isCurrent ? 'text-purple-700' : elColors[l.element]}`}>
            {STEMS_HANJA[l.stem]}{BRANCHES_HANJA[l.branch]}
          </div>
          <div className="text-yellow-400 text-[8px]">{'★'.repeat(l.rating)}{'☆'.repeat(5-l.rating)}</div>
          <div className={`text-[8px] font-medium ${l.isCurrent ? 'text-purple-600' : 'text-gray-500'}`}>
            {l.isCurrent ? '📍현재' : l.keyword}
          </div>
        </div>
      ))}
    </div>
  )
}

const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const strength = result.isDayMasterStrong ? STRENGTH_INTERPRETATIONS.strong : STRENGTH_INTERPRETATIONS.weak
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear())
  const viralSummary = getViralSummary(result.dayMaster, result.isDayMasterStrong)
  const maxEl = Math.max(...result.elementCounts)
  const usefulGodTip = USEFUL_GOD_TIPS[result.usefulGod]

  const pillars: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }[] = [
    { label: '시주(時)', pillar: result.hourPillar || { stem: 0, branch: 0 }, tenGod: result.tenGods[3] || '' },
    { label: '일주(日)', pillar: result.dayPillar, tenGod: '나', isMe: true },
    { label: '월주(月)', pillar: result.monthPillar, tenGod: result.tenGods[1] },
    { label: '년주(年)', pillar: result.yearPillar, tenGod: result.tenGods[0] },
  ]

  return (
    <div ref={ref} className="bg-white print:shadow-none print:rounded-none" style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* ─── 인쇄용 A4 스타일 ─── */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .saju-card { break-inside: avoid; page-break-inside: avoid; font-size: 11px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="saju-card">
        {/* ═══ HEADER ═══ */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 sm:px-6 py-4 sm:py-5 text-white rounded-t-2xl print:rounded-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-[10px] tracking-widest uppercase">四柱命理 분석 리포트</p>
              <h2 className="text-lg sm:text-xl font-black mt-1">{profile.emoji} {profile.title}</h2>
              <p className="text-indigo-200 text-xs mt-0.5">{viralSummary}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-[10px]">생년월일</p>
              <p className="font-bold text-sm">{result.birthYear}.{String(result.birthMonth).padStart(2,'0')}.{String(result.birthDay).padStart(2,'0')}</p>
              <p className="text-indigo-200 text-[10px]">{result.animal}띠 · {result.gender === 'male' ? '남' : '여'}성</p>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-5 py-4 space-y-4 print:space-y-3 print:px-3 print:py-2">

          {/* ═══ 사주팔자 4기둥 ═══ */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-indigo-500 rounded-full inline-block" />
              사주팔자(四柱八字)
            </h3>
            <div className="flex justify-center gap-2 sm:gap-3 pt-2">
              {pillars.map((p, i) => (
                result.hourPillar || i > 0 ? (
                  <PillarBox key={i} label={p.label} pillar={p.pillar} tenGod={p.tenGod} isMe={p.isMe} />
                ) : (
                  <EmptyPillarBox key={i} />
                )
              ))}
            </div>
          </div>

          {/* ═══ 종합 점수 게이지 ═══ */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-3 print:p-2">
            <ScoreGauge score={result.dayMasterScore} label="일간 에너지" color="#6366f1" />
            <ScoreGauge score={result.elementBalance} label="오행 균형도" color="#10b981" />
            <ScoreGauge score={fortune.stars * 20} label={`${new Date().getFullYear()}년 운세`} color="#f59e0b" />
          </div>

          {/* ═══ 이달의 운세 ═══ */}
          {result.currentMonthFortune && (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-3 text-white print:p-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold">📅 {new Date().getMonth() + 1}월 운세 — 이달의 운</h3>
                <span className="text-yellow-300 text-sm">{'★'.repeat(result.currentMonthFortune.rating)}{'☆'.repeat(5-result.currentMonthFortune.rating)}</span>
              </div>
              <p className="text-sm font-bold text-white/90">{result.currentMonthFortune.keyword}</p>
              <p className="text-[11px] text-white/80 mt-0.5">{result.currentMonthFortune.advice}</p>
            </div>
          )}

          {/* ═══ 올해 운세 ═══ */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-100 print:p-2">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-bold text-gray-800">🗓️ {new Date().getFullYear()}년 운세</h3>
              <StarRating stars={fortune.stars} />
            </div>
            <p className="text-xs font-medium text-purple-700 mb-1">{fortune.title}</p>
            <p className="text-[11px] text-gray-600 mb-1.5">{fortune.description}</p>
            <p className="text-[10px] text-purple-600 font-medium">💡 {fortune.advice}</p>
          </div>

          {/* ═══ 월별 운세 ═══ */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-purple-500 rounded-full inline-block" />
              {new Date().getFullYear()}년 월별 운세
            </h3>
            <MonthlyFortuneGrid fortunes={result.monthlyFortunes} />
            <p className="text-[9px] text-gray-400 mt-1.5 text-center">🍀최고 = 행운의 달 · ⚡주의 = 조심할 달 · 📍지금 = 이번 달</p>
          </div>

          {/* ═══ 재물 · 연애 · 궁합 (3열) ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-2.5 border border-gray-200">
              <h4 className="text-[10px] font-bold text-gray-800 mb-1">💰 재물운</h4>
              <p className="text-[10px] text-gray-600 leading-relaxed">{strength.money}</p>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-gray-200">
              <h4 className="text-[10px] font-bold text-gray-800 mb-1">❤️ 연애/관계</h4>
              <p className="text-[10px] text-gray-600 leading-relaxed">{profile.loveStyle}</p>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-gray-200">
              <h4 className="text-[10px] font-bold text-gray-800 mb-1">💕 궁합 힌트</h4>
              <p className="text-[10px] text-gray-600 leading-relaxed">{getCompatibilityHint(result.dayMaster)}</p>
            </div>
          </div>

          {/* ═══ 대운 (10년 주기) ═══ */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-amber-500 rounded-full inline-block" />
              대운(大運) — 인생의 큰 흐름
            </h3>
            <MajorLuckTimeline lucks={result.majorLucks} />
            <p className="text-[9px] text-gray-400 mt-1 text-center">10년 단위 운의 흐름 · 📍현재 대운 표시</p>
          </div>

          {/* ═══ 일간 분석 + 신강/신약 ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-indigo-50 rounded-xl p-3 print:p-2">
              <h3 className="text-xs font-bold text-indigo-800 mb-1.5 flex items-center gap-1">
                🧬 일간(日干) — {STEMS_HANJA[result.dayMaster]}{STEMS[result.dayMaster]} · {profile.element}
              </h3>
              <p className="text-[11px] text-gray-700 leading-relaxed">{profile.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.personality.map(k => (
                  <span key={k} className="bg-white text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full border border-indigo-200">#{k}</span>
                ))}
              </div>
            </div>
            <div className={`rounded-xl p-3 print:p-2 ${result.isDayMasterStrong ? 'bg-orange-50' : 'bg-sky-50'}`}>
              <h3 className={`text-xs font-bold mb-1.5 ${result.isDayMasterStrong ? 'text-orange-800' : 'text-sky-800'}`}>
                {strength.emoji} {strength.label} (에너지 {result.dayMasterScore}%)
              </h3>
              <p className="text-[11px] text-gray-700">{strength.description}</p>
              <p className={`text-[11px] mt-1.5 font-medium ${result.isDayMasterStrong ? 'text-orange-600' : 'text-sky-600'}`}>💡 {strength.advice}</p>
            </div>
          </div>

          {/* ═══ 오행 밸런스 ═══ */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-emerald-500 rounded-full inline-block" />
              오행(五行) 밸런스
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                {ELEMENTS.map((el, i) => (
                  <ElementBarRow key={el} element={el} count={result.elementCounts[i]} max={maxEl} idx={i} />
                ))}
              </div>
              <div>
                {result.missingElements.length > 0 ? (
                  <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                    <p className="text-[10px] text-amber-800 font-bold mb-1.5">
                      ⚠️ 부족한 오행: {result.missingElements.map(i => `${getElementEmoji(i)}${ELEMENTS[i]}`).join(', ')}
                    </p>
                    {result.missingElements.slice(0, 2).map(i => (
                      <div key={i} className="mb-1">
                        <ul className="text-[10px] text-amber-700 space-y-0.5">
                          {MISSING_ELEMENT_ADVICE[i].items.slice(0, 3).map((item, j) => (
                            <li key={j}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-200 text-center">
                    <p className="text-emerald-700 font-bold text-sm">✨ 오행 균형 우수!</p>
                    <p className="text-[10px] text-emerald-600 mt-1">모든 오행이 고르게 분포되어 있습니다. 안정적인 기운을 가진 사주입니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ 강점 & 약점 ═══ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-2.5 border border-green-100">
              <h4 className="text-[10px] font-bold text-green-800 mb-1.5">💪 강점</h4>
              <ul className="text-[10px] text-green-700 space-y-0.5">
                {profile.strengths.map(s => <li key={s}>✓ {s}</li>)}
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-2.5 border border-red-100">
              <h4 className="text-[10px] font-bold text-red-800 mb-1.5">⚡ 주의점</h4>
              <ul className="text-[10px] text-red-700 space-y-0.5">
                {profile.weaknesses.map(w => <li key={w}>• {w}</li>)}
              </ul>
            </div>
          </div>

          {/* ═══ 건강 · 직업 ═══ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-2.5 border border-gray-200">
              <h4 className="text-[10px] font-bold text-gray-800 mb-1">🏥 건강 조언</h4>
              <p className="text-[10px] text-gray-600">{profile.healthTip}</p>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-gray-200">
              <h4 className="text-[10px] font-bold text-gray-800 mb-1">💼 적합 직업</h4>
              <ul className="text-[10px] text-gray-600 space-y-0.5">
                {profile.careerFit.slice(0, 4).map(c => <li key={c}>• {c}</li>)}
              </ul>
            </div>
          </div>

          {/* ═══ 용신 개운법 + 행운 키워드 ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-2.5 border border-amber-100">
              <h3 className="text-[10px] font-bold text-gray-800 mb-1">
                🍀 개운법 — 용신: {ELEMENTS_HANJA[result.usefulGod]}{usefulGodTip.element}
              </h3>
              <p className="text-[9px] text-gray-500 mb-1">{usefulGodTip.description}</p>
              <ul className="text-[10px] text-gray-700 space-y-0.5">
                {usefulGodTip.tips.map((t, i) => <li key={i}>✨ {t}</li>)}
              </ul>
            </div>
            <div className="rounded-xl p-2.5 border border-gray-200">
              <h3 className="text-[10px] font-bold text-gray-800 mb-2">🎯 행운 키워드</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-gray-400">색</div>
                  <div className="text-xs font-bold text-gray-700">🎨 {profile.luckyColor}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-gray-400">숫자</div>
                  <div className="text-xs font-bold text-gray-700">🔢 {profile.luckyNumber}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-gray-400">방향</div>
                  <div className="text-xs font-bold text-gray-700">🧭 {profile.luckyDirection}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-gray-400">띠</div>
                  <div className="text-xs font-bold text-gray-700">🐾 {result.animal}띠</div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Footer ═══ */}
          <div className="text-center pt-1 pb-1 border-t border-gray-100">
            <p className="text-[9px] text-gray-300">노후연구소 四柱命理 분석 · nohu-lab.vercel.app · 전통 사주명리학 기반 재미 콘텐츠</p>
          </div>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

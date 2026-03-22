'use client'

import { forwardRef } from 'react'
import { TarotResult as TarotResultType } from './tarotEngine'

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']

const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '바람': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  '물': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  '불': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  '땅': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
}

interface Props {
  result: TarotResultType
}

const TarotResultCard = forwardRef<HTMLDivElement, Props>(function TarotResultCard({ result }, ref) {
  const scorePercent = result.energyScore
  const scoreGrade = scorePercent >= 80 ? 'S' : scorePercent >= 65 ? 'A' : scorePercent >= 50 ? 'B' : scorePercent >= 35 ? 'C' : 'D'
  const gradeColor = scorePercent >= 80 ? 'text-purple-600' : scorePercent >= 65 ? 'text-indigo-600' : scorePercent >= 50 ? 'text-blue-600' : scorePercent >= 35 ? 'text-gray-600' : 'text-gray-500'
  const barColor = scorePercent >= 65 ? 'from-purple-500 to-indigo-500' : scorePercent >= 50 ? 'from-indigo-400 to-blue-400' : 'from-gray-400 to-blue-300'

  return (
    <div ref={ref} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

      {/* ━━ 헤더: 한눈에 보이는 결과 ━━ */}
      <div className="relative bg-gradient-to-br from-[#1a103d] via-[#2d1b69] to-[#1a103d] px-5 sm:px-8 pt-8 pb-7 text-center overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-4 left-8 text-5xl">✦</div>
          <div className="absolute top-12 right-12 text-3xl">✦</div>
          <div className="absolute bottom-6 left-16 text-2xl">✦</div>
          <div className="absolute bottom-4 right-8 text-4xl">✦</div>
        </div>

        <div className="relative z-10">
          <div className="text-5xl mb-3">{result.readingEmoji}</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
            {result.readingTitle}
          </h2>
          <p className="text-purple-300/80 text-sm mb-5">
            {result.spread.icon} {result.spread.name} 리딩
          </p>

          {result.question && (
            <p className="text-purple-300/60 text-sm italic mb-5 max-w-sm mx-auto">
              &ldquo;{result.question}&rdquo;
            </p>
          )}

          {/* 에너지 스코어 - 크고 명확하게 */}
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
            <div className="text-center">
              <div className={`text-4xl font-black ${gradeColor} bg-white/90 w-14 h-14 rounded-xl flex items-center justify-center shadow-sm`}>
                {scoreGrade}
              </div>
            </div>
            <div className="text-left">
              <div className="text-white text-2xl font-black">{scorePercent}<span className="text-sm text-purple-300 font-medium ml-0.5">점</span></div>
              <div className="text-purple-300/80 text-xs mt-0.5">{result.energyLabel}</div>
              <div className="w-32 bg-white/20 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${barColor}`} style={{ width: `${scorePercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-8 py-7 sm:py-8 space-y-8">

        {/* ━━ 선택한 카드 ━━ */}
        <section>
          <div className={`grid ${result.cards.length === 1 ? 'grid-cols-1 max-w-[220px] mx-auto' : 'grid-cols-3'} gap-3 sm:gap-4`}>
            {result.cards.map((sc, i) => {
              const elColor = ELEMENT_COLORS[sc.card.element] || ELEMENT_COLORS['땅']
              return (
                <div key={i} className={`relative rounded-2xl p-4 sm:p-5 text-center ${elColor.bg} border ${elColor.border} shadow-sm`}>
                  {/* 포지션 뱃지 */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#2d1b69] text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm whitespace-nowrap">
                    {sc.position}
                  </div>
                  {/* 로마 숫자 */}
                  <div className="text-[10px] font-semibold tracking-[0.2em] text-gray-400 mt-1 font-serif">
                    {ROMAN[sc.card.number]}
                  </div>
                  {/* 이모지 */}
                  <div className={`my-3 ${sc.isReversed ? 'rotate-180 inline-block' : ''}`}>
                    <div className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-white/60 flex items-center justify-center shadow-inner">
                      <span className="text-4xl sm:text-[2.5rem]">{sc.card.emoji}</span>
                    </div>
                  </div>
                  {/* 이름 */}
                  <div className="text-base sm:text-lg font-black text-gray-900">{sc.card.name}</div>
                  <div className="text-[10px] text-gray-400 italic mb-2">{sc.card.nameEn}</div>
                  {/* 방향 */}
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    sc.isReversed
                      ? 'bg-red-100 text-red-600'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {sc.isReversed ? '↓ 역방향' : '↑ 정방향'}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* ━━ 핵심 해석 (내러티브) — 가장 중요한 콘텐츠 ━━ */}
        <section className="relative bg-gradient-to-br from-purple-50 to-indigo-50/60 rounded-2xl p-6 sm:p-7 border border-purple-100">
          <h3 className="text-base sm:text-lg font-black text-purple-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📖</span> 타로 리더의 해석
          </h3>
          <p className="text-[15px] sm:text-base text-gray-700 leading-[1.9] whitespace-pre-line">
            {result.narrative}
          </p>
        </section>

        {/* ━━ 카드별 핵심 메시지 ━━ */}
        {result.cards.map((sc, i) => {
          const interp = sc.isReversed ? sc.card.reversed : sc.card.upright
          const elColor = ELEMENT_COLORS[sc.card.element] || ELEMENT_COLORS['땅']
          return (
            <section key={i} className="space-y-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className={`text-xl ${sc.isReversed ? 'rotate-180 inline-block' : ''}`}>{sc.card.emoji}</span>
                {sc.position} — {sc.card.name}
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  sc.isReversed ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
                }`}>
                  {sc.isReversed ? '역방향' : '정방향'}
                </span>
              </h3>

              <div className="bg-gray-50/80 rounded-xl p-5 space-y-4 border border-gray-100">
                {/* 키워드 */}
                <div className="flex flex-wrap gap-1.5">
                  {sc.card.keywords.map(kw => (
                    <span key={kw} className="px-2.5 py-1 bg-white text-purple-700 text-xs rounded-lg font-medium border border-purple-100 shadow-sm">{kw}</span>
                  ))}
                  <span className={`px-2.5 py-1 ${elColor.bg} ${elColor.text} text-xs rounded-lg border ${elColor.border}`}>
                    {sc.card.element} · {sc.card.planet}
                  </span>
                </div>

                {/* 이 위치에서의 의미 */}
                <div className="bg-white rounded-xl p-4 border border-purple-100/60">
                  <p className="text-xs font-bold text-purple-600 mb-1.5">🔮 이 자리에서의 의미</p>
                  <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">{result.positionReadings[i]}</p>
                </div>

                {/* 핵심 메시지 */}
                <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">{interp.meaning}</p>

                {/* 핵심 조언 */}
                <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100/50">
                  <p className="text-xs font-bold text-purple-600 mb-1.5">💡 조언</p>
                  <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">{interp.advice}</p>
                </div>
              </div>
            </section>
          )
        })}

        {/* ━━ 카드 조합 분석 ━━ */}
        {result.combinations.length > 0 && (
          <section>
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">🔗</span> 카드 조합 분석
            </h3>
            <div className="space-y-3">
              {result.combinations.map((combo, i) => (
                <div key={i} className="bg-gradient-to-r from-purple-50 to-indigo-50/60 rounded-xl p-5 border border-purple-100">
                  <p className="text-sm font-bold text-purple-700 mb-2">✨ {combo.theme}</p>
                  <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">{combo.interpretation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ━━ 종합 리딩 ━━ */}
        <section className="bg-gradient-to-br from-[#f5f0ff] via-[#eef0ff] to-[#f5f0ff] rounded-2xl p-6 sm:p-7 border border-purple-200/60">
          <h3 className="text-base sm:text-lg font-black text-purple-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📜</span> 종합 리딩
          </h3>
          <p className="text-[15px] sm:text-base text-gray-700 leading-[1.9] whitespace-pre-line">
            {result.overallMessage}
          </p>
        </section>

        {/* ━━ 오늘의 실천 과제 ━━ */}
        <section>
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">✅</span> 오늘의 실천 과제
          </h3>
          <div className="space-y-2.5">
            {result.actionItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-amber-50/60 rounded-xl p-4 border border-amber-100">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ━━ 오늘의 행운 ━━ */}
        <section>
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">🍀</span> 오늘의 행운
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-pink-50/80 rounded-xl p-4 text-center border border-pink-100">
              <div className="text-2xl mb-1">🎨</div>
              <div className="text-[10px] text-gray-400 mb-0.5">행운 색상</div>
              <div className="text-sm font-bold text-gray-800">{result.luckyColor}</div>
            </div>
            <div className="bg-blue-50/80 rounded-xl p-4 text-center border border-blue-100">
              <div className="text-2xl mb-1">🔢</div>
              <div className="text-[10px] text-gray-400 mb-0.5">행운 숫자</div>
              <div className="text-sm font-bold text-gray-800">{result.luckyNumber}</div>
            </div>
            <div className="bg-green-50/80 rounded-xl p-4 text-center border border-green-100">
              <div className="text-2xl mb-1">🧭</div>
              <div className="text-[10px] text-gray-400 mb-0.5">행운 방향</div>
              <div className="text-sm font-bold text-gray-800">{result.luckyDirection}</div>
            </div>
          </div>
        </section>

        {/* ━━ 면책 ━━ */}
        <p className="text-[11px] text-gray-300 text-center leading-relaxed pt-2">
          본 타로 리딩은 재미와 자기 성찰 목적으로 제공되며, 전문 상담을 대체하지 않습니다.
          <br />중요한 결정은 반드시 전문가와 상의하세요.
        </p>
      </div>
    </div>
  )
})

export default TarotResultCard

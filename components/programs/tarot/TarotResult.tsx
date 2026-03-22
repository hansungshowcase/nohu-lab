'use client'

import { forwardRef } from 'react'
import { TarotResult as TarotResultType } from './tarotEngine'

interface Props {
  result: TarotResultType
}

const TarotResultCard = forwardRef<HTMLDivElement, Props>(function TarotResultCard({ result }, ref) {
  const scoreColor = result.energyScore >= 75 ? 'text-purple-600' : result.energyScore >= 50 ? 'text-indigo-600' : 'text-gray-600'
  const scoreBarColor = result.energyScore >= 75 ? 'from-purple-500 to-indigo-500' : result.energyScore >= 50 ? 'from-indigo-400 to-purple-400' : 'from-gray-400 to-purple-300'

  return (
    <div ref={ref} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100">
      {/* ── 프리미엄 헤더 ── */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-800 px-4 sm:px-6 py-5 sm:py-7 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-3 left-6 text-4xl">&#10022;</div>
          <div className="absolute top-8 right-10 text-2xl">&#10022;</div>
          <div className="absolute bottom-4 left-12 text-xl">&#10022;</div>
          <div className="absolute bottom-6 right-6 text-3xl">&#10022;</div>
        </div>

        <div className="text-3xl sm:text-4xl mb-2">{result.readingEmoji}</div>
        <h2 className="text-lg sm:text-xl font-black text-white mb-1">{result.readingTitle}</h2>
        <p className="text-purple-200 text-xs sm:text-sm mb-3">{result.spread.icon} {result.spread.name} 리딩</p>

        {result.question && (
          <p className="text-purple-300 text-[11px] sm:text-xs italic mb-3">&ldquo;{result.question}&rdquo;</p>
        )}

        {/* 에너지 스코어 */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-3 max-w-xs mx-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-purple-200 text-[10px] sm:text-xs font-medium">에너지 점수</span>
            <span className="text-white font-black text-lg sm:text-xl">{result.energyScore}<span className="text-xs text-purple-300">/100</span></span>
          </div>
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor}`} style={{ width: `${result.energyScore}%` }} />
          </div>
          <p className="text-purple-200 text-[10px] mt-1">{result.energyLabel}</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-6 sm:space-y-7">

        {/* ── 선택된 카드 요약 ── */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">🃏</span>
            선택된 카드
          </h3>
          <div className={`grid ${result.cards.length === 1 ? 'grid-cols-1 max-w-[220px] mx-auto' : 'grid-cols-3'} gap-3`}>
            {result.cards.map((sc, i) => (
              <div key={i} className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-xl p-3 sm:p-4 text-center border-2 border-purple-200 shadow-sm">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-purple-600 text-white text-[9px] sm:text-[10px] font-bold rounded-full">
                  {sc.position}
                </div>
                <div className={`text-4xl sm:text-5xl my-2 ${sc.isReversed ? 'rotate-180 inline-block' : ''}`}>
                  {sc.card.emoji}
                </div>
                <div className="text-sm sm:text-base font-black text-gray-900">{sc.card.name}</div>
                <div className="text-[10px] text-gray-400 mb-1">{sc.card.nameEn}</div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${sc.isReversed ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-purple-50 text-purple-600 border border-purple-200'}`}>
                  {sc.isReversed ? '↓ 역방향' : '↑ 정방향'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 타로 리더의 해석 노트 (내러티브) ── */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50/50 to-purple-50/30 rounded-2xl p-4 sm:p-5 border border-purple-200 relative">
          <div className="absolute -top-3 left-4 px-3 py-1 bg-purple-600 text-white text-[10px] sm:text-xs font-bold rounded-full">
            📖 타로 리더의 해석 노트
          </div>
          <p className="text-sm sm:text-base text-gray-700 leading-[1.8] mt-1 whitespace-pre-line">{result.narrative}</p>
        </div>

        {/* ── 각 카드 상세 해석 ── */}
        {result.cards.map((sc, i) => {
          const interp = sc.isReversed ? sc.card.reversed : sc.card.upright
          return (
            <div key={i} className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className={`text-lg ${sc.isReversed ? 'rotate-180 inline-block' : ''}`}>{sc.card.emoji}</span>
                <span>{sc.position} — {sc.card.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${sc.isReversed ? 'bg-red-50 text-red-500' : 'bg-purple-50 text-purple-600'}`}>
                  {sc.isReversed ? '역방향' : '정방향'}
                </span>
              </h3>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                {/* 키워드 + 원소 */}
                <div className="flex flex-wrap gap-1.5">
                  {sc.card.keywords.map(kw => (
                    <span key={kw} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] sm:text-xs rounded-full font-medium">{kw}</span>
                  ))}
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] sm:text-xs rounded-full border border-indigo-100">
                    {sc.card.element} · {sc.card.planet}
                  </span>
                </div>

                {/* 상징 */}
                <div className="bg-purple-50/50 rounded-lg p-2.5 border border-purple-100">
                  <p className="text-[10px] sm:text-xs text-purple-600 font-bold mb-0.5">🎨 카드의 상징</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{sc.card.symbolism}</p>
                </div>

                {/* 위치별 해석 */}
                <div className="bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100">
                  <p className="text-[10px] sm:text-xs text-indigo-600 font-bold mb-0.5">🔮 이 자리에서의 의미</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{result.positionReadings[i]}</p>
                </div>

                {/* 핵심 의미 */}
                <p className="text-sm text-gray-700 leading-relaxed">{interp.meaning}</p>

                {/* 영역별 5개 메시지 */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-white rounded-lg p-2.5 border border-pink-100">
                    <p className="text-[10px] sm:text-xs font-bold text-pink-500 mb-0.5">💕 사랑·관계</p>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{interp.love}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                    <p className="text-[10px] sm:text-xs font-bold text-blue-500 mb-0.5">💼 직업·커리어</p>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{interp.career}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-2.5 border border-green-100">
                      <p className="text-[10px] sm:text-xs font-bold text-green-500 mb-0.5">💰 재정</p>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{interp.finance}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-teal-100">
                      <p className="text-[10px] sm:text-xs font-bold text-teal-500 mb-0.5">💚 건강</p>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{interp.health}</p>
                    </div>
                  </div>
                </div>

                {/* 확언 */}
                <div className="text-center bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-2.5 border border-purple-100">
                  <p className="text-[10px] text-purple-400 mb-0.5">오늘의 확언</p>
                  <p className="text-xs sm:text-sm font-bold text-purple-700 italic">&ldquo;{sc.card.affirmation}&rdquo;</p>
                </div>
              </div>
            </div>
          )
        })}

        {/* ── 카드 조합 분석 ── */}
        {result.combinations.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">🔗</span>
              카드 조합 분석
            </h3>
            <div className="space-y-2">
              {result.combinations.map((combo, i) => (
                <div key={i} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                  <p className="text-sm font-bold text-purple-700 mb-1">✨ {combo.theme}</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{combo.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 원소 에너지 분석 ── */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">🌊</span>
            지배 원소: {result.dominantElement}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 bg-indigo-50 rounded-xl p-3 leading-relaxed border border-indigo-100">{result.elementMessage}</p>
        </div>

        {/* ── 영적 메시지 ── */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
          <h3 className="text-sm font-bold text-violet-700 mb-2 flex items-center gap-1.5">🧘 영적 메시지</h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{result.spiritualMessage}</p>
        </div>

        {/* ── 건강 가이드 ── */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200">
          <h3 className="text-sm font-bold text-teal-700 mb-2 flex items-center gap-1.5">💚 건강 가이드</h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{result.healthGuidance}</p>
        </div>

        {/* ── 오늘의 실천 과제 ── */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">✅</span>
            오늘의 실천 과제
          </h3>
          <div className="space-y-2">
            {result.actionItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 종합 메시지 ── */}
        <div className="bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-purple-200">
          <h3 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-1.5">📜 종합 리딩</h3>
          <p className="text-sm sm:text-base text-gray-700 leading-[1.8] whitespace-pre-line">{result.overallMessage}</p>
        </div>

        {/* ── 오늘의 행운 ── */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-xs">🍀</span>
            오늘의 행운
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-b from-pink-50 to-pink-100/50 rounded-xl p-3 text-center border border-pink-200">
              <div className="text-lg mb-0.5">🎨</div>
              <div className="text-[9px] sm:text-[10px] text-gray-400">행운 색상</div>
              <div className="text-sm font-bold text-gray-800">{result.luckyColor}</div>
            </div>
            <div className="bg-gradient-to-b from-blue-50 to-blue-100/50 rounded-xl p-3 text-center border border-blue-200">
              <div className="text-lg mb-0.5">🔢</div>
              <div className="text-[9px] sm:text-[10px] text-gray-400">행운 숫자</div>
              <div className="text-sm font-bold text-gray-800">{result.luckyNumber}</div>
            </div>
            <div className="bg-gradient-to-b from-green-50 to-green-100/50 rounded-xl p-3 text-center border border-green-200">
              <div className="text-lg mb-0.5">🧭</div>
              <div className="text-[9px] sm:text-[10px] text-gray-400">행운 방향</div>
              <div className="text-sm font-bold text-gray-800">{result.luckyDirection}</div>
            </div>
          </div>
        </div>

        {/* ── 에너지 요약 바 ── */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">전체 에너지 흐름</span>
            <span className={`text-lg font-black ${scoreColor}`}>{result.energyScore}점</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor} transition-all`} style={{ width: `${result.energyScore}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-400">내면 성찰</span>
            <span className="text-[9px] text-gray-400">{result.energyLabel}</span>
            <span className="text-[9px] text-gray-400">강한 긍정</span>
          </div>
        </div>

        {/* ── 면책 문구 ── */}
        <p className="text-[10px] sm:text-xs text-gray-300 text-center leading-relaxed pt-1">
          본 타로 리딩은 재미와 자기 성찰 목적으로 제공되며, 전문 상담을 대체하지 않습니다.
          <br />중요한 결정은 반드시 전문가와 상의하세요.
        </p>
      </div>
    </div>
  )
})

export default TarotResultCard

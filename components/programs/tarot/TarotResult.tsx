'use client'

import { forwardRef } from 'react'
import { TarotResult as TarotResultType } from './tarotEngine'

interface Props {
  result: TarotResultType
}

const TarotResultCard = forwardRef<HTMLDivElement, Props>(function TarotResultCard({ result }, ref) {
  return (
    <div ref={ref} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-4 sm:px-6 py-4 sm:py-5 text-center">
        <h2 className="text-lg sm:text-xl font-black text-white mb-1">
          {result.spread.icon} {result.spread.name} 리딩 결과
        </h2>
        {result.question && (
          <p className="text-purple-200 text-xs sm:text-sm">&ldquo;{result.question}&rdquo;</p>
        )}
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
        {/* 선택된 카드 요약 */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1.5">
            <span>🃏</span> 선택된 카드
          </h3>
          <div className={`grid ${result.cards.length === 1 ? 'grid-cols-1 max-w-[200px] mx-auto' : 'grid-cols-3'} gap-3`}>
            {result.cards.map((sc, i) => (
              <div key={i} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 text-center border border-purple-200">
                <div className="text-xs text-purple-500 font-medium mb-1">{sc.position}</div>
                <div className={`text-3xl sm:text-4xl mb-1 ${sc.isReversed ? 'rotate-180 inline-block' : ''}`}>
                  {sc.card.emoji}
                </div>
                <div className="text-sm sm:text-base font-bold text-gray-900">{sc.card.name}</div>
                <div className="text-[10px] text-gray-400">{sc.card.nameEn}</div>
                <div className={`text-[10px] sm:text-xs font-medium mt-1 ${sc.isReversed ? 'text-red-500' : 'text-purple-600'}`}>
                  {sc.isReversed ? '역방향 ↓' : '정방향 ↑'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 각 카드 상세 해석 */}
        {result.cards.map((sc, i) => {
          const interp = sc.isReversed ? sc.card.reversed : sc.card.upright
          return (
            <div key={i} className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500 flex items-center gap-1.5">
                <span className={sc.isReversed ? 'rotate-180 inline-block' : ''}>{sc.card.emoji}</span>
                {sc.position} — {sc.card.name} ({sc.isReversed ? '역방향' : '정방향'})
              </h3>

              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3">
                {/* 키워드 */}
                <div className="flex flex-wrap gap-1.5">
                  {sc.card.keywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] sm:text-xs rounded-full font-medium">
                      {kw}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] sm:text-xs rounded-full">
                    {sc.card.element} · {sc.card.planet}
                  </span>
                </div>

                {/* 의미 */}
                <p className="text-sm text-gray-700 leading-relaxed">{interp.meaning}</p>

                {/* 영역별 메시지 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2.5 border border-pink-100">
                    <div className="text-[10px] sm:text-xs font-bold text-pink-500 mb-0.5">💕 사랑</div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{interp.love}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                    <div className="text-[10px] sm:text-xs font-bold text-blue-500 mb-0.5">💼 직업</div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{interp.career}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-green-100">
                    <div className="text-[10px] sm:text-xs font-bold text-green-500 mb-0.5">💰 재정</div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{interp.finance}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-amber-100">
                    <div className="text-[10px] sm:text-xs font-bold text-amber-500 mb-0.5">💡 조언</div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{interp.advice}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* 카드 조합 해석 */}
        {result.combinations.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1.5">
              <span>🔗</span> 카드 조합 해석
            </h3>
            <div className="space-y-2">
              {result.combinations.map((combo, i) => (
                <div key={i} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                  <div className="text-sm font-bold text-purple-700 mb-1">✨ {combo.theme}</div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{combo.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 원소 에너지 */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1.5">
            <span>🌊</span> 지배 원소: {result.dominantElement}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 bg-indigo-50 rounded-xl p-3 leading-relaxed">{result.elementMessage}</p>
        </div>

        {/* 종합 메시지 */}
        <div className="bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-50 rounded-xl p-4 sm:p-5 border border-purple-200">
          <h3 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-1.5">
            <span>📜</span> 종합 메시지
          </h3>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{result.overallMessage}</p>
        </div>

        {/* 오늘의 행운 */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1.5">
            <span>🍀</span> 오늘의 행운
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-b from-pink-50 to-pink-100/50 rounded-xl p-3 text-center border border-pink-200">
              <div className="text-lg mb-0.5">🎨</div>
              <div className="text-[10px] text-gray-400 mb-0.5">행운 색상</div>
              <div className="text-sm font-bold text-gray-800">{result.luckyColor}</div>
            </div>
            <div className="bg-gradient-to-b from-blue-50 to-blue-100/50 rounded-xl p-3 text-center border border-blue-200">
              <div className="text-lg mb-0.5">🔢</div>
              <div className="text-[10px] text-gray-400 mb-0.5">행운 숫자</div>
              <div className="text-sm font-bold text-gray-800">{result.luckyNumber}</div>
            </div>
            <div className="bg-gradient-to-b from-green-50 to-green-100/50 rounded-xl p-3 text-center border border-green-200">
              <div className="text-lg mb-0.5">🧭</div>
              <div className="text-[10px] text-gray-400 mb-0.5">행운 방향</div>
              <div className="text-sm font-bold text-gray-800">{result.luckyDirection}</div>
            </div>
          </div>
        </div>

        {/* 면책 문구 */}
        <p className="text-[10px] sm:text-xs text-gray-300 text-center leading-relaxed pt-2">
          본 타로 리딩은 재미와 참고용으로 제공되며, 전문 상담이나 의학적 조언을 대체하지 않습니다.
          <br />중요한 결정은 반드시 전문가와 상의하세요.
        </p>
      </div>
    </div>
  )
})

export default TarotResultCard

'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SPREAD_TYPES, SpreadType } from './tarot/tarotData'
import { generateReading, decodeResultFromUrl, TarotResult } from './tarot/tarotEngine'
import TarotCardSelect from './tarot/TarotCardSelect'
import TarotAnalyzing from './tarot/TarotAnalyzing'
import TarotResultCard from './tarot/TarotResult'
import TarotShareButtons from './tarot/TarotShareButtons'

type Phase = 'intro' | 'select' | 'analyzing' | 'result'

export default function TarotReading() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>}>
      <TarotReadingInner />
    </Suspense>
  )
}

function TarotReadingInner() {
  const searchParams = useSearchParams()
  const isSharedLink = searchParams.has('s') && searchParams.has('c') && searchParams.has('r')

  const [phase, setPhase] = useState<Phase>('intro')
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>(SPREAD_TYPES[1])
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<TarotResult | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // 공유 링크 파싱
  useEffect(() => {
    const decoded = decodeResultFromUrl(searchParams, SPREAD_TYPES)
    if (decoded) {
      const spread = SPREAD_TYPES.find((s) => s.id === decoded.spreadId)
      if (!spread) return
      const selectedCards = decoded.cardIndices.map((idx, i) => ({
        cardIndex: idx,
        isReversed: decoded.reversals[i],
      }))
      const reading = generateReading(spread, selectedCards, decoded.question)
      setSelectedSpread(spread)
      setQuestion(decoded.question)
      setResult(reading)
      setPhase('result')
    }
  }, [searchParams])

  const handleStartReading = () => {
    setPhase('select')
  }

  const handleCardsSelected = (selected: { cardIndex: number; isReversed: boolean }[]) => {
    const reading = generateReading(selectedSpread, selected, question)
    setResult(reading)
    setPhase('analyzing')
  }

  const handleRetry = () => {
    setResult(null)
    setQuestion('')
    setPhase('intro')
    // URL 파라미터 제거
    window.history.replaceState(null, '', window.location.pathname)
  }

  // ── intro ──
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 animate-fadeIn">
        {/* 히어로 */}
        <div className="text-center space-y-3 py-4">
          <div className="text-5xl sm:text-6xl mb-2">🔮</div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">타로 카드 리딩</h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            마음을 가라앉히고, 직감이 이끄는 대로<br />
            카드를 선택해보세요
          </p>
        </div>

        {/* 스프레드 선택 */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">스프레드 선택</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {SPREAD_TYPES.map((spread) => (
              <button
                key={spread.id}
                onClick={() => setSelectedSpread(spread)}
                className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 transition-all text-left ${
                  selectedSpread.id === spread.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                }`}
              >
                <span className="text-2xl sm:text-3xl">{spread.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-sm sm:text-base">{spread.name}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{spread.description}</div>
                  <div className="text-[10px] sm:text-xs text-purple-500 mt-0.5">카드 {spread.cardCount}장</div>
                </div>
                {selectedSpread.id === spread.id && (
                  <span className="text-purple-600 text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 질문 입력 */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">고민이나 질문 <span className="text-gray-400 font-normal">(선택)</span></h3>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: 올해 연애운은 어떨까요?"
            maxLength={100}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
          />
          <p className="text-right text-[10px] text-gray-400 mt-0.5">{question.length}/100</p>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleStartReading}
          className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-base sm:text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200 hover:shadow-xl active:scale-[0.98]"
        >
          카드 뽑기 시작 ✨
        </button>
      </div>
    )
  }

  // ── select ──
  if (phase === 'select') {
    return <TarotCardSelect spread={selectedSpread} onComplete={handleCardsSelected} />
  }

  // ── analyzing ──
  if (phase === 'analyzing') {
    return <TarotAnalyzing onComplete={() => setPhase('result')} />
  }

  // ── result ──
  if (phase === 'result' && result) {
    return (
      <div className={isSharedLink ? "max-w-2xl mx-auto space-y-3 sm:space-y-4 animate-fadeIn" : "max-w-2xl mx-auto space-y-3 sm:space-y-4 animate-fadeIn"}>
        <TarotResultCard ref={cardRef} result={result} />

        <div className="no-print space-y-4 px-1">
          <TarotShareButtons result={result} cardRef={cardRef} />

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleRetry}
              className="py-3.5 bg-gradient-to-b from-purple-50 to-purple-100/50 border border-purple-200 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] text-purple-700 rounded-2xl text-sm font-semibold transition-all duration-200"
            >
              🔮 다시 뽑기
            </button>
            <button
              onClick={() => window.print()}
              className="py-3.5 bg-gradient-to-b from-gray-50 to-gray-100/50 border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] text-gray-700 rounded-2xl text-sm font-semibold transition-all duration-200"
            >
              🖨️ 인쇄하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

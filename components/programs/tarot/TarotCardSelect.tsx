'use client'

import { useState, useEffect, useCallback } from 'react'
import { MAJOR_ARCANA } from './tarotData'
import { shuffleCards, randomOrientation } from './tarotEngine'
import type { SpreadType } from './tarotData'

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']

const ELEMENT_STYLES: Record<string, React.CSSProperties> = {
  '바람': { background: 'linear-gradient(170deg, #f0f9ff 0%, #dbeafe 100%)' },
  '물': { background: 'linear-gradient(170deg, #eef2ff 0%, #e0e7ff 100%)' },
  '불': { background: 'linear-gradient(170deg, #fff7ed 0%, #ffedd5 100%)' },
  '땅': { background: 'linear-gradient(170deg, #fefce8 0%, #fef9c3 100%)' },
}

interface Props {
  spread: SpreadType
  onComplete: (selected: { cardIndex: number; isReversed: boolean }[]) => void
}

export default function TarotCardSelect({ spread, onComplete }: Props) {
  const [shuffled, setShuffled] = useState<number[]>([])
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<{ cardIndex: number; isReversed: boolean; position: number }[]>([])
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setShuffled(shuffleCards())
  }, [])

  const handleCardClick = useCallback(
    (position: number) => {
      if (animating) return
      if (flipped.has(position)) return
      if (selected.length >= spread.cardCount) return

      setAnimating(true)
      const cardIndex = shuffled[position]
      const isReversed = randomOrientation()

      setFlipped((prev) => new Set(prev).add(position))
      const newSelected = [...selected, { cardIndex, isReversed, position }]
      setSelected(newSelected)

      setTimeout(() => {
        setAnimating(false)
        if (newSelected.length >= spread.cardCount) {
          setTimeout(() => {
            onComplete(newSelected.map((s) => ({ cardIndex: s.cardIndex, isReversed: s.isReversed })))
          }, 800)
        }
      }, 600)
    },
    [animating, flipped, selected, spread.cardCount, shuffled, onComplete]
  )

  const remaining = spread.cardCount - selected.length

  if (shuffled.length === 0) return null

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
      {/* 안내 */}
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">운명의 카드를 선택하세요</h2>
        <p className="text-sm sm:text-base text-gray-500">
          마음을 가라앉히고, 끌리는 카드를 {spread.cardCount}장 선택하세요
        </p>
        <div className="flex justify-center gap-2 mt-3">
          {spread.positions.map((pos, i) => (
            <div
              key={pos}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                i < selected.length
                  ? 'bg-purple-600 text-white'
                  : i === selected.length
                  ? 'bg-purple-100 text-purple-700 border border-purple-300 animate-pulse'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {pos}
            </div>
          ))}
        </div>
        {remaining > 0 && (
          <p className="text-purple-600 text-sm font-medium mt-2">
            {remaining}장 더 선택하세요
          </p>
        )}
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
        {shuffled.map((cardIdx, position) => {
          const isFlipped = flipped.has(position)
          const card = MAJOR_ARCANA[cardIdx]
          const selInfo = selected.find((s) => s.position === position)
          const isDisabled = !isFlipped && selected.length >= spread.cardCount

          return (
            <button
              key={position}
              onClick={() => handleCardClick(position)}
              disabled={isFlipped || isDisabled}
              className={`tarot-card aspect-[2/3] rounded-lg relative cursor-pointer transition-all duration-300
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                ${!isFlipped && !isDisabled ? 'hover:scale-105 hover:-translate-y-1 hover:shadow-lg' : ''}
                ${isFlipped ? 'cursor-default' : ''}
              `}
            >
              <div className={`tarot-card-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}>
                {/* 뒷면 — 전통 타로 카드 */}
                <div
                  className="tarot-card-back absolute inset-0 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1040 30%, #2d1b69 50%, #1a1040 70%, #0f0a2e 100%)', border: '2px solid #c9a84c' }}
                >
                  <div className="absolute inset-[3px] rounded-md pointer-events-none" style={{ border: '1px solid rgba(201, 168, 76, 0.25)' }} />
                  <div className="absolute top-1.5 left-1.5 text-[6px]" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>✦</div>
                  <div className="absolute top-1.5 right-1.5 text-[6px]" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>✦</div>
                  <div className="absolute bottom-1.5 left-1.5 text-[6px]" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>✦</div>
                  <div className="absolute bottom-1.5 right-1.5 text-[6px]" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>✦</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(201, 168, 76, 0.3)' }}>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(201, 168, 76, 0.2)' }}>
                      <span className="text-xs sm:text-sm" style={{ color: 'rgba(201, 168, 76, 0.6)' }}>✦</span>
                    </div>
                  </div>
                </div>

                {/* 앞면 — 전통 타로 카드 */}
                <div
                  className="tarot-card-front absolute inset-0 rounded-lg flex flex-col items-center justify-between py-1.5 px-1 overflow-hidden"
                  style={{ ...ELEMENT_STYLES[card.element], border: '2px solid #c9a84c' }}
                >
                  <div className="absolute inset-[3px] rounded-md pointer-events-none" style={{ border: '1px solid rgba(201, 168, 76, 0.3)' }} />
                  {/* 로마 숫자 */}
                  <span className="text-[7px] sm:text-[8px] font-bold tracking-[0.15em] relative z-10" style={{ color: '#8b7332', fontFamily: 'serif' }}>
                    {ROMAN[card.number]}
                  </span>
                  {/* 카드 심볼 */}
                  <div className={`relative z-10 ${selInfo?.isReversed ? 'rotate-180' : ''}`}>
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center" style={{ background: 'rgba(201, 168, 76, 0.08)', border: '1px solid rgba(201, 168, 76, 0.15)' }}>
                      <span className="text-xl sm:text-2xl drop-shadow-sm">{card.emoji}</span>
                    </div>
                  </div>
                  {/* 카드 이름 */}
                  <div className="text-center relative z-10">
                    <span className="text-[8px] sm:text-[9px] font-bold text-gray-800 leading-tight block">{card.name}</span>
                    {selInfo?.isReversed && (
                      <span className="text-[6px] sm:text-[7px] font-bold text-red-500">역방향</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 선택된 카드 요약 */}
      {selected.length > 0 && (
        <div className="flex justify-center gap-3 pt-2">
          {selected.map((sel, i) => {
            const card = MAJOR_ARCANA[sel.cardIndex]
            return (
              <div key={i} className="text-center animate-fadeIn">
                <div
                  className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg flex flex-col items-center justify-center shadow-md relative overflow-hidden"
                  style={{ ...ELEMENT_STYLES[card.element], border: '2px solid #c9a84c' }}
                >
                  <div className="absolute inset-[2px] rounded-md pointer-events-none" style={{ border: '1px solid rgba(201, 168, 76, 0.2)' }} />
                  <span className="text-[6px] relative z-10" style={{ color: '#8b7332', fontFamily: 'serif' }}>{ROMAN[card.number]}</span>
                  <span className={`text-xl sm:text-2xl relative z-10 ${sel.isReversed ? 'rotate-180' : ''}`}>{card.emoji}</span>
                  <span className="text-[7px] sm:text-[8px] font-bold text-gray-800 relative z-10">{card.name}</span>
                </div>
                <span className="text-[10px] text-purple-600 font-medium mt-1 block">{spread.positions[i]}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

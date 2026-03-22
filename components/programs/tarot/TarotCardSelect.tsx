'use client'

import { useState, useEffect, useCallback } from 'react'
import { MAJOR_ARCANA } from './tarotData'
import { shuffleCards, randomOrientation } from './tarotEngine'
import type { SpreadType } from './tarotData'

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
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">카드를 선택하세요</h2>
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
              className={`tarot-card aspect-[2/3] rounded-xl relative cursor-pointer transition-all duration-300
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                ${!isFlipped && !isDisabled ? 'hover:scale-105 hover:-translate-y-1 hover:shadow-lg' : ''}
                ${isFlipped ? 'cursor-default' : ''}
              `}
            >
              <div className={`tarot-card-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}>
                {/* 뒷면 */}
                <div className="tarot-card-back absolute inset-0 rounded-xl bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 border-2 border-purple-500/50 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 left-2 text-[8px] text-purple-300">&#10022;</div>
                    <div className="absolute top-2 right-2 text-[8px] text-purple-300">&#10022;</div>
                    <div className="absolute bottom-2 left-2 text-[8px] text-purple-300">&#10022;</div>
                    <div className="absolute bottom-2 right-2 text-[8px] text-purple-300">&#10022;</div>
                  </div>
                  <div className="text-2xl sm:text-3xl">&#10025;</div>
                </div>

                {/* 앞면 */}
                <div className={`tarot-card-front absolute inset-0 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 ${isFlipped ? 'border-purple-400' : 'border-purple-200'} flex flex-col items-center justify-center p-1 overflow-hidden`}>
                  <span className={`text-2xl sm:text-3xl ${selInfo?.isReversed ? 'rotate-180' : ''}`}>
                    {card.emoji}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-purple-900 mt-1 text-center leading-tight">
                    {card.name}
                  </span>
                  {selInfo?.isReversed && (
                    <span className="text-[7px] sm:text-[8px] text-red-500 font-medium mt-0.5">역방향</span>
                  )}
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
                <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-purple-400 flex flex-col items-center justify-center shadow-md">
                  <span className={`text-xl sm:text-2xl ${sel.isReversed ? 'rotate-180' : ''}`}>{card.emoji}</span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-purple-800 mt-0.5">{card.name}</span>
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

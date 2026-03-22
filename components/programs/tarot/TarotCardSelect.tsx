'use client'

import { useState, useEffect, useCallback } from 'react'
import { MAJOR_ARCANA } from './tarotData'
import { shuffleCards, randomOrientation } from './tarotEngine'
import type { SpreadType } from './tarotData'

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']

const ELEMENT_FRONT: Record<string, { bg: string; glow: string }> = {
  '바람': { bg: 'linear-gradient(180deg, #e0f0ff 0%, #b8d4f0 30%, #8bb8e0 60%, #6a9fd4 100%)', glow: 'rgba(100,160,220,0.3)' },
  '물': { bg: 'linear-gradient(180deg, #dde4ff 0%, #b4bef0 30%, #8a9ae0 60%, #6b7dd4 100%)', glow: 'rgba(100,120,220,0.3)' },
  '불': { bg: 'linear-gradient(180deg, #fff0dd 0%, #f0d4a0 30%, #e0b060 60%, #d49840 100%)', glow: 'rgba(220,160,60,0.3)' },
  '땅': { bg: 'linear-gradient(180deg, #f0eedd 0%, #d8d0a8 30%, #c0b478 60%, #a89850 100%)', glow: 'rgba(180,160,80,0.3)' },
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
          const elFront = ELEMENT_FRONT[card.element] || ELEMENT_FRONT['땅']

          return (
            <button
              key={position}
              onClick={() => handleCardClick(position)}
              disabled={isFlipped || isDisabled}
              className={`tarot-card aspect-[2/3] rounded-lg relative cursor-pointer transition-all duration-300
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                ${!isFlipped && !isDisabled ? 'hover:scale-105 hover:-translate-y-1 hover:shadow-xl' : ''}
                ${isFlipped ? 'cursor-default' : ''}
              `}
            >
              <div className={`tarot-card-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}>
                {/* ── 뒷면: 풀 패턴 타로 카드 ── */}
                <div
                  className="tarot-card-back absolute inset-0 rounded-lg overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #0a0620 0%, #1a1040 30%, #2d1b69 50%, #1a1040 70%, #0a0620 100%)', border: '2px solid #c9a84c' }}
                >
                  {/* 금색 내부 테두리 */}
                  <div className="absolute inset-[3px] rounded-md" style={{ border: '1px solid rgba(201, 168, 76, 0.35)' }} />
                  {/* 중앙 다이아몬드 패턴 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[70%] h-[75%] relative" style={{ border: '1px solid rgba(201, 168, 76, 0.15)' }}>
                      {/* 대각선 패턴 */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1px]" style={{ background: 'rgba(201,168,76,0.12)', transform: 'translate(-50%,-50%) rotate(45deg)' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1px]" style={{ background: 'rgba(201,168,76,0.12)', transform: 'translate(-50%,-50%) rotate(-45deg)' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full" style={{ background: 'rgba(201,168,76,0.1)' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px]" style={{ background: 'rgba(201,168,76,0.1)' }} />
                      </div>
                    </div>
                  </div>
                  {/* 중앙 심볼 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(201, 168, 76, 0.25)', background: 'rgba(201, 168, 76, 0.04)' }}>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(201, 168, 76, 0.2)', background: 'rgba(201, 168, 76, 0.06)' }}>
                        <span className="text-sm sm:text-base" style={{ color: 'rgba(201, 168, 76, 0.5)' }}>✦</span>
                      </div>
                    </div>
                  </div>
                  {/* 코너 장식 */}
                  <div className="absolute top-1.5 left-1.5 text-[7px]" style={{ color: 'rgba(201, 168, 76, 0.4)' }}>✦</div>
                  <div className="absolute top-1.5 right-1.5 text-[7px]" style={{ color: 'rgba(201, 168, 76, 0.4)' }}>✦</div>
                  <div className="absolute bottom-1.5 left-1.5 text-[7px]" style={{ color: 'rgba(201, 168, 76, 0.4)' }}>✦</div>
                  <div className="absolute bottom-1.5 right-1.5 text-[7px]" style={{ color: 'rgba(201, 168, 76, 0.4)' }}>✦</div>
                </div>

                {/* ── 앞면: 여백 없이 꽉 찬 타로 카드 ── */}
                <div
                  className="tarot-card-front absolute inset-0 rounded-lg overflow-hidden"
                  style={{ background: elFront.bg, border: '2px solid #c9a84c' }}
                >
                  {/* 금색 내부 테두리 */}
                  <div className="absolute inset-[2px] rounded-md pointer-events-none" style={{ border: '1px solid rgba(201, 168, 76, 0.3)' }} />

                  {/* 상단: 로마 숫자 */}
                  <div className="absolute top-0 left-0 right-0 text-center pt-1.5 z-10">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em]" style={{ color: '#6b5a28', fontFamily: 'serif' }}>
                      {ROMAN[card.number]}
                    </span>
                  </div>

                  {/* 중앙: 이모지 — 카드 전체를 채움 */}
                  <div className={`absolute inset-0 flex items-center justify-center z-10 ${selInfo?.isReversed ? 'rotate-180' : ''}`}>
                    <span className="text-[2.8rem] sm:text-[3.5rem] drop-shadow-md" style={{ filter: `drop-shadow(0 0 8px ${elFront.glow})` }}>
                      {card.emoji}
                    </span>
                  </div>

                  {/* 하단: 카드 이름 */}
                  <div className="absolute bottom-0 left-0 right-0 text-center pb-1 z-10" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.06))' }}>
                    <span className="text-[8px] sm:text-[9px] font-black text-gray-800 leading-tight block drop-shadow-sm">{card.name}</span>
                    {selInfo?.isReversed && (
                      <span className="text-[6px] sm:text-[7px] font-bold text-red-600">역방향</span>
                    )}
                  </div>

                  {/* 코너 장식 */}
                  <div className="absolute top-1 left-1.5 text-[5px] z-10" style={{ color: 'rgba(107, 90, 40, 0.3)' }}>✦</div>
                  <div className="absolute top-1 right-1.5 text-[5px] z-10" style={{ color: 'rgba(107, 90, 40, 0.3)' }}>✦</div>
                  <div className="absolute bottom-1 left-1.5 text-[5px] z-10" style={{ color: 'rgba(107, 90, 40, 0.3)' }}>✦</div>
                  <div className="absolute bottom-1 right-1.5 text-[5px] z-10" style={{ color: 'rgba(107, 90, 40, 0.3)' }}>✦</div>
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
            const elFront = ELEMENT_FRONT[card.element] || ELEMENT_FRONT['땅']
            return (
              <div key={i} className="text-center animate-fadeIn">
                <div
                  className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg shadow-lg relative overflow-hidden"
                  style={{ background: elFront.bg, border: '2px solid #c9a84c' }}
                >
                  <div className="absolute inset-[2px] rounded-md pointer-events-none" style={{ border: '1px solid rgba(201, 168, 76, 0.25)' }} />
                  <div className="absolute top-1 left-0 right-0 text-center z-10">
                    <span className="text-[7px]" style={{ color: '#6b5a28', fontFamily: 'serif' }}>{ROMAN[card.number]}</span>
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center z-10 ${sel.isReversed ? 'rotate-180' : ''}`}>
                    <span className="text-3xl sm:text-4xl drop-shadow-md" style={{ filter: `drop-shadow(0 0 6px ${elFront.glow})` }}>{card.emoji}</span>
                  </div>
                  <div className="absolute bottom-0.5 left-0 right-0 text-center z-10">
                    <span className="text-[7px] sm:text-[8px] font-bold text-gray-800">{card.name}</span>
                  </div>
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

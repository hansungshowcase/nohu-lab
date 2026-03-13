'use client'

import { useEffect, useState } from 'react'
import { TIER_MAP, TIER_COLORS } from '@/lib/types'

const TIER_GLOW: Record<number, string> = {
  0: 'shadow-gray-200',
  1: 'shadow-green-300',
  2: 'shadow-yellow-300',
  3: 'shadow-orange-300',
  4: 'shadow-purple-400',
}

export default function TierBadge({ tier }: { tier: number }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const info = TIER_MAP[tier]
  const colors = TIER_COLORS[tier]
  const glow = TIER_GLOW[tier] || 'shadow-gray-200'

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${colors}
        shadow-md ${glow}
        transition-all duration-700 ease-out
        ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'}
      `}
      style={{
        animation: mounted ? 'tierPulse 2s ease-in-out 1' : undefined,
      }}
    >
      <style>{`
        @keyframes tierPulse {
          0% { box-shadow: 0 0 0 0 currentColor; }
          40% { box-shadow: 0 0 12px 4px currentColor; }
          100% { box-shadow: none; }
        }
      `}</style>
      {info?.cafeName || info?.name || `Tier ${tier}`}
    </span>
  )
}

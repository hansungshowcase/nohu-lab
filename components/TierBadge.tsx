'use client'

import { useEffect, useState } from 'react'
import { TIER_MAP } from '@/lib/types'

const TIER_STYLES: Record<number, { bg: string; text: string; ring: string; dot: string }> = {
  0: { bg: 'bg-gray-50', text: 'text-gray-500', ring: 'ring-gray-200', dot: 'bg-gray-400' },
  1: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  2: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  3: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200', dot: 'bg-orange-500' },
  4: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', dot: 'bg-violet-500' },
}

export default function TierBadge({ tier }: { tier: number }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(t)
  }, [])

  const info = TIER_MAP[tier]
  const style = TIER_STYLES[tier] || TIER_STYLES[0]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide
        ${style.bg} ${style.text} ring-1 ${style.ring}
        transition-all duration-500 ease-out
        ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${mounted ? 'animate-pulse' : ''}`} />
      {info?.cafeName || info?.name || `Tier ${tier}`}
    </span>
  )
}

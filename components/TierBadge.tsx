import { TIER_MAP, TIER_COLORS } from '@/lib/types'

export default function TierBadge({ tier }: { tier: number }) {
  const info = TIER_MAP[tier]
  const colors = TIER_COLORS[tier]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}>
      {info?.cafeName || info?.name || `Tier ${tier}`}
    </span>
  )
}

'use client'

import Link from 'next/link'
import { Program, TIER_MAP, TIER_COLORS } from '@/lib/types'

interface Props {
  program: Program
  userTier: number
}

export default function ProgramCard({ program, userTier }: Props) {
  const canAccess = userTier >= program.minTier
  const tierInfo = TIER_MAP[program.minTier]

  if (canAccess) {
    return (
      <Link href={`/programs/${program.id}`}>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100 hover:shadow-md hover:border-green-300 transition cursor-pointer h-full">
          <div className="flex items-start justify-between mb-3">
            <span className="text-3xl">{program.icon}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_COLORS[program.minTier]}`}>
              {tierInfo.cafeName}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {program.name}
          </h3>
          <p className="text-sm text-gray-500">
            {program.description}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 opacity-50 h-full relative">
      <div className="absolute top-3 right-3 text-lg">🔒</div>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl grayscale">{program.icon}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_COLORS[program.minTier]}`}>
          {tierInfo.cafeName}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">
        {program.name}
      </h3>
      <p className="text-sm text-gray-500 mb-2">
        {program.description}
      </p>
      <span className="text-xs text-gray-400">
        {tierInfo.cafeName} 이상 이용 가능
      </span>
    </div>
  )
}

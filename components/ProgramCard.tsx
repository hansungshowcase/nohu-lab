'use client'

import Link from 'next/link'
import { Program, TIER_MAP } from '@/lib/types'

interface Props {
  program: Program
  userTier: number
}

const TIER_BADGE_STYLE: Record<number, string> = {
  0: 'bg-gray-50 text-gray-500 ring-gray-200',
  1: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  2: 'bg-amber-50 text-amber-600 ring-amber-200',
  3: 'bg-orange-50 text-orange-600 ring-orange-200',
  4: 'bg-violet-50 text-violet-600 ring-violet-200',
}

export default function ProgramCard({ program, userTier }: Props) {
  const canAccess = userTier >= program.minTier
  const tierInfo = TIER_MAP[program.minTier]
  const badgeStyle = TIER_BADGE_STYLE[program.minTier] || TIER_BADGE_STYLE[1]

  if (canAccess) {
    return (
      <Link href={`/programs/${program.id}`}>
        <div className="group bg-white rounded-2xl p-5 border border-gray-100 card-hover h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/0 group-hover:from-green-50/50 group-hover:to-emerald-50/30 transition-all duration-500 rounded-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:from-green-50 group-hover:to-emerald-50 transition-colors duration-300">
                <span className="text-2xl">{program.icon}</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ring-1 ${badgeStyle}`}>
                {tierInfo.cafeName}
              </span>
            </div>
            <h3 className="font-semibold text-[15px] text-gray-900 mb-1.5 group-hover:text-green-700 transition-colors">
              {program.name}
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              {program.description}
            </p>
            <div className="mt-4 flex items-center text-[12px] text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>바로가기</span>
              <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-white/60 rounded-2xl p-5 border border-gray-100 h-full relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      </div>
      <div className="opacity-40">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">
            <span className="text-2xl grayscale">{program.icon}</span>
          </div>
        </div>
        <h3 className="font-semibold text-[15px] text-gray-900 mb-1.5">
          {program.name}
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          {program.description}
        </p>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-[11px] text-gray-400 font-medium">
          {tierInfo.cafeName} 이상 이용 가능
        </span>
      </div>
    </div>
  )
}

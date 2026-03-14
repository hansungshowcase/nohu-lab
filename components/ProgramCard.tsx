'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
        <div className={`group bg-white rounded-2xl p-5 border ${program.badge ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'} card-hover h-full relative overflow-hidden`}>
          {program.badge && (
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-sm flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {program.badge}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/0 group-hover:from-green-50/50 group-hover:to-emerald-50/30 transition-all duration-500 rounded-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${program.badge ? 'from-green-50 to-emerald-50' : 'from-gray-50 to-gray-100'} flex items-center justify-center group-hover:from-green-50 group-hover:to-emerald-50 transition-colors duration-300`}>
                <span className="text-2xl">{program.icon}</span>
              </div>
              {!program.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ring-1 ${badgeStyle}`}>
                  {tierInfo.cafeName}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-[15px] text-gray-900 mb-1.5 group-hover:text-green-700 transition-colors">
              {program.name}
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              {program.description}
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 group-hover:from-green-600 group-hover:to-emerald-700 text-white text-[12px] font-semibold rounded-lg shadow-sm group-hover:shadow-md shadow-green-500/15 group-hover:shadow-green-500/25 transition-all duration-300">
                바로 이용하기
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  const router = useRouter()

  return (
    <div
      className="group/locked bg-white/60 rounded-2xl p-5 border border-gray-100 h-full relative overflow-hidden cursor-pointer"
      onClick={() => router.push('/dashboard/tier-guide')}
    >
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
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] text-green-600 font-semibold animate-pulse">
          {tierInfo.cafeName} 이상 이용 가능
        </span>
        <span className="text-[11px] text-green-600 font-medium flex items-center gap-0.5 opacity-0 group-hover/locked:opacity-100 transition-opacity duration-300">
          등업하기
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      </div>
    </div>
  )
}

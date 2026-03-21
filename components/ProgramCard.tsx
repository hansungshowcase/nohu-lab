'use client'

import Link from 'next/link'
import { Program } from '@/lib/types'

interface Props {
  program: Program
  userTier: number
}

export default function ProgramCard({ program }: Props) {
  return (
    <Link href={`/programs/${program.id}`}>
      <div className={`group bg-white rounded-2xl p-5 border ${program.badge ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'} card-hover h-full relative overflow-hidden active:scale-[0.98] transition-transform`}>
        {program.badge && (
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-sm flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {program.badge}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/0 group-hover:from-orange-50/50 group-hover:to-amber-50/30 transition-all duration-500 rounded-2xl" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${program.badge ? 'from-orange-50 to-amber-50' : 'from-gray-50 to-gray-100'} flex items-center justify-center group-hover:from-orange-50 group-hover:to-amber-50 transition-colors duration-300`}>
              <span className="text-2xl">{program.icon}</span>
            </div>
          </div>
          <h3 className="font-semibold text-[15px] text-gray-900 mb-1.5 group-hover:text-orange-700 transition-colors">
            {program.name}
          </h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            {program.description}
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-amber-600 group-hover:from-orange-600 group-hover:to-amber-700 text-white text-[13px] font-semibold rounded-lg shadow-sm group-hover:shadow-lg shadow-orange-500/15 group-hover:shadow-orange-500/30 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 animate-subtle-pulse">
              바로 이용하기
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

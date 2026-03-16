'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TierBadge from '@/components/TierBadge'
import ProgramCard from '@/components/ProgramCard'
import { programRegistry, getAllCategories } from '@/app/programs/registry'
import { TIER_MAP } from '@/lib/types'

interface User {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [category, setCategory] = useState('전체')
  const categories = ['전체', ...getAllCategories()]

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setUser)
      .catch(() => router.push('/'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 spinner" />
      </div>
    )
  }

  const filtered =
    category === '전체'
      ? programRegistry.filter((p) => p.isActive)
      : programRegistry.filter((p) => p.isActive && p.category === category)

  const tierInfo = TIER_MAP[user.tier]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 sm:mb-10 ml-12 lg:ml-0 animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {user.nickname}님
          </h1>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <TierBadge tier={user.tier} />
          <span className="text-[13px] text-gray-400 font-medium">
            {tierInfo?.description}
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide animate-slide-up" style={{ animationDelay: '100ms' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 ${
              category === cat
                ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((program, i) => (
          <div
            key={program.id}
            className="animate-slide-up"
            style={{ animationDelay: `${150 + i * 50}ms` }}
          >
            <ProgramCard
              program={program}
              userTier={user.tier}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-gray-400 text-[14px]">해당 카테고리에 프로그램이 없습니다</p>
        </div>
      )}
    </div>
  )
}

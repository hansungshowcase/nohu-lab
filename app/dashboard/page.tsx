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
  }, [router])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const filtered =
    category === '전체'
      ? programRegistry.filter((p) => p.isActive)
      : programRegistry.filter((p) => p.isActive && p.category === category)

  const tierInfo = TIER_MAP[user.tier]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 ml-12 lg:ml-0">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.nickname}님 환영합니다
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <TierBadge tier={user.tier} />
          <span className="text-sm text-gray-500">
            {tierInfo?.cafeName} 등급
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              category === cat
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border border-green-200 hover:bg-green-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            userTier={user.tier}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          해당 카테고리에 프로그램이 없습니다.
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TierBadge from '@/components/TierBadge'
import ProgramCard from '@/components/ProgramCard'
import { programRegistry, getAllCategories } from '@/app/programs/registry'

interface User {
  memberId: string
  nickname: string
  tier: 1 | 2 | 3 | 4
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 환영 메시지 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {user.nickname}님 환영합니다 👋
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <TierBadge tier={user.tier} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Tier {user.tier} 이하 프로그램 이용 가능
          </span>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              category === cat
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 프로그램 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            userTier={user.tier}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          해당 카테고리에 프로그램이 없습니다.
        </div>
      )}
    </div>
  )
}

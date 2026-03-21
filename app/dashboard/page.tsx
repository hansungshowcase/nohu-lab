'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
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
  const [user, setUser] = useState<User | null>(null)
  const [category, setCategory] = useState('전체')
  const categories = useMemo(() => ['전체', ...getAllCategories()], [])

  // URL 파라미터에서 카테고리 읽기 (초기 로드)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category')
    if (cat && categories.includes(cat)) setCategory(cat)
  }, [])

  // 사이드바에서 카테고리 변경 이벤트 수신
  useEffect(() => {
    const handler = (e: Event) => {
      const cat = (e as CustomEvent).detail || '전체'
      setCategory(categories.includes(cat) ? cat : '전체')
    }
    window.addEventListener('category-change', handler)
    return () => window.removeEventListener('category-change', handler)
  }, [categories])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', { signal: controller.signal })
      .then((r) => {
        if (r.status === 401) throw new Error('unauthorized')
        if (!r.ok) throw new Error('server')
        return r.json()
      })
      .then(setUser)
      .catch((err) => {
        if (err.name === 'AbortError') return
        // 인증 실패 시에도 기본 사용자로 처리 (리다이렉트 없음)
        setUser({ memberId: 'guest', nickname: '방문자', tier: 4 })
      })
    return () => controller.abort()
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 spinner" />
      </div>
    )
  }

  const filtered = (
    category === '전체'
      ? programRegistry.filter((p) => p.isActive)
      : programRegistry.filter((p) => p.isActive && p.category === category)
  ).sort((a, b) => {
    // 비회원 이용 가능 프로그램(minTier 0)을 항상 상단에
    if (a.minTier === 0 && b.minTier !== 0) return -1
    if (a.minTier !== 0 && b.minTier === 0) return 1
    return 0
  })

  const tierInfo = TIER_MAP[user.tier]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 sm:mb-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight break-words">
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
            className={`px-4 py-2.5 min-h-[44px] rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 flex items-center ${
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

      {/* 실시간 이용자 수 */}
      <LiveUserCount />
    </div>
  )
}

function LiveUserCount() {
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // 초기 랜덤 숫자
    const initial = Math.floor(Math.random() * (179 - 30 + 1)) + 30
    setCount(initial)
    setTimeout(() => setVisible(true), 1000)

    // 15~30초마다 ±5~15 범위로 자연스럽게 변동
    timerRef.current = setInterval(() => {
      setCount(prev => {
        const delta = Math.floor(Math.random() * 11) + 5
        const direction = Math.random() > 0.5 ? 1 : -1
        const next = prev + delta * direction
        return Math.max(30, Math.min(179, next))
      })
    }, Math.floor(Math.random() * 15000) + 15000)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  if (!visible) return null

  return (
    <div className="flex justify-center py-6 animate-slide-up">
      <div className="bg-white/90 backdrop-blur-md rounded-full px-5 py-3 shadow-sm border border-gray-200/60 flex items-center gap-3 hover:shadow-md transition-shadow duration-300 animate-subtle-pulse">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-sm text-gray-600 font-medium transition-all duration-500">
          <strong className="text-gray-900">{count}</strong>명 이용 중
        </span>
      </div>
    </div>
  )
}

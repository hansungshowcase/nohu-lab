'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import TierBadge from './TierBadge'
import { getAllCategories } from '@/app/programs/registry'

interface User {
  memberId: string
  nickname: string
  tier: 1 | 2 | 3 | 4
}

export default function Sidebar({ user }: { user: User | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const categories = getAllCategories()

  if (!user) return null

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: '대시보드', icon: '🏠' },
    ...categories.map((cat) => ({
      href: `/dashboard?category=${encodeURIComponent(cat)}`,
      label: cat,
      icon: cat === '유틸리티' ? '🔧' : cat === '콘텐츠' ? '📄' : cat === '분석' ? '📊' : '📁',
    })),
    ...(user.tier === 4
      ? [{ href: '/admin', label: '관리자 패널', icon: '⚙️' }]
      : []),
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* 로고 */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            카페 웹앱
          </span>
        </Link>
      </div>

      {/* 사용자 정보 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="font-medium text-gray-900 dark:text-white">
          {user.nickname}
        </div>
        <TierBadge tier={user.tier} />
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              pathname === item.href
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 로그아웃 */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
        >
          <span>🚪</span>
          로그아웃
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* 모바일 햄버거 */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* 모바일 오버레이 */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

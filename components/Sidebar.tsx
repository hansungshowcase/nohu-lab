'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import TierBadge from './TierBadge'
import { getAllCategories } from '@/app/programs/registry'

interface User {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
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
      icon: cat === '유틸리티' ? '🔧' : cat === '콘텐츠' ? '📄' : cat === '분석' ? '📊' : cat === '테스트' ? '📋' : cat === '재무' ? '💰' : '📁',
    })),
    { href: '/dashboard/tier-guide', label: '등급 안내', icon: '🏆' },
    ...(user.tier === 4
      ? [{ href: '/admin', label: '관리자 패널', icon: '⚙️' }]
      : []),
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200/60 group-hover:shadow-lg group-hover:shadow-orange-300/60 transition-all duration-300">
            <span className="text-white text-base font-black">N</span>
          </div>
          <div>
            <span className="font-extrabold text-[16px] text-gray-900 tracking-tight">
              노후연구소
            </span>
            <span className="block text-[9px] text-orange-400/80 font-semibold tracking-[0.15em] uppercase">
              Retirement Lab
            </span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* User Info */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/50 border border-orange-100/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center ring-2 ring-orange-200/50 shadow-sm">
            <span className="text-orange-600 font-bold text-sm">
              {user.nickname.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[13px] text-gray-800 truncate">
              {user.nickname}
            </div>
            <div className="mt-0.5">
              <TierBadge tier={user.tier} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">
            메뉴
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 ${
                isActive
                  ? 'bg-orange-50 text-orange-700 font-semibold shadow-sm shadow-orange-100/80 border border-orange-100/60'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-[15px] w-5 text-center">{item.icon}</span>
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Logout */}
      <div className="px-3 py-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          로그아웃
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-gray-200/60"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] max-w-[80vw] border-r border-gray-100 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

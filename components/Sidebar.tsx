'use client'

import { useState, useEffect } from 'react'
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
  const [fullUrl, setFullUrl] = useState(pathname)

  useEffect(() => {
    setFullUrl(window.location.pathname + window.location.search)
  }, [pathname])
  const categories = getAllCategories()

  if (!user) return null

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* 네트워크 오류 무시 */ }
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
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #fdf8f0 0%, #faf5eb 40%, #f7f0e3 100%)' }}>
      {/* Logo */}
      <header className="px-6 pt-7 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-700 to-orange-800 flex items-center justify-center shadow-lg shadow-amber-800/15 group-hover:shadow-xl group-hover:shadow-amber-800/25 transition-all duration-300">
            <span className="text-amber-100 text-lg font-black">N</span>
          </div>
          <div>
            <span className="font-extrabold text-[17px] text-amber-950 tracking-tight">
              노후연구소
            </span>
            <span className="block text-[9px] text-amber-600/60 font-semibold tracking-[0.2em] uppercase mt-0.5">
              Retirement Lab
            </span>
          </div>
        </Link>
      </header>

      {/* User Card */}
      <div className="mx-4 mb-4">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 border border-amber-200/30 shadow-sm shadow-amber-100/40">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center ring-2 ring-amber-300/30">
            <span className="text-amber-800 font-bold text-sm">
              {user.nickname.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[13px] text-amber-950 truncate">
              {user.nickname}
            </div>
            <div className="mt-0.5">
              <TierBadge tier={user.tier} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2.5">
          <span className="text-[10px] font-bold text-amber-700/40 uppercase tracking-[0.15em]">
            메뉴
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = fullUrl === item.href || (item.href === '/dashboard' && pathname === '/dashboard' && !fullUrl.includes('category='))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.97] ${
                isActive
                  ? 'bg-white/80 text-amber-900 font-semibold shadow-sm shadow-amber-200/30 border border-amber-200/40'
                  : 'text-amber-800/60 hover:bg-white/50 hover:text-amber-900'
              }`}
            >
              <span className="text-[15px] w-5 text-center">{item.icon}</span>
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-600" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mx-4 mb-4 mt-2">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/20 to-transparent mb-3" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] text-amber-700/40 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-all duration-200"
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
        className="lg:hidden fixed top-3 left-3 z-50 p-3 rounded-xl shadow-lg shadow-amber-900/5 border border-amber-200/40 transition-all" style={{ background: 'rgba(253,248,240,0.95)', backdropFilter: 'blur(8px)' }}
        aria-label="메뉴 열기"
      >
        <svg className="w-5 h-5 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
          className="lg:hidden fixed inset-0 bg-amber-950/15 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] max-w-[80vw] border-r border-amber-200/20 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl shadow-amber-900/10' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

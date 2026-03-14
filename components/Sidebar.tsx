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
  const categories = getAllCategories()

  const [unreadChat, setUnreadChat] = useState(0)

  // 안읽은 채팅 메시지 수 폴링
  useEffect(() => {
    if (!user || user.tier === 0) return
    function fetchUnread() {
      fetch('/api/chat/rooms')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && typeof data.unreadCount === 'number') {
            setUnreadChat(data.unreadCount)
          } else if (Array.isArray(data)) {
            // 관리자: 전체 안읽은 수 합산
            setUnreadChat(data.reduce((s: number, r: { unreadCount: number }) => s + r.unreadCount, 0))
          }
        })
        .catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [user])

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
      icon: cat === '유틸리티' ? '🔧' : cat === '콘텐츠' ? '📄' : cat === '분석' ? '📊' : cat === '테스트' ? '📋' : '📁',
    })),
    { href: '/dashboard/tier-guide', label: '등급 안내', icon: '🏆' },
    ...(user.tier !== 0
      ? [{ href: user.tier === 4 ? '/admin?tab=chat' : '/chat', label: '채팅', icon: '💬', badge: unreadChat }]
      : []),
    ...(user.tier === 4
      ? [{ href: '/admin', label: '관리자 패널', icon: '⚙️' }]
      : []),
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-green-200 group-hover:shadow-md group-hover:shadow-green-200 transition-shadow">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <div>
            <span className="font-semibold text-[15px] text-gray-900 tracking-tight">
              노후연구소
            </span>
            <span className="block text-[10px] text-gray-400 font-medium tracking-wider uppercase">
              Retirement Lab
            </span>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center border border-green-200/50">
            <span className="text-green-700 font-semibold text-sm">
              {user.nickname.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">
              {user.nickname}
            </div>
            <div className="mt-0.5">
              <TierBadge tier={user.tier} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            메뉴
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const badge = 'badge' in item ? (item as { badge?: number }).badge : 0
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 ${
                isActive
                  ? 'bg-green-50 text-green-700 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
              {badge && badge > 0 ? (
                <span className="ml-auto min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {badge}
                </span>
              ) : isActive ? (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-gray-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all duration-200"
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-gray-200/50"
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
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] max-w-[80vw] bg-white/95 backdrop-blur-md border-r border-gray-100 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

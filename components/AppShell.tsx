'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import ChatWidget from './ChatWidget'

interface User {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
}

const CAFE_URL = 'https://cafe.naver.com/eovhskfktmak'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [showGuestBanner, setShowGuestBanner] = useState(false)
  const isLoginPage = pathname === '/' || pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setUser(null)
      return
    }
    const controller = new AbortController()
    fetch('/api/auth/me', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setUser)
      .catch((err) => {
        if (err.name !== 'AbortError') setUser(null)
      })
    return () => controller.abort()
  }, [pathname, isLoginPage])

  // 비회원 배너 표시
  useEffect(() => {
    if (user && user.tier === 0) {
      const dismissed = sessionStorage.getItem('guest-banner-dismissed')
      if (!dismissed) setShowGuestBanner(true)
    } else {
      setShowGuestBanner(false)
    }
  }, [user])

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-premium">
      <Sidebar user={user} />
      <main className="flex-1 lg:ml-0 min-h-screen">
        {showGuestBanner && (
          <a
            href={CAFE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 flex items-center justify-between gap-2 animate-slide-up cursor-pointer hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-medium flex-1 min-w-0">
              <span className="text-sm shrink-0">🔒</span>
              <span>비회원은 프로그램 <strong>2회</strong> 제한 · 회원가입하면 무제한!</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-4 py-1.5 bg-white text-orange-600 text-sm font-bold rounded-lg shadow-sm whitespace-nowrap">
                회원가입 →
              </span>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowGuestBanner(false); sessionStorage.setItem('guest-banner-dismissed', '1') }}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </a>
        )}
        {children}
      </main>
      <ChatWidget user={user} />
    </div>
  )
}

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
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 flex items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-2 text-sm font-medium flex-1 min-w-0">
              <span className="text-lg shrink-0">🔒</span>
              <span>비회원은 모든 프로그램이 <strong>2회</strong>까지 제한됩니다. 지금 바로 회원가입하고 무제한으로 이용하세요!</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={CAFE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-white text-orange-600 text-sm font-bold rounded-lg hover:bg-orange-50 transition whitespace-nowrap"
              >
                회원가입
              </a>
              <button
                onClick={() => { setShowGuestBanner(false); sessionStorage.setItem('guest-banner-dismissed', '1') }}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {children}
      </main>
      <ChatWidget user={user} />
    </div>
  )
}

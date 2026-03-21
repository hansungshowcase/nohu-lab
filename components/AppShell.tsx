'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import ChatWidget from './ChatWidget'
import CafeFloatingCard from './CafeFloatingCard'

interface User {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sharedMode, setSharedMode] = useState(false)
  const [showEventBanner, setShowEventBanner] = useState(true)
  const isLoginPage = pathname === '/admin/login'

  // 공유 링크 감지 (사주풀이/연금 결과 링크)
  useEffect(() => {
    const search = window.location.search
    const isShared =
      (pathname === '/programs/saju-reading' && search.includes('y=')) ||
      (pathname === '/programs/pension-timing' && search.includes('age='))
    setSharedMode(isShared)
  }, [pathname])

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

  if (isLoginPage) {
    return <>{children}</>
  }

  // 공유 링크: 사이드바/배너/채팅 없이 결과만 풀스크린
  if (sharedMode) {
    return (
      <div className="min-h-screen bg-white">
        <main className="min-h-screen">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-premium">
      <Sidebar user={user} />
      <main className="flex-1 lg:ml-0 min-h-screen overflow-x-hidden">
        {showEventBanner && (
          <a
            href="https://cafe.naver.com/eovhskfktmak?iframe_url_utf8=%2FArticleRead.nhn%253Fclubid%3D20898041%2526articleid%3D2281%2526referrerAllArticles%3Dtrue"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white pl-[60px] pr-3 lg:px-3 py-2.5 flex items-center justify-between gap-2 animate-banner-slide-down cursor-pointer hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium flex-1 min-w-0">
              <span className="text-sm shrink-0 animate-banner-icon-bounce">☕</span>
              <span className="break-words leading-tight">노후연구소 회원 가입 시 <strong className="animate-banner-glow">아메리카노 100% 지급</strong> 이벤트!!</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 sm:px-4 py-1.5 bg-white text-orange-600 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap animate-banner-btn">
                가입하기 →
              </span>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEventBanner(false) }}
                className="p-2.5 -mr-1 hover:bg-white/20 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="배너 닫기"
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
      <CafeFloatingCard />
    </div>
  )
}

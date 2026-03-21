'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const CAFE_URL = 'https://cafe.naver.com/eovhskfktmak'

export default function CafeFloatingCard() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isProgram = pathname.startsWith('/programs/')

  useEffect(() => {
    if (!isProgram) {
      setVisible(false)
      setDismissed(false)
      return
    }

    // 프로그램 페이지 진입 후 5초 뒤 표시
    setDismissed(false)
    setVisible(false)
    const timer = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(timer)
  }, [pathname, isProgram])

  if (!isProgram || dismissed || !visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-200 p-4 flex items-center gap-3">
        <span className="text-2xl shrink-0">☕</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] sm:text-[14px] font-bold text-gray-900">노후연구소 카페 가입하기</p>
          <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5">가입 시 아메리카노 100% 지급!</p>
        </div>
        <a
          href={CAFE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[12px] sm:text-[13px] font-bold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all whitespace-nowrap"
        >
          가입하기
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition"
          aria-label="닫기"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

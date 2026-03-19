'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
}

const tiers = [
  {
    name: '일반회원',
    tier: 1,
    gradient: 'from-gray-50 to-gray-50/50',
    border: 'border-gray-200/60',
    badgeBg: 'bg-gray-100 text-gray-600',
    accent: 'text-gray-700',
    statBg: 'bg-gray-50',
    icon: '🌱',
    description: '가입 후 막 활동을 시작하는 멤버',
    benefit: '가입 인사만 작성해도 커피쿠폰 지급',
    method: '회원가입',
    conditions: null,
  },
  {
    name: '코어회원',
    tier: 1,
    gradient: 'from-amber-50/80 to-orange-50/30',
    border: 'border-amber-200/60',
    badgeBg: 'bg-amber-100 text-amber-700',
    accent: 'text-amber-700',
    statBg: 'bg-white/80',
    icon: '🌿',
    description: '카페 일반 멤버',
    benefit: '프리미엄 콘텐츠 읽기 가능',
    method: '자동등업',
    conditions: { posts: 1, comments: 5, visits: 0, likes: 0 },
  },
  {
    name: '우수회원',
    tier: 2,
    gradient: 'from-amber-50/80 to-yellow-50/30',
    border: 'border-amber-200/60',
    badgeBg: 'bg-amber-100 text-amber-700',
    accent: 'text-amber-700',
    statBg: 'bg-white/80',
    icon: '⭐',
    description: '카페 활동을 성실히 하는 멤버',
    benefit: 'VIP글 읽기 가능 + 배달의 민족 3만원 상품권',
    method: '자동등업',
    conditions: { posts: 10, comments: 30, visits: 5, likes: 0 },
  },
  {
    name: '프리미엄회원',
    tier: 3,
    gradient: 'from-orange-50/80 to-amber-50/30',
    border: 'border-orange-200/60',
    badgeBg: 'bg-orange-100 text-orange-700',
    accent: 'text-orange-700',
    statBg: 'bg-white/80',
    icon: '💎',
    description: '카페 열심 멤버',
    benefit: '백화점 10만원 상품권 지급',
    method: '등업게시판',
    conditions: { posts: 30, comments: 100, visits: 50, likes: 50 },
  },
  {
    name: '시그니처회원',
    tier: 3,
    gradient: 'from-rose-50/80 to-red-50/30',
    border: 'border-rose-200/60',
    badgeBg: 'bg-rose-100 text-rose-700',
    accent: 'text-rose-700',
    statBg: 'bg-white/80',
    icon: '🏅',
    description: '카페 우수 멤버',
    benefit: '네이버 포인트 30만원 지급',
    method: '등업게시판',
    conditions: { posts: 100, comments: 500, visits: 100, likes: 100 },
  },
  {
    name: '헤리티지회원',
    tier: 4,
    gradient: 'from-violet-50/80 to-purple-50/30',
    border: 'border-violet-200/60',
    badgeBg: 'bg-violet-100 text-violet-700',
    accent: 'text-violet-700',
    statBg: 'bg-white/80',
    icon: '👑',
    description: '최고 고마운 VIP 멤버',
    benefit: '카페 스탭 임명, 명절 선물 배송, 회원 관리 권한',
    method: '등업게시판',
    conditions: { posts: 300, comments: 1000, visits: 300, likes: 300 },
  },
]

export default function TierGuidePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

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
        if (err.message === 'unauthorized') router.push('/')
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8 sm:mb-10 ml-0 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          등급 안내
        </h1>
        <p className="text-[13px] text-gray-400 mt-1.5 font-medium">
          카페 활동에 따라 자동 또는 신청을 통해 등업됩니다
        </p>
      </div>

      <div className="space-y-4">
        {tiers.map((t, i) => (
          <div
            key={i}
            className={`animate-slide-up rounded-2xl border ${t.border} bg-gradient-to-br ${t.gradient} p-5 sm:p-6 card-hover`}
            style={{ animationDelay: `${100 + i * 80}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl shrink-0 mt-0.5">{t.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className={`text-[16px] font-bold ${t.accent}`}>{t.name}</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${t.badgeBg}`}>
                    {t.method}
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 mt-1">{t.description}</p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[13px]">🎁</span>
                  <span className="text-[13px] font-medium text-gray-700">{t.benefit}</span>
                </div>

                {t.conditions && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: '게시글', value: t.conditions.posts },
                      { label: '댓글', value: t.conditions.comments },
                      { label: '방문', value: t.conditions.visits },
                      { label: '좋아요', value: t.conditions.likes },
                    ].map((stat) => (
                      <div key={stat.label} className={`${t.statBg} rounded-xl px-2 py-2.5 text-center backdrop-blur-sm`}>
                        <div className="text-[16px] font-bold text-gray-800">{stat.value}</div>
                        <div className="text-[12px] text-gray-400 font-medium mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 animate-slide-up" style={{ animationDelay: '700ms' }}>
        <div className="p-6 bg-gradient-to-br from-orange-50/80 to-amber-50/40 backdrop-blur-sm rounded-2xl border border-amber-200/60 text-center">
          <p className="text-[13px] text-gray-500 mb-4">
            등업 신청은 노후연구소 카페의 등업게시판에서 가능합니다
          </p>
          <a
            href="https://cafe.naver.com/eovhskfktmak"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-[14px] rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            등업하러 가기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

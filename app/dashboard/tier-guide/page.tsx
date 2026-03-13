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
    color: 'gray',
    bgColor: 'bg-gray-50 border-gray-200',
    badgeColor: 'bg-gray-100 text-gray-700',
    icon: '🌱',
    description: '가입 후 막 활동을 시작하는 멤버',
    benefit: '가입 인사만 작성해도 커피쿠폰 지급',
    method: '회원가입',
    conditions: null,
  },
  {
    name: '코어회원',
    tier: 1,
    color: 'green',
    bgColor: 'bg-green-50 border-green-200',
    badgeColor: 'bg-green-100 text-green-700',
    icon: '🌿',
    description: '카페 일반 멤버',
    benefit: '프리미엄 콘텐츠 읽기 가능',
    method: '자동등업',
    conditions: { posts: 1, comments: 5, visits: 0, likes: 0, weeks: 0 },
  },
  {
    name: '우수회원',
    tier: 2,
    color: 'yellow',
    bgColor: 'bg-yellow-50 border-yellow-200',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    icon: '⭐',
    description: '카페 활동을 성실히 하는 멤버',
    benefit: 'VIP글 읽기 가능 + 배달의 민족 3만원 상품권 지급',
    method: '자동등업',
    conditions: { posts: 10, comments: 30, visits: 5, likes: 0, weeks: 0 },
  },
  {
    name: '프리미엄회원',
    tier: 3,
    color: 'orange',
    bgColor: 'bg-orange-50 border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-700',
    icon: '💎',
    description: '카페 열심 멤버',
    benefit: '백화점 10만원 상품권 지급',
    method: '등업게시판',
    conditions: { posts: 30, comments: 100, visits: 50, likes: 50, weeks: 0 },
  },
  {
    name: '시그니처회원',
    tier: 3,
    color: 'red',
    bgColor: 'bg-red-50 border-red-200',
    badgeColor: 'bg-red-100 text-red-700',
    icon: '🏅',
    description: '카페 우수 멤버',
    benefit: '네이버 포인트 30만원 지급',
    method: '등업게시판',
    conditions: { posts: 100, comments: 500, visits: 100, likes: 100, weeks: 0 },
  },
  {
    name: '헤리티지회원',
    tier: 4,
    color: 'purple',
    bgColor: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
    icon: '👑',
    description: '최고 고마운 VIP 멤버',
    benefit: '카페 스탭 임명, 명절마다 선물 배송, 회원 관리 권한',
    method: '등업게시판',
    conditions: { posts: 300, comments: 1000, visits: 300, likes: 300, weeks: 0 },
  },
]

export default function TierGuidePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setUser)
      .catch(() => router.push('/'))
  }, [router])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 ml-12 lg:ml-0">
        <h1 className="text-2xl font-bold text-gray-900">등급 안내 & 등업 조건</h1>
        <p className="text-sm text-gray-500 mt-1">
          카페 활동에 따라 자동 또는 신청을 통해 등업됩니다
        </p>
      </div>

      <div className="space-y-4">
        {tiers.map((t, i) => (
          <div
            key={t.name}
            className={`rounded-xl border-2 p-5 ${t.bgColor} transition-all duration-300 hover:shadow-md`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl shrink-0">{t.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">{t.name}</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.badgeColor}`}>
                    {t.method}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                <p className="text-sm font-medium text-gray-800 mt-2">
                  🎁 {t.benefit}
                </p>

                {t.conditions && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
                      <div className="text-lg font-bold text-gray-900">{t.conditions.posts}</div>
                      <div className="text-xs text-gray-500">게시글</div>
                    </div>
                    <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
                      <div className="text-lg font-bold text-gray-900">{t.conditions.comments}</div>
                      <div className="text-xs text-gray-500">댓글</div>
                    </div>
                    <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
                      <div className="text-lg font-bold text-gray-900">{t.conditions.visits}</div>
                      <div className="text-xs text-gray-500">방문</div>
                    </div>
                    <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
                      <div className="text-lg font-bold text-gray-900">{t.conditions.likes}</div>
                      <div className="text-xs text-gray-500">좋아요</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
        <p className="text-sm text-gray-600">
          등업 신청은{' '}
          <a
            href="https://cafe.naver.com/eovhskfktmak"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 font-medium hover:underline"
          >
            노후연구소 카페
          </a>
          의 등업게시판에서 가능합니다
        </p>
      </div>
    </div>
  )
}

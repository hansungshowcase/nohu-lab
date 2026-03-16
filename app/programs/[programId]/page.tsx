'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProgramById } from '@/app/programs/registry'
import { TIER_MAP } from '@/lib/types'
import TierBadge from '@/components/TierBadge'

const programComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'text-counter': lazy(() => import('@/components/programs/TextCounter')),
  'image-resizer': lazy(() => import('@/components/programs/ImageResizer')),
  'nickname-generator': lazy(() => import('@/components/programs/NicknameGenerator')),
  'hashtag-recommender': lazy(() => import('@/components/programs/HashtagRecommender')),
  'text-converter': lazy(() => import('@/components/programs/TextConverter')),
  'retirement-test': lazy(() => import('@/components/programs/RetirementTest')),
  'saju-reading': lazy(() => import('@/components/programs/SajuReading')),
}

interface User {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
}

export default function ProgramPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const programId = params.programId as string
  const program = getProgramById(programId)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setUser)
      .catch((err) => {
        if (err.name !== 'AbortError') setUser({ memberId: 'guest', nickname: '게스트', tier: 4 })
      })
    return () => controller.abort()
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❓</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          프로그램을 찾을 수 없습니다
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          대시보드로 돌아가기
        </button>
      </div>
    )
  }

  if (user.tier < program.minTier) {
    const tierInfo = TIER_MAP[program.minTier]
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          등급이 부족합니다
        </h1>
        <p className="text-gray-500 mb-4">
          이 프로그램은 <strong>{tierInfo.cafeName}</strong> 이상만 이용할 수 있습니다.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          대시보드로 돌아가기
        </button>
      </div>
    )
  }

  const ProgramComponent = programComponents[programId]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-green-50 rounded-lg transition"
        >
          ←
        </button>
        <span className="text-2xl">{program.icon}</span>
        <h1 className="text-xl font-bold text-gray-900">
          {program.name}
        </h1>
        <TierBadge tier={program.minTier} />
      </div>

      {ProgramComponent ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
            </div>
          }
        >
          <ProgramComponent />
        </Suspense>
      ) : (
        <div className="text-center py-12 text-gray-400">
          프로그램 컴포넌트를 불러올 수 없습니다.
        </div>
      )}
    </div>
  )
}

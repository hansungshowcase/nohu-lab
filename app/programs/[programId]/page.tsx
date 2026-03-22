'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getProgramById } from '@/app/programs/registry'
import TierBadge from '@/components/TierBadge'

const programComponents: Record<string, React.LazyExoticComponent<React.ComponentType<{ userTier?: number }>>> = {
  'text-counter': lazy(() => import('@/components/programs/TextCounter')),
  'image-resizer': lazy(() => import('@/components/programs/ImageResizer')),
  'nickname-generator': lazy(() => import('@/components/programs/NicknameGenerator')),
  'hashtag-recommender': lazy(() => import('@/components/programs/HashtagRecommender')),
  'text-converter': lazy(() => import('@/components/programs/TextConverter')),
  'retirement-test': lazy(() => import('@/components/programs/RetirementTest')),
  'saju-reading': lazy(() => import('@/components/programs/SajuReading')),
  'pension-timing': lazy(() => import('@/components/programs/PensionTiming')),
  'mental-health': lazy(() => import('@/components/programs/MentalHealth')),
  'supplement-recommend': lazy(() => import('@/components/programs/supplement/SupplementRecommender')),
  'event-money': lazy(() => import('@/components/programs/EventMoneyCalc')),
}

interface User {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
}

export default function ProgramPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const programId = params.programId as string
  // 공유 링크 접속 여부 감지 (URL에 y, m, d 파라미터가 있으면 공유 링크)
  const isSharedLink = (programId === 'saju-reading' && searchParams.has('y') && searchParams.has('m') && searchParams.has('d'))
    || (programId === 'supplement-recommend' && searchParams.has('g') && searchParams.has('age'))
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
        if (err.name !== 'AbortError') setUser({ memberId: 'guest', nickname: '게스트', tier: 0 })
      })
    return () => controller.abort()
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
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
          className="mt-4 px-5 py-3 min-h-[44px] bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          대시보드로 돌아가기
        </button>
      </div>
    )
  }

  const ProgramComponent = programComponents[programId]

  return (
    <div className={isSharedLink ? "max-w-2xl mx-auto px-2 sm:px-4 py-3 sm:py-6" : "max-w-4xl mx-auto px-4 py-6 sm:py-8"}>
      {!isSharedLink && (
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-3 -ml-1 min-h-11 min-w-11 flex items-center justify-center hover:bg-orange-50 rounded-lg transition"
            aria-label="대시보드로 돌아가기"
          >
            ←
          </button>
          <span className="text-2xl">{program.icon}</span>
          <h1 className="text-[16px] sm:text-xl font-bold text-gray-900 break-keep">
            {program.name}
          </h1>
          <TierBadge tier={program.minTier} />
        </div>
      )}

      {ProgramComponent ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          }
        >
          <ProgramComponent userTier={user.tier} />
        </Suspense>
      ) : (
        <div className="text-center py-12 text-gray-400">
          프로그램 컴포넌트를 불러올 수 없습니다.
        </div>
      )}
    </div>
  )
}

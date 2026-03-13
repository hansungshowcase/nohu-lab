'use client'

import { useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getResultByCode } from '@/components/programs/retirement-test/results'
import { CategoryScore } from '@/components/programs/retirement-test/questions'
import ResultCard from '@/components/programs/retirement-test/ResultCard'
import ResultCardA4 from '@/components/programs/retirement-test/ResultCardA4'
import ShareButtons from '@/components/programs/retirement-test/ShareButtons'
import Link from 'next/link'

export default function RetirementTestResultClient({
  resultCode,
}: {
  resultCode: string
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <ResultContent resultCode={resultCode} />
    </Suspense>
  )
}

function ResultContent({ resultCode }: { resultCode: string }) {
  const searchParams = useSearchParams()
  const cardRef = useRef<HTMLDivElement>(null)
  const a4CardRef = useRef<HTMLDivElement>(null)

  const result = getResultByCode(resultCode)

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">❓</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          결과를 찾을 수 없습니다
        </h1>
        <Link
          href="/programs/retirement-test"
          className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
        >
          나도 테스트하기
        </Link>
      </div>
    )
  }

  const total = parseInt(searchParams.get('s') || '0', 10) || result.minScore
  const categories: CategoryScore[] = [
    {
      key: 'finance',
      label: '재정 준비도',
      score: parseInt(searchParams.get('f') || '0', 10) || Math.round(total / 4),
      max: 12,
    },
    {
      key: 'lifestyle',
      label: '생활/건강',
      score: parseInt(searchParams.get('l') || '0', 10) || Math.round(total / 4),
      max: 12,
    },
    {
      key: 'housing',
      label: '주거/자산',
      score: parseInt(searchParams.get('h') || '0', 10) || Math.round(total / 4),
      max: 12,
    },
    {
      key: 'mindset',
      label: '마인드/지식',
      score: parseInt(searchParams.get('m') || '0', 10) || Math.round(total / 4),
      max: 12,
    },
  ]

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <ResultCard
          ref={cardRef}
          total={total}
          maxTotal={48}
          result={result}
          categories={categories}
        />

        <ResultCardA4
          ref={a4CardRef}
          total={total}
          maxTotal={48}
          result={result}
          categories={categories}
        />

        <ShareButtons
          shareUrl={shareUrl}
          total={total}
          grade={result.grade}
          cardRef={cardRef}
          a4CardRef={a4CardRef}
        />

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/programs/retirement-test"
            className="inline-block w-full max-w-md px-6 py-4 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 transition"
          >
            🏦 나도 테스트하기
          </Link>
        </div>
      </div>
    </div>
  )
}

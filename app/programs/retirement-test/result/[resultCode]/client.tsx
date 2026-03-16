'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getResultByCode } from '@/components/programs/retirement-test/results'
import { CategoryScore } from '@/components/programs/retirement-test/questions'
import ResultCard from '@/components/programs/retirement-test/ResultCard'
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
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <ResultContent resultCode={resultCode} />
    </Suspense>
  )
}

function ResultContent({ resultCode }: { resultCode: string }) {
  const searchParams = useSearchParams()

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
          className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition font-medium"
        >
          나도 테스트하기
        </Link>
      </div>
    )
  }

  const total = parseInt(searchParams.get('s') || '0', 10) || result.minScore
  const f = parseInt(searchParams.get('f') || '0', 10)
  const l = parseInt(searchParams.get('l') || '0', 10)
  const h = parseInt(searchParams.get('h') || '0', 10)
  const m = parseInt(searchParams.get('m') || '0', 10)
  const hasParams = f > 0 || l > 0 || h > 0 || m > 0
  const fallback = Math.floor(total / 4)
  const remainder = total - fallback * 4
  const categories: CategoryScore[] = [
    { key: 'finance', label: '재정 준비도', score: hasParams ? f : fallback + (remainder > 0 ? 1 : 0), max: 20 },
    { key: 'lifestyle', label: '생활/건강', score: hasParams ? l : fallback + (remainder > 1 ? 1 : 0), max: 20 },
    { key: 'housing', label: '주거/자산', score: hasParams ? h : fallback + (remainder > 2 ? 1 : 0), max: 20 },
    { key: 'mindset', label: '마인드/지식', score: hasParams ? m : fallback, max: 20 },
  ]

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <ResultCard
          total={total}
          maxTotal={80}
          result={result}
          categories={categories}
        />

        <ShareButtons
          shareUrl={shareUrl}
          total={total}
          grade={result.grade}
          resultCode={result.code}
          categories={categories}
        />

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/programs/retirement-test"
            className="inline-block w-full max-w-md px-6 py-4 bg-orange-600 text-white text-lg font-bold rounded-xl hover:bg-orange-700 transition"
          >
            🏦 나도 테스트하기
          </Link>
        </div>
      </div>
    </div>
  )
}

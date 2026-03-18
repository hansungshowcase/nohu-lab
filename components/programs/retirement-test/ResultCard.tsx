'use client'

import { forwardRef } from 'react'
import { ResultType } from './results'
import { CategoryScore } from './questions'

interface ResultCardProps {
  total: number
  maxTotal: number
  result: ResultType
  categories: CategoryScore[]
}

const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  function ResultCard({ total, maxTotal, result, categories }, ref) {
    const percentage = Math.round((total / maxTotal) * 100)
    const circumference = 2 * Math.PI * 54
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div
        ref={ref}
        className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto"
        style={{ width: '100%' }}
      >
        {/* Header */}
        <div className="bg-orange-600 text-white px-6 py-4 text-center">
          <div className="text-sm font-medium opacity-80">노후연구소</div>
          <div className="text-lg font-bold mt-1">나의 노후 준비 점수는?</div>
        </div>

        {/* Score circle */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none" stroke="#e5e7eb" strokeWidth="8"
              />
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke={result.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{total}</span>
              <span className="text-xs text-gray-400">/ {maxTotal}점</span>
            </div>
          </div>

          {/* Grade */}
          <div className="mt-4 text-center">
            <span className="text-4xl">{result.icon}</span>
            <h2
              className="text-xl font-bold mt-2"
              style={{ color: result.color }}
            >
              {result.grade}
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed px-4">
              {result.description}
            </p>
          </div>
        </div>

        {/* Category bars */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            카테고리별 점수
          </h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{cat.label}</span>
                  <span className="font-medium text-gray-900">
                    {cat.score}/{cat.max}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(cat.score / cat.max) * 100}%`,
                      backgroundColor: result.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated fund */}
        <div
          className="mx-6 rounded-xl p-4 text-center mb-4"
          style={{ backgroundColor: result.bgColor }}
        >
          <div className="text-xs text-gray-500 mb-1">예상 필요 노후자금</div>
          <div
            className="text-2xl font-bold"
            style={{ color: result.color }}
          >
            {result.estimatedFund}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            은퇴 후 25년, 월 200만원 기준
          </div>
        </div>

        {/* Advices */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            맞춤 조언
          </h3>
          <ul className="space-y-2">
            {result.advices.map((advice, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-orange-500 mt-0.5 shrink-0">✓</span>
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
          <div className="text-xs text-gray-400">
            retireplan.kr · 나도 테스트하기
          </div>
        </div>
      </div>
    )
  }
)

export default ResultCard

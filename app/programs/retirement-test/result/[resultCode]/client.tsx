'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getResultByCode } from '@/components/programs/retirement-test/results'
import { CategoryScore } from '@/components/programs/retirement-test/questions'
import { getCrossInsights, getDeepAdvice } from '@/components/programs/retirement-test/ResultCardA4'
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
          className="mt-4 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition font-medium"
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

  // answers가 없으므로 카테고리 점수 기반으로 가상 answers 생성
  const dummyAnswers: Record<number, number> = {}
  const catQuestionIds: Record<string, number[]> = {
    finance: [1, 2, 3, 13, 16],
    lifestyle: [4, 5, 6, 14, 17],
    housing: [7, 8, 9, 15, 18],
    mindset: [10, 11, 12, 19, 20],
  }
  for (const cat of categories) {
    const ids = catQuestionIds[cat.key]
    const avg = Math.round(cat.score / ids.length)
    const clamped = Math.max(1, Math.min(4, avg))
    for (const id of ids) {
      dummyAnswers[id] = clamped
    }
  }

  const insights = getCrossInsights(categories)
  const deepAdvice = getDeepAdvice(total, categories, dummyAnswers)

  const weakest = [...categories].sort((a, b) => a.score - b.score)[0]

  // 점수대별 실행 3가지
  const actionItems = total >= 61
    ? [
        { text: '연금 예상 수령액 재확인하고 연기연금(연 7.2% 증액) 검토하기', sub: 'nps.or.kr에서 조회. 5년 연기 시 최대 36% 증액 가능' },
        { text: '보유 금융상품 수수료 점검하고 포트폴리오 리밸런싱하기', sub: '연 0.5% 수수료 차이가 20년간 수백만원 차이. TDF/ETF 전환 검토' },
        { text: '상속·증여 계획 검토하고 세무사 상담 예약하기', sub: '10년 단위 증여 한도(5천만~5억) 활용하면 절세 효과 큼' },
      ]
    : total >= 49
    ? [
        { text: '국민연금공단(1355)에서 내 예상 수령액 확인하기', sub: '5분이면 됩니다. nps.or.kr에서도 조회 가능' },
        { text: '연금저축 계좌 개설하고 월 50만원 자동이체 설정하기', sub: '연 99만원 세액공제. 증권사 앱에서 10분 완료' },
        { text: '퇴직연금 운용현황 확인하고 TDF로 전환 검토하기', sub: '회사 HR팀에 DB/DC 여부, 적립금 확인 요청' },
      ]
    : total >= 37
    ? [
        { text: '국민연금공단(1355)에 전화해서 내 예상 수령액 확인하기', sub: '5분이면 됩니다. nps.or.kr에서도 조회 가능' },
        { text: '이번 주 안에 연금저축 계좌 개설하기 (월 10만원부터)', sub: '소액이라도 시작이 중요. 증권사 앱에서 10분 완료' },
        { text: '월 지출 내역 1주일간 기록하고 불필요한 지출 줄이기', sub: '커피·구독·외식 등 월 20만원 절약 → 연 240만원 투자 가능' },
      ]
    : [
        { text: '국민연금공단(☎1355)에 전화해서 가입 이력 확인하기', sub: '추납(추후납부) 가능 여부도 함께 확인. 5분이면 됩니다' },
        { text: '통장 쪼개기: 생활비/저축/비상금 통장 3개 만들기', sub: '저축 통장에 월급일 자동이체 설정. 소액이라도 시작하세요' },
        { text: '불필요한 구독 서비스 3개 해지하고 그 돈 저축하기', sub: '월 3만원 절약 → 연 36만원. 연금저축으로 넣으면 절세 효과까지' },
      ]

  const iconMap: Record<string, string> = { '[F]': '💰', '[L]': '🏃', '[H]': '🏠', '[M]': '🧠' }
  const colorMap: Record<string, string> = { '[F]': '#ea580c', '[L]': '#2563eb', '[H]': '#16a34a', '[M]': '#7c3aed' }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        <ResultCard
          total={total}
          maxTotal={80}
          result={result}
          categories={categories}
        />

        {/* 교차 분석 인사이트 */}
        {insights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4">교차 분석 인사이트</h3>
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i} className="bg-orange-50 rounded-xl p-4">
                  <div className="font-semibold text-gray-900 mb-1">{ins.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{ins.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 영역별 맞춤 실천 가이드 */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">영역별 맞춤 실천 가이드</h3>
          {deepAdvice.map((adv, i) => {
            const tag = adv.title.match(/\[[A-Z]\]/)?.[0] || ''
            const icon = iconMap[tag] || '📋'
            const color = colorMap[tag] || '#ea580c'
            const title = adv.title.replace(/\[[A-Z]\]\s*/, '')
            return (
              <details key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{title}</div>
                    <div className="text-xs mt-0.5" style={{ color }}>{adv.advice.slice(0, 40)}...</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <div className="px-4 pb-4 pt-0">
                  <div className="h-px bg-gray-100 mb-3" />
                  <p className="text-sm text-gray-700 leading-relaxed">{adv.advice}</p>
                </div>
              </details>
            )
          })}
        </div>

        {/* 이번 달 바로 실행할 3가지 */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white">
          <h3 className="text-lg font-bold mb-4">이번 달 바로 실행할 3가지</h3>
          <div className="space-y-3">
            {actionItems.map((action, i) => (
              <div key={i} className="bg-white/15 backdrop-blur rounded-xl p-3">
                <div className="flex gap-2 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                  <div>
                    <div className="font-semibold text-sm">{action.text}</div>
                    <div className="text-xs opacity-80 mt-0.5">{action.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 가장 취약한 영역 안내 */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">가장 보강이 필요한 영역</div>
            <div className="text-2xl font-black text-orange-700">{weakest.label}</div>
            <div className="text-sm text-gray-500 mt-1">{weakest.score}/{weakest.max}점</div>
            <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-500"
                style={{ width: `${(weakest.score / weakest.max) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <ShareButtons
          shareUrl={shareUrl}
          total={total}
          grade={result.grade}
          resultCode={result.code}
          categories={categories}
        />

        {/* CTA */}
        <div className="text-center space-y-3">
          <Link
            href="/programs/retirement-test"
            className="inline-block w-full max-w-md px-6 py-4 bg-orange-600 text-white text-lg font-bold rounded-xl hover:bg-orange-700 transition"
          >
            나도 테스트하기
          </Link>
          <a
            href="https://cafe.naver.com/eovhskfktmak"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full max-w-md px-6 py-3 bg-white border-2 border-orange-500 text-orange-700 text-sm font-bold rounded-xl hover:bg-orange-50 transition"
          >
            노후연구소 카페 가입하기
          </a>
        </div>
      </div>
    </div>
  )
}

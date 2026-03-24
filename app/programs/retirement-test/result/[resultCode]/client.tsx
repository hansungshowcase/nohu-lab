'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getResultByCode } from '@/components/programs/retirement-test/results'
import { CategoryScore } from '@/components/programs/retirement-test/questions'
import { getCrossInsights } from '@/components/programs/retirement-test/ResultCardA4'
import ResultCard from '@/components/programs/retirement-test/ResultCard'
import ShareButtons from '@/components/programs/retirement-test/ShareButtons'
import Link from 'next/link'

// 연령대별 평균 순자산 (통계청 2025 가계금융복지조사, 만원)
const AGE_ASSET_DATA: Record<string, { avg: number; median: number; label: string }> = {
  '30': { avg: 21000, median: 12000, label: '30대' },
  '40': { avg: 48000, median: 30000, label: '40대' },
  '50': { avg: 55000, median: 35000, label: '50대' },
  '60': { avg: 54000, median: 32000, label: '60대' },
}

function getAssetPercentile(age: number, asset: number): number {
  const group = age < 40 ? '30' : age < 50 ? '40' : age < 60 ? '50' : '60'
  const data = AGE_ASSET_DATA[group]
  if (!data) return 50
  const ratio = asset / data.avg
  if (ratio >= 3) return 95
  if (ratio >= 2) return 90
  if (ratio >= 1.5) return 80
  if (ratio >= 1) return 60
  if (ratio >= 0.7) return 45
  if (ratio >= 0.5) return 30
  if (ratio >= 0.3) return 15
  return 5
}

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

  // URL에서 나이/소득/자산 읽기
  const userAge = parseInt(searchParams.get('age') || '0', 10)
  const userIncome = parseInt(searchParams.get('inc') || '0', 10)
  const userAsset = parseInt(searchParams.get('ast') || '0', 10)
  const hasAge = userAge >= 20 && userAge <= 80
  const hasAsset = userAsset > 0

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const insights = getCrossInsights(categories)

  // 카테고리 점수 기반 노후자금 직접 계산 (dummyAnswers 의존 제거)
  const fScore = categories.find(c => c.key === 'finance')!.score
  const hScore = categories.find(c => c.key === 'housing')!.score
  // 주거/자산 점수로 생활비 수준 추정 (q8 대용)
  const monthly = hScore >= 14 ? 336 : hScore >= 8 ? 298 : 217
  const monthlyMin = hScore >= 14 ? 250 : hScore >= 8 ? 217 : 139
  const fundYears = 25
  const totalNeeded = monthly * 12 * fundYears
  const totalNeededMin = monthlyMin * 12 * fundYears
  // 재정 점수로 연금 수준 추정 (q2 대용)
  const nps = fScore >= 14 ? 133 : fScore >= 8 ? 100 : 67
  const personalPension = fScore >= 14 ? 60 : fScore >= 8 ? 30 : 0
  const pensionEstimate = (nps + personalPension) * 12 * fundYears
  const fundGap = Math.max(0, totalNeeded - pensionEstimate)
  const fundGapMin = Math.max(0, totalNeededMin - pensionEstimate)
  // 저축액: 사용자 나이 기반 또는 기본 20년
  const saveYears = hasAge ? Math.max(1, 65 - userAge) : 20
  const monthlySave = fundGap > 0 ? Math.round(fundGap / saveYears / 12) : 0
  const rMonth = 0.05 / 12
  const nMonth = saveYears * 12
  const monthlySaveInvest = fundGap > 0 ? Math.round(fundGap / ((Math.pow(1 + rMonth, nMonth) - 1) / rMonth)) : 0

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        <ResultCard
          total={total}
          maxTotal={80}
          result={result}
          categories={categories}
        />

        {/* 동년배 비교 분석 */}
        {hasAge && hasAsset && (() => {
          const percentile = getAssetPercentile(userAge, userAsset)
          const group = userAge < 40 ? '30' : userAge < 50 ? '40' : userAge < 60 ? '50' : '60'
          const data = AGE_ASSET_DATA[group]
          const retireAge = 65
          const yearsLeft = Math.max(0, retireAge - userAge)
          const monthlyNeed = 298
          const retireYears = 25
          const totalNeed = monthlyNeed * 12 * retireYears
          const currentGap = Math.max(0, totalNeed - userAsset)
          const monthlySaveSimple = yearsLeft > 0 ? Math.round(currentGap / yearsLeft / 12) : 0
          const r5 = 0.05 / 12
          const n5 = yearsLeft * 12
          const monthlySaveInvest = yearsLeft > 0 && n5 > 0 ? Math.round(currentGap / ((Math.pow(1 + r5, n5) - 1) / r5)) : 0
          const pensionExpected = userIncome > 0 ? Math.round(userIncome * 0.43 * 0.6) : 67

          return (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
                <div className="text-sm opacity-80 mb-1">{data.label} 동년배 자산 순위</div>
                <div className="text-3xl sm:text-5xl font-black">{percentile >= 50 ? `상위 ${100 - percentile}%` : `하위 ${percentile}%`}</div>
                <div className="text-xs sm:text-sm opacity-80 mt-2 flex flex-wrap justify-center gap-x-1">
                  <span>내 순자산 {userAsset >= 10000 ? `${(userAsset/10000).toFixed(1)}억` : `${userAsset.toLocaleString()}만`}원</span>
                  <span>| {data.label} 평균 {(data.avg/10000).toFixed(1)}억원</span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {/* 자산 위치 바 */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>하위</span>
                    <span>내 위치</span>
                    <span>상위</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full" style={{ width: '100%' }} />
                    <div className="absolute top-0 h-full w-1 bg-blue-800 rounded" style={{ left: `${percentile}%` }} />
                  </div>
                </div>

                {/* 핵심 수치 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">은퇴까지</div>
                    <div className="text-xl font-bold text-blue-700">{yearsLeft}년</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">예상 국민연금 (월)</div>
                    <div className="text-xl font-bold text-blue-700">{pensionExpected}만원</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">추가 필요 자금</div>
                    <div className="text-xl font-bold text-orange-700">{currentGap >= 10000 ? `${(currentGap/10000).toFixed(1)}억` : `${currentGap.toLocaleString()}만`}원</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">매월 저축 필요</div>
                    <div className="text-xl font-bold text-orange-700">{monthlySaveInvest > 0 ? `${monthlySaveInvest.toLocaleString()}만원` : '-'}</div>
                    <div className="text-[11px] text-gray-400">연 5% 투자 시</div>
                  </div>
                </div>

                {/* 맞춤 코멘트 */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                  {percentile >= 70 ? (
                    <p><strong className="text-blue-700">동년배 상위권입니다.</strong> 자산 관리는 잘 되고 있으니, 연금 수령 시기 최적화와 절세 전략에 집중하세요. 연기연금(연 7.2% 증액)과 IRP 세액공제(연 148.5만원)를 적극 활용하세요.</p>
                  ) : percentile >= 40 ? (
                    <p><strong className="text-orange-700">동년배 평균 수준입니다.</strong> 지금부터 월 {monthlySaveInvest}만원씩 투자하면 은퇴 시 목표 달성이 가능합니다. 연금저축(월 50만원, 연 99만원 절세) + 매월 자동이체가 핵심입니다.</p>
                  ) : (
                    <p><strong className="text-red-600">동년배 대비 자산이 부족합니다.</strong> 즉시 행동이 필요합니다. 불필요한 지출 20% 줄이기, 연금저축 개설(월 50만원), 퇴직연금 TDF 전환. 단순 저축 시 월 {monthlySaveSimple}만원, 투자 시 월 {monthlySaveInvest}만원이면 따라잡을 수 있습니다.</p>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* 교차 분석 인사이트 */}
        {insights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
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

        {/* 나의 노후자금 계산 */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">나의 노후자금 계산</h3>
          <p className="text-xs text-gray-400 mb-4">2026년 국민연금연구원 통계 기반 (65세~90세, {fundYears}년)</p>

          <div className="grid grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">적정 월 생활비</div>
              <div className="text-xl sm:text-2xl font-bold text-orange-700">{monthly}만원</div>
              <div className="text-[11px] text-gray-400">최소 {monthlyMin}만원</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{fundYears}년간 필요 총액</div>
              <div className="text-xl sm:text-2xl font-bold text-orange-700">{(totalNeeded / 10000).toFixed(1)}억원</div>
              <div className="text-[11px] text-gray-400">최소 {(totalNeededMin / 10000).toFixed(1)}억원</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">예상 연금 수령</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-700">{(pensionEstimate / 10000).toFixed(1)}억원</div>
              <div className="text-[11px] text-gray-400">국민+개인연금 합산</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">추가 확보 필요</div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{(fundGap / 10000).toFixed(1)}억원</div>
              <div className="text-[11px] text-gray-400">최소 {(fundGapMin / 10000).toFixed(1)}억원</div>
            </div>
          </div>

          {fundGap > 0 && (
            <>
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-5 text-white text-center mb-3">
                <div className="text-sm opacity-90 mb-1">지금부터 매월 저축해야 할 금액</div>
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold">{monthlySave.toLocaleString()}만원</div>
                    <div className="text-[11px] opacity-75">{saveYears}년 단순 저축</div>
                  </div>
                  <div className="text-lg opacity-50">→</div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold">{monthlySaveInvest.toLocaleString()}만원</div>
                    <div className="text-[11px] opacity-75">연 5% 투자 시</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1 overflow-hidden">
                <div className="font-semibold text-gray-800 mb-2">절세 전략으로 부담 줄이기</div>
                <div>1. 연금저축 월 50만원 → 세액공제 <strong className="text-orange-600">연 99만원</strong></div>
                <div>2. IRP 월 25만원 추가 → 합산 <strong className="text-orange-600">연 148.5만원 절세</strong></div>
                <div>3. 퇴직연금 DC형 → TDF 전환으로 수익률 개선</div>
              </div>
            </>
          )}
        </div>

        {/* 나의 노후 준비 로드맵 */}
        {(() => {
          const age = hasAge ? userAge : 45
          const allSteps = [
            { age: Math.max(age, 30), title: '지금 즉시', items: ['연금저축 계좌 개설 (월 50만원 자동이체)', 'IRP 추가 개설 (월 25만원)', '퇴직연금 TDF로 전환 신청'], color: '#dc2626' },
            { age: Math.max(age + 5, 40), title: `${Math.max(age + 5, 40)}세`, items: ['비상자금 6개월치 확보', '보장성 보험 점검 (실손+암)', '부채 상환 계획 수립'], color: '#ea580c' },
            { age: Math.max(age + 10, 50), title: `${Math.max(age + 10, 50)}세`, items: ['은퇴 후 주거 계획 확정', '퇴직 후 소득원 준비 (부업/자격증)', '건강검진 정밀화 (매년)'], color: '#ca8a04' },
            { age: 55, title: '55세', items: ['개인연금 수령 개시', '퇴직연금 연금 전환 준비', '은퇴 3년치 생활비 별도 확보'], color: '#2563eb' },
            { age: 65, title: '65세', items: ['국민연금 수령 (또는 연기 결정)', '건강보험 피부양자 자격 관리', '자산 인출 순서 최적화'], color: '#16a34a' },
          ]
          // 중복 나이 제거: 같은 age가 있으면 첫 번째만 유지
          const seen = new Set<number>()
          const roadmap = allSteps.filter(r => r.age >= age).filter(r => {
            if (seen.has(r.age)) return false
            seen.add(r.age)
            return true
          }).sort((a, b) => a.age - b.age)

          return (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {hasAge ? '나의 노후 준비 로드맵' : '노후 준비 로드맵'}
              </h3>
              <div className="space-y-0">
                {roadmap.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: step.color }} />
                      {i < roadmap.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="font-bold text-sm" style={{ color: step.color }}>{step.title}</div>
                      <div className="mt-1 space-y-1">
                        {step.items.map((item, j) => (
                          <div key={j} className="text-xs text-gray-600 flex gap-1.5">
                            <span className="text-gray-300 shrink-0">-</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

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

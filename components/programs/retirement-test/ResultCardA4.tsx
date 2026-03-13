'use client'

import { forwardRef } from 'react'
import { ResultType } from './results'
import { CategoryScore } from './questions'

interface ResultCardA4Props {
  total: number
  maxTotal: number
  result: ResultType
  categories: CategoryScore[]
}

// ── 카테고리별 상세 진단 데이터 ──

const categoryIcons: Record<string, string> = {
  finance: '💰',
  lifestyle: '🏃',
  housing: '🏠',
  mindset: '🧠',
}

const categoryDiagnosis: Record<string, { levels: { min: number; max: number; grade: string; color: string; detail: string }[] }> = {
  finance: {
    levels: [
      { min: 10, max: 12, grade: '매우 우수', color: '#16a34a', detail: '저축·투자·연금·비상자금 모든 면에서 체계적으로 준비하고 계십니다. 현재의 재정 전략을 유지하면서 포트폴리오 리밸런싱과 세제혜택 최적화에 집중하시면 됩니다. 연금 수령 시기 전략(조기수령 vs 연기연금)도 미리 검토해두시길 권합니다.' },
      { min: 7, max: 9, grade: '양호', color: '#2563eb', detail: '기본적인 재정 기반은 갖추고 있으나, 연금 다층화 또는 비상자금 규모에서 보완이 필요합니다. 국민연금 외에 개인연금(IRP/연금저축)을 추가하고, 세액공제 한도(연 900만원)를 최대한 활용하세요. 비상자금은 최소 6개월치 생활비를 확보해야 합니다.' },
      { min: 4, max: 6, grade: '보통', color: '#ca8a04', detail: '저축 습관이 불규칙하거나 연금 준비가 부족한 상태입니다. 매월 급여일에 자동이체로 최소 소득의 20%를 저축하는 습관부터 만드세요. 아직 개인연금이 없다면, 연금저축펀드(ETF형)부터 시작하는 것을 추천합니다. 소액이라도 지금 시작하는 것이 10년 후 큰 차이를 만듭니다.' },
      { min: 0, max: 3, grade: '미흡', color: '#dc2626', detail: '재정 준비가 거의 안 된 긴급한 상태입니다. 당장 오늘부터 실행할 수 있는 것: ①통장 쪼개기(생활비/저축/비상금 분리) ②월 10만원이라도 자동이체 저축 시작 ③국민연금공단 홈페이지에서 내 예상 수령액 확인. 작은 것부터 시작하되, 반드시 오늘 시작하세요.' },
    ],
  },
  lifestyle: {
    levels: [
      { min: 10, max: 12, grade: '매우 우수', color: '#16a34a', detail: '운동·건강검진·취미활동 모두 잘 관리하고 계십니다. 현재 생활 패턴을 유지하면서, 은퇴 후에도 사회적 관계를 넓힐 수 있는 커뮤니티 활동(동호회, 봉사활동 등)을 추가로 고려해보세요. 건강한 노후의 핵심은 신체 건강 + 사회적 연결입니다.' },
      { min: 7, max: 9, grade: '양호', color: '#2563eb', detail: '건강관리의 기본은 갖추고 있으나, 일부 영역에서 보강이 필요합니다. 운동이 불규칙하다면 "주 3회 30분 걷기"처럼 낮은 진입장벽의 목표부터 설정하세요. 종합검진을 기본검진으로만 받고 있다면, 40대 이후엔 위·대장내시경, CT 등을 포함한 종합검진으로 업그레이드할 것을 권합니다.' },
      { min: 4, max: 6, grade: '보통', color: '#ca8a04', detail: '건강관리와 여가생활에 더 많은 관심이 필요합니다. 은퇴 후 하루 24시간을 건강하고 의미있게 보내려면 지금부터 준비해야 합니다. 우선 주 1회 규칙적 운동부터 시작하고, 최소 1가지 이상의 취미(등산, 독서, 악기, 요리 등)를 꾸준히 이어가세요.' },
      { min: 0, max: 3, grade: '미흡', color: '#dc2626', detail: '건강과 생활 준비가 매우 부족합니다. 은퇴 후 가장 큰 리스크는 의료비 폭증과 무료함입니다. 즉시 실행 사항: ①이번 달 안에 건강검진 예약 ②하루 20분 산책부터 시작 ③관심 있는 취미 클래스 1개 등록. 건강을 잃으면 아무리 많은 돈도 의미가 없습니다.' },
    ],
  },
  housing: {
    levels: [
      { min: 10, max: 12, grade: '매우 우수', color: '#16a34a', detail: '주거 계획, 생활비 산출, 부채 관리 모두 잘 되어 있습니다. 은퇴 전 부채를 완전 상환하는 것이 이상적이며, 주택연금이나 다운사이징 등 주거 자산 활용 전략도 사전에 검토해두면 좋습니다. 현재의 계획을 연 1회 점검하고 시장 변화에 맞춰 조정하세요.' },
      { min: 7, max: 9, grade: '양호', color: '#2563eb', detail: '기본적인 자산·주거 계획은 있으나 구체성이 부족할 수 있습니다. 은퇴 후 월 생활비를 항목별로(주거비, 식비, 의료비, 여가비, 경조사비 등) 상세하게 산출해보세요. 부채가 있다면 은퇴 시점 전 완전 상환을 목표로 상환 가속화 계획을 세우시길 권합니다.' },
      { min: 4, max: 6, grade: '보통', color: '#ca8a04', detail: '자산 관리와 주거 계획에 본격적인 관심이 필요한 시점입니다. 우선 은퇴 후 예상 월 생활비를 계산해보세요(통계청 기준 2인 가구 월 약 250만원~350만원). 부채 상환 우선순위를 정하고, 고금리 부채부터 집중 상환하는 전략을 세우세요.' },
      { min: 0, max: 3, grade: '미흡', color: '#dc2626', detail: '주거·자산 계획이 거의 없는 위험한 상태입니다. 즉시 실행 사항: ①은퇴 후 월 생활비 예상표 작성(엑셀이나 가계부 앱 활용) ②현재 부채 총액과 이자율 정리 ③주거 형태 변경 가능성 검토(다운사이징, 지방 이전 등). 계획이 없으면 자산이 있어도 노후가 불안합니다.' },
    ],
  },
  mindset: {
    levels: [
      { min: 10, max: 12, grade: '매우 우수', color: '#16a34a', detail: '노후 준비에 대한 관심도, 금융 지식, 소득원 계획 모두 높은 수준입니다. 이제 지식을 넘어 실행과 최적화에 집중하세요. 세금 최적화(절세 전략), 연금 수령 방식 최적화, 은퇴 후 소득원 다각화 등 고급 전략을 학습하고 적용하면 됩니다.' },
      { min: 7, max: 9, grade: '양호', color: '#2563eb', detail: '관심도와 기본 지식은 갖추고 있으나, 실천이나 심화 학습에서 보완이 필요합니다. 금융 지식을 ETF, 연금, 세금 절세 전략까지 넓혀보세요. 은퇴 후 소득원(프리랜서, 임대수입, 온라인 사업 등)에 대해 구체적인 계획을 세우기 시작하세요.' },
      { min: 4, max: 6, grade: '보통', color: '#ca8a04', detail: '노후에 대한 막연한 관심은 있으나 구체적인 지식과 행동이 부족합니다. 추천 학습 경로: ①유튜브/책으로 연금 기초 학습 ②금융감독원 "파인"에서 내 금융상품 조회 ③국민연금공단 "내 연금 알아보기" 활용. 월 2시간만 투자해도 1년 후 큰 차이를 만들 수 있습니다.' },
      { min: 0, max: 3, grade: '미흡', color: '#dc2626', detail: '노후 준비에 대한 인식 자체가 부족합니다. 하지만 이 테스트를 한 것이 변화의 시작입니다. 가장 먼저 해야 할 일: ①"나는 몇 살까지 일할 수 있을까?" 진지하게 생각하기 ②국민연금 예상 수령액 확인 ③주변의 은퇴한 분들에게 조언 구하기. 인식의 변화가 행동의 변화를 만듭니다.' },
    ],
  },
}

// ── 점수별 종합 리스크 등급 ──
function getRiskAssessment(total: number): { level: string; color: string; description: string } {
  if (total >= 44) return { level: '안정', color: '#16a34a', description: '노후 준비가 전반적으로 안정적인 궤도에 올라 있습니다. 현재의 계획을 유지·점검하면서 자산 보전과 이전 전략에 집중하세요.' }
  if (total >= 37) return { level: '양호', color: '#2563eb', description: '대부분의 영역에서 양호하나, 취약 영역을 보강하면 한 단계 더 도약할 수 있습니다. 가장 점수가 낮은 카테고리에 집중 투자하세요.' }
  if (total >= 30) return { level: '주의', color: '#ca8a04', description: '노후 준비가 시작 단계입니다. 지금부터 체계적으로 시작하면 충분히 안정적인 노후를 만들 수 있습니다. 3개월 단위로 목표를 설정하고 실행하세요.' }
  if (total >= 23) return { level: '경고', color: '#ea580c', description: '대부분의 영역에서 준비가 부족하여 긴급한 대응이 필요합니다. 즉시 재정 점검과 기본적인 저축·연금 가입부터 시작하세요.' }
  return { level: '위험', color: '#dc2626', description: '거의 모든 영역에서 노후 준비가 안 되어 있습니다. 하지만 지금이 가장 빠른 시작점입니다. 오늘부터 하나씩 실행에 옮기세요.' }
}

// ── 재무 시뮬레이션 ──
function getFinancialProjection(total: number): { monthlyNeeded: string; gap: string; years25: string; pensionCoverage: string; shortfall: string } {
  if (total >= 44) return { monthlyNeeded: '약 200~250만원', gap: '거의 없음', years25: '약 6억~7.5억', pensionCoverage: '70~90%', shortfall: '자산으로 충분히 보전 가능' }
  if (total >= 37) return { monthlyNeeded: '약 250~300만원', gap: '월 50~100만원', years25: '약 7.5억~9억', pensionCoverage: '50~70%', shortfall: '추가 저축·투자로 보완 필요' }
  if (total >= 30) return { monthlyNeeded: '약 250~300만원', gap: '월 100~150만원', years25: '약 7.5억~9억', pensionCoverage: '30~50%', shortfall: '적극적인 재정 계획 수립 필요' }
  if (total >= 23) return { monthlyNeeded: '약 200~250만원', gap: '월 150~200만원', years25: '약 6억~7.5억', pensionCoverage: '15~30%', shortfall: '긴급한 저축·연금 가입 필요' }
  return { monthlyNeeded: '약 200~250만원', gap: '월 180만원+', years25: '약 6억~7.5억', pensionCoverage: '10% 미만', shortfall: '즉시 재정 기반 구축 시작 필요' }
}

// ── 추천 금융상품/전략 ──
function getRecommendedStrategies(categories: CategoryScore[]): { category: string; strategies: { name: string; desc: string; priority: string }[] }[] {
  const result: { category: string; strategies: { name: string; desc: string; priority: string }[] }[] = []
  const finance = categories.find(c => c.key === 'finance')
  if (finance && finance.score <= 8) {
    result.push({
      category: '재정 보강',
      strategies: [
        { name: '연금저축펀드 (ETF형)', desc: '연 최대 600만원 세액공제, TDF(타깃데이트펀드)로 간편 운용', priority: finance.score <= 4 ? '최우선' : '높음' },
        { name: 'IRP (개인형 퇴직연금)', desc: '추가 300만원 세액공제, 퇴직금 이전 시 세금 이연 효과', priority: finance.score <= 4 ? '최우선' : '높음' },
        { name: 'ISA (개인종합자산관리계좌)', desc: '비과세 한도 내 이자·배당 비과세, 만기 후 연금전환 가능', priority: '보통' },
      ],
    })
  }
  const housing = categories.find(c => c.key === 'housing')
  if (housing && housing.score <= 8) {
    result.push({
      category: '자산·부채 관리',
      strategies: [
        { name: '부채 스노우볼/에벌랜치 전략', desc: '고금리 부채부터 집중 상환하거나, 소액 부채부터 완납하여 동기 부여', priority: housing.score <= 4 ? '최우선' : '높음' },
        { name: '주택연금 사전 검토', desc: '자가 보유 시 주택연금 가입 가능 여부와 예상 수령액 미리 확인', priority: '보통' },
        { name: '가계부/자산관리 앱 활용', desc: '뱅크샐러드, 토스 등으로 자산·지출 한 눈에 파악', priority: '높음' },
      ],
    })
  }
  const lifestyle = categories.find(c => c.key === 'lifestyle')
  if (lifestyle && lifestyle.score <= 8) {
    result.push({
      category: '건강·생활 투자',
      strategies: [
        { name: '실손의료보험 점검', desc: '4세대 실손보험 전환 검토, 보장 범위와 보험료 확인', priority: '높음' },
        { name: '건강검진 업그레이드', desc: '40대 이후: 위·대장내시경, 심장CT, 치매선별검사 추가 권장', priority: lifestyle.score <= 4 ? '최우선' : '보통' },
        { name: '사회 활동 확대', desc: '동호회, 자원봉사, 평생교육원 등 사회적 관계 유지 채널 확보', priority: '보통' },
      ],
    })
  }
  const mindset = categories.find(c => c.key === 'mindset')
  if (mindset && mindset.score <= 8) {
    result.push({
      category: '지식·마인드 강화',
      strategies: [
        { name: '금융문해력 학습', desc: '금감원 금융교육센터, 한국은행 경제교육 무료 프로그램 활용', priority: mindset.score <= 4 ? '최우선' : '높음' },
        { name: '은퇴 후 소득원 탐색', desc: '경험 기반 컨설팅, 온라인 사업, 자격증 취득 등 제2의 커리어 준비', priority: '높음' },
        { name: '재무상담 받기', desc: '은행·증권사 무료 재무상담 또는 서민금융진흥원 상담 활용', priority: '보통' },
      ],
    })
  }
  if (result.length === 0) {
    result.push({
      category: '자산 최적화',
      strategies: [
        { name: '포트폴리오 리밸런싱', desc: '연 1회 자산 배분 점검, 나이에 맞는 주식/채권 비율 조정', priority: '보통' },
        { name: '상속·증여 계획', desc: '사전증여 활용, 증여세 공제 한도(10년간 5천만원) 적극 활용', priority: '보통' },
        { name: '은퇴 후 세금 최적화', desc: '연금 수령 방식(일시금 vs 연금), 건보료 영향 등 세후 수령액 극대화', priority: '높음' },
      ],
    })
  }
  return result
}

// ── 90일 로드맵 ──
function get90DayRoadmap(total: number, categories: CategoryScore[]): { week: string; title: string; tasks: string[] }[] {
  const weakest = [...categories].sort((a, b) => a.score - b.score)[0]
  const secondWeakest = [...categories].sort((a, b) => a.score - b.score)[1]

  if (total >= 37) {
    return [
      { week: '1~2주', title: '현황 점검', tasks: ['전체 자산·부채 현황표 업데이트', '연금 예상 수령액 재확인 (국민연금+개인연금)', '보험 보장 내역 점검'] },
      { week: '3~4주', title: '최적화 실행', tasks: [`${weakest.label} 영역 집중 보강 계획 수립`, '세액공제 한도 잔여분 확인 후 추가 납입', '포트폴리오 리밸런싱 검토'] },
      { week: '5~8주', title: '심화 전략', tasks: ['은퇴 후 세금·건보료 시뮬레이션', '상속·증여 전략 검토 (필요시 세무사 상담)', '은퇴 후 소득원 구체화'] },
      { week: '9~12주', title: '마무리 점검', tasks: ['실행 결과 중간 점검', '부족한 영역 추가 보완', '다음 분기 목표 설정 및 자동화'] },
    ]
  }
  if (total >= 23) {
    return [
      { week: '1~2주', title: '기초 세팅', tasks: ['통장 쪼개기 실행 (생활비/저축/비상금)', '국민연금 예상 수령액 확인', '월 지출 내역 1주일간 기록해보기'] },
      { week: '3~4주', title: '저축 시작', tasks: ['급여일 자동이체 저축 설정 (최소 소득 10%)', '개인연금(연금저축/IRP) 가입 검토 및 신청', `${weakest.label} 개선을 위한 구체적 목표 1가지 설정`] },
      { week: '5~8주', title: '습관 정착', tasks: ['저축 습관 유지 확인 및 금액 점진적 증가', `${secondWeakest.label} 영역 보강 시작`, '금융 기초 콘텐츠 학습 시작 (주 1회)'] },
      { week: '9~12주', title: '확장 및 점검', tasks: ['3개월 저축 현황 점검', '은퇴 후 월 생활비 예상표 작성', '다음 분기 목표 설정'] },
    ]
  }
  return [
    { week: '1주', title: '인식 전환', tasks: ['은퇴까지 남은 기간과 필요 자금 계산', '국민연금공단 방문 또는 온라인으로 예상 수령액 확인', '현재 자산·부채 총액 정리 (종이 1장에)'] },
    { week: '2~3주', title: '첫 걸음', tasks: ['저축 전용 통장 개설 + 자동이체 설정 (소액이라도)', '불필요한 구독/지출 3가지 찾아서 해지', '건강검진 예약 (올해 안에)'] },
    { week: '4~6주', title: '기반 구축', tasks: ['연금저축 계좌 개설 (월 10~30만원부터 시작)', '무료 재무상담 예약 (은행 또는 서민금융진흥원)', '관심 있는 취미/운동 1가지 시작'] },
    { week: '7~12주', title: '습관 만들기', tasks: ['저축·운동 습관 유지 여부 점검', '금융 기초 학습 시작 (유튜브 or 도서 1권)', '은퇴 후 생활 계획 초안 작성'] },
  ]
}

// ── 컴포넌트 ──

const ResultCardA4 = forwardRef<HTMLDivElement, ResultCardA4Props>(
  function ResultCardA4({ total, maxTotal, result, categories }, ref) {
    const percentage = Math.round((total / maxTotal) * 100)
    const circumference = 2 * Math.PI * 54
    const risk = getRiskAssessment(total)
    const projection = getFinancialProjection(total)
    const strategies = getRecommendedStrategies(categories)
    const roadmap = get90DayRoadmap(total, categories)
    const weakest = [...categories].sort((a, b) => a.score - b.score)[0]
    const strongest = [...categories].sort((a, b) => b.score - a.score)[0]

    // Radar chart points
    const radarSize = 160
    const radarCenter = radarSize / 2
    const radarRadius = 58
    const radarAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI] // top, right, bottom, left
    const radarPoints = categories.map((cat, i) => {
      const r = (cat.score / cat.max) * radarRadius
      return {
        x: radarCenter + r * Math.cos(radarAngles[i]),
        y: radarCenter + r * Math.sin(radarAngles[i]),
      }
    })
    const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'
    const gridLevels = [0.25, 0.5, 0.75, 1]

    const s = (base: Record<string, string | number>): React.CSSProperties => base as React.CSSProperties

    return (
      <div
        ref={ref}
        style={s({
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '794px',
          backgroundColor: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", Roboto, sans-serif',
          color: '#111827',
          lineHeight: '1.5',
        })}
      >
        {/* ========== HEADER ========== */}
        <div style={s({
          background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
          color: '#ffffff',
          padding: '28px 48px 24px',
        })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
            <div>
              <div style={s({ fontSize: '11px', letterSpacing: '3px', opacity: 0.7, textTransform: 'uppercase', marginBottom: '6px' })}>
                RETIREMENT READINESS REPORT
              </div>
              <div style={s({ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' })}>
                노후 준비 종합 진단 리포트
              </div>
              <div style={s({ fontSize: '12px', opacity: 0.6, marginTop: '4px' })}>
                4개 영역 · 12개 항목 심층 분석
              </div>
            </div>
            <div style={s({ textAlign: 'right' })}>
              <div style={s({ fontSize: '20px', fontWeight: 800 })}>노후연구소</div>
              <div style={s({ fontSize: '10px', opacity: 0.6, marginTop: '2px' })}>nohu-lab.com</div>
              <div style={s({ fontSize: '10px', opacity: 0.5, marginTop: '2px' })}>
                발행일: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* ========== EXECUTIVE SUMMARY ========== */}
        <div style={s({ padding: '28px 48px 20px', backgroundColor: '#fafafa', borderBottom: '1px solid #e5e7eb' })}>
          <div style={s({ display: 'flex', gap: '28px', alignItems: 'center' })}>
            {/* Score circle */}
            <div style={s({ position: 'relative', width: '130px', height: '130px', flexShrink: 0 })}>
              <svg width="130" height="130" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="7" />
                <circle cx="60" cy="60" r="54" fill="none" stroke={result.color} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (percentage / 100) * circumference} />
              </svg>
              <div style={s({ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' })}>
                <span style={s({ fontSize: '32px', fontWeight: 800, color: '#111827' })}>{total}</span>
                <span style={s({ fontSize: '11px', color: '#9ca3af' })}>/ {maxTotal}점</span>
              </div>
            </div>

            {/* Summary info */}
            <div style={s({ flex: 1 })}>
              <div style={s({ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' })}>
                <span style={s({ fontSize: '28px' })}>{result.icon}</span>
                <span style={s({ fontSize: '20px', fontWeight: 800, color: result.color })}>{result.grade}</span>
                <span style={s({
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#fff',
                  backgroundColor: risk.color,
                  marginLeft: '4px',
                })}>리스크 {risk.level}</span>
              </div>
              <p style={s({ fontSize: '12.5px', color: '#4b5563', lineHeight: '1.65', margin: '0' })}>
                {result.description}
              </p>
              <div style={s({ display: 'flex', gap: '12px', marginTop: '10px' })}>
                <div style={s({ padding: '6px 14px', borderRadius: '8px', backgroundColor: result.bgColor, fontSize: '11px' })}>
                  <span style={s({ color: '#6b7280' })}>필요 노후자금 </span>
                  <span style={s({ fontWeight: 700, color: result.color })}>{result.estimatedFund}</span>
                </div>
                <div style={s({ padding: '6px 14px', borderRadius: '8px', backgroundColor: '#f3f4f6', fontSize: '11px' })}>
                  <span style={s({ color: '#6b7280' })}>상위 </span>
                  <span style={s({ fontWeight: 700, color: '#111827' })}>{total >= 44 ? '5%' : total >= 37 ? '20%' : total >= 30 ? '40%' : total >= 23 ? '60%' : '80%'}</span>
                </div>
              </div>
            </div>

            {/* Radar chart */}
            <div style={s({ flexShrink: 0 })}>
              <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
                {/* Grid */}
                {gridLevels.map((level) => (
                  <polygon
                    key={level}
                    points={radarAngles.map(a => `${radarCenter + radarRadius * level * Math.cos(a)},${radarCenter + radarRadius * level * Math.sin(a)}`).join(' ')}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="0.7"
                  />
                ))}
                {/* Axes */}
                {radarAngles.map((a, i) => (
                  <line key={i} x1={radarCenter} y1={radarCenter} x2={radarCenter + radarRadius * Math.cos(a)} y2={radarCenter + radarRadius * Math.sin(a)} stroke="#d1d5db" strokeWidth="0.5" />
                ))}
                {/* Data polygon */}
                <polygon points={radarPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={result.color} fillOpacity="0.15" stroke={result.color} strokeWidth="2" />
                {/* Data points */}
                {radarPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={result.color} />
                ))}
                {/* Labels */}
                {([
                  { x: radarCenter, y: 8, label: '재정', anchor: 'middle' as const },
                  { x: radarSize - 4, y: radarCenter + 4, label: '생활', anchor: 'start' as const },
                  { x: radarCenter, y: radarSize - 2, label: '주거', anchor: 'middle' as const },
                  { x: 4, y: radarCenter + 4, label: '마인드', anchor: 'end' as const },
                ]).map((l, i) => (
                  <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} fontSize="9" fill="#6b7280" fontWeight="600">{l.label}</text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* ========== 종합 리스크 평가 ========== */}
        <div style={s({ padding: '20px 48px 16px' })}>
          <div style={s({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' })}>
            <div style={s({ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: '#166534' })} />
            <h3 style={s({ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 })}>종합 리스크 평가</h3>
          </div>
          <div style={s({ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '14px 18px', border: '1px solid #e5e7eb' })}>
            <div style={s({ display: 'flex', gap: '16px', alignItems: 'flex-start' })}>
              <div style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 })}>
                <div style={s({ width: '8px', height: '8px', borderRadius: '999px', backgroundColor: risk.color, marginBottom: '4px' })} />
                <span style={s({ fontSize: '11px', fontWeight: 700, color: risk.color })}>{risk.level}</span>
              </div>
              <div>
                <p style={s({ fontSize: '11.5px', color: '#374151', lineHeight: '1.65', margin: 0 })}>{risk.description}</p>
                <div style={s({ display: 'flex', gap: '20px', marginTop: '8px' })}>
                  <span style={s({ fontSize: '10px', color: '#6b7280' })}>강점 영역: <strong style={{ color: '#16a34a' }}>{strongest.label} ({strongest.score}/{strongest.max})</strong></span>
                  <span style={s({ fontSize: '10px', color: '#6b7280' })}>보강 필요: <strong style={{ color: '#dc2626' }}>{weakest.label} ({weakest.score}/{weakest.max})</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== 카테고리별 심층 분석 ========== */}
        <div style={s({ padding: '8px 48px 16px' })}>
          <div style={s({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' })}>
            <div style={s({ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: '#166534' })} />
            <h3 style={s({ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 })}>영역별 심층 분석</h3>
          </div>
          {categories.map((cat) => {
            const diag = categoryDiagnosis[cat.key]
            const level = diag.levels.find(l => cat.score >= l.min && cat.score <= l.max) || diag.levels[diag.levels.length - 1]
            const catPct = Math.round((cat.score / cat.max) * 100)

            return (
              <div key={cat.key} style={s({ marginBottom: '14px', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' })}>
                {/* Category header */}
                <div style={s({ padding: '10px 16px', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' })}>
                  <div style={s({ display: 'flex', alignItems: 'center', gap: '8px' })}>
                    <span style={s({ fontSize: '16px' })}>{categoryIcons[cat.key]}</span>
                    <span style={s({ fontSize: '13px', fontWeight: 700, color: '#111827' })}>{cat.label}</span>
                  </div>
                  <div style={s({ display: 'flex', alignItems: 'center', gap: '10px' })}>
                    <span style={s({
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#fff',
                      backgroundColor: level.color,
                    })}>{level.grade}</span>
                    <span style={s({ fontSize: '14px', fontWeight: 800, color: level.color })}>{cat.score}<span style={s({ fontSize: '10px', color: '#9ca3af', fontWeight: 400 })}>/{cat.max}</span></span>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={s({ padding: '0 16px', marginTop: '10px' })}>
                  <div style={s({ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' })}>
                    <div style={s({ height: '100%', borderRadius: '999px', backgroundColor: level.color, width: `${catPct}%` })} />
                  </div>
                  <div style={s({ display: 'flex', justifyContent: 'space-between', marginTop: '2px' })}>
                    <span style={s({ fontSize: '8px', color: '#9ca3af' })}>0</span>
                    <span style={s({ fontSize: '8px', color: '#9ca3af' })}>3</span>
                    <span style={s({ fontSize: '8px', color: '#9ca3af' })}>6</span>
                    <span style={s({ fontSize: '8px', color: '#9ca3af' })}>9</span>
                    <span style={s({ fontSize: '8px', color: '#9ca3af' })}>12</span>
                  </div>
                </div>
                {/* Diagnosis text */}
                <div style={s({ padding: '8px 16px 12px' })}>
                  <p style={s({ fontSize: '11px', color: '#374151', lineHeight: '1.7', margin: 0 })}>{level.detail}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ========== 재무 시뮬레이션 ========== */}
        <div style={s({ padding: '8px 48px 16px' })}>
          <div style={s({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' })}>
            <div style={s({ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: '#166534' })} />
            <h3 style={s({ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 })}>은퇴 재무 시뮬레이션</h3>
            <span style={s({ fontSize: '9px', color: '#9ca3af' })}>(은퇴 후 25년, 2인가구 기준)</span>
          </div>
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' })}>
            {[
              { label: '예상 월 생활비', value: projection.monthlyNeeded, sub: '통계청 가계동향조사 기준' },
              { label: '연금 커버리지', value: projection.pensionCoverage, sub: '국민연금+개인연금 예상' },
              { label: '월 소득 갭', value: projection.gap, sub: '생활비 - 연금수령액' },
            ].map((item, i) => (
              <div key={i} style={s({ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '12px 14px', border: '1px solid #f3f4f6', textAlign: 'center' })}>
                <div style={s({ fontSize: '9px', color: '#6b7280', marginBottom: '4px' })}>{item.label}</div>
                <div style={s({ fontSize: '16px', fontWeight: 800, color: '#111827' })}>{item.value}</div>
                <div style={s({ fontSize: '8px', color: '#9ca3af', marginTop: '2px' })}>{item.sub}</div>
              </div>
            ))}
          </div>
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' })}>
            <div style={s({ backgroundColor: result.bgColor, borderRadius: '10px', padding: '12px 14px', border: `1px solid ${result.color}22`, textAlign: 'center' })}>
              <div style={s({ fontSize: '9px', color: '#6b7280', marginBottom: '4px' })}>25년간 총 필요 자금</div>
              <div style={s({ fontSize: '18px', fontWeight: 800, color: result.color })}>{projection.years25}</div>
            </div>
            <div style={s({ backgroundColor: '#fef2f2', borderRadius: '10px', padding: '12px 14px', border: '1px solid #fecaca', textAlign: 'center' })}>
              <div style={s({ fontSize: '9px', color: '#6b7280', marginBottom: '4px' })}>현재 상태 진단</div>
              <div style={s({ fontSize: '12px', fontWeight: 700, color: '#dc2626', lineHeight: '1.5' })}>{projection.shortfall}</div>
            </div>
          </div>
        </div>

        {/* ========== 맞춤 전략 추천 ========== */}
        <div style={s({ padding: '8px 48px 16px' })}>
          <div style={s({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' })}>
            <div style={s({ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: '#166534' })} />
            <h3 style={s({ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 })}>맞춤 전략 추천</h3>
          </div>
          {strategies.map((group, gi) => (
            <div key={gi} style={s({ marginBottom: '12px' })}>
              <div style={s({ fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '6px', paddingLeft: '4px' })}>{group.category}</div>
              <div style={s({ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' })}>
                {group.strategies.map((strat, si) => (
                  <div key={si} style={s({
                    padding: '10px 14px',
                    borderBottom: si < group.strategies.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  })}>
                    <span style={s({
                      display: 'inline-block',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '8px',
                      fontWeight: 700,
                      color: strat.priority === '최우선' ? '#dc2626' : strat.priority === '높음' ? '#ea580c' : '#6b7280',
                      backgroundColor: strat.priority === '최우선' ? '#fef2f2' : strat.priority === '높음' ? '#fff7ed' : '#f3f4f6',
                      flexShrink: 0,
                      marginTop: '2px',
                    })}>{strat.priority}</span>
                    <div>
                      <div style={s({ fontSize: '11.5px', fontWeight: 700, color: '#111827' })}>{strat.name}</div>
                      <div style={s({ fontSize: '10px', color: '#6b7280', marginTop: '2px', lineHeight: '1.5' })}>{strat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ========== 90일 실행 로드맵 ========== */}
        <div style={s({ padding: '8px 48px 20px' })}>
          <div style={s({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' })}>
            <div style={s({ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: '#166534' })} />
            <h3 style={s({ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 })}>90일 실행 로드맵</h3>
          </div>
          <div style={s({ position: 'relative' })}>
            {/* Timeline line */}
            <div style={s({ position: 'absolute', left: '52px', top: '0', bottom: '0', width: '2px', backgroundColor: '#e5e7eb' })} />
            {roadmap.map((phase, i) => (
              <div key={i} style={s({ display: 'flex', gap: '16px', marginBottom: '14px', position: 'relative' })}>
                <div style={s({ width: '44px', textAlign: 'right', flexShrink: 0 })}>
                  <span style={s({ fontSize: '10px', fontWeight: 700, color: '#16a34a' })}>{phase.week}</span>
                </div>
                <div style={s({ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: '#16a34a', border: '2px solid #fff', boxShadow: '0 0 0 2px #16a34a', flexShrink: 0, marginTop: '2px', zIndex: 1 })} />
                <div style={s({ flex: 1, backgroundColor: '#f9fafb', borderRadius: '8px', padding: '10px 14px', border: '1px solid #f3f4f6' })}>
                  <div style={s({ fontSize: '11.5px', fontWeight: 700, color: '#111827', marginBottom: '6px' })}>{phase.title}</div>
                  {phase.tasks.map((task, ti) => (
                    <div key={ti} style={s({ display: 'flex', gap: '6px', fontSize: '10px', color: '#4b5563', lineHeight: '1.6', marginBottom: '2px' })}>
                      <span style={s({ color: '#16a34a', flexShrink: 0 })}>□</span>
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== 종합 조언 ========== */}
        <div style={s({ padding: '0 48px 20px' })}>
          <div style={s({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' })}>
            <div style={s({ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: '#166534' })} />
            <h3 style={s({ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 })}>전문가 종합 조언</h3>
          </div>
          <div style={s({
            backgroundColor: result.bgColor,
            borderRadius: '10px',
            padding: '16px 18px',
            borderLeft: `4px solid ${result.color}`,
          })}>
            {result.advices.map((advice, i) => (
              <div key={i} style={s({ display: 'flex', gap: '8px', fontSize: '11.5px', color: '#374151', lineHeight: '1.65', marginBottom: i < result.advices.length - 1 ? '6px' : '0' })}>
                <span style={s({ color: result.color, flexShrink: 0, fontWeight: 700 })}>✓</span>
                <span>{advice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <div style={s({
          margin: '0',
          padding: '16px 48px',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
        })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
            <div>
              <div style={s({ fontSize: '12px', fontWeight: 700, color: '#374151' })}>노후연구소</div>
              <div style={s({ fontSize: '9px', color: '#9ca3af', marginTop: '2px' })}>nohu-lab.com</div>
            </div>
            <div style={s({ textAlign: 'right', maxWidth: '400px' })}>
              <div style={s({ fontSize: '8.5px', color: '#9ca3af', lineHeight: '1.5' })}>
                본 리포트는 자가진단 결과를 기반으로 한 참고 자료이며, 전문적인 재무상담을 대체하지 않습니다.
                개인의 구체적인 재정 상황에 따라 전문 재무설계사 또는 공인회계사와의 상담을 권장합니다.
                제시된 금액과 비율은 통계적 추정치이며, 실제와 차이가 있을 수 있습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default ResultCardA4

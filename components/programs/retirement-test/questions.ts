export interface Question {
  id: number
  category: 'finance' | 'lifestyle' | 'housing' | 'mindset'
  categoryLabel: string
  text: string
  options: { label: string; score: number }[]
}

export const questions: Question[] = [
  // ═══ 재정 준비도 (5문항) ═══
  {
    id: 1,
    category: 'finance',
    categoryLabel: '재정 준비도',
    text: '현재 월 소득 대비 저축/투자 비율은?',
    options: [
      { label: '거의 못하고 있다 (10% 미만)', score: 1 },
      { label: '조금씩 하고 있다 (10~20%)', score: 2 },
      { label: '꾸준히 하고 있다 (20~30%)', score: 3 },
      { label: '적극적으로 하고 있다 (30% 이상)', score: 4 },
    ],
  },
  {
    id: 2,
    category: 'finance',
    categoryLabel: '재정 준비도',
    text: '국민연금 외에 개인연금이나 퇴직연금에 가입하고 있나요?',
    options: [
      { label: '아무것도 가입하지 않았다', score: 1 },
      { label: '하나 정도 가입했지만 잘 모른다', score: 2 },
      { label: '하나 이상 가입하고 관리하고 있다', score: 3 },
      { label: '연금 포트폴리오를 체계적으로 구성했다', score: 4 },
    ],
  },
  {
    id: 3,
    category: 'finance',
    categoryLabel: '재정 준비도',
    text: '갑작스러운 지출(의료비, 수리비 등)에 대비한 비상자금이 있나요?',
    options: [
      { label: '전혀 없다', score: 1 },
      { label: '1~2개월치 생활비 정도', score: 2 },
      { label: '3~6개월치 생활비', score: 3 },
      { label: '6개월 이상의 비상자금이 있다', score: 4 },
    ],
  },
  {
    id: 13,
    category: 'finance',
    categoryLabel: '재정 준비도',
    text: '노후 의료비·간병비에 대비한 보험이 있나요?',
    options: [
      { label: '보험이 하나도 없다', score: 1 },
      { label: '실손보험 정도만 있다', score: 2 },
      { label: '실손보험 + 암/중대질병 보험이 있다', score: 3 },
      { label: '간병보험까지 체계적으로 가입했다', score: 4 },
    ],
  },
  {
    id: 16,
    category: 'finance',
    categoryLabel: '재정 준비도',
    text: '퇴직연금(DB/DC/IRP)을 어떻게 관리하고 있나요?',
    options: [
      { label: '퇴직연금이 뭔지 잘 모른다', score: 1 },
      { label: '가입은 되어 있지만 방치하고 있다', score: 2 },
      { label: '수시로 확인하고 운용 방식을 조정한다', score: 3 },
      { label: 'TDF/ETF 등으로 적극 운용하고 있다', score: 4 },
    ],
  },

  // ═══ 생활/건강 (5문항) ═══
  {
    id: 4,
    category: 'lifestyle',
    categoryLabel: '생활/건강',
    text: '규칙적인 운동을 하고 있나요?',
    options: [
      { label: '거의 하지 않는다', score: 1 },
      { label: '가끔 한다 (월 1~2회)', score: 2 },
      { label: '주 1~2회 꾸준히 한다', score: 3 },
      { label: '주 3회 이상 규칙적으로 한다', score: 4 },
    ],
  },
  {
    id: 5,
    category: 'lifestyle',
    categoryLabel: '생활/건강',
    text: '정기 건강검진을 받고 있나요?',
    options: [
      { label: '최근 3년간 받은 적 없다', score: 1 },
      { label: '국가검진만 받는다', score: 2 },
      { label: '매년 기본검진을 받는다', score: 3 },
      { label: '매년 종합검진을 받고 관리한다', score: 4 },
    ],
  },
  {
    id: 6,
    category: 'lifestyle',
    categoryLabel: '생활/건강',
    text: '은퇴 후에도 즐길 수 있는 취미나 활동이 있나요?',
    options: [
      { label: '딱히 없다', score: 1 },
      { label: '막연히 생각만 하고 있다', score: 2 },
      { label: '하나 정도 꾸준히 하고 있다', score: 3 },
      { label: '여러 취미를 즐기고 있다', score: 4 },
    ],
  },
  {
    id: 14,
    category: 'lifestyle',
    categoryLabel: '생활/건강',
    text: '은퇴 후에도 유지할 수 있는 사회적 관계가 있나요?',
    options: [
      { label: '직장 외 인간관계가 거의 없다', score: 1 },
      { label: '가족 외에는 별로 없다', score: 2 },
      { label: '동호회나 모임에 1~2개 참여 중이다', score: 3 },
      { label: '다양한 커뮤니티에서 활발히 활동 중이다', score: 4 },
    ],
  },
  {
    id: 17,
    category: 'lifestyle',
    categoryLabel: '생활/건강',
    text: '스트레스 관리나 정신건강 관리를 하고 있나요?',
    options: [
      { label: '특별히 관리하지 않는다', score: 1 },
      { label: '필요성은 느끼지만 실천은 못한다', score: 2 },
      { label: '나름의 스트레스 해소법이 있다', score: 3 },
      { label: '명상, 상담 등 체계적으로 관리한다', score: 4 },
    ],
  },

  // ═══ 주거/자산 (5문항) ═══
  {
    id: 7,
    category: 'housing',
    categoryLabel: '주거/자산',
    text: '은퇴 후 주거 계획이 있나요?',
    options: [
      { label: '생각해본 적 없다', score: 1 },
      { label: '현재 집에서 계속 살 예정이다', score: 2 },
      { label: '다운사이징 등 구체적 계획이 있다', score: 3 },
      { label: '은퇴 후 주거를 이미 확보했다', score: 4 },
    ],
  },
  {
    id: 8,
    category: 'housing',
    categoryLabel: '주거/자산',
    text: '은퇴 후 월 생활비를 얼마나 쓸지 계산해본 적 있나요?',
    options: [
      { label: '전혀 생각해본 적 없다', score: 1 },
      { label: '대략적으로만 알고 있다', score: 2 },
      { label: '꽤 구체적으로 계산해봤다', score: 3 },
      { label: '상세한 은퇴 생활비 계획이 있다', score: 4 },
    ],
  },
  {
    id: 9,
    category: 'housing',
    categoryLabel: '주거/자산',
    text: '현재 부채(대출) 상황은 어떤가요?',
    options: [
      { label: '부채가 많고 상환 계획이 없다', score: 1 },
      { label: '부채가 있지만 천천히 갚고 있다', score: 2 },
      { label: '부채를 적극적으로 줄이고 있다', score: 3 },
      { label: '부채가 거의 없거나 전혀 없다', score: 4 },
    ],
  },
  {
    id: 15,
    category: 'housing',
    categoryLabel: '주거/자산',
    text: '부동산 외 금융자산(예금, 주식, 펀드 등)의 비중은?',
    options: [
      { label: '금융자산이 거의 없다 (부동산 위주)', score: 1 },
      { label: '전체 자산의 10~20% 정도', score: 2 },
      { label: '전체 자산의 20~40%', score: 3 },
      { label: '전체 자산의 40% 이상으로 분산되어 있다', score: 4 },
    ],
  },
  {
    id: 18,
    category: 'housing',
    categoryLabel: '주거/자산',
    text: '주택연금(역모기지) 제도를 알고 있나요?',
    options: [
      { label: '들어본 적 없다', score: 1 },
      { label: '이름만 들어봤다', score: 2 },
      { label: '대략적으로 알고 있다', score: 3 },
      { label: '자세히 알고 활용 계획이 있다', score: 4 },
    ],
  },

  // ═══ 마인드/지식 (5문항) ═══
  {
    id: 10,
    category: 'mindset',
    categoryLabel: '마인드/지식',
    text: '노후 준비에 대한 관심도는?',
    options: [
      { label: '아직 먼 이야기라고 생각한다', score: 1 },
      { label: '관심은 있지만 실천은 못하고 있다', score: 2 },
      { label: '관련 콘텐츠를 자주 찾아본다', score: 3 },
      { label: '적극적으로 공부하고 실천한다', score: 4 },
    ],
  },
  {
    id: 11,
    category: 'mindset',
    categoryLabel: '마인드/지식',
    text: '금융 지식 수준은 어느 정도인가요?',
    options: [
      { label: '예금/적금 정도만 안다', score: 1 },
      { label: '펀드, 보험 기본은 안다', score: 2 },
      { label: '주식, ETF 등 다양한 투자를 이해한다', score: 3 },
      { label: '세금, 연금, 부동산까지 폭넓게 안다', score: 4 },
    ],
  },
  {
    id: 12,
    category: 'mindset',
    categoryLabel: '마인드/지식',
    text: '은퇴 후 추가 소득원 계획이 있나요?',
    options: [
      { label: '전혀 생각해본 적 없다', score: 1 },
      { label: '막연히 뭔가 해야겠다고 생각한다', score: 2 },
      { label: '구체적인 아이디어가 있다', score: 3 },
      { label: '이미 준비하거나 시작했다', score: 4 },
    ],
  },
  {
    id: 19,
    category: 'mindset',
    categoryLabel: '마인드/지식',
    text: '배우자나 가족과 은퇴 후 계획을 이야기한 적 있나요?',
    options: [
      { label: '전혀 이야기한 적 없다', score: 1 },
      { label: '가끔 가벼운 이야기는 한다', score: 2 },
      { label: '구체적으로 대화하고 계획을 공유한다', score: 3 },
      { label: '부부/가족 단위로 재무 계획을 세웠다', score: 4 },
    ],
  },
  {
    id: 20,
    category: 'mindset',
    categoryLabel: '마인드/지식',
    text: '은퇴 후 연금 수령까지의 소득 공백기(소득 크레바스)에 대비하고 있나요?',
    options: [
      { label: '소득 공백기가 뭔지 모른다', score: 1 },
      { label: '걱정은 되지만 대비하지 못하고 있다', score: 2 },
      { label: '일부 대비책이 있다 (저축, 파트타임 등)', score: 3 },
      { label: '공백기 자금을 별도로 확보해두었다', score: 4 },
    ],
  },
]

export type CategoryKey = 'finance' | 'lifestyle' | 'housing' | 'mindset'

export interface CategoryScore {
  key: CategoryKey
  label: string
  score: number
  max: number
}

export function calculateScores(answers: Record<number, number>): {
  total: number
  categories: CategoryScore[]
} {
  const catMap: Record<CategoryKey, { label: string; score: number }> = {
    finance: { label: '재정 준비도', score: 0 },
    lifestyle: { label: '생활/건강', score: 0 },
    housing: { label: '주거/자산', score: 0 },
    mindset: { label: '마인드/지식', score: 0 },
  }

  for (const q of questions) {
    const answer = answers[q.id]
    if (answer !== undefined) {
      catMap[q.category].score += answer
    }
  }

  const catMaxMap: Record<CategoryKey, number> = {
    finance: 20,
    lifestyle: 20,
    housing: 20,
    mindset: 20,
  }

  const categories: CategoryScore[] = Object.entries(catMap).map(([key, val]) => ({
    key: key as CategoryKey,
    label: val.label,
    score: val.score,
    max: catMaxMap[key as CategoryKey],
  }))

  const total = categories.reduce((sum, c) => sum + c.score, 0)

  return { total, categories }
}

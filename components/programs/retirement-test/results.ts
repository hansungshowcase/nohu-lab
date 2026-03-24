export type ResultCode = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface ResultType {
  code: ResultCode
  minScore: number
  maxScore: number
  grade: string
  icon: string
  color: string
  bgColor: string
  estimatedFund: string
  description: string
  advices: string[]
}

export const resultTypes: ResultType[] = [
  {
    code: 'S',
    minScore: 73,
    maxScore: 80,
    grade: '노후 마스터',
    icon: '🐢',
    color: '#ea580c',
    bgColor: '#fff7ed',
    estimatedFund: '이미 80%+ 확보',
    description: '당신은 이미 노후 준비의 달인! 체계적인 계획과 꾸준한 실천으로 든든한 미래를 만들어가고 있습니다.',
    advices: [
      '현재 포트폴리오의 리밸런싱을 정기적으로 점검하세요',
      '상속·증여 등 자산 이전 계획도 함께 세워보세요',
      '주변 사람들에게 노후 준비 노하우를 공유해주세요',
    ],
  },
  {
    code: 'A',
    minScore: 61,
    maxScore: 72,
    grade: '든든한 준비생',
    icon: '🐜',
    color: '#2563eb',
    bgColor: '#eff6ff',
    estimatedFund: '추가 약 1~2억 필요',
    description: '꾸준히 준비해온 당신! 대부분의 영역에서 잘 준비하고 있지만, 몇 가지 보완하면 더 완벽해집니다.',
    advices: [
      '부족한 카테고리를 집중적으로 보강하세요',
      '연금 수령 시기와 방법을 미리 계획해보세요',
      '건강관리와 취미활동도 잊지 마세요',
    ],
  },
  {
    code: 'B',
    minScore: 49,
    maxScore: 60,
    grade: '슬슬 눈뜬 사람',
    icon: '🐣',
    color: '#ca8a04',
    bgColor: '#fefce8',
    estimatedFund: '추가 약 2~3억 필요',
    description: '노후 준비에 눈을 뜨기 시작했네요! 지금부터 본격적으로 시작하면 충분히 따라잡을 수 있습니다.',
    advices: [
      '매월 자동이체로 저축 습관을 만들어보세요',
      '개인연금(IRP/연금저축) 가입을 적극 검토하세요',
      '구체적인 은퇴 생활비 계획을 세워보세요',
    ],
  },
  {
    code: 'C',
    minScore: 37,
    maxScore: 48,
    grade: '아직은 꿈나라',
    icon: '😴',
    color: '#ea580c',
    bgColor: '#fff7ed',
    estimatedFund: '추가 약 3~4억 필요',
    description: '아직 노후 준비가 많이 부족해요. 하지만 걱정하지 마세요, 지금 시작해도 늦지 않습니다!',
    advices: [
      '국민연금 예상 수령액부터 확인해보세요',
      '소액이라도 매월 저축을 시작하세요',
      '노후 관련 무료 교육 프로그램에 참여해보세요',
    ],
  },
  {
    code: 'D',
    minScore: 28,
    maxScore: 36,
    grade: '노후? 그게 뭔데?',
    icon: '🙈',
    color: '#dc2626',
    bgColor: '#fef2f2',
    estimatedFund: '추가 약 4~5억 필요',
    description: '솔직히 노후 준비를 거의 안 하고 있네요. 지금이 바로 시작할 때입니다!',
    advices: [
      '먼저 현재 재정 상태를 정확히 파악하세요',
      '불필요한 지출을 줄이고 저축부터 시작하세요',
      '금융 기초 지식을 쌓는 것부터 시작하세요',
    ],
  },
  {
    code: 'F',
    minScore: 20,
    maxScore: 27,
    grade: '올해부터 시작!',
    icon: '🔥',
    color: '#9333ea',
    bgColor: '#faf5ff',
    estimatedFund: '추가 약 5억+ 필요',
    description: '거의 모든 영역에서 준비가 안 되어 있어요. 하지만 이 테스트를 한 것 자체가 첫 걸음입니다!',
    advices: [
      '오늘 당장 통장을 하나 만들어 자동이체를 설정하세요',
      '국민연금공단에서 내 연금 예상액을 확인하세요',
      '가까운 은행의 무료 재무상담을 받아보세요',
    ],
  },
]

export function getResultByScore(score: number): ResultType {
  const result = resultTypes.find(
    (r) => score >= r.minScore && score <= r.maxScore
  )
  return result || resultTypes[resultTypes.length - 1]
}

export function getResultByCode(code: string): ResultType | undefined {
  return resultTypes.find((r) => r.code === code.toUpperCase())
}

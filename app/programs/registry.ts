import { Program } from '@/lib/types'

export const programRegistry: Program[] = [
  // ── 재무·투자 섹터 ──
  {
    id: 'retirement-test',
    name: '노후 준비 점수 테스트',
    description: '20개 질문으로 알아보는 나의 노후 준비 상태',
    minTier: 0,
    icon: '📊',
    category: '재무·투자',
    isActive: true,
    badge: '인기',
  },
  {
    id: 'pension-timing',
    name: '연금 수령 황금 타이밍',
    description: '조기·정상·연기수령 비교로 나에게 최적인 연금 개시 시점을 찾아드립니다',
    minTier: 0,
    icon: '⏰',
    category: '재무·투자',
    isActive: true,
    badge: 'NEW',
  },
  // ── 심리·건강 섹터 ──
  {
    id: 'mental-health',
    name: '심리 상태 자가진단',
    description: '우울, 불안, 스트레스 수준을 간단하게 체크해보세요',
    minTier: 0,
    icon: '🧠',
    category: '심리·건강',
    isActive: true,
    badge: 'NEW',
  },
  {
    id: 'supplement-recommend',
    name: '맞춤 영양제 추천',
    description: '나이·생활습관·건강 고민을 분석하여 맞춤 영양제를 추천합니다',
    minTier: 0,
    icon: '💊',
    category: '심리·건강',
    isActive: true,
    badge: 'NEW',
  },
  // ── 운세·풀이 섹터 ──
  {
    id: 'saju-reading',
    name: '사주풀이',
    description: '생년월일로 알아보는 나의 타고난 운명과 올해 운세',
    minTier: 0,
    icon: '🔮',
    category: '운세·풀이',
    isActive: true,
    badge: 'NEW',
  },
  // ── 유틸리티 섹터 ──
  {
    id: 'text-counter',
    name: '글자수 카운터',
    description: '텍스트의 글자수, 단어수, 바이트를 계산합니다',
    minTier: 0,
    icon: '📝',
    category: '유틸리티',
    isActive: true,
  },
  {
    id: 'image-resizer',
    name: '이미지 리사이저',
    description: '이미지 크기를 간편하게 변경합니다',
    minTier: 0,
    icon: '🖼️',
    category: '유틸리티',
    isActive: true,
  },
  {
    id: 'nickname-generator',
    name: '랜덤 닉네임 생성기',
    description: '재미있는 랜덤 닉네임을 생성합니다',
    minTier: 0,
    icon: '🎲',
    category: '유틸리티',
    isActive: true,
  },
  {
    id: 'hashtag-recommender',
    name: '해시태그 추천기',
    description: '게시글 내용에 맞는 해시태그를 추천합니다',
    minTier: 0,
    icon: '#️⃣',
    category: '유틸리티',
    isActive: true,
  },
  {
    id: 'text-converter',
    name: '텍스트 변환기',
    description: '한영타 변환, 대소문자 변환 등 텍스트를 변환합니다',
    minTier: 0,
    icon: '🔄',
    category: '유틸리티',
    isActive: true,
  },
]

export function getProgramsByTier(tier: number): Program[] {
  return programRegistry.filter(
    (p) => p.isActive && p.minTier <= tier
  )
}

export function getProgramById(id: string): Program | undefined {
  return programRegistry.find((p) => p.id === id)
}

export function getAllCategories(): string[] {
  return [...new Set(programRegistry.map((p) => p.category))]
}

import { Program } from '@/lib/types'

export const programRegistry: Program[] = [
  {
    id: 'text-counter',
    name: '글자수 카운터',
    description: '텍스트의 글자수, 단어수, 바이트를 계산합니다',
    minTier: 1,
    icon: '📝',
    category: '유틸리티',
    isActive: true,
  },
  {
    id: 'image-resizer',
    name: '이미지 리사이저',
    description: '이미지 크기를 간편하게 변경합니다',
    minTier: 1,
    icon: '🖼️',
    category: '유틸리티',
    isActive: true,
  },
  {
    id: 'nickname-generator',
    name: '랜덤 닉네임 생성기',
    description: '재미있는 랜덤 닉네임을 생성합니다',
    minTier: 1,
    icon: '🎲',
    category: '유틸리티',
    isActive: true,
  },
  {
    id: 'hashtag-recommender',
    name: '해시태그 추천기',
    description: '게시글 내용에 맞는 해시태그를 추천합니다',
    minTier: 2,
    icon: '#️⃣',
    category: '콘텐츠',
    isActive: true,
  },
  {
    id: 'text-converter',
    name: '텍스트 변환기',
    description: '한영타 변환, 대소문자 변환 등 텍스트를 변환합니다',
    minTier: 2,
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

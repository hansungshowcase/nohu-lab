export interface Member {
  id: string
  nickname: string
  phone: string
  tier: number
  created_at: string
  last_login: string
}

export interface Program {
  id: string
  name: string
  description: string
  minTier: number
  icon: string
  category: string
  isActive: boolean
}

export interface TierInfo {
  level: number
  name: string
  color: string
  description: string
}

// DB tier 범위: 1~4 (DB CHECK 제약)
// 카페 등급 표시는 cafeTier 필드로 별도 관리
// tier 1 = 일반/코어, tier 2 = 우수, tier 3 = 프리미엄/시그니처, tier 4 = 헤리티지/관리자
//
// 카페 등급별 표시 이름 매핑
export const CAFE_LEVELS = [
  { name: '일반회원', tier: 1, color: 'gray' },
  { name: '코어회원', tier: 1, color: 'green' },
  { name: '우수회원', tier: 2, color: 'yellow' },
  { name: '프리미엄회원', tier: 3, color: 'orange' },
  { name: '시그니처회원', tier: 3, color: 'red' },
  { name: '헤리티지회원', tier: 4, color: 'purple' },
]

export const TIER_MAP: Record<number, { name: string; color: string; description: string; cafeName: string }> = {
  1: { name: '코어회원', color: 'green', description: '기본 프로그램 이용 가능', cafeName: '코어회원' },
  2: { name: '우수회원', color: 'yellow', description: '우수회원 이상 이용 가능', cafeName: '우수회원' },
  3: { name: '프리미엄회원', color: 'orange', description: '프리미엄회원 이상 이용 가능', cafeName: '프리미엄회원' },
  4: { name: '헤리티지회원', color: 'purple', description: '전체 프로그램 이용 가능', cafeName: '헤리티지회원' },
}

export const TIER_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800 border-green-300',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  3: 'bg-orange-100 text-orange-800 border-orange-300',
  4: 'bg-purple-100 text-purple-800 border-purple-300',
}

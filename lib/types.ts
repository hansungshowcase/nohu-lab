export interface Member {
  id: string
  nickname: string
  phone: string
  tier: 1 | 2 | 3 | 4
  created_at: string
  last_login: string
}

export interface Program {
  id: string
  name: string
  description: string
  minTier: 1 | 2 | 3 | 4
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

export const TIER_MAP: Record<number, { name: string; color: string; description: string }> = {
  1: { name: '일반회원', color: 'green', description: '기본 프로그램 이용 가능' },
  2: { name: '우수회원', color: 'yellow', description: 'Lv2 이하 프로그램 이용 가능' },
  3: { name: 'VIP', color: 'red', description: 'Lv3 이하 프로그램 이용 가능' },
  4: { name: '관리자', color: 'black', description: '전체 프로그램 + 관리자 패널' },
}

export const TIER_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800 border-green-300',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  3: 'bg-red-100 text-red-800 border-red-300',
  4: 'bg-gray-900 text-white border-gray-700',
}

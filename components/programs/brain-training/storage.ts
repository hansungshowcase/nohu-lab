// localStorage 기반 기록/통계 관리

export interface DayRecord {
  date: string        // YYYY-MM-DD (KST)
  brainAge: number
  memoryScore: number
  mathScore: number
  reactionScore: number
  totalScore: number
}

const STORAGE_KEY = 'brain-training-history'
const DAILY_KEY = 'brain-training-daily'
const STREAK_KEY = 'brain-training-streak'

function kstToday(): string {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

function kstYesterday(): string {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000 - 86400000)
  return d.toISOString().slice(0, 10)
}

/* ── 일일 제한 ── */
export function hasPlayedToday(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(DAILY_KEY) === kstToday()
  } catch {
    return false
  }
}

export function markPlayedToday(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DAILY_KEY, kstToday())
  } catch {
    // silent fail
  }
}

/* ── 연속 플레이 (streak) ── */
export function getStreak(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return 0
    const data = JSON.parse(raw)
    // 오늘 또는 어제가 마지막이면 streak 유효
    if (data.lastDate === kstToday() || data.lastDate === kstYesterday()) {
      return data.count || 0
    }
    return 0 // streak 끊김
  } catch {
    return 0
  }
}

export function updateStreak(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    const today = kstToday()
    if (!raw) {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: today }))
      return
    }
    const data = JSON.parse(raw)
    if (data.lastDate === today) return // 이미 오늘 기록됨
    if (data.lastDate === kstYesterday()) {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count: (data.count || 0) + 1, lastDate: today }))
    } else {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: today }))
    }
  } catch {
    // silent fail
  }
}

/* ── 7일 기록 ── */
export function getHistory(): DayRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const all: DayRecord[] = JSON.parse(raw)
    // 최근 7일만 유지
    return all.slice(-7)
  } catch {
    return []
  }
}

export function saveRecord(record: Omit<DayRecord, 'date'>): void {
  if (typeof window === 'undefined') return
  try {
    const today = kstToday()
    const history = getHistory()
    // 오늘 기록이 이미 있으면 갱신
    const idx = history.findIndex((r) => r.date === today)
    const newRecord = { ...record, date: today }
    if (idx >= 0) {
      history[idx] = newRecord
    } else {
      history.push(newRecord)
    }
    // 최근 7일만 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-7)))
  } catch {
    // silent fail
  }
}

/** 이전 최고 점수 (난이도 자동 조절용) */
export function getLastScore(): number | null {
  const history = getHistory()
  if (history.length === 0) return null
  return history[history.length - 1].totalScore
}

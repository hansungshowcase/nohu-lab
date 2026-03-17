// ═══════════════════════════════════════════════
// 사주팔자 계산 엔진 (Four Pillars of Destiny)
// ═══════════════════════════════════════════════

// 천간 (10 Heavenly Stems)
export const STEMS = ['갑','을','병','정','무','기','경','신','임','계'] as const
export const STEMS_HANJA = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const

// 지지 (12 Earthly Branches)
export const BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'] as const
export const BRANCHES_HANJA = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const
export const BRANCHES_ANIMAL = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'] as const

// 오행 (Five Elements)
export const ELEMENTS = ['목','화','토','금','수'] as const
export const ELEMENTS_HANJA = ['木','火','土','金','水'] as const

// 천간→오행 매핑
export const STEM_ELEMENT: number[] = [0,0,1,1,2,2,3,3,4,4]

// 지지→오행 매핑
export const BRANCH_ELEMENT: number[] = [4,2,0,0,2,1,1,2,3,3,2,4]

// 음양 (0=음, 1=양)
export const STEM_YINYANG: number[] = [1,0,1,0,1,0,1,0,1,0]
export const BRANCH_YINYANG: number[] = [1,0,1,0,1,0,1,0,1,0,1,0]

// 오행 상생 / 상극
export function produces(a: number, b: number): boolean { return (a + 1) % 5 === b }
export function controls(a: number, b: number): boolean { return (a + 2) % 5 === b }

// 지장간 (Hidden Stems in Branches) - 여기(餘氣), 중기(中氣), 정기(正氣) 순
export const HIDDEN_STEMS: number[][] = [
  [9],       // 자: 계
  [9,7,5],   // 축: 계신기
  [4,2,0],   // 인: 무병갑
  [0,1],     // 묘: 갑을
  [1,9,4],   // 진: 을계무
  [4,6,2],   // 사: 무경병
  [2,5,3],   // 오: 병기정
  [3,1,5],   // 미: 정을기
  [4,8,6],   // 신: 무임경
  [6,7],     // 유: 경신
  [7,3,4],   // 술: 신정무
  [4,0,8],   // 해: 무갑임
]

// 지장간 가중치 (여기:중기:정기)
const HIDDEN_WEIGHTS: number[][] = [
  [1.0],           // 자
  [0.3, 0.3, 0.4], // 축
  [0.3, 0.3, 0.4], // 인
  [0.3, 0.7],      // 묘
  [0.3, 0.3, 0.4], // 진
  [0.3, 0.3, 0.4], // 사
  [0.3, 0.3, 0.4], // 오
  [0.3, 0.3, 0.4], // 미
  [0.3, 0.3, 0.4], // 신
  [0.3, 0.7],      // 유
  [0.3, 0.3, 0.4], // 술
  [0.3, 0.3, 0.4], // 해
]

// ═══════════════════════════════════════════════
// 절기(節氣) 기반 월 경계 (양력 근사값)
// ═══════════════════════════════════════════════
interface MonthBound { solarMonth: number; solarDay: number; branchIdx: number }
const MONTH_BOUNDS: MonthBound[] = [
  { solarMonth: 2,  solarDay: 4,  branchIdx: 2  }, // 인월 (입춘)
  { solarMonth: 3,  solarDay: 6,  branchIdx: 3  }, // 묘월 (경칩)
  { solarMonth: 4,  solarDay: 5,  branchIdx: 4  }, // 진월 (청명)
  { solarMonth: 5,  solarDay: 6,  branchIdx: 5  }, // 사월 (입하)
  { solarMonth: 6,  solarDay: 6,  branchIdx: 6  }, // 오월 (망종)
  { solarMonth: 7,  solarDay: 7,  branchIdx: 7  }, // 미월 (소서)
  { solarMonth: 8,  solarDay: 7,  branchIdx: 8  }, // 신월 (입추)
  { solarMonth: 9,  solarDay: 8,  branchIdx: 9  }, // 유월 (백로)
  { solarMonth: 10, solarDay: 8,  branchIdx: 10 }, // 술월 (한로)
  { solarMonth: 11, solarDay: 7,  branchIdx: 11 }, // 해월 (입동)
  { solarMonth: 12, solarDay: 7,  branchIdx: 0  }, // 자월 (대설)
  { solarMonth: 1,  solarDay: 5,  branchIdx: 1  }, // 축월 (소한)
]

// 월령(月令) - 월지의 오행이 일간에 미치는 영향 가중치
function getMonthSeasonWeight(monthBranch: number, element: number): number {
  const monthEl = BRANCH_ELEMENT[monthBranch]
  if (monthEl === element) return 1.5      // 월령을 얻음 (득령)
  if (produces(monthEl, element)) return 1.2 // 월령이 생해줌
  if (controls(monthEl, element)) return 0.7 // 월령이 극함
  return 1.0
}

// ═══════════════════════════════════════════════
// 사주 기둥(Pillar) 타입
// ═══════════════════════════════════════════════
export interface Pillar {
  stem: number
  branch: number
}

export interface SajuResult {
  yearPillar: Pillar
  monthPillar: Pillar
  dayPillar: Pillar
  hourPillar: Pillar | null
  dayMaster: number
  dayMasterElement: number
  dayMasterYinYang: number
  elementCounts: number[]
  missingElements: number[]
  strongElement: number
  isDayMasterStrong: boolean
  dayMasterScore: number     // 신강/신약 점수 (0~100)
  tenGods: string[]
  usefulGod: number
  gender: 'male' | 'female'
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number | null
  animal: string
  elementBalance: number     // 오행 균형도 (0~100)
}

// ═══════════════════════════════════════════════
// 년주 계산 (입춘 기준)
// ═══════════════════════════════════════════════
function getYearPillar(year: number, month: number, day: number): Pillar {
  let ey = year
  if (month < 2 || (month === 2 && day < 4)) ey--
  const stem = ((ey - 4) % 10 + 10) % 10
  const branch = ((ey - 4) % 12 + 12) % 12
  return { stem, branch }
}

// ═══════════════════════════════════════════════
// 월주 계산 (절기 기준)
// ═══════════════════════════════════════════════
function getMonthIndex(month: number, day: number): number {
  for (let i = 11; i >= 0; i--) {
    const b = MONTH_BOUNDS[i]
    if (month > b.solarMonth || (month === b.solarMonth && day >= b.solarDay)) {
      return i
    }
  }
  return 11
}

function getMonthPillar(yearStem: number, month: number, day: number): Pillar {
  const mi = getMonthIndex(month, day)
  const branch = MONTH_BOUNDS[mi].branchIdx
  const startStems = [2, 4, 6, 8, 0]
  const monthStemStart = startStems[yearStem % 5]
  const stem = (monthStemStart + mi) % 10
  return { stem, branch }
}

// ═══════════════════════════════════════════════
// 일주 계산 (기준일 역산법)
// ═══════════════════════════════════════════════
function getDayPillar(year: number, month: number, day: number): Pillar {
  const ref = new Date(2024, 0, 1)
  const target = new Date(year, month - 1, day)
  const diffDays = Math.round((target.getTime() - ref.getTime()) / 86400000)
  const stem = ((1 + diffDays) % 10 + 10) % 10
  const branch = ((1 + diffDays) % 12 + 12) % 12
  return { stem, branch }
}

// ═══════════════════════════════════════════════
// 시주 계산
// ═══════════════════════════════════════════════
function getHourBranch(hour: number): number {
  if (hour === 23 || hour === 0) return 0
  return Math.floor((hour + 1) / 2)
}

function getHourPillar(dayStem: number, hour: number): Pillar {
  const branch = getHourBranch(hour)
  const startStems = [0, 2, 4, 6, 8]
  const hourStemStart = startStems[dayStem % 5]
  const stem = (hourStemStart + branch) % 10
  return { stem, branch }
}

// ═══════════════════════════════════════════════
// 십신 (Ten Gods) 계산
// ═══════════════════════════════════════════════
const TEN_GOD_NAMES = [
  '비견', '겁재',
  '식신', '상관',
  '편재', '정재',
  '편관', '정관',
  '편인', '정인',
] as const

function getTenGod(dayMasterElement: number, dayMasterYY: number, targetStem: number): string {
  const targetElement = STEM_ELEMENT[targetStem]
  const targetYY = STEM_YINYANG[targetStem]
  const sameYY = dayMasterYY === targetYY ? 0 : 1

  if (targetElement === dayMasterElement) return TEN_GOD_NAMES[0 + sameYY]
  if (produces(dayMasterElement, targetElement)) return TEN_GOD_NAMES[2 + sameYY]
  if (controls(dayMasterElement, targetElement)) return TEN_GOD_NAMES[4 + sameYY]
  if (controls(targetElement, dayMasterElement)) return TEN_GOD_NAMES[6 + sameYY]
  if (produces(targetElement, dayMasterElement)) return TEN_GOD_NAMES[8 + sameYY]
  return '비견'
}

// ═══════════════════════════════════════════════
// 오행 분석 & 용신 판단 (정확도 향상)
// ═══════════════════════════════════════════════
function analyzeElements(pillars: Pillar[], dayMasterElement: number, monthBranch: number) {
  const counts = [0, 0, 0, 0, 0]

  for (const p of pillars) {
    // 천간: 1.0점
    counts[STEM_ELEMENT[p.stem]] += 1.0
    // 지지: 1.2점 (지지가 실질적 힘이 더 강함)
    counts[BRANCH_ELEMENT[p.branch]] += 1.2
    // 지장간: 가중치 적용
    const hidden = HIDDEN_STEMS[p.branch]
    const weights = HIDDEN_WEIGHTS[p.branch]
    for (let i = 0; i < hidden.length; i++) {
      counts[STEM_ELEMENT[hidden[i]]] += weights[i]
    }
  }

  // 월령 가중치 적용
  const seasonWeight = getMonthSeasonWeight(monthBranch, dayMasterElement)

  const missing = counts.map((c, i) => c < 0.5 ? i : -1).filter(i => i >= 0)
  const strongIdx = counts.indexOf(Math.max(...counts))

  // 신강/신약 판단 (월령 반영)
  const produceMe = (dayMasterElement + 4) % 5
  const myStrength = (counts[dayMasterElement] + counts[produceMe]) * seasonWeight
  const totalStrength = counts.reduce((a, b) => a + b, 0)
  const isDayMasterStrong = myStrength > totalStrength * 0.45
  const dayMasterScore = Math.round(Math.min(100, Math.max(0, (myStrength / totalStrength) * 100)))

  // 오행 균형도 계산
  const avg = totalStrength / 5
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / 5
  const elementBalance = Math.round(Math.max(0, 100 - variance * 8))

  // 용신 판단
  let usefulGod: number
  if (isDayMasterStrong) {
    const drain = (dayMasterElement + 1) % 5
    const control = (dayMasterElement + 2) % 5
    usefulGod = counts[drain] <= counts[control] ? drain : control
  } else {
    const support = (dayMasterElement + 4) % 5
    usefulGod = counts[support] <= counts[dayMasterElement] ? support : dayMasterElement
  }

  return { counts, missing, strongElement: strongIdx, isDayMasterStrong, usefulGod, dayMasterScore, elementBalance }
}

// ═══════════════════════════════════════════════
// 메인 사주 계산 함수
// ═══════════════════════════════════════════════
export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number | null,
  gender: 'male' | 'female'
): SajuResult {
  const yearPillar = getYearPillar(year, month, day)
  const monthPillar = getMonthPillar(yearPillar.stem, month, day)
  const dayPillar = getDayPillar(year, month, day)
  const hourPillar = hour !== null ? getHourPillar(dayPillar.stem, hour) : null

  const dayMaster = dayPillar.stem
  const dayMasterElement = STEM_ELEMENT[dayMaster]
  const dayMasterYinYang = STEM_YINYANG[dayMaster]

  const pillars = [yearPillar, monthPillar, dayPillar]
  if (hourPillar) pillars.push(hourPillar)

  const analysis = analyzeElements(pillars, dayMasterElement, monthPillar.branch)

  const tenGods: string[] = []
  tenGods.push(getTenGod(dayMasterElement, dayMasterYinYang, yearPillar.stem))
  tenGods.push(getTenGod(dayMasterElement, dayMasterYinYang, monthPillar.stem))
  tenGods.push('일주')
  if (hourPillar) {
    tenGods.push(getTenGod(dayMasterElement, dayMasterYinYang, hourPillar.stem))
  }

  const animalYear = ((year - 4) % 12 + 12) % 12
  const animal = BRANCHES_ANIMAL[animalYear]

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    dayMasterElement,
    dayMasterYinYang,
    elementCounts: analysis.counts,
    missingElements: analysis.missing,
    strongElement: analysis.strongElement,
    isDayMasterStrong: analysis.isDayMasterStrong,
    dayMasterScore: analysis.dayMasterScore,
    tenGods,
    usefulGod: analysis.usefulGod,
    gender,
    birthYear: year,
    birthMonth: month,
    birthDay: day,
    birthHour: hour,
    animal,
    elementBalance: analysis.elementBalance,
  }
}

// ═══════════════════════════════════════════════
// 유틸리티
// ═══════════════════════════════════════════════
export function pillarToString(p: Pillar): string {
  return `${STEMS[p.stem]}${BRANCHES[p.branch]}`
}

export function pillarToHanja(p: Pillar): string {
  return `${STEMS_HANJA[p.stem]}${BRANCHES_HANJA[p.branch]}`
}

export function getElementColor(el: number): string {
  return ['#22c55e','#ef4444','#eab308','#ffffff','#3b82f6'][el]
}

export function getElementBg(el: number): string {
  return ['bg-green-500','bg-red-500','bg-yellow-500','bg-gray-200','bg-blue-500'][el]
}

export function getElementEmoji(el: number): string {
  return ['🌳','🔥','🏔️','⚔️','💧'][el]
}

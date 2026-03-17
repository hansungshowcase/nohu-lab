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

// 천간합 (Heavenly Stem Combinations) - 합이 되면 오행이 변할 수 있음
// 갑기합토, 을경합금, 병신합수, 정임합목, 무계합화
export const STEM_COMBINATIONS: [number, number, number][] = [
  [0, 5, 2], // 갑+기 → 토
  [1, 6, 3], // 을+경 → 금
  [2, 7, 4], // 병+신 → 수
  [3, 8, 0], // 정+임 → 목
  [4, 9, 1], // 무+계 → 화
]

// 지지충 (Earthly Branch Clashes) - 정반대 에너지 충돌
export const BRANCH_CLASHES: [number, number][] = [
  [0, 6],   // 자오충
  [1, 7],   // 축미충
  [2, 8],   // 인신충
  [3, 9],   // 묘유충
  [4, 10],  // 진술충
  [5, 11],  // 사해충
]

// 지지합 (Earthly Branch Combinations) - 육합
export const BRANCH_COMBINATIONS: [number, number, number][] = [
  [0, 1, 2],   // 자축합토
  [2, 11, 0],  // 인해합목
  [3, 10, 1],  // 묘술합화
  [4, 9, 3],   // 진유합금
  [5, 8, 4],   // 사신합수
  [6, 7, 2],   // 오미합토(화)
]

// 지지형 (Earthly Branch Penalties) - 자형, 삼형
export const BRANCH_PENALTIES: [number, number][] = [
  [2, 5],   // 인사형
  [5, 8],   // 사신형
  [2, 8],   // 인신형 (삼형)
  [1, 10],  // 축술형
  [10, 7],  // 술미형
  [1, 7],   // 축미형 (삼형)
  [0, 3],   // 자묘형
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

// ═══════════════════════════════════════════════
// 신살 (Spirit Stars) 관련 인터페이스
// ═══════════════════════════════════════════════
export interface SinsalInfo {
  hasYeokma: boolean    // 역마살
  hasDohwa: boolean     // 도화살
  hasHwagae: boolean    // 화개살
  hasCheoneul: boolean  // 천을귀인
  dayEnergyStage: number // 십이운성 index (0-11)
  dayEnergyName: string  // 십이운성 이름
}

// 세운(올해) 분석 결과
export interface YearAnalysis {
  yearStem: number        // 올해 천간
  yearBranch: number      // 올해 지지
  yearTenGod: string      // 올해 천간의 십신
  hasCheonganHap: boolean // 천간합 여부 (사주 기둥과)
  hapTarget: string       // 합 대상 기둥 (년/월/일/시)
  hasJijiChung: boolean   // 지지충 여부
  chungTarget: string     // 충 대상 기둥
  hasJijiHap: boolean     // 지지합(육합) 여부
  hapBranchTarget: string // 합 대상 기둥
  tenGodCounts: Record<string, number> // 사주 내 십신 분포
  dominantTenGod: string  // 가장 많은 십신
  usefulGodElement: number // 용신 오행
  healthRisk: { organ: string; warning: string }[] // 건강 위험
}

// ═══════════════════════════════════════════════
// 기존 호환용 인터페이스 (사용하지 않지만 유지)
// ═══════════════════════════════════════════════
export interface MonthlyFortune {
  month: number
  rating: number
  keyword: string
  advice: string
  isBest: boolean
  isWorst: boolean
}

export interface MajorLuck {
  startAge: number
  endAge: number
  stem: number
  branch: number
  element: number
  rating: number
  keyword: string
  isCurrent: boolean
}

export interface PillarInteraction {
  type: 'clash' | 'combine' | 'penalty'
  description: string
  effect: string
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
  dayMasterScore: number
  tenGods: string[]
  usefulGod: number
  gender: 'male' | 'female'
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number | null
  animal: string
  elementBalance: number
  sinsal: SinsalInfo
  yearAnalysis: YearAnalysis
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
// 신살 (Spirit Stars) 계산
// ═══════════════════════════════════════════════

// 역마살: 일지 삼합 기준
function getYeokmaTarget(dayBranch: number): number {
  // 인오술(2,6,10) → 신(8)
  if (dayBranch === 2 || dayBranch === 6 || dayBranch === 10) return 8
  // 사유축(5,9,1) → 해(11)
  if (dayBranch === 5 || dayBranch === 9 || dayBranch === 1) return 11
  // 신자진(8,0,4) → 인(2)
  if (dayBranch === 8 || dayBranch === 0 || dayBranch === 4) return 2
  // 해묘미(11,3,7) → 사(5)
  return 5
}

// 도화살
function getDohwaTarget(dayBranch: number): number {
  if (dayBranch === 2 || dayBranch === 6 || dayBranch === 10) return 3  // 묘
  if (dayBranch === 5 || dayBranch === 9 || dayBranch === 1) return 6   // 오
  if (dayBranch === 8 || dayBranch === 0 || dayBranch === 4) return 9   // 유
  return 0 // 자
}

// 화개살
function getHwagaeTarget(dayBranch: number): number {
  if (dayBranch === 2 || dayBranch === 6 || dayBranch === 10) return 10 // 술
  if (dayBranch === 5 || dayBranch === 9 || dayBranch === 1) return 1   // 축
  if (dayBranch === 8 || dayBranch === 0 || dayBranch === 4) return 4   // 진
  return 7 // 미
}

// 천을귀인: 일간 기준
function getCheoneulTargets(dayStem: number): number[] {
  // 갑(0)→축미, 을(1)→자신, 병(2)→해유, 정(3)→해유,
  // 무(4)→축미, 기(5)→자신, 경(6)→인오, 신(7)→인오,
  // 임(8)→사묘, 계(9)→사묘
  const map: Record<number, number[]> = {
    0: [1, 7],   // 갑 → 축, 미
    1: [0, 8],   // 을 → 자, 신
    2: [11, 9],  // 병 → 해, 유
    3: [11, 9],  // 정 → 해, 유
    4: [1, 7],   // 무 → 축, 미
    5: [0, 8],   // 기 → 자, 신
    6: [2, 6],   // 경 → 인, 오
    7: [2, 6],   // 신 → 인, 오
    8: [5, 3],   // 임 → 사, 묘
    9: [5, 3],   // 계 → 사, 묘
  }
  return map[dayStem] || []
}

// ═══════════════════════════════════════════════
// 십이운성 계산
// ═══════════════════════════════════════════════
const TWELVE_STAGES = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'] as const

// 각 천간의 장생 시작 지지
const STAGE_START: Record<number, number> = {
  0: 11,  // 갑 → 해(11)
  1: 6,   // 을 → 오(6)
  2: 2,   // 병 → 인(2)
  3: 9,   // 정 → 유(9)
  4: 2,   // 무 → 인(2)
  5: 9,   // 기 → 유(9)
  6: 5,   // 경 → 사(5)
  7: 0,   // 신 → 자(0)
  8: 8,   // 임 → 신(8)
  9: 3,   // 계 → 묘(3)
}

function getTwelveStage(dayStem: number, branch: number): { index: number; name: string } {
  const start = STAGE_START[dayStem]
  const isYang = STEM_YINYANG[dayStem] === 1

  let offset: number
  if (isYang) {
    // 양간: 순행
    offset = ((branch - start) % 12 + 12) % 12
  } else {
    // 음간: 역행
    offset = ((start - branch) % 12 + 12) % 12
  }

  return { index: offset, name: TWELVE_STAGES[offset] }
}

// ═══════════════════════════════════════════════
// 신살 종합 계산
// ═══════════════════════════════════════════════
function calculateSinsal(pillars: Pillar[], dayStem: number, dayBranch: number): SinsalInfo {
  const allBranches = pillars.map(p => p.branch)

  // 역마살: 사주 내 어떤 지지가 역마 대상과 일치하면
  const yeokmaTarget = getYeokmaTarget(dayBranch)
  const hasYeokma = allBranches.some(b => b === yeokmaTarget)

  // 도화살
  const dohwaTarget = getDohwaTarget(dayBranch)
  const hasDohwa = allBranches.some(b => b === dohwaTarget)

  // 화개살
  const hwagaeTarget = getHwagaeTarget(dayBranch)
  const hasHwagae = allBranches.some(b => b === hwagaeTarget)

  // 천을귀인
  const cheoneulTargets = getCheoneulTargets(dayStem)
  const hasCheoneul = allBranches.some(b => cheoneulTargets.includes(b))

  // 십이운성 (일간 vs 일지)
  const stage = getTwelveStage(dayStem, dayBranch)

  return {
    hasYeokma,
    hasDohwa,
    hasHwagae,
    hasCheoneul,
    dayEnergyStage: stage.index,
    dayEnergyName: stage.name,
  }
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

  // 충이 있으면 해당 오행 약화
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      for (const [a, b] of BRANCH_CLASHES) {
        if ((pillars[i].branch === a && pillars[j].branch === b) || (pillars[i].branch === b && pillars[j].branch === a)) {
          counts[BRANCH_ELEMENT[pillars[i].branch]] = Math.max(0, counts[BRANCH_ELEMENT[pillars[i].branch]] - 0.3)
          counts[BRANCH_ELEMENT[pillars[j].branch]] = Math.max(0, counts[BRANCH_ELEMENT[pillars[j].branch]] - 0.3)
        }
      }
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
// 세운(올해) 분석 함수
// ═══════════════════════════════════════════════
function analyzeYear(
  pillars: Pillar[], dayMaster: number, dayMasterElement: number,
  dayMasterYinYang: number, tenGods: string[], usefulGod: number
): YearAnalysis {
  const currentYear = new Date().getFullYear()
  const yearStem = ((currentYear - 4) % 10 + 10) % 10
  const yearBranch = ((currentYear - 4) % 12 + 12) % 12

  // 올해 천간의 십신
  const yearTenGod = getTenGod(dayMasterElement, dayMasterYinYang, yearStem)

  // 천간합 분석: 올해 천간 vs 사주 기둥 천간
  let hasCheonganHap = false
  let hapTarget = ''
  const pillarNames = ['년주', '월주', '일주', '시주']
  for (let i = 0; i < pillars.length; i++) {
    for (const [a, b] of STEM_COMBINATIONS) {
      if ((yearStem === a && pillars[i].stem === b) || (yearStem === b && pillars[i].stem === a)) {
        hasCheonganHap = true
        hapTarget = pillarNames[i]
        break
      }
    }
    if (hasCheonganHap) break
  }

  // 지지충 분석: 올해 지지 vs 사주 기둥 지지
  let hasJijiChung = false
  let chungTarget = ''
  for (let i = 0; i < pillars.length; i++) {
    for (const [a, b] of BRANCH_CLASHES) {
      if ((yearBranch === a && pillars[i].branch === b) || (yearBranch === b && pillars[i].branch === a)) {
        hasJijiChung = true
        chungTarget = pillarNames[i]
        break
      }
    }
    if (hasJijiChung) break
  }

  // 지지합(육합) 분석
  let hasJijiHap = false
  let hapBranchTarget = ''
  for (let i = 0; i < pillars.length; i++) {
    for (const [a, b] of BRANCH_COMBINATIONS) {
      if ((yearBranch === a && pillars[i].branch === b) || (yearBranch === b && pillars[i].branch === a)) {
        hasJijiHap = true
        hapBranchTarget = pillarNames[i]
        break
      }
    }
    if (hasJijiHap) break
  }

  // 십신 분포 계산 (지장간 포함)
  const tenGodCounts: Record<string, number> = {}
  // 천간 십신
  for (const tg of tenGods) {
    if (tg === '일주') continue
    tenGodCounts[tg] = (tenGodCounts[tg] || 0) + 1
  }
  // 지장간 십신 (각 지지의 정기만)
  for (const p of pillars) {
    const hidden = HIDDEN_STEMS[p.branch]
    const mainHidden = hidden[hidden.length - 1] // 정기
    const hiddenTG = getTenGod(dayMasterElement, dayMasterYinYang, mainHidden)
    tenGodCounts[hiddenTG] = (tenGodCounts[hiddenTG] || 0) + 0.5
  }

  // 가장 많은 십신
  let dominantTenGod = '비견'
  let maxCount = 0
  for (const [k, v] of Object.entries(tenGodCounts)) {
    if (v > maxCount) { maxCount = v; dominantTenGod = k }
  }

  // 건강 위험 분석 (오행 과다/부족 기반)
  const healthRisk: { organ: string; warning: string }[] = []
  const organMap: Record<number, { name: string; excess: string; lack: string }> = {
    0: { name: '간/담', excess: '두통, 신경과민, 눈 충혈이 자주 올 수 있어요', lack: '시력 저하, 근육 약화, 손톱이 잘 부러질 수 있어요' },
    1: { name: '심장/소장', excess: '가슴 두근거림, 불면증, 혈압 상승에 주의하세요', lack: '수족 냉증, 저혈압, 우울감이 생길 수 있어요' },
    2: { name: '위장/비장', excess: '소화불량, 체중 증가, 당뇨 위험에 주의하세요', lack: '식욕 부진, 피부 트러블, 면역력 저하가 올 수 있어요' },
    3: { name: '폐/대장', excess: '피부 알레르기, 호흡기 과민 반응에 주의하세요', lack: '감기를 자주 걸리고, 비염·기관지 질환에 취약해요' },
    4: { name: '신장/방광', excess: '부종, 요통, 과도한 수분 저류에 주의하세요', lack: '허리 통증, 탈모, 생식기 관련 불편이 올 수 있어요' },
  }

  // 가장 과다한 오행과 가장 부족한 오행 건강 경고 추가
  // (analyzeElements의 counts를 여기서 직접 접근할 수 없으므로 pillars로 간이 계산)
  const simpleCounts = [0, 0, 0, 0, 0]
  for (const p of pillars) {
    simpleCounts[STEM_ELEMENT[p.stem]]++
    simpleCounts[BRANCH_ELEMENT[p.branch]]++
  }
  const maxEl = simpleCounts.indexOf(Math.max(...simpleCounts))
  const minEl = simpleCounts.indexOf(Math.min(...simpleCounts))
  if (simpleCounts[maxEl] >= 4 && organMap[maxEl]) {
    healthRisk.push({ organ: organMap[maxEl].name + ' (과다)', warning: organMap[maxEl].excess })
  }
  if (simpleCounts[minEl] === 0 && organMap[minEl]) {
    healthRisk.push({ organ: organMap[minEl].name + ' (부족)', warning: organMap[minEl].lack })
  }

  return {
    yearStem, yearBranch, yearTenGod,
    hasCheonganHap, hapTarget,
    hasJijiChung, chungTarget,
    hasJijiHap, hapBranchTarget,
    tenGodCounts, dominantTenGod,
    usefulGodElement: usefulGod,
    healthRisk,
  }
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

  // 신살 계산
  const sinsal = calculateSinsal(pillars, dayMaster, dayPillar.branch)

  // 세운 분석
  const yearAnalysis = analyzeYear(pillars, dayMaster, dayMasterElement, dayMasterYinYang, tenGods, analysis.usefulGod)

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
    sinsal,
    yearAnalysis,
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

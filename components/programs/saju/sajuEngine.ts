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
  [8,9],     // 자: 임(여기10일),계(정기20일)
  [9,7,5],   // 축: 계(여기9일),신(중기3일),기(정기18일)
  [4,2,0],   // 인: 무(여기7일),병(중기7일),갑(정기16일)
  [0,1],     // 묘: 갑(여기10일),을(정기20일)
  [1,9,4],   // 진: 을(여기9일),계(중기3일),무(정기18일)
  [4,6,2],   // 사: 무(여기7일),경(중기7일),병(정기16일)
  [2,5,3],   // 오: 병(여기10일),기(중기9일),정(정기11일)
  [3,1,5],   // 미: 정(여기9일),을(중기3일),기(정기18일)
  [4,8,6],   // 신: 무(여기7일),임(중기7일),경(정기16일)
  [6,7],     // 유: 경(여기10일),신(정기20일)
  [7,3,4],   // 술: 신(여기9일),정(중기3일),무(정기18일)
  [4,0,8],   // 해: 무(여기7일),갑(중기7일),임(정기16일)
]

// 지장간 가중치 (여기:중기:정기) - 일수 기반 비율
const HIDDEN_WEIGHTS: number[][] = [
  [0.33, 0.67],        // 자: 10일/20일
  [0.30, 0.10, 0.60],  // 축: 9일/3일/18일
  [0.23, 0.23, 0.54],  // 인: 7일/7일/16일
  [0.33, 0.67],        // 묘: 10일/20일
  [0.30, 0.10, 0.60],  // 진: 9일/3일/18일
  [0.23, 0.23, 0.54],  // 사: 7일/7일/16일
  [0.33, 0.30, 0.37],  // 오: 10일/9일/11일
  [0.30, 0.10, 0.60],  // 미: 9일/3일/18일
  [0.23, 0.23, 0.54],  // 신: 7일/7일/16일
  [0.33, 0.67],        // 유: 10일/20일
  [0.30, 0.10, 0.60],  // 술: 9일/3일/18일
  [0.23, 0.23, 0.54],  // 해: 7일/7일/16일
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

// 지지삼합 (Three Harmony) - 세 지지가 모이면 오행이 생성됨
export const BRANCH_THREE_HARMONY: [number, number, number, number][] = [
  [8, 0, 4, 4],   // 신자진 → 수(水)
  [2, 6, 10, 1],  // 인오술 → 화(火)
  [5, 9, 1, 3],   // 사유축 → 금(金)
  [11, 3, 7, 0],  // 해묘미 → 목(木)
]

// 공망 (空亡 / Void) - 일주 갑자순 기준 빈 지지 2개
// 갑자순(0~9): 술해(10,11), 갑술순(10~19): 신유(8,9), ...
export function getGongmang(dayPillar: { stem: number; branch: number }): number[] {
  // 60갑자에서 일주의 순번 계산
  const pillarIdx = (dayPillar.stem + (dayPillar.branch - dayPillar.stem + 120) % 12 * 5) // simplified
  // 더 정확한 방법: 갑자순의 시작점 찾기
  // 현재 기둥의 천간이 '갑(0)'인 경우를 역추적
  const stepsFromJia = dayPillar.stem // 갑에서 몇 번째 천간인지
  // 해당 갑 시작의 지지
  const jiaBranch = ((dayPillar.branch - stepsFromJia) % 12 + 12) % 12
  // 공망 = 해당 순에서 10~11번째 지지 (순 시작 지지 + 10, +11)
  const void1 = (jiaBranch + 10) % 12
  const void2 = (jiaBranch + 11) % 12
  return [void1, void2]
}

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
  hasMunchang: boolean  // 문창귀인
  hasYangin: boolean    // 양인살
  hasGeobsal: boolean   // 겁살
  dayEnergyStage: number // 십이운성 index (0-11)
  dayEnergyName: string  // 십이운성 이름
}

// 대운 (Major Luck Cycle) 인터페이스
export interface DaeunInfo {
  startAge: number
  stem: number
  branch: number
  element: number
  tenGod: string
  isCurrent: boolean
}

// 공망 정보
export interface GongmangInfo {
  voidBranches: number[]  // 공망에 해당하는 지지 인덱스
  affectedPillars: string[] // 공망에 걸린 기둥 이름
}

// 격국 (Chart Structure)
export interface GyeokgukInfo {
  name: string         // 격국 이름
  description: string  // 설명
  quality: 'good' | 'neutral' | 'challenging'  // 품격
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
  daeun: DaeunInfo[]
  gongmang: GongmangInfo
  gyeokguk: GyeokgukInfo
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
    3: [9, 11],  // 정 → 유, 해
    4: [1, 7],   // 무 → 축, 미
    5: [0, 8],   // 기 → 자, 신
    6: [1, 7],   // 경 → 축, 미
    7: [2, 6],   // 신 → 인, 오
    8: [3, 5],   // 임 → 묘, 사
    9: [5, 3],   // 계 → 사, 묘
  }
  return map[dayStem] || []
}

// 문창귀인: 일간 기준
function getMunchangTargets(dayStem: number): number[] {
  // 갑→사, 을→오, 병→신, 정→유, 무→신, 기→유, 경→해, 신→자, 임→인, 계→묘
  const map: Record<number, number[]> = {
    0: [5], 1: [6], 2: [8], 3: [9], 4: [8],
    5: [9], 6: [11], 7: [0], 8: [2], 9: [3],
  }
  return map[dayStem] || []
}

// 양인살: 일간 기준 (양간만 해당, 음간은 없음)
function getYanginTarget(dayStem: number): number {
  // 갑→묘(3), 병→오(6), 무→오(6), 경→유(9), 임→자(0)
  // 음간은 -1 (해당 없음)
  const map: Record<number, number> = {
    0: 3, 1: -1, 2: 6, 3: -1, 4: 6,
    5: -1, 6: 9, 7: -1, 8: 0, 9: -1,
  }
  return map[dayStem] ?? -1
}

// 겁살: 일지 삼합 기준 (역마살 바로 앞 지지)
function getGeobsalTarget(dayBranch: number): number {
  // 인오술(2,6,10) → 사(5), 사유축(5,9,1) → 인(2),
  // 신자진(8,0,4) → 해(11), 해묘미(11,3,7) → 신(8)
  if (dayBranch === 2 || dayBranch === 6 || dayBranch === 10) return 5
  if (dayBranch === 5 || dayBranch === 9 || dayBranch === 1) return 2
  if (dayBranch === 8 || dayBranch === 0 || dayBranch === 4) return 11
  return 8
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

  // 문창귀인
  const munchangTargets = getMunchangTargets(dayStem)
  const hasMunchang = allBranches.some(b => munchangTargets.includes(b))

  // 양인살
  const yanginTarget = getYanginTarget(dayStem)
  const hasYangin = yanginTarget >= 0 && allBranches.some(b => b === yanginTarget)

  // 겁살
  const geobsalTarget = getGeobsalTarget(dayBranch)
  const hasGeobsal = allBranches.some(b => b === geobsalTarget)

  // 십이운성 (일간 vs 일지)
  const stage = getTwelveStage(dayStem, dayBranch)

  return {
    hasYeokma,
    hasDohwa,
    hasHwagae,
    hasCheoneul,
    hasMunchang,
    hasYangin,
    hasGeobsal: hasGeobsal,
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
// 대운 (Major Luck Cycles) 계산
// ═══════════════════════════════════════════════
function calculateDaeun(
  yearStem: number, monthPillar: Pillar, gender: 'male' | 'female',
  dayMasterElement: number, dayMasterYinYang: number,
  birthYear: number
): DaeunInfo[] {
  // 양남음녀 = 순행, 음남양녀 = 역행
  const yearYinYang = STEM_YINYANG[yearStem]
  const isForward = (gender === 'male' && yearYinYang === 1) || (gender === 'female' && yearYinYang === 0)

  // 대운 시작 나이 (간이 계산: 보통 1~9세 사이, 여기서는 3세로 근사)
  // 정확한 계산은 생일~절기 날짜 차이가 필요하지만, 근사값 사용
  const startAge = 3

  const result: DaeunInfo[] = []
  const currentAge = new Date().getFullYear() - birthYear

  for (let i = 1; i <= 8; i++) {
    const age = startAge + (i - 1) * 10
    let stem: number, branch: number
    if (isForward) {
      stem = (monthPillar.stem + i) % 10
      branch = (monthPillar.branch + i) % 12
    } else {
      stem = ((monthPillar.stem - i) % 10 + 10) % 10
      branch = ((monthPillar.branch - i) % 12 + 12) % 12
    }
    const isCurrent = currentAge >= age && currentAge < age + 10
    const tenGod = getTenGod(dayMasterElement, dayMasterYinYang, stem)

    result.push({
      startAge: age,
      stem,
      branch,
      element: STEM_ELEMENT[stem],
      tenGod,
      isCurrent,
    })
  }

  return result
}

// ═══════════════════════════════════════════════
// 공망 (Void) 분석
// ═══════════════════════════════════════════════
function calculateGongmang(dayPillar: Pillar, pillars: Pillar[]): GongmangInfo {
  const voidBranches = getGongmang(dayPillar)
  const pillarNames = ['년주', '월주', '일주', '시주']
  const affectedPillars: string[] = []

  for (let i = 0; i < pillars.length; i++) {
    if (voidBranches.includes(pillars[i].branch)) {
      affectedPillars.push(pillarNames[i])
    }
  }

  return { voidBranches, affectedPillars }
}

// ═══════════════════════════════════════════════
// 격국 (Chart Structure) 판단
// ═══════════════════════════════════════════════
function determineGyeokguk(
  dayMaster: number, dayMasterElement: number, monthPillar: Pillar,
  isDayMasterStrong: boolean, dayMasterYinYang: number
): GyeokgukInfo {
  // 월지의 정기(正氣)로 격국 판단
  const monthHidden = HIDDEN_STEMS[monthPillar.branch]
  const mainHidden = monthHidden[monthHidden.length - 1] // 정기
  const tenGod = getTenGod(dayMasterElement, dayMasterYinYang, mainHidden)

  // 정격 (Normal Structures) - 월지 정기의 십신으로 격국 결정
  const gyeokMap: Record<string, { name: string; desc: string; quality: 'good' | 'neutral' | 'challenging' }> = {
    '비견': { name: '건록격(建祿格)', desc: '자립심이 강하고 독립적으로 성공하는 격국입니다. 남에게 기대지 않고 자기 힘으로 일어서며, 실무 능력이 뛰어나 어떤 분야에서든 인정받습니다.', quality: 'neutral' },
    '겁재': { name: '양인격(羊刃格)', desc: '강한 추진력과 결단력의 격국입니다. 리더십이 뛰어나지만 때로는 과감함이 독이 될 수 있어요. 승부욕이 강해 경쟁에서 빛을 발합니다.', quality: 'neutral' },
    '식신': { name: '식신격(食神格)', desc: '타고난 복(福)의 격국! 평생 먹고사는 걱정이 적고, 온화한 성품으로 사람들에게 사랑받습니다. 예술적 재능과 창의력이 뛰어나 콘텐츠·요리·교육 분야에서 성공합니다.', quality: 'good' },
    '상관': { name: '상관격(傷官格)', desc: '천재적 재능의 격국! 두뇌가 명석하고 표현력이 탁월합니다. 기존 질서를 깨는 혁신가 기질이 있어 예술, 기술, 법률 분야에서 두각을 나타냅니다. 자유로운 영혼이에요.', quality: 'neutral' },
    '편재': { name: '편재격(偏財格)', desc: '사업 수완이 뛰어난 격국! 돈을 굴리는 감각이 타고났으며, 대인관계가 넓어 사교계의 인기인입니다. 투자, 무역, 영업 분야에서 큰 성공을 거둘 수 있습니다.', quality: 'good' },
    '정재': { name: '정재격(正財格)', desc: '안정적으로 재물을 모으는 격국! 성실하고 계획적이며, 꾸준히 노력해 부를 쌓습니다. 재테크와 저축에 능하고, 가정적이며 책임감이 강합니다.', quality: 'good' },
    '편관': { name: '편관격(偏官格/七殺格)', desc: '카리스마 넘치는 리더의 격국! 강한 추진력으로 큰 일을 해내며, 군인·경찰·CEO 등 지도자 기질이 강합니다. 도전과 모험을 두려워하지 않는 용기의 소유자예요.', quality: 'challenging' },
    '정관': { name: '정관격(正官格)', desc: '사회적으로 가장 존경받는 격국! 품행이 바르고 리더십이 뛰어나 공직, 대기업, 전문직에서 승승장구합니다. 명예와 체면을 중시하며, 안정적인 성공을 거둡니다.', quality: 'good' },
    '편인': { name: '편인격(偏印格)', desc: '비범한 재능의 격국! 남다른 시각과 독특한 사고방식으로 특수 분야에서 전문가가 됩니다. 점술, IT, 연구, 의학 등 전문 영역에서 탁월한 성과를 냅니다.', quality: 'neutral' },
    '정인': { name: '정인격(正印格)', desc: '학문과 지혜의 격국! 교육, 연구, 학술 분야에서 크게 성공합니다. 어머니의 덕이 있고, 어른들의 도움을 받기 쉽습니다. 인자하고 품위 있는 성품이에요.', quality: 'good' },
  }

  const result = gyeokMap[tenGod] || { name: '보통격', desc: '균형 잡힌 사주입니다.', quality: 'neutral' as const }

  // 종격 판단 (일간이 극도로 약하거나 강할 때)
  // 간이 판단: dayMasterScore 기준
  return {
    name: result.name,
    description: result.desc,
    quality: result.quality,
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

  // 대운 계산
  const daeun = calculateDaeun(yearPillar.stem, monthPillar, gender, dayMasterElement, dayMasterYinYang, year)

  // 공망 분석
  const gongmang = calculateGongmang(dayPillar, pillars)

  // 격국 판단
  const gyeokguk = determineGyeokguk(dayMaster, dayMasterElement, monthPillar, analysis.isDayMasterStrong, dayMasterYinYang)

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
    daeun,
    gongmang,
    gyeokguk,
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

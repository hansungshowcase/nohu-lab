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

// 지지파 (Earthly Branch Destructions)
export const BRANCH_DESTRUCTIONS: [number, number][] = [
  [0, 9],   // 자유파
  [1, 4],   // 축진파
  [2, 11],  // 인해파
  [3, 6],   // 묘오파
  [5, 8],   // 사신파
  [10, 7],  // 술미파
]

// 지지해 (Earthly Branch Harms)
export const BRANCH_HARMS: [number, number][] = [
  [0, 7],   // 자미해
  [1, 6],   // 축오해
  [2, 5],   // 인사해
  [3, 4],   // 묘진해
  [8, 11],  // 신해해
  [9, 10],  // 유술해
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

// 합충형파해 상세
export interface HapChungDetail {
  type: 'cheongan-hap' | 'jiji-yukap' | 'samhap' | 'chung' | 'hyung' | 'pa' | 'hae'
  pillar1: string
  pillar2: string
  description: string
  effect: 'positive' | 'negative' | 'neutral'
}

// 합충형파해 종합 분석
export interface HapChungAnalysis {
  details: HapChungDetail[]
  hasClash: boolean
  hasHarmony: boolean
  overallTendency: 'harmonious' | 'conflicting' | 'mixed' | 'neutral'
}

// 종격 정보
export interface JonggukInfo {
  type: string
  name: string
  description: string
  isSpecial: boolean
  followElement: number  // 따르는 오행
}

// 투간/통근 분석
export interface TuganTonggeunInfo {
  tugan: { stemIdx: number; stemName: string; fromBranch: string; pillarName: string }[]
  tonggeun: { stemIdx: number; stemName: string; inBranch: string; pillarName: string }[]
  dayMasterRooted: boolean
  rootStrength: 'strong' | 'medium' | 'weak' | 'none'
}

// 조후용신
export interface JohuYongsinInfo {
  season: string
  temperature: string
  neededElement: number
  explanation: string
}

// 월운 (Monthly fortune)
export interface WolunInfo {
  month: number
  stem: number
  branch: number
  tenGod: string
  rating: number  // 1-5 stars
  keyword: string
}

// 확장 신살 (기존 + 추가)
export interface EnhancedSinsalInfo extends SinsalInfo {
  hasBaekho: boolean      // 백호대살
  hasHongyeom: boolean    // 홍염살
  hasCheonui: boolean     // 천의성
  hasHakdang: boolean     // 학당귀인
  hasCheonduk: boolean    // 천덕귀인
  hasWolduk: boolean      // 월덕귀인
  hasGwimungwan: boolean  // 귀문관살
  hasGyeokgak: boolean    // 격각살
  hasCheonla: boolean     // 천라
  hasJimang: boolean      // 지망
  hasWonjin: boolean      // 원진살
  hasBokseong: boolean    // 복성귀인
  hasGeumyeo: boolean     // 금여록
  hasTaeguk: boolean      // 태극귀인
  twelveAnimalSinsal: string  // 12신살 이름
}

// 심층 공망
export interface EnhancedGongmangInfo extends GongmangInfo {
  severity: 'high' | 'medium' | 'low' | 'none'
  yearVoid: boolean
  monthVoid: boolean
  hourVoid: boolean
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
  hapChung: HapChungAnalysis
  jongguk: JonggukInfo | null
  tuganTonggeun: TuganTonggeunInfo
  johu: JohuYongsinInfo
  wolun: WolunInfo[]
  enhancedSinsal: EnhancedSinsalInfo
  enhancedGongmang: EnhancedGongmangInfo
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
  // 절기 순서대로 순회하며 마지막으로 지난 절기를 찾음
  // 축월(1/5) → 인월(2/4) → ... → 자월(12/7) 순
  const chronOrder = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  let result = 10 // 기본값: 자월 (1/1~1/4는 대설 이후 소한 이전)
  for (const idx of chronOrder) {
    const b = MONTH_BOUNDS[idx]
    if (month > b.solarMonth || (month === b.solarMonth && day >= b.solarDay)) {
      result = idx
    }
  }
  return result
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
  // 기준일: 2024-01-01 = 병진일(丙辰) → stem=2(병), branch=4(진)
  const ref = new Date(2024, 0, 1)
  const target = new Date(year, month - 1, day)
  const diffDays = Math.round((target.getTime() - ref.getTime()) / 86400000)
  const stem = (((diffDays + 2) % 10) + 10) % 10
  const branch = (((diffDays + 4) % 12) + 12) % 12
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

  // ── 신강/신약 판단: 득령·득지·득세 3요소 ──
  const produceMe = (dayMasterElement + 4) % 5  // 인성 오행

  // 득령(得令): 월지 오행이 일간과 같거나(비겁) 일간을 생하면(인성)
  const monthEl = BRANCH_ELEMENT[monthBranch]
  const deukryeong = (monthEl === dayMasterElement) || produces(monthEl, dayMasterElement)

  // 득지(得地): 일지 지장간에 비겁/인성 오행이 있으면 (특히 정기)
  const dayBranchIdx = pillars.length >= 3 ? pillars[2].branch : monthBranch
  const dayBranchHidden = HIDDEN_STEMS[dayBranchIdx]
  const deukji = dayBranchHidden.some(h => {
    const el = STEM_ELEMENT[h]
    return el === dayMasterElement || produces(el, dayMasterElement)
  })

  // 득세(得勢): 천간+지지 중 비겁/인성이 과반수
  let helpCount = 0
  let totalItems = 0
  for (const p of pillars) {
    const sEl = STEM_ELEMENT[p.stem]
    if (sEl === dayMasterElement || sEl === produceMe) helpCount++
    totalItems++
    const bEl = BRANCH_ELEMENT[p.branch]
    if (bEl === dayMasterElement || bEl === produceMe) helpCount++
    totalItems++
  }
  const deukse = helpCount >= Math.ceil(totalItems / 2)

  // 3요소 중 2개 이상이면 신강
  const strengthFactors = [deukryeong, deukji, deukse].filter(Boolean).length
  const isDayMasterStrong = strengthFactors >= 2

  // 점수 계산 (종격 판별 등에 사용)
  const myStrength = (counts[dayMasterElement] + counts[produceMe]) * seasonWeight
  const totalStrength = counts.reduce((a, b) => a + b, 0)
  const rawScore = (myStrength / totalStrength) * 100
  // 득령/득지/득세 반영 보정
  const factorBonus = strengthFactors * 5 - 7.5
  const dayMasterScore = Math.round(Math.min(100, Math.max(0, rawScore + factorBonus)))

  // 오행 균형도 계산
  const avg = totalStrength / 5
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / 5
  const elementBalance = Math.round(Math.max(0, 100 - variance * 8))

  // ── 용신 판단: 억부 + 조후 + 통관 통합 ──

  // 1) 억부용신 (기본)
  let eokbuGod: number
  if (isDayMasterStrong) {
    const drain = (dayMasterElement + 1) % 5    // 식상 (설기)
    const control = (dayMasterElement + 2) % 5   // 재성 (극)
    eokbuGod = counts[drain] <= counts[control] ? drain : control
  } else {
    const support = (dayMasterElement + 4) % 5   // 인성 (생)
    eokbuGod = counts[support] <= counts[dayMasterElement] ? support : dayMasterElement
  }

  // 2) 조후용신 (계절 극단)
  let johuGod: number | null = null
  // 여름(사오미): 수가 필요
  if (monthBranch === 5 || monthBranch === 6 || monthBranch === 7) {
    johuGod = dayMasterElement === 4 ? 3 : 4  // 수일간이면 금, 아니면 수
  }
  // 겨울(해자축): 화가 필요
  else if (monthBranch === 11 || monthBranch === 0 || monthBranch === 1) {
    johuGod = dayMasterElement === 1 ? 0 : 1  // 화일간이면 목, 아니면 화
  }

  // 3) 통관용신: 가장 강한 두 오행이 상극이면 중재 오행
  let tongguanGod: number | null = null
  const sortedEls = counts.map((c, i) => ({ el: i, count: c })).sort((a, b) => b.count - a.count)
  if (sortedEls.length >= 2) {
    const top1 = sortedEls[0].el
    const top2 = sortedEls[1].el
    if (controls(top1, top2) || controls(top2, top1)) {
      const controller = controls(top1, top2) ? top1 : top2
      tongguanGod = (controller + 1) % 5  // 통관 = 극하는 쪽이 생하는 오행
    }
  }

  // 통합: 극단 계절(여름/겨울)이면 조후 우선, 아니면 억부 + 통관 고려
  let usefulGod: number
  const isExtremeSeason = monthBranch === 5 || monthBranch === 6 || monthBranch === 7 ||
                          monthBranch === 11 || monthBranch === 0 || monthBranch === 1
  if (isExtremeSeason && johuGod !== null) {
    // 조후와 억부가 같으면 최선, 다르면 조후 우선
    usefulGod = johuGod
  } else if (tongguanGod !== null && sortedEls[0].count > totalStrength * 0.35 && sortedEls[1].count > totalStrength * 0.25) {
    // 두 오행이 모두 강하게 충돌할 때만 통관 적용
    usefulGod = tongguanGod
  } else {
    usefulGod = eokbuGod
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
  birthYear: number, birthMonth: number, birthDay: number
): DaeunInfo[] {
  // 양남음녀 = 순행, 음남양녀 = 역행
  const yearYinYang = STEM_YINYANG[yearStem]
  const isForward = (gender === 'male' && yearYinYang === 1) || (gender === 'female' && yearYinYang === 0)

  // 대운 시작 나이 = 생일~다음(또는 이전) 절기까지 일수 ÷ 3 (반올림)
  // 순행이면 다음 절기, 역행이면 이전 절기까지의 거리
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
  let startAge = 3 // fallback

  // MONTH_BOUNDS를 양력 순서로 정렬하여 가장 가까운 절기 찾기
  const sortedBounds = [...MONTH_BOUNDS].sort((a, b) => a.solarMonth - b.solarMonth || a.solarDay - b.solarDay)

  if (isForward) {
    // 순행: 생일 이후 가장 가까운 다음 절기까지 일수
    let nextBoundDate: Date | null = null
    for (const b of sortedBounds) {
      const d = new Date(birthYear, b.solarMonth - 1, b.solarDay)
      if (d > birthDate) { nextBoundDate = d; break }
    }
    if (!nextBoundDate) {
      // 올해 남은 절기 없으면 다음해 첫 절기
      nextBoundDate = new Date(birthYear + 1, sortedBounds[0].solarMonth - 1, sortedBounds[0].solarDay)
    }
    const diffDays = Math.round((nextBoundDate.getTime() - birthDate.getTime()) / 86400000)
    startAge = Math.max(1, Math.round(diffDays / 3))
  } else {
    // 역행: 생일 이전 가장 가까운 절기까지 일수
    let prevBoundDate: Date | null = null
    for (let i = sortedBounds.length - 1; i >= 0; i--) {
      const b = sortedBounds[i]
      const d = new Date(birthYear, b.solarMonth - 1, b.solarDay)
      if (d < birthDate) { prevBoundDate = d; break }
    }
    if (!prevBoundDate) {
      // 올해 이전 절기 없으면 작년 마지막 절기
      const last = sortedBounds[sortedBounds.length - 1]
      prevBoundDate = new Date(birthYear - 1, last.solarMonth - 1, last.solarDay)
    }
    const diffDays = Math.round((birthDate.getTime() - prevBoundDate.getTime()) / 86400000)
    startAge = Math.max(1, Math.round(diffDays / 3))
  }

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

  // 현재 대운이 범위 밖인 경우 (너무 어리거나 고령)
  const hasCurrent = result.some(d => d.isCurrent)
  if (!hasCurrent && result.length > 0) {
    const firstAge = result[0].startAge
    const lastAge = result[result.length - 1].startAge
    if (currentAge < firstAge) {
      // 아직 첫 대운 전: 첫 번째를 현재로
      result[0].isCurrent = true
    } else if (currentAge >= lastAge + 10) {
      // 마지막 대운 지남: 마지막을 현재로
      result[result.length - 1].isCurrent = true
    }
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
  isDayMasterStrong: boolean, dayMasterYinYang: number,
  allPillars?: Pillar[]
): GyeokgukInfo {
  // ── 격국 판단: 투간 우선순위 (정기→중기→여기→월지정기) ──
  const monthHidden = HIDDEN_STEMS[monthPillar.branch]
  // 지장간 순서: [여기, (중기), 정기] - 마지막이 정기(본기)
  // 투간 확인: 월지 지장간이 사주의 천간에 나타나는지 (일간 제외)
  const allStems: number[] = allPillars
    ? allPillars.filter((_, i) => i !== 2).map(p => p.stem)  // 일간(index 2) 제외
    : []

  let tenGod: string = ''
  if (allStems.length > 0) {
    // 정기(본기) 투간 → 중기 투간 → 여기 투간 순으로 확인
    const checkOrder = [...monthHidden].reverse()  // 정기→중기→여기 순
    for (const hiddenStem of checkOrder) {
      if (allStems.includes(hiddenStem) && STEM_ELEMENT[hiddenStem] !== dayMasterElement) {
        // 비겁은 격국으로 쓰지 않음 (건록/양인격 제외)
        tenGod = getTenGod(dayMasterElement, dayMasterYinYang, hiddenStem)
        if (tenGod !== '비견' && tenGod !== '겁재') break
        tenGod = ''  // 비겁이면 다음 지장간 확인
      }
    }
  }

  // 투간이 없으면 월지 정기의 십신으로 격국 결정 (기존 방식)
  if (!tenGod) {
    const mainHidden = monthHidden[monthHidden.length - 1]
    tenGod = getTenGod(dayMasterElement, dayMasterYinYang, mainHidden)
  }

  // 정격 (Normal Structures) - 십신으로 격국 결정
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
// 합충형파해 종합 분석
// ═══════════════════════════════════════════════
function analyzeHapChung(pillars: Pillar[]): HapChungAnalysis {
  const details: HapChungDetail[] = []
  const pillarNames = ['년주', '월주', '일주', '시주']

  // 모든 기둥 쌍 비교
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const pi = pillars[i]
      const pj = pillars[j]

      // 천간합 체크
      for (const [a, b, resultEl] of STEM_COMBINATIONS) {
        if ((pi.stem === a && pj.stem === b) || (pi.stem === b && pj.stem === a)) {
          details.push({
            type: 'cheongan-hap',
            pillar1: pillarNames[i],
            pillar2: pillarNames[j],
            description: `${STEMS[pi.stem]}${STEMS[pj.stem]} 천간합 → ${ELEMENTS[resultEl]}`,
            effect: 'positive',
          })
        }
      }

      // 지지육합 체크
      for (const [a, b, resultEl] of BRANCH_COMBINATIONS) {
        if ((pi.branch === a && pj.branch === b) || (pi.branch === b && pj.branch === a)) {
          details.push({
            type: 'jiji-yukap',
            pillar1: pillarNames[i],
            pillar2: pillarNames[j],
            description: `${BRANCHES[pi.branch]}${BRANCHES[pj.branch]} 육합 → ${ELEMENTS[resultEl]}`,
            effect: 'positive',
          })
        }
      }

      // 지지충 체크
      for (const [a, b] of BRANCH_CLASHES) {
        if ((pi.branch === a && pj.branch === b) || (pi.branch === b && pj.branch === a)) {
          details.push({
            type: 'chung',
            pillar1: pillarNames[i],
            pillar2: pillarNames[j],
            description: `${BRANCHES[pi.branch]}${BRANCHES[pj.branch]} 충 - 강한 충돌과 변동`,
            effect: 'negative',
          })
        }
      }

      // 지지형 체크
      for (const [a, b] of BRANCH_PENALTIES) {
        if ((pi.branch === a && pj.branch === b) || (pi.branch === b && pj.branch === a)) {
          details.push({
            type: 'hyung',
            pillar1: pillarNames[i],
            pillar2: pillarNames[j],
            description: `${BRANCHES[pi.branch]}${BRANCHES[pj.branch]} 형 - 갈등과 시련`,
            effect: 'negative',
          })
        }
      }

      // 지지파 체크
      for (const [a, b] of BRANCH_DESTRUCTIONS) {
        if ((pi.branch === a && pj.branch === b) || (pi.branch === b && pj.branch === a)) {
          details.push({
            type: 'pa',
            pillar1: pillarNames[i],
            pillar2: pillarNames[j],
            description: `${BRANCHES[pi.branch]}${BRANCHES[pj.branch]} 파 - 깨짐과 손실`,
            effect: 'negative',
          })
        }
      }

      // 지지해 체크
      for (const [a, b] of BRANCH_HARMS) {
        if ((pi.branch === a && pj.branch === b) || (pi.branch === b && pj.branch === a)) {
          details.push({
            type: 'hae',
            pillar1: pillarNames[i],
            pillar2: pillarNames[j],
            description: `${BRANCHES[pi.branch]}${BRANCHES[pj.branch]} 해 - 방해와 손해`,
            effect: 'negative',
          })
        }
      }
    }
  }

  // 지지삼합 체크 (3개 기둥의 지지가 삼합을 이루는지)
  const allBranches = pillars.map(p => p.branch)
  for (const [b1, b2, b3, resultEl] of BRANCH_THREE_HARMONY) {
    const has1 = allBranches.includes(b1)
    const has2 = allBranches.includes(b2)
    const has3 = allBranches.includes(b3)
    if (has1 && has2 && has3) {
      details.push({
        type: 'samhap',
        pillar1: `${BRANCHES[b1]}${BRANCHES[b2]}`,
        pillar2: BRANCHES[b3],
        description: `${BRANCHES[b1]}${BRANCHES[b2]}${BRANCHES[b3]} 삼합 → ${ELEMENTS[resultEl]} 국`,
        effect: 'positive',
      })
    }
  }

  const hasClash = details.some(d => d.type === 'chung' || d.type === 'hyung' || d.type === 'pa' || d.type === 'hae')
  const hasHarmony = details.some(d => d.type === 'cheongan-hap' || d.type === 'jiji-yukap' || d.type === 'samhap')

  let overallTendency: 'harmonious' | 'conflicting' | 'mixed' | 'neutral' = 'neutral'
  if (hasHarmony && hasClash) overallTendency = 'mixed'
  else if (hasHarmony) overallTendency = 'harmonious'
  else if (hasClash) overallTendency = 'conflicting'

  return { details, hasClash, hasHarmony, overallTendency }
}

// ═══════════════════════════════════════════════
// 종격 판별
// ═══════════════════════════════════════════════
function detectJongguk(
  dayMasterElement: number, dayMasterScore: number,
  elementCounts: number[], isDayMasterStrong: boolean,
  pillars: Pillar[]
): JonggukInfo | null {
  const totalStrength = elementCounts.reduce((a, b) => a + b, 0)

  // 종강격: 일간이 극도로 강함 (비겁+인성이 압도적)
  if (dayMasterScore > 85) {
    const produceMe = (dayMasterElement + 4) % 5  // 인성 오행
    const myGroupStr = elementCounts[dayMasterElement] + elementCounts[produceMe]
    if (myGroupStr / totalStrength > 0.8) {
      return {
        type: 'jongganggyeok',
        name: '종강격(從強格)',
        description: '일간이 극도로 강하여 비겁과 인성을 따르는 특수 격국입니다. 자기 주관이 뚜렷하고 리더십이 강합니다.',
        isSpecial: true,
        followElement: dayMasterElement,
      }
    }
  }

  // 종격 조건: 일간이 극도로 약함
  if (dayMasterScore < 15) {
    const drain = (dayMasterElement + 1) % 5      // 식상 (내가 생하는)
    const wealth = (dayMasterElement + 2) % 5      // 재성 (내가 극하는)
    const officer = (dayMasterElement + 3) % 5     // 관성 (나를 극하는)

    // 종재격: 재성이 압도적
    if (elementCounts[wealth] / totalStrength > 0.35) {
      return {
        type: 'jongjae',
        name: '종재격(從財格)',
        description: '재성의 기운이 압도적이어서 재물을 따르는 격국입니다. 사업과 투자에 탁월한 감각을 보입니다.',
        isSpecial: true,
        followElement: wealth,
      }
    }

    // 종관격: 관성이 압도적
    if (elementCounts[officer] / totalStrength > 0.35) {
      return {
        type: 'jonggwan',
        name: '종관격(從官格)',
        description: '관성의 기운이 압도적이어서 권력과 명예를 따르는 격국입니다. 공직이나 대기업에서 크게 성공합니다.',
        isSpecial: true,
        followElement: officer,
      }
    }

    // 종아격: 식상이 압도적
    if (elementCounts[drain] / totalStrength > 0.35) {
      return {
        type: 'jonga',
        name: '종아격(從兒格)',
        description: '식상의 기운이 압도적이어서 표현과 창작을 따르는 격국입니다. 예술, 교육, 기술 분야에서 빛납니다.',
        isSpecial: true,
        followElement: drain,
      }
    }
  }

  return null
}

// ═══════════════════════════════════════════════
// 투간/통근 분석
// ═══════════════════════════════════════════════
function analyzeTuganTonggeun(pillars: Pillar[]): TuganTonggeunInfo {
  const pillarNames = ['년주', '월주', '일주', '시주']
  const tugan: TuganTonggeunInfo['tugan'] = []
  const tonggeun: TuganTonggeunInfo['tonggeun'] = []

  // 모든 기둥의 천간 목록
  const allStems = pillars.map(p => p.stem)

  // 투간: 지장간에 있는 천간이 사주의 천간에 나타나는 경우
  for (let i = 0; i < pillars.length; i++) {
    const hidden = HIDDEN_STEMS[pillars[i].branch]
    for (const hs of hidden) {
      // 다른 기둥의 천간 중 이 지장간과 같은 것이 있으면 투간
      for (let j = 0; j < pillars.length; j++) {
        if (pillars[j].stem === hs) {
          tugan.push({
            stemIdx: hs,
            stemName: STEMS[hs],
            fromBranch: `${pillarNames[i]} ${BRANCHES[pillars[i].branch]}`,
            pillarName: pillarNames[j],
          })
        }
      }
    }
  }

  // 통근: 천간이 어떤 지지의 지장간에 뿌리를 두고 있는 경우
  for (let i = 0; i < pillars.length; i++) {
    const stem = pillars[i].stem
    for (let j = 0; j < pillars.length; j++) {
      const hidden = HIDDEN_STEMS[pillars[j].branch]
      if (hidden.includes(stem)) {
        tonggeun.push({
          stemIdx: stem,
          stemName: STEMS[stem],
          inBranch: `${pillarNames[j]} ${BRANCHES[pillars[j].branch]}`,
          pillarName: pillarNames[i],
        })
      }
    }
  }

  // 일간 통근 여부 (일간이 어떤 지지의 지장간에 있는지)
  const dayStem = pillars[2].stem  // 일주 = index 2
  let rootCount = 0
  for (const p of pillars) {
    const hidden = HIDDEN_STEMS[p.branch]
    if (hidden.includes(dayStem)) rootCount++
  }

  const dayMasterRooted = rootCount > 0
  let rootStrength: 'strong' | 'medium' | 'weak' | 'none' = 'none'
  if (rootCount >= 3) rootStrength = 'strong'
  else if (rootCount === 2) rootStrength = 'medium'
  else if (rootCount === 1) rootStrength = 'weak'

  return { tugan, tonggeun, dayMasterRooted, rootStrength }
}

// ═══════════════════════════════════════════════
// 조후용신 계산
// ═══════════════════════════════════════════════
function calculateJohu(dayMasterElement: number, monthBranch: number, dayMaster?: number): JohuYongsinInfo {
  // 계절 판별
  let season: string
  let temperature: string

  if (monthBranch === 2 || monthBranch === 3) {
    season = '봄(春)'
    temperature = '따뜻함'
  } else if (monthBranch === 5 || monthBranch === 6) {
    season = '여름(夏)'
    temperature = '더움'
  } else if (monthBranch === 8 || monthBranch === 9) {
    season = '가을(秋)'
    temperature = '서늘함'
  } else if (monthBranch === 11 || monthBranch === 0) {
    season = '겨울(冬)'
    temperature = '추움'
  } else {
    // 진술축미 (환절기/토왕용사)
    if (monthBranch === 4) { season = '늦봄(季春)'; temperature = '따뜻함' }
    else if (monthBranch === 7) { season = '늦여름(季夏)'; temperature = '더움' }
    else if (monthBranch === 10) { season = '늦가을(季秋)'; temperature = '서늘함' }
    else { season = '늦겨울(季冬)'; temperature = '추움' }  // monthBranch === 1
  }

  // ── 조후 판단: 일간(10천간) × 계절 상세 규칙 ──
  // 일간별 계절별 조후용신 매트릭스
  // key: `${dayMasterElement}_${seasonGroup}` → { element, explanation }
  // seasonGroup: 'spring'(인묘진), 'summer'(사오미), 'autumn'(신유술), 'winter'(해자축)
  let seasonGroup: 'spring' | 'summer' | 'autumn' | 'winter'
  if (monthBranch === 2 || monthBranch === 3 || monthBranch === 4) seasonGroup = 'spring'
  else if (monthBranch === 5 || monthBranch === 6 || monthBranch === 7) seasonGroup = 'summer'
  else if (monthBranch === 8 || monthBranch === 9 || monthBranch === 10) seasonGroup = 'autumn'
  else seasonGroup = 'winter'

  // 일간(10천간)별 조후용신 상세 테이블
  // dayMaster: 0=갑, 1=을, 2=병, 3=정, 4=무, 5=기, 6=경, 7=신, 8=임, 9=계
  type JohuRule = { el: number; desc: string }
  const johuTable: Record<string, JohuRule> = {
    // ── 갑목(0) : 양목, 큰 나무 ──
    '0_spring': { el: 1, desc: '봄 갑목(甲木)은 양기가 왕성하니 병화(丙火)로 기운을 발산하고, 계수(癸水)로 뿌리를 적셔야 합니다. 경금(庚金)으로 가지치기하면 더욱 좋습니다.' },
    '0_summer': { el: 4, desc: '여름 갑목(甲木)은 화기에 타들어가니 계수(癸水)로 뿌리를 보호하는 것이 급선무입니다. 임수(壬水)가 있으면 더욱 좋습니다.' },
    '0_autumn': { el: 1, desc: '가을 갑목(甲木)은 경금(庚金)의 극을 정면으로 받으니 정화(丁火)로 금을 제련하고, 임수(壬水)로 자양하면 좋습니다.' },
    '0_winter': { el: 1, desc: '겨울 갑목(甲木)은 추위에 얼어붙으니 병화(丙火)의 따뜻한 햇살이 반드시 필요합니다. 무토(戊土)로 뿌리를 고정하면 안정됩니다.' },
    // ── 을목(1) : 음목, 풀·덩굴 ──
    '1_spring': { el: 1, desc: '봄 을목(乙木)은 생기가 넘치니 병화(丙火)의 햇살로 꽃을 피우고, 계수(癸水)의 이슬비로 자양하면 좋습니다.' },
    '1_summer': { el: 4, desc: '여름 을목(乙木)은 화기에 시들기 쉬우니 계수(癸水)의 적신 비가 필수입니다. 임수(壬水)는 과하면 뿌리가 썩으니 주의합니다.' },
    '1_autumn': { el: 1, desc: '가을 을목(乙木)은 신금(辛金)의 극을 받아 꺾이기 쉬우니 병화(丙火)로 따뜻하게 하고, 계수(癸水)로 생기를 유지하면 좋습니다.' },
    '1_winter': { el: 1, desc: '겨울 을목(乙木)은 추위에 완전히 시드니 병화(丙火)의 온기가 절대적으로 필요합니다. 무토(戊土)가 있으면 뿌리를 지탱합니다.' },
    // ── 병화(2) : 양화, 태양 ──
    '2_spring': { el: 4, desc: '봄 병화(丙火)는 목(木)의 생조를 받아 기세가 좋으니 임수(壬水)로 조절하면 빛이 고르게 퍼집니다. 과한 목은 화를 태우니 주의합니다.' },
    '2_summer': { el: 4, desc: '여름 병화(丙火)는 태양이 극에 달하니 임수(壬水)로 반드시 식혀야 합니다. 경금(庚金)이 있으면 수원을 만들어 더욱 좋습니다.' },
    '2_autumn': { el: 0, desc: '가을 병화(丙火)는 서늘함에 기운이 약해지니 갑목(甲木)으로 불을 살리면 좋습니다. 경금(庚金)으로 갑목을 다듬으면 더욱 효과적입니다.' },
    '2_winter': { el: 0, desc: '겨울 병화(丙火)는 수(水)의 극을 받아 빛이 약해지니 갑목(甲木)으로 불을 살리는 것이 급선무입니다. 무토(戊土)로 수를 막으면 안정됩니다.' },
    // ── 정화(3) : 음화, 촛불·등불 ──
    '3_spring': { el: 0, desc: '봄 정화(丁火)는 갑목(甲木)을 연료 삼아 빛을 내니, 갑목이 있으면 문창(文昌)의 격입니다. 경금(庚金)으로 갑목을 다듬으면 더욱 좋습니다.' },
    '3_summer': { el: 0, desc: '여름 정화(丁火)는 화기가 넘치니 갑목(甲木)으로 안정시키되, 임수(壬水)를 겸하면 과열을 방지합니다.' },
    '3_autumn': { el: 0, desc: '가을 정화(丁火)는 금(金)에 설기가 되어 약해지니 갑목(甲木)을 연료로 불을 살려야 합니다. 병화(丙火)가 보조하면 좋습니다.' },
    '3_winter': { el: 0, desc: '겨울 정화(丁火)는 수(水)에 꺼지기 쉬우니 갑목(甲木)의 연료가 필수입니다. 무토(戊土)로 수를 막고 병화(丙火)로 보조하면 안정됩니다.' },
    // ── 무토(4) : 양토, 산·둑 ──
    '4_spring': { el: 1, desc: '봄 무토(戊土)는 목(木)의 극을 받으니 병화(丙火)로 목을 설기시키고 토를 생해주면 좋습니다. 갑목(甲木)이 있으면 병화가 더욱 필요합니다.' },
    '4_summer': { el: 4, desc: '여름 무토(戊土)는 화기에 건조해지니 임수(壬水)로 적셔야 만물을 길러냅니다. 갑목(甲木)으로 토를 소통시키면 더욱 좋습니다.' },
    '4_autumn': { el: 1, desc: '가을 무토(戊土)는 금(金)에 설기가 과하니 병화(丙火)로 따뜻하게 하고, 갑목(甲木)으로 소통시키면 좋습니다.' },
    '4_winter': { el: 1, desc: '겨울 무토(戊土)는 수(水)와 추위에 얼어붙으니 병화(丙火)의 온기가 절대적으로 필요합니다. 무토 자체가 강해도 화가 없으면 무용합니다.' },
    // ── 기토(5) : 음토, 밭·정원 ──
    '5_spring': { el: 1, desc: '봄 기토(己土)는 목(木)의 극을 받아 흩어지니 병화(丙火)로 따뜻하게 하고, 계수(癸水)로 적시면 만물을 길러냅니다.' },
    '5_summer': { el: 4, desc: '여름 기토(己土)는 화기에 말라붙으니 계수(癸水)의 적신 비가 필수입니다. 병화가 과하면 오히려 해로우니 수가 먼저입니다.' },
    '5_autumn': { el: 1, desc: '가을 기토(己土)는 금(金)에 기운을 빼앗기니 병화(丙火)로 따뜻하게 하면 좋습니다. 계수(癸水)가 겸하면 윤택해집니다.' },
    '5_winter': { el: 1, desc: '겨울 기토(己土)는 추위에 꽁꽁 얼으니 병화(丙火)의 온기가 최우선입니다. 갑목(甲木)이 있어 갑기합화하면 더욱 좋습니다.' },
    // ── 경금(6) : 양금, 큰 쇠·바위 ──
    '6_spring': { el: 1, desc: '봄 경금(庚金)은 목(木)이 왕성하여 기세에 눌리니 병화(丙火)·정화(丁火)로 단련해야 유용한 그릇이 됩니다. 갑목이 겸하면 더욱 좋습니다.' },
    '6_summer': { el: 4, desc: '여름 경금(庚金)은 화(火)의 극이 맹렬하니 임수(壬水)·계수(癸水)로 반드시 식혀야 합니다. 무토(戊土)가 과하면 금을 묻으니 주의합니다.' },
    '6_autumn': { el: 1, desc: '가을 경금(庚金)은 금기가 왕성하니 정화(丁火)로 단련하여 쓸모 있는 그릇으로 만들어야 합니다. 갑목이 연료가 되면 최상입니다.' },
    '6_winter': { el: 1, desc: '겨울 경금(庚金)은 추위에 차갑게 굳으니 병화(丙火)로 따뜻하게 하고, 정화(丁火)로 단련하면 좋습니다. 무토(戊土)로 수를 제어하면 안정됩니다.' },
    // ── 신금(7) : 음금, 보석·바늘 ──
    '7_spring': { el: 4, desc: '봄 신금(辛金)은 목(木)에 기세가 눌리니 임수(壬水)로 신금을 씻어내고 빛나게 하는 것이 우선입니다. 갑목(甲木)이 겸하면 수의 근원이 됩니다.' },
    '7_summer': { el: 4, desc: '여름 신금(辛金)은 화(火)에 녹기 쉬우니 임수(壬水)·계수(癸水)로 반드시 식혀야 합니다. 기토(己土)가 과하면 보석이 묻히니 주의합니다.' },
    '7_autumn': { el: 4, desc: '가을 신금(辛金)은 금기가 왕성하니 임수(壬水)로 설기하고 씻어내면 보석이 빛납니다. 정화(丁火)로 단련하면 쓸모가 더해집니다.' },
    '7_winter': { el: 1, desc: '겨울 신금(辛金)은 수(水)에 빛을 잃고 추위에 얼으니 병화(丙火)의 따뜻한 햇살이 반드시 필요합니다. 무토(戊土)로 수를 막으면 안정됩니다.' },
    // ── 임수(8) : 양수, 강·바다 ──
    '8_spring': { el: 2, desc: '봄 임수(壬水)는 목(木)에 설기가 되어 약해지니 무토(戊土)로 둑을 쌓고, 경금(庚金)으로 수원을 보충하면 좋습니다.' },
    '8_summer': { el: 3, desc: '여름 임수(壬水)는 화(火)가 강해 증발하니 경금(庚金)·신금(辛金)으로 수원을 보충해야 합니다. 무토가 과하면 수를 막으니 주의합니다.' },
    '8_autumn': { el: 0, desc: '가을 임수(壬水)는 금(金)의 생조를 받아 범람할 수 있으니 갑목(甲木)으로 설기하면 좋습니다. 무토(戊土)로 제방을 쌓으면 안정됩니다.' },
    '8_winter': { el: 1, desc: '겨울 임수(壬水)는 수가 범람하고 얼어붙으니 병화(丙火)의 온기가 절대적으로 필요합니다. 무토(戊土)로 수를 제어하고 갑목으로 소통시키면 좋습니다.' },
    // ── 계수(9) : 음수, 이슬·빗물 ──
    '9_spring': { el: 3, desc: '봄 계수(癸水)는 목(木)에 설기가 되어 마르기 쉬우니 신금(辛金)으로 수원을 보충하면 좋습니다. 병화(丙火)가 있으면 따뜻한 봄비가 됩니다.' },
    '9_summer': { el: 3, desc: '여름 계수(癸水)는 화(火)에 증발하여 고갈되니 신금(辛金)·경금(庚金)으로 수원 보충이 급선무입니다. 병화가 과하면 완전히 마릅니다.' },
    '9_autumn': { el: 1, desc: '가을 계수(癸水)는 금(金)의 생조를 받아 기세가 좋으니 병화(丙火)로 따뜻하게 조절하면 좋습니다. 신금이 과하면 설기합니다.' },
    '9_winter': { el: 1, desc: '겨울 계수(癸水)는 수(水)가 범람하고 차갑게 얼으니 병화(丙火)의 온기가 절대적으로 필요합니다. 무토(戊土)로 수를 제어하면 안정됩니다.' },
  }

  // dayMaster가 주어지면 천간별 상세 규칙 사용, 아니면 오행별 규칙으로 fallback
  const stemKey = dayMaster !== undefined ? `${dayMaster}_${seasonGroup}` : null
  const elKey = `${dayMasterElement}_${seasonGroup}`
  const johuRule = (stemKey && johuTable[stemKey]) || johuTable[elKey] || { el: 1, desc: '화(火)의 기운이 필요합니다.' }
  const neededElement = johuRule.el
  const explanation = johuRule.desc

  return { season, temperature, neededElement, explanation }
}

// ═══════════════════════════════════════════════
// 추가 신살 계산 함수들
// ═══════════════════════════════════════════════

// 백호대살: 일간 기준
function getBaekhoTarget(dayStem: number): number {
  const map: Record<number, number> = { 0: 4, 1: 5, 2: 6, 3: 7, 4: 8, 5: 9, 6: 10, 7: 11, 8: 0, 9: 1 }
  return map[dayStem]
}

// 홍염살: 일간 기준
function getHongyeomTarget(dayStem: number): number {
  const map: Record<number, number> = { 0: 6, 1: 8, 2: 2, 3: 7, 4: 4, 5: 4, 6: 10, 7: 9, 8: 0, 9: 8 }
  return map[dayStem]
}

// 천의성: 일간 기준 → 대상 지지 배열
function getCheonuiTargets(dayStem: number): number[] {
  const map: Record<number, number[]> = {
    0: [1, 2],    // 갑 → 축, 인
    1: [5, 6],    // 을 → 사, 오
    2: [9, 11],   // 병 → 유, 해
    3: [9, 11],   // 정 → 유, 해
    4: [11],      // 무 → 해
    5: [0],       // 기 → 자
    6: [2, 3],    // 경 → 인, 묘
    7: [2, 3],    // 신 → 인, 묘
    8: [3],       // 임 → 묘
    9: [5],       // 계 → 사
  }
  return map[dayStem]
}

// 학당귀인: 일간 기준
function getHakdangTarget(dayStem: number): number {
  const map: Record<number, number> = { 0: 11, 1: 6, 2: 2, 3: 9, 4: 2, 5: 9, 6: 5, 7: 0, 8: 8, 9: 3 }
  return map[dayStem]
}

// 천덕귀인: 월지 기준 → 해당 천간 인덱스
function getCheondukStem(monthBranch: number): number {
  const map: Record<number, number> = {
    2: 3, 3: 8, 4: 8, 5: 7, 6: 0, 7: 9, 8: 2, 9: 5, 10: 5, 11: 0, 0: 2, 1: 3,
  }
  return map[monthBranch]
}

// 월덕귀인: 월지 삼합 그룹 기준 → 해당 천간 인덱스
function getWoldukStem(monthBranch: number): number {
  if (monthBranch === 2 || monthBranch === 6 || monthBranch === 10) return 2   // 丙
  if (monthBranch === 8 || monthBranch === 0 || monthBranch === 4) return 8    // 壬
  if (monthBranch === 11 || monthBranch === 3 || monthBranch === 7) return 0   // 甲
  return 6  // 庚 (사유축: 5, 9, 1)
}

// 귀문관살: 일지 기준
function getGwimungwanTarget(dayBranch: number): number {
  const map: Record<number, number> = {
    0: 9, 1: 6, 2: 7, 3: 4, 4: 5, 5: 2, 6: 1, 7: 10, 8: 11, 9: 0, 10: 3, 11: 8,
  }
  return map[dayBranch]
}

// 원진살: 일지 기준
function getWonjinTarget(dayBranch: number): number {
  const map: Record<number, number> = {
    0: 7, 1: 6, 2: 9, 3: 8, 4: 11, 5: 10, 6: 1, 7: 0, 8: 3, 9: 2, 10: 5, 11: 4,
  }
  return map[dayBranch]
}

// 복성귀인: 일간 기준 → 대상 지지 배열
function getBokseongTargets(dayStem: number): number[] {
  const map: Record<number, number[]> = {
    0: [0, 1, 2],     // 갑 → 자축인
    1: [4, 5],         // 을 → 진사
    2: [11],           // 병 → 해
    3: [9, 11],        // 정 → 유해
    4: [0, 1, 2],      // 무 → 자축인
    5: [4, 5],         // 기 → 진사
    6: [6, 7],         // 경 → 오미
    7: [4, 5, 6],      // 신 → 진사오
    8: [4, 5],         // 임 → 진사
    9: [1, 2],         // 계 → 축인
  }
  return map[dayStem]
}

// 금여록: 일간 기준
function getGeumyeoTarget(dayStem: number): number {
  const map: Record<number, number> = { 0: 4, 1: 5, 2: 7, 3: 8, 4: 9, 5: 10, 6: 0, 7: 1, 8: 2, 9: 3 }
  return map[dayStem]
}

// 태극귀인: 일간 기준 → 대상 지지 배열
function getTaegukTargets(dayStem: number): number[] {
  const map: Record<number, number[]> = {
    0: [0, 6],          // 갑 → 자오
    1: [0, 6],          // 을 → 자오
    2: [3, 9],          // 병 → 묘유
    3: [3, 9],          // 정 → 묘유
    4: [1, 4, 7, 10],   // 무 → 축진미술
    5: [1, 4, 7, 10],   // 기 → 축진미술
    6: [2, 6],          // 경 → 인오
    7: [2, 6],          // 신 → 인오
    8: [5, 9],          // 임 → 사유
    9: [5, 9],          // 계 → 사유
  }
  return map[dayStem]
}

// 12신살: 년지 삼합 그룹 기준
function getTwelveAnimalSinsal(yearBranch: number, dayBranch: number): string {
  const sinsalNames = ['겁살', '재살', '천살', '지살', '연살', '월살', '망신살', '장성살', '반안살', '역마살', '육해살', '화개살']

  // 삼합 그룹별 시작 지지 (겁살 위치)
  // 신자진(8,0,4) → 겁살=사(5)
  // 인오술(2,6,10) → 겁살=해(11)
  // 사유축(5,9,1) → 겁살=인(2)
  // 해묘미(11,3,7) → 겁살=신(8)
  let geobsalStart: number
  if (yearBranch === 8 || yearBranch === 0 || yearBranch === 4) geobsalStart = 5
  else if (yearBranch === 2 || yearBranch === 6 || yearBranch === 10) geobsalStart = 11
  else if (yearBranch === 5 || yearBranch === 9 || yearBranch === 1) geobsalStart = 2
  else geobsalStart = 8  // 해묘미

  // 일지가 겁살 시작으로부터 몇 번째인지 계산
  const offset = ((dayBranch - geobsalStart) % 12 + 12) % 12
  return sinsalNames[offset]
}

// 확장 신살 종합 계산
function calculateEnhancedSinsal(
  pillars: Pillar[], dayStem: number, dayBranch: number,
  yearBranch: number, monthBranch: number, baseSinsal: SinsalInfo
): EnhancedSinsalInfo {
  const allBranches = pillars.map(p => p.branch)
  const allStems = pillars.map(p => p.stem)

  // 백호대살: 일간 기준, 사주 내 지지에 대상이 있으면
  const baekhoTarget = getBaekhoTarget(dayStem)
  const hasBaekho = allBranches.some(b => b === baekhoTarget)

  // 홍염살
  const hongyeomTarget = getHongyeomTarget(dayStem)
  const hasHongyeom = allBranches.some(b => b === hongyeomTarget)

  // 천의성
  const cheonuiTargets = getCheonuiTargets(dayStem)
  const hasCheonui = allBranches.some(b => cheonuiTargets.includes(b))

  // 학당귀인
  const hakdangTarget = getHakdangTarget(dayStem)
  const hasHakdang = allBranches.some(b => b === hakdangTarget)

  // 천덕귀인: 월지 기준 천간이 사주의 어떤 천간에 있으면
  const cheondukStem = getCheondukStem(monthBranch)
  const hasCheonduk = allStems.some(s => s === cheondukStem)

  // 월덕귀인: 월지 그룹 기준 천간이 사주의 어떤 천간에 있으면
  const woldukStem = getWoldukStem(monthBranch)
  const hasWolduk = allStems.some(s => s === woldukStem)

  // 귀문관살: 일지 기준
  const gwimungwanTarget = getGwimungwanTarget(dayBranch)
  const hasGwimungwan = allBranches.some(b => b === gwimungwanTarget)

  // 격각살: 일지에서 3칸 떨어진 지지가 사주에 있으면
  const gyeokgakTarget1 = (dayBranch + 3) % 12
  const gyeokgakTarget2 = ((dayBranch - 3) % 12 + 12) % 12
  const hasGyeokgak = allBranches.some(b => b === gyeokgakTarget1 || b === gyeokgakTarget2)

  // 천라: 술(10)과 해(11)가 사주에 모두 있으면
  const hasCheonla = allBranches.includes(10) && allBranches.includes(11)

  // 지망: 진(4)과 사(5)가 사주에 모두 있으면
  const hasJimang = allBranches.includes(4) && allBranches.includes(5)

  // 원진살: 일지 기준
  const wonjinTarget = getWonjinTarget(dayBranch)
  const hasWonjin = allBranches.some(b => b === wonjinTarget)

  // 복성귀인
  const bokseongTargets = getBokseongTargets(dayStem)
  const hasBokseong = allBranches.some(b => bokseongTargets.includes(b))

  // 금여록
  const geumyeoTarget = getGeumyeoTarget(dayStem)
  const hasGeumyeo = allBranches.some(b => b === geumyeoTarget)

  // 태극귀인
  const taegukTargets = getTaegukTargets(dayStem)
  const hasTaeguk = allBranches.some(b => taegukTargets.includes(b))

  // 12신살
  const twelveAnimalSinsal = getTwelveAnimalSinsal(yearBranch, dayBranch)

  return {
    // 기존 SinsalInfo 필드 복사
    ...baseSinsal,
    // 추가 신살
    hasBaekho,
    hasHongyeom,
    hasCheonui,
    hasHakdang,
    hasCheonduk,
    hasWolduk,
    hasGwimungwan,
    hasGyeokgak,
    hasCheonla,
    hasJimang,
    hasWonjin,
    hasBokseong,
    hasGeumyeo,
    hasTaeguk,
    twelveAnimalSinsal,
  }
}

// ═══════════════════════════════════════════════
// 심층 공망 분석
// ═══════════════════════════════════════════════
function calculateEnhancedGongmang(dayPillar: Pillar, pillars: Pillar[], baseGongmang: GongmangInfo): EnhancedGongmangInfo {
  const voidBranches = baseGongmang.voidBranches

  const yearVoid = voidBranches.includes(pillars[0].branch)
  const monthVoid = voidBranches.includes(pillars[1].branch)
  // 일주는 공망 기준이므로 체크하지 않음
  const hourVoid = pillars.length > 3 ? voidBranches.includes(pillars[3].branch) : false

  const voidCount = [yearVoid, monthVoid, hourVoid].filter(Boolean).length

  let severity: 'high' | 'medium' | 'low' | 'none' = 'none'
  if (voidCount >= 2) severity = 'high'
  else if (voidCount === 1) {
    // 년주 공망은 영향이 크고, 시주는 상대적으로 작음
    if (yearVoid) severity = 'medium'
    else severity = 'low'
  }

  return {
    ...baseGongmang,
    severity,
    yearVoid,
    monthVoid,
    hourVoid,
  }
}

// ═══════════════════════════════════════════════
// 월운 계산
// ═══════════════════════════════════════════════
function calculateWolun(
  dayMasterElement: number, dayMasterYinYang: number,
  yearStem: number, isDayMasterStrong: boolean, usefulGod: number
): WolunInfo[] {
  const currentYear = new Date().getFullYear()
  const yearPillar = getYearPillar(currentYear, 6, 15) // 연중 근사값
  const result: WolunInfo[] = []

  for (let m = 1; m <= 12; m++) {
    const mp = getMonthPillar(yearPillar.stem, m, 15)
    const tg = getTenGod(dayMasterElement, dayMasterYinYang, mp.stem)

    // 월의 오행
    const monthElement = STEM_ELEMENT[mp.stem]

    // 평점 산출: 용신 오행과의 관계
    let rating = 3
    if (monthElement === usefulGod) {
      rating = 5
    } else if (produces(monthElement, usefulGod)) {
      rating = 4
    } else if (produces(usefulGod, dayMasterElement) && monthElement === usefulGod) {
      rating = 4
    } else if (controls(monthElement, usefulGod)) {
      rating = 2
    } else if (controls(usefulGod, monthElement)) {
      rating = 1
    }

    // 십신 × 평점 조합 키워드 (더 구체적)
    const keywordMap: Record<string, Record<number, string>> = {
      '비견': { 5: '협력 성과', 4: '동료 도움', 3: '경쟁 심화', 2: '라이벌', 1: '갈등 주의' },
      '겁재': { 5: '큰 변화', 4: '새 기회', 3: '지출 주의', 2: '손재 위험', 1: '보증 금지' },
      '식신': { 5: '창작 대박', 4: '재능 발휘', 3: '표현 기회', 2: '체력 저하', 1: '건강 관리' },
      '상관': { 5: '파격 성공', 4: '도전 보상', 3: '말조심', 2: '구설수', 1: '충돌 주의' },
      '편재': { 5: '횡재 가능', 4: '부수입', 3: '지출 관리', 2: '투자 손실', 1: '도박 금지' },
      '정재': { 5: '수입 증가', 4: '저축 적기', 3: '현상 유지', 2: '고정비 증가', 1: '재물 유출' },
      '편관': { 5: '승진 기회', 4: '인정받음', 3: '업무 과중', 2: '스트레스', 1: '건강 위험' },
      '정관': { 5: '안정 성장', 4: '신뢰 획득', 3: '책임 증가', 2: '압박감', 1: '구속감' },
      '편인': { 5: '합격 운', 4: '공부 적기', 3: '고민 많음', 2: '불면 주의', 1: '우울 주의' },
      '정인': { 5: '귀인 만남', 4: '조언 도움', 3: '배움 기회', 2: '의존 주의', 1: '고립감' },
    }

    const kw = keywordMap[tg]?.[rating] || (rating >= 4 ? '좋은 달' : rating <= 2 ? '조심할 달' : '평범한 달')

    result.push({
      month: m,
      stem: mp.stem,
      branch: mp.branch,
      tenGod: tg,
      rating,
      keyword: kw,
    })
  }

  return result
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

  const animal = BRANCHES_ANIMAL[yearPillar.branch]

  // 신살 계산
  const sinsal = calculateSinsal(pillars, dayMaster, dayPillar.branch)

  // 세운 분석
  const yearAnalysis = analyzeYear(pillars, dayMaster, dayMasterElement, dayMasterYinYang, tenGods, analysis.usefulGod)

  // 대운 계산
  const daeun = calculateDaeun(yearPillar.stem, monthPillar, gender, dayMasterElement, dayMasterYinYang, year, month, day)

  // 공망 분석
  const gongmang = calculateGongmang(dayPillar, pillars)

  // 격국 판단 (투간 우선순위 적용)
  const gyeokguk = determineGyeokguk(dayMaster, dayMasterElement, monthPillar, analysis.isDayMasterStrong, dayMasterYinYang, pillars)

  // 합충형파해 종합 분석
  const hapChung = analyzeHapChung(pillars)

  // 종격 판별
  const jongguk = detectJongguk(dayMasterElement, analysis.dayMasterScore, analysis.counts, analysis.isDayMasterStrong, pillars)

  // 투간/통근 분석
  const tuganTonggeun = analyzeTuganTonggeun(pillars)

  // 조후용신 계산
  const johu = calculateJohu(dayMasterElement, monthPillar.branch, dayMaster)

  // 월운 계산
  const wolun = calculateWolun(dayMasterElement, dayMasterYinYang, yearPillar.stem, analysis.isDayMasterStrong, analysis.usefulGod)

  // 확장 신살 계산
  const enhancedSinsal = calculateEnhancedSinsal(pillars, dayMaster, dayPillar.branch, yearPillar.branch, monthPillar.branch, sinsal)

  // 심층 공망 분석
  const enhancedGongmang = calculateEnhancedGongmang(dayPillar, pillars, gongmang)

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
    hapChung,
    jongguk,
    tuganTonggeun,
    johu,
    wolun,
    enhancedSinsal,
    enhancedGongmang,
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

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
export const STEM_ELEMENT: number[] = [0,0,1,1,2,2,3,3,4,4] // 갑을=목, 병정=화, 무기=토, 경신=금, 임계=수

// 지지→오행 매핑
export const BRANCH_ELEMENT: number[] = [4,2,0,0,2,1,1,2,3,3,2,4] // 자=수, 축=토, 인=목...

// 음양 (0=음, 1=양)
export const STEM_YINYANG: number[] = [1,0,1,0,1,0,1,0,1,0]
export const BRANCH_YINYANG: number[] = [1,0,1,0,1,0,1,0,1,0,1,0]

// 오행 상생 (Production cycle): 목→화→토→금→수→목
// 오행 상극 (Control cycle): 목→토→수→화→금→목
export function produces(a: number, b: number): boolean { return (a + 1) % 5 === b }
export function controls(a: number, b: number): boolean { return (a + 2) % 5 === b }

// 지장간 (Hidden Stems in Branches)
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

// ═══════════════════════════════════════════════
// 사주 기둥(Pillar) 타입
// ═══════════════════════════════════════════════
export interface Pillar {
  stem: number    // 천간 인덱스 (0~9)
  branch: number  // 지지 인덱스 (0~11)
}

export interface DaeunPeriod {
  startAge: number
  endAge: number
  pillar: Pillar
  tenGod: string
}

export interface SajuResult {
  yearPillar: Pillar
  monthPillar: Pillar
  dayPillar: Pillar
  hourPillar: Pillar | null
  dayMaster: number           // 일간 인덱스
  dayMasterElement: number    // 일간 오행
  dayMasterYinYang: number    // 일간 음양
  elementCounts: number[]     // 오행별 개수 [목,화,토,금,수]
  missingElements: number[]   // 부족한 오행
  strongElement: number       // 가장 강한 오행
  isDayMasterStrong: boolean  // 신강 여부
  tenGods: string[]           // 각 기둥의 십신
  usefulGod: number           // 용신 오행
  gender: 'male' | 'female'
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number | null
  animal: string              // 띠
  daeun: DaeunPeriod[]        // 대운
  daeunStartAge: number       // 대운 시작 나이
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
  // 12개 절기 경계에서 현재 날짜가 어디에 해당하는지
  for (let i = 11; i >= 0; i--) {
    const b = MONTH_BOUNDS[i]
    if (month > b.solarMonth || (month === b.solarMonth && day >= b.solarDay)) {
      return i
    }
  }
  return 11 // 1월 소한 이전 → 축월(전년도 12월)
}

function getMonthPillar(yearStem: number, month: number, day: number): Pillar {
  const mi = getMonthIndex(month, day)
  const branch = MONTH_BOUNDS[mi].branchIdx

  // 오호둔법: 년간에 따라 인월(1월)의 천간 결정
  const startStems = [2, 4, 6, 8, 0] // 갑기→병, 을경→무, 병신→경, 정임→임, 무계→갑
  const monthStemStart = startStems[yearStem % 5]
  const stem = (monthStemStart + mi) % 10

  return { stem, branch }
}

// ═══════════════════════════════════════════════
// 일주 계산 (기준일 역산법)
// ═══════════════════════════════════════════════
function getDayPillar(year: number, month: number, day: number): Pillar {
  // 기준일: 2024년 1월 1일 = 을축일 (stem=1, branch=1)
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
  if (hour === 23 || hour === 0) return 0  // 자시
  return Math.floor((hour + 1) / 2)
}

function getHourPillar(dayStem: number, hour: number): Pillar {
  const branch = getHourBranch(hour)
  // 오자둔법: 일간에 따라 자시의 천간 결정
  const startStems = [0, 2, 4, 6, 8] // 갑기→갑, 을경→병, 병신→무, 정임→경, 무계→임
  const hourStemStart = startStems[dayStem % 5]
  const stem = (hourStemStart + branch) % 10
  return { stem, branch }
}

// ═══════════════════════════════════════════════
// 십신 (Ten Gods) 계산
// ═══════════════════════════════════════════════
const TEN_GOD_NAMES = [
  '비견', '겁재',  // 같은 오행
  '식신', '상관',  // 내가 생하는
  '편재', '정재',  // 내가 극하는
  '편관', '정관',  // 나를 극하는
  '편인', '정인',  // 나를 생하는
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
// 오행 분석 & 용신 판단
// ═══════════════════════════════════════════════
function analyzeElements(pillars: Pillar[], dayMasterElement: number) {
  const counts = [0, 0, 0, 0, 0] // 목화토금수

  for (const p of pillars) {
    counts[STEM_ELEMENT[p.stem]]++
    counts[BRANCH_ELEMENT[p.branch]]++
    // 지장간 본기 추가 (가중치 0.5)
    const main = HIDDEN_STEMS[p.branch]
    if (main.length > 0) {
      counts[STEM_ELEMENT[main[main.length - 1]]] += 0.5
    }
  }

  const missing = counts.map((c, i) => c === 0 ? i : -1).filter(i => i >= 0)
  const strongIdx = counts.indexOf(Math.max(...counts))

  // 신강/신약 판단: 일간과 같은 오행 + 인성(나를 생하는) 오행의 합
  const produceMe = (dayMasterElement + 4) % 5 // 나를 생하는 오행
  const myStrength = counts[dayMasterElement] + counts[produceMe]
  const totalStrength = counts.reduce((a, b) => a + b, 0)
  const isDayMasterStrong = myStrength > totalStrength / 2

  // 용신 판단
  let usefulGod: number
  if (isDayMasterStrong) {
    // 신강 → 설기(식상), 극기(재성/관성) 필요
    const drain = (dayMasterElement + 1) % 5  // 식상 (내가 생하는)
    const control = (dayMasterElement + 2) % 5 // 재성 (내가 극하는)
    usefulGod = counts[drain] <= counts[control] ? drain : control
  } else {
    // 신약 → 생기(인성), 비겁 필요
    const support = (dayMasterElement + 4) % 5 // 인성 (나를 생하는)
    usefulGod = counts[support] <= counts[dayMasterElement] ? support : dayMasterElement
  }

  return { counts, missing, strongElement: strongIdx, isDayMasterStrong, usefulGod }
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

  const analysis = analyzeElements(pillars, dayMasterElement)

  // 각 기둥 천간의 십신 계산
  const tenGods: string[] = []
  tenGods.push(getTenGod(dayMasterElement, dayMasterYinYang, yearPillar.stem))
  tenGods.push(getTenGod(dayMasterElement, dayMasterYinYang, monthPillar.stem))
  tenGods.push('일주') // 일간 자신
  if (hourPillar) {
    tenGods.push(getTenGod(dayMasterElement, dayMasterYinYang, hourPillar.stem))
  }

  // 띠 계산
  const animalYear = ((year - 4) % 12 + 12) % 12
  const animal = BRANCHES_ANIMAL[animalYear]

  // ═══════════════════════════════════════════════
  // 대운(大運) 계산
  // ═══════════════════════════════════════════════
  const yearStemYY = STEM_YINYANG[yearPillar.stem]
  const isForward = (gender === 'male' && yearStemYY === 1) || (gender === 'female' && yearStemYY === 0)

  const mi = getMonthIndex(month, day)
  const currentBound = MONTH_BOUNDS[mi]
  const birthDate = new Date(year, month - 1, day)
  let targetDate: Date

  if (isForward) {
    const nextIdx = (mi + 1) % 12
    const nextBound = MONTH_BOUNDS[nextIdx]
    let tYear = year
    if (nextBound.solarMonth < month || (nextBound.solarMonth === month && nextBound.solarDay <= day)) tYear++
    targetDate = new Date(tYear, nextBound.solarMonth - 1, nextBound.solarDay)
  } else {
    let tYear = year
    if (currentBound.solarMonth > month || (currentBound.solarMonth === month && currentBound.solarDay > day)) tYear--
    targetDate = new Date(tYear, currentBound.solarMonth - 1, currentBound.solarDay)
  }

  const daysDiff = Math.abs(Math.round((targetDate.getTime() - birthDate.getTime()) / 86400000))
  const daeunStartAge = Math.max(1, Math.round(daysDiff / 3))

  const daeun: DaeunPeriod[] = []
  let dStem = monthPillar.stem
  let dBranch = monthPillar.branch

  for (let i = 0; i < 8; i++) {
    if (isForward) {
      dStem = (dStem + 1) % 10
      dBranch = (dBranch + 1) % 12
    } else {
      dStem = (dStem - 1 + 10) % 10
      dBranch = (dBranch - 1 + 12) % 12
    }
    daeun.push({
      startAge: daeunStartAge + i * 10,
      endAge: daeunStartAge + i * 10 + 9,
      pillar: { stem: dStem, branch: dBranch },
      tenGod: getTenGod(dayMasterElement, dayMasterYinYang, dStem),
    })
  }

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
    tenGods,
    usefulGod: analysis.usefulGod,
    gender,
    birthYear: year,
    birthMonth: month,
    birthDay: day,
    birthHour: hour,
    animal,
    daeun,
    daeunStartAge,
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

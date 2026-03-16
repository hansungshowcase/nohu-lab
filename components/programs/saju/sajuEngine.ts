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
  shinsal: string[]           // 신살 (해당하는 신살 이름 배열)
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
  // MONTH_BOUNDS: 인월(2월)~자월(12월)~축월(1월) 순서
  // 1월(index 11)이 끝에 있어 별도 처리 필요
  if (month >= 2) {
    for (let i = 10; i >= 0; i--) {
      const b = MONTH_BOUNDS[i]
      if (month > b.solarMonth || (month === b.solarMonth && day >= b.solarDay)) {
        return i
      }
    }
    return 11 // 입춘(2/4) 이전 → 축월
  }
  // 1월: 소한(1/5) 이후면 축월, 이전이면 자월
  if (day >= MONTH_BOUNDS[11].solarDay) return 11
  return 10
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
// 계절별 왕상(旺相) 오행 매핑
// 월지 → 해당 계절에서 왕(旺)하는 오행과 상(相)하는 오행
// 왕: 해당 계절의 오행, 상: 왕이 생하는 오행
function getSeasonStrong(monthBranch: number): number[] {
  // 인묘(2,3) = 봄/목 → 왕=목(0), 상=화(1)
  // 사오(5,6) = 여름/화 → 왕=화(1), 상=토(2)
  // 신유(8,9) = 가을/금 → 왕=금(3), 상=수(4)
  // 해자(11,0) = 겨울/수 → 왕=수(4), 상=목(0)
  // 진술축미(4,10,1,7) = 토왕용사/토 → 왕=토(2), 상=금(3)
  switch (monthBranch) {
    case 2: case 3: return [0, 1]     // 봄: 목왕, 화상
    case 5: case 6: return [1, 2]     // 여름: 화왕, 토상
    case 8: case 9: return [3, 4]     // 가을: 금왕, 수상
    case 11: case 0: return [4, 0]    // 겨울: 수왕, 목상
    case 4: case 10: case 1: case 7: return [2, 3] // 토월: 토왕, 금상
    default: return [2, 3]
  }
}

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

  // ═══ 개선된 신강/신약 판단 (득령/통근/투간 3요소) ═══
  const produceMeElement = (dayMasterElement + 4) % 5 // 인성 오행 (나를 생하는)
  const monthBranch = pillars[1].branch
  let strengthScore = 0

  // 1) 득령(得令): 월지의 계절에서 일간 오행이 왕(旺)/상(相)이면 +2점
  const seasonStrong = getSeasonStrong(monthBranch)
  if (seasonStrong.includes(dayMasterElement)) {
    strengthScore += 2
  }

  // 2) 통근(通根): 사주 지지에서 일간과 같은 오행 또는 생하는 오행이면 각 +1점
  for (const p of pillars) {
    const branchEl = BRANCH_ELEMENT[p.branch]
    if (branchEl === dayMasterElement || branchEl === produceMeElement) {
      strengthScore += 1
    }
  }

  // 3) 투간(透干): 천간에 비겁(같은 오행) 또는 인성(나를 생하는 오행)이 있으면 각 +1점
  //    (일간 자신은 제외)
  for (let i = 0; i < pillars.length; i++) {
    if (i === 2) continue // 일간 자신 제외
    const stemEl = STEM_ELEMENT[pillars[i].stem]
    if (stemEl === dayMasterElement || stemEl === produceMeElement) {
      strengthScore += 1
    }
  }

  // 총점 4점 이상이면 신강
  const isDayMasterStrong = strengthScore >= 4

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
// 신살(神殺) 계산
// ═══════════════════════════════════════════════

// 천을귀인: 일간별 귀인이 되는 지지
// 갑=축미, 을=자신, 병=해유, 정=해유, 무=축미, 기=자신, 경=축미, 신=인오, 임=사묘, 계=사묘
const CHEONUL_MAP: Record<number, number[]> = {
  0: [1, 7],   // 갑 → 축, 미
  1: [0, 8],   // 을 → 자, 신
  2: [11, 9],  // 병 → 해, 유
  3: [11, 9],  // 정 → 해, 유
  4: [1, 7],   // 무 → 축, 미
  5: [0, 8],   // 기 → 자, 신
  6: [1, 7],   // 경 → 축, 미
  7: [2, 6],   // 신 → 인, 오
  8: [5, 3],   // 임 → 사, 묘
  9: [5, 3],   // 계 → 사, 묘
}

// 양인살: 일간별 양인이 되는 지지
// 갑=묘, 병=오, 정=사, 무=오, 기=사, 경=유, 신=신, 임=자, 계=해
const YANGIN_MAP: Record<number, number> = {
  0: 3,   // 갑 → 묘
  // 을은 음간이라 양인 해당 없음 (제외)
  2: 6,   // 병 → 오
  3: 5,   // 정 → 사
  4: 6,   // 무 → 오
  5: 5,   // 기 → 사
  6: 9,   // 경 → 유
  7: 8,   // 신 → 신
  8: 0,   // 임 → 자
  9: 11,  // 계 → 해
}

// 도화살: 삼합 기준 일지/년지로 판단
// 인/오/술 → 묘(3), 사/유/축 → 오(6), 신/자/진 → 유(9), 해/묘/미 → 자(0)
const DOHWA_MAP: Record<number, number> = {
  2: 3, 6: 3, 10: 3,   // 인/오/술 → 묘
  5: 6, 9: 6, 1: 6,    // 사/유/축 → 오
  8: 9, 0: 9, 4: 9,    // 신/자/진 → 유
  11: 0, 3: 0, 7: 0,   // 해/묘/미 → 자
}

// 역마살: 삼합의 충 방향
// 인/오/술 → 신(8), 사/유/축 → 해(11), 신/자/진 → 인(2), 해/묘/미 → 사(5)
const YEOKMA_MAP: Record<number, number> = {
  2: 8, 6: 8, 10: 8,    // 인/오/술 → 신
  5: 11, 9: 11, 1: 11,  // 사/유/축 → 해
  8: 2, 0: 2, 4: 2,     // 신/자/진 → 인
  11: 5, 3: 5, 7: 5,    // 해/묘/미 → 사
}

// 화개살: 삼합 기준
// 인/오/술 → 술(10), 사/유/축 → 축(1), 신/자/진 → 진(4), 해/묘/미 → 미(7)
const HWAGAE_MAP: Record<number, number> = {
  2: 10, 6: 10, 10: 10,  // 인/오/술 → 술
  5: 1, 9: 1, 1: 1,      // 사/유/축 → 축
  8: 4, 0: 4, 4: 4,      // 신/자/진 → 진
  11: 7, 3: 7, 7: 7,     // 해/묘/미 → 미
}

function calculateShinsal(dayMaster: number, pillars: Pillar[]): string[] {
  const result: string[] = []
  const dayBranch = pillars[2].branch // 일지
  const yearBranch = pillars[0].branch // 년지

  // 모든 기둥의 지지 수집
  const allBranches = pillars.map(p => p.branch)

  // 도화살: 일지(또는 년지) 기준 삼합에서 파생, 해당 지지가 사주에 있으면
  const dohwaTarget = DOHWA_MAP[dayBranch]
  const dohwaTargetYear = DOHWA_MAP[yearBranch]
  if ((dohwaTarget !== undefined && allBranches.some(b => b === dohwaTarget)) ||
      (dohwaTargetYear !== undefined && allBranches.some(b => b === dohwaTargetYear))) {
    result.push('도화살')
  }

  // 역마살: 일지(또는 년지) 기준 삼합의 충 방향, 해당 지지가 사주에 있으면
  const yeokmaTarget = YEOKMA_MAP[dayBranch]
  const yeokmaTargetYear = YEOKMA_MAP[yearBranch]
  if ((yeokmaTarget !== undefined && allBranches.some(b => b === yeokmaTarget)) ||
      (yeokmaTargetYear !== undefined && allBranches.some(b => b === yeokmaTargetYear))) {
    result.push('역마살')
  }

  // 천을귀인: 일간 기준, 사주 내 지지에 귀인 지지가 있으면 해당
  const guiinBranches = CHEONUL_MAP[dayMaster]
  if (guiinBranches && allBranches.some(b => guiinBranches.includes(b))) {
    result.push('천을귀인')
  }

  // 화개살: 일지(또는 년지) 기준, 해당 지지가 사주에 있으면
  const hwagaeTarget = HWAGAE_MAP[dayBranch]
  const hwagaeTargetYear = HWAGAE_MAP[yearBranch]
  if ((hwagaeTarget !== undefined && allBranches.some(b => b === hwagaeTarget)) ||
      (hwagaeTargetYear !== undefined && allBranches.some(b => b === hwagaeTargetYear))) {
    result.push('화개살')
  }

  // 양인살: 일간의 양인 지지가 사주 내에 있으면 해당
  const yangInBranch = YANGIN_MAP[dayMaster]
  if (yangInBranch !== undefined && allBranches.includes(yangInBranch)) {
    result.push('양인살')
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

  const analysis = analyzeElements(pillars, dayMasterElement)

  // 각 기둥 천간의 십신 계산
  const tenGods: string[] = []
  tenGods.push(getTenGod(dayMasterElement, dayMasterYinYang, yearPillar.stem))
  tenGods.push(getTenGod(dayMasterElement, dayMasterYinYang, monthPillar.stem))
  tenGods.push('일주') // 일간 자신
  if (hourPillar) {
    tenGods.push(getTenGod(dayMasterElement, dayMasterYinYang, hourPillar.stem))
  }

  // 신살 계산
  const shinsal = calculateShinsal(dayMaster, pillars)

  // 띠 계산 (입춘 기준)
  let animalY = year
  if (month < 2 || (month === 2 && day < 4)) animalY--
  const animalIdx = ((animalY - 4) % 12 + 12) % 12
  const animal = BRANCHES_ANIMAL[animalIdx]

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
    shinsal,
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
  return ['#f97316','#ef4444','#eab308','#ffffff','#3b82f6'][el]
}

export function getElementBg(el: number): string {
  return ['bg-orange-500','bg-red-500','bg-yellow-500','bg-gray-200','bg-blue-500'][el]
}

export function getElementEmoji(el: number): string {
  return ['🌳','🔥','🏔️','⚔️','💧'][el]
}

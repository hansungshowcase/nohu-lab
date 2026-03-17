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

export interface MonthlyFortune {
  month: number        // 1-12
  rating: number       // 1-5 stars
  keyword: string      // 한줄 키워드
  advice: string       // 조언
  isBest: boolean
  isWorst: boolean
}

export interface MajorLuck {
  startAge: number
  endAge: number
  stem: number
  branch: number
  element: number
  rating: number       // 1-5
  keyword: string
  isCurrent: boolean
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
  monthlyFortunes: MonthlyFortune[]
  majorLucks: MajorLuck[]
  pillarInteractions: PillarInteraction[]
  currentMonthFortune: MonthlyFortune | null
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
// 사주 내 충/합/형 분석
// ═══════════════════════════════════════════════
export interface PillarInteraction {
  type: 'clash' | 'combine' | 'penalty'
  description: string
  effect: string
}

function analyzePillarInteractions(pillars: Pillar[]): PillarInteraction[] {
  const interactions: PillarInteraction[] = []
  const branchList = pillars.map(p => p.branch)
  const stemList = pillars.map(p => p.stem)
  const pillarNames = ['년주', '월주', '일주', '시주']

  // 지지충 체크
  for (let i = 0; i < branchList.length; i++) {
    for (let j = i + 1; j < branchList.length; j++) {
      for (const [a, b] of BRANCH_CLASHES) {
        if ((branchList[i] === a && branchList[j] === b) || (branchList[i] === b && branchList[j] === a)) {
          const clashEffects: Record<string, string> = {
            '년주-월주': '부모와의 갈등이나 초년기 어려움이 있을 수 있습니다',
            '년주-일주': '가문이나 배경과 다른 삶을 살 수 있습니다',
            '년주-시주': '조상 덕이 약하지만 자수성가 운이 있습니다',
            '월주-일주': '직장/사회생활에서 변동이 잦을 수 있습니다',
            '월주-시주': '중년기 이후 큰 변화가 올 수 있습니다',
            '일주-시주': '배우자나 자녀 관계에서 신경 쓸 일이 있습니다',
          }
          const key = `${pillarNames[i]}-${pillarNames[j]}`
          interactions.push({
            type: 'clash',
            description: `${pillarNames[i]}↔${pillarNames[j]} 충(衝)`,
            effect: clashEffects[key] || '변화와 도전의 에너지가 있습니다',
          })
        }
      }
    }
  }

  // 지지합 체크
  for (let i = 0; i < branchList.length; i++) {
    for (let j = i + 1; j < branchList.length; j++) {
      for (const [a, b] of BRANCH_COMBINATIONS) {
        if ((branchList[i] === a && branchList[j] === b) || (branchList[i] === b && branchList[j] === a)) {
          interactions.push({
            type: 'combine',
            description: `${pillarNames[i]}↔${pillarNames[j]} 합(合)`,
            effect: '조화로운 에너지가 흘러 좋은 인연과 기회가 따릅니다',
          })
        }
      }
    }
  }

  // 천간합 체크
  for (let i = 0; i < stemList.length; i++) {
    for (let j = i + 1; j < stemList.length; j++) {
      for (const [a, b] of STEM_COMBINATIONS) {
        if ((stemList[i] === a && stemList[j] === b) || (stemList[i] === b && stemList[j] === a)) {
          interactions.push({
            type: 'combine',
            description: `${pillarNames[i]}↔${pillarNames[j]} 천간합`,
            effect: '천간의 조화로 귀인의 도움이나 좋은 기회를 만납니다',
          })
        }
      }
    }
  }

  // 지지형 체크
  for (let i = 0; i < branchList.length; i++) {
    for (let j = i + 1; j < branchList.length; j++) {
      for (const [a, b] of BRANCH_PENALTIES) {
        if ((branchList[i] === a && branchList[j] === b) || (branchList[i] === b && branchList[j] === a)) {
          interactions.push({
            type: 'penalty',
            description: `${pillarNames[i]}↔${pillarNames[j]} 형(刑)`,
            effect: '갈등이나 시련이 있지만, 이를 통해 성장할 수 있습니다',
          })
        }
      }
    }
  }

  return interactions
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
          // 충이면 양쪽 지지 오행 0.3 감소
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
// 월운(月運) 계산
// ═══════════════════════════════════════════════
function getMonthlyFortunes(dayMasterElement: number, dayMasterYY: number, currentYear: number): MonthlyFortune[] {
  const fortunes: MonthlyFortune[] = []
  const yearStem = ((currentYear - 4) % 10 + 10) % 10

  const keywords: Record<number, { good: string; bad: string }> = {
    0: { good: '성장과 도약', bad: '무리한 확장 주의' },
    1: { good: '열정과 표현', bad: '감정 조절 필요' },
    2: { good: '안정과 수확', bad: '변화에 둔감 주의' },
    3: { good: '결단과 정리', bad: '대인관계 마찰 주의' },
    4: { good: '지혜와 기회', bad: '우유부단함 주의' },
  }

  const advices: string[][] = [
    ['새로운 시작에 좋은 달, 계획을 실행하세요', '과욕은 금물, 현실적 목표를 세우세요'],
    ['자기 표현에 좋은 달, 적극적으로 나서세요', '화를 다스리고 차분하게 대처하세요'],
    ['재물운이 좋은 달, 저축/투자 기회', '지출을 줄이고 허리띠를 졸라매세요'],
    ['직장/사회운이 좋은 달, 승진/인정', '건강에 주의하고 무리하지 마세요'],
    ['학습/자기계발에 좋은 달, 공부하세요', '결정을 미루지 말고 행동하세요'],
  ]

  for (let m = 1; m <= 12; m++) {
    // Calculate month pillar for this month
    const startStems = [2, 4, 6, 8, 0]
    const monthStemStart = startStems[yearStem % 5]

    // Get month index based on solar month
    let mi = 0
    const MONTH_BOUNDS_SIMPLE = [2,3,4,5,6,7,8,9,10,11,12,1]
    for (let i = 11; i >= 0; i--) {
      if (m >= MONTH_BOUNDS_SIMPLE[i]) { mi = i; break }
    }

    const monthStem = (monthStemStart + mi) % 10
    const monthElement = STEM_ELEMENT[monthStem]
    const monthYY = STEM_YINYANG[monthStem]

    // Calculate relationship
    const rel = ((monthElement - dayMasterElement) % 5 + 5) % 5

    // Base rating from relationship
    let rating: number
    const sameYY = dayMasterYY === monthYY

    if (rel === 0) rating = 3          // 비겁 - 경쟁/협력
    else if (rel === 1) rating = 4     // 식상 - 표현/창작
    else if (rel === 2) rating = sameYY ? 5 : 4  // 재성 - 재물
    else if (rel === 3) rating = sameYY ? 2 : 3  // 관성 - 변화/압박
    else rating = sameYY ? 3 : 4       // 인성 - 학습/귀인

    const isGood = rating >= 4
    const kw = keywords[monthElement]

    fortunes.push({
      month: m,
      rating,
      keyword: isGood ? kw.good : kw.bad,
      advice: isGood ? advices[monthElement][0] : advices[monthElement][1],
      isBest: false,
      isWorst: false,
    })
  }

  // Mark best and worst months
  const maxRating = Math.max(...fortunes.map(f => f.rating))
  const minRating = Math.min(...fortunes.map(f => f.rating))
  fortunes.forEach(f => {
    if (f.rating === maxRating) f.isBest = true
    if (f.rating === minRating) f.isWorst = true
  })

  return fortunes
}

// ═══════════════════════════════════════════════
// 대운(大運) 계산
// ═══════════════════════════════════════════════
function getMajorLuckCycles(
  monthPillar: Pillar,
  yearStemYY: number,
  gender: 'male' | 'female',
  birthYear: number,
  dayMasterElement: number,
  currentYear: number
): MajorLuck[] {
  // 대운 방향: 양남음녀 = 순행(+1), 음남양녀 = 역행(-1)
  const isForward = (yearStemYY === 1 && gender === 'male') || (yearStemYY === 0 && gender === 'female')
  const direction = isForward ? 1 : -1

  const lucks: MajorLuck[] = []
  const currentAge = currentYear - birthYear

  // 대운 시작 나이 (간략화: 성별/음양에 따라 2~8세 사이)
  const startAge = gender === 'male' ? (isForward ? 3 : 4) : (isForward ? 4 : 3)

  const majorKeywords: Record<number, string[]> = {
    0: ['성장기', '발전운'],
    1: ['활동기', '표현운'],
    2: ['안정기', '수확운'],
    3: ['결실기', '정리운'],
    4: ['준비기', '축적운'],
  }

  for (let i = 0; i < 8; i++) {
    const age = startAge + i * 10
    const stemIdx = ((monthPillar.stem + direction * (i + 1)) % 10 + 10) % 10
    const branchIdx = ((monthPillar.branch + direction * (i + 1)) % 12 + 12) % 12
    const element = STEM_ELEMENT[stemIdx]

    // Rating based on element relationship with day master
    const rel = ((element - dayMasterElement) % 5 + 5) % 5
    let rating: number
    if (rel === 0) rating = 3
    else if (rel === 1) rating = 4
    else if (rel === 2) rating = 5
    else if (rel === 3) rating = 2
    else rating = 4

    const kws = majorKeywords[element]
    const isCurrent = currentAge >= age && currentAge < age + 10

    lucks.push({
      startAge: age,
      endAge: age + 9,
      stem: stemIdx,
      branch: branchIdx,
      element,
      rating,
      keyword: kws[rating >= 4 ? 0 : 1],
      isCurrent,
    })
  }

  return lucks
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

  const currentYear = new Date().getFullYear()
  const monthlyFortunes = getMonthlyFortunes(dayMasterElement, dayMasterYinYang, currentYear)
  const majorLucks = getMajorLuckCycles(
    monthPillar, STEM_YINYANG[yearPillar.stem], gender, year, dayMasterElement, currentYear
  )
  const currentMonth = new Date().getMonth() + 1
  const currentMonthFortune = monthlyFortunes.find(f => f.month === currentMonth) || null

  const pillarInteractions = analyzePillarInteractions(pillars)

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
    monthlyFortunes,
    majorLucks,
    pillarInteractions,
    currentMonthFortune,
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

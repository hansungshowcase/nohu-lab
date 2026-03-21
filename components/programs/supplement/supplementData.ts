// ── 영양제 데이터베이스 + 추천 로직 ──

export interface Supplement {
  id: string
  name: string
  nameEn: string
  icon: string
  color: string
  benefits: string[]
  description: string
  dosage: string
  timing: ('morning' | 'lunch' | 'evening' | 'bedtime')[]
  timingNote: string
  buyTip: string
  caution?: string
}

export const supplements: Record<string, Supplement> = {
  'vitamin-d': {
    id: 'vitamin-d',
    name: '비타민D',
    nameEn: 'Vitamin D3',
    icon: '☀️',
    color: '#F59E0B',
    benefits: ['뼈·치아 건강', '면역력 강화', '우울감 완화'],
    description: '한국인의 약 80%가 부족한 영양소입니다. 실내 생활이 많거나 자외선 차단제를 바르면 체내 합성이 어렵습니다. 뼈 건강뿐 아니라 면역력과 기분 조절에도 중요한 역할을 합니다.',
    dosage: '1,000~2,000 IU (1정)',
    timing: ['morning'],
    timingNote: '식후 복용 (지용성)',
    buyTip: 'D3(콜레칼시페롤) 형태 선택, 오일 캡슐이 흡수율 높음',
  },
  'omega3': {
    id: 'omega3',
    name: '오메가3',
    nameEn: 'Omega-3 (EPA/DHA)',
    icon: '🐟',
    color: '#3B82F6',
    benefits: ['혈관 건강', '눈 건조 개선', '뇌 기능 지원'],
    description: '혈중 중성지방을 낮추고 혈관을 깨끗하게 유지합니다. DHA는 뇌와 망막의 주요 구성 성분으로 눈 건강과 인지 기능에 도움을 줍니다.',
    dosage: 'EPA+DHA 1,000mg (1~2캡슐)',
    timing: ['morning', 'evening'],
    timingNote: '식후 복용 (지용성)',
    buyTip: 'rTG 형태가 흡수율 최고, EPA+DHA 합산 함량 확인',
    caution: '혈액희석제 복용 시 의사 상담 필요',
  },
  'magnesium': {
    id: 'magnesium',
    name: '마그네슘',
    nameEn: 'Magnesium',
    icon: '🌙',
    color: '#8B5CF6',
    benefits: ['수면 질 개선', '근육 이완', '스트레스 완화'],
    description: '300가지 이상의 효소 반응에 관여하는 필수 미네랄입니다. 근육 경련, 눈떨림, 수면 장애가 있다면 마그네슘 부족을 의심해볼 수 있습니다.',
    dosage: '300~400mg (1정)',
    timing: ['bedtime'],
    timingNote: '취침 30분 전',
    buyTip: '글리시네이트 또는 비스글리시네이트 형태 추천 (위장 부담 적음)',
  },
  'vitamin-b': {
    id: 'vitamin-b',
    name: '비타민B군',
    nameEn: 'Vitamin B Complex',
    icon: '⚡',
    color: '#EF4444',
    benefits: ['에너지 대사', '만성 피로 개선', '신경 기능'],
    description: '8가지 비타민B가 함께 작용하여 음식을 에너지로 바꾸는 과정을 돕습니다. 스트레스·음주·카페인이 많으면 B군 소모가 빨라집니다.',
    dosage: 'B군 복합제 1정',
    timing: ['morning'],
    timingNote: '아침 식후 (저녁 복용 시 수면 방해 가능)',
    buyTip: '활성형(메틸코발라민, 엽산메틸) 포함 제품 권장',
  },
  'vitamin-c': {
    id: 'vitamin-c',
    name: '비타민C',
    nameEn: 'Vitamin C',
    icon: '🍊',
    color: '#F97316',
    benefits: ['면역력 강화', '피부 건강', '항산화'],
    description: '강력한 항산화제로 면역 세포를 활성화하고 콜라겐 합성을 촉진합니다. 수용성이라 체내에 저장되지 않으므로 매일 보충이 필요합니다.',
    dosage: '500~1,000mg (1~2정)',
    timing: ['morning', 'evening'],
    timingNote: '식후 복용',
    buyTip: '위가 약하면 에스터-C(완충형) 선택, 나누어 복용이 효과적',
  },
  'probiotics': {
    id: 'probiotics',
    name: '유산균',
    nameEn: 'Probiotics',
    icon: '🦠',
    color: '#10B981',
    benefits: ['장 건강', '소화 개선', '면역력 지원'],
    description: '장내 유익균을 보충하여 소화 흡수를 돕고 면역력의 70%를 담당하는 장 환경을 개선합니다. 항생제 복용 후 특히 중요합니다.',
    dosage: '100억 CFU 이상 (1캡슐)',
    timing: ['morning'],
    timingNote: '아침 공복 또는 식전',
    buyTip: '보장균수 100억 이상, 장까지 도달하는 코팅 캡슐 선택',
  },
  'lutein': {
    id: 'lutein',
    name: '루테인',
    nameEn: 'Lutein & Zeaxanthin',
    icon: '👁️',
    color: '#06B6D4',
    benefits: ['눈 건강', '황반변성 예방', '블루라이트 차단'],
    description: '눈의 황반부를 구성하는 핵심 성분으로, 나이가 들수록 체내 함량이 줄어듭니다. 스마트폰·PC 사용이 많은 현대인에게 특히 필요합니다.',
    dosage: '20mg (1캡슐)',
    timing: ['morning'],
    timingNote: '식후 복용 (지용성)',
    buyTip: '루테인 20mg + 지아잔틴 4mg 복합 제품 권장',
  },
  'zinc': {
    id: 'zinc',
    name: '아연',
    nameEn: 'Zinc',
    icon: '🛡️',
    color: '#6366F1',
    benefits: ['면역력 강화', '피부·모발 건강', '상처 회복'],
    description: '면역 세포 생성과 피부 재생에 필수적인 미네랄입니다. 탈모, 손톱 갈라짐, 입안 염증이 잦다면 아연 부족 신호일 수 있습니다.',
    dosage: '15~30mg (1정)',
    timing: ['evening'],
    timingNote: '식후 복용',
    buyTip: '아연 피콜리네이트 또는 비스글리시네이트 형태가 흡수율 높음',
  },
  'iron': {
    id: 'iron',
    name: '철분',
    nameEn: 'Iron (Ferrous)',
    icon: '🩸',
    color: '#DC2626',
    benefits: ['빈혈 예방', '피로 개선', '산소 운반'],
    description: '혈액 속 헤모글로빈의 핵심 성분으로 산소를 온몸에 전달합니다. 여성은 월경으로 철분 손실이 많아 보충이 특히 중요합니다.',
    dosage: '12~18mg (1정)',
    timing: ['morning'],
    timingNote: '공복 복용 권장 (비타민C와 함께)',
    buyTip: '비스글리시네이트 철분이 위장 자극 적음, 비타민C와 함께 복용',
    caution: '칼슘·유제품과 2시간 간격',
  },
  'calcium': {
    id: 'calcium',
    name: '칼슘',
    nameEn: 'Calcium',
    icon: '🦴',
    color: '#78716C',
    benefits: ['뼈·골다공증 예방', '치아 건강', '근육 기능'],
    description: '뼈와 치아의 99%를 구성하는 미네랄입니다. 30대 이후 골밀도가 매년 감소하므로 꾸준한 보충이 중요합니다. 비타민D와 함께 복용하면 흡수율이 높아집니다.',
    dosage: '500~600mg (1~2정)',
    timing: ['evening'],
    timingNote: '식후 복용 (비타민D와 함께)',
    buyTip: '구연산칼슘이 탄산칼슘보다 흡수율 높음, 1회 500mg 이하로 나눠 복용',
    caution: '철분과 2시간 간격',
  },
  'coq10': {
    id: 'coq10',
    name: '코엔자임Q10',
    nameEn: 'Coenzyme Q10',
    icon: '❤️',
    color: '#E11D48',
    benefits: ['심장 건강', '세포 에너지 생성', '항산화'],
    description: '모든 세포의 에너지 공장(미토콘드리아)에서 필수적인 성분입니다. 40대부터 체내 생산이 급격히 줄어들어 보충이 필요합니다. 심장 건강과 항노화에 도움을 줍니다.',
    dosage: '100~200mg (1캡슐)',
    timing: ['morning'],
    timingNote: '식후 복용 (지용성)',
    buyTip: '환원형(유비퀴놀)이 산화형(유비퀴논)보다 흡수율 높음',
  },
  'collagen': {
    id: 'collagen',
    name: '콜라겐',
    nameEn: 'Collagen Peptide',
    icon: '✨',
    color: '#EC4899',
    benefits: ['피부 탄력', '관절 건강', '모발·손톱 강화'],
    description: '피부, 뼈, 관절의 구조를 이루는 단백질입니다. 25세 이후 매년 1%씩 감소하여 주름, 관절 불편감의 원인이 됩니다. 저분자 펩타이드 형태가 흡수에 유리합니다.',
    dosage: '2,000~5,000mg (1포)',
    timing: ['bedtime'],
    timingNote: '취침 전 공복',
    buyTip: '저분자 피쉬콜라겐 펩타이드(1,000Da 이하) 권장',
  },
  'milk-thistle': {
    id: 'milk-thistle',
    name: '밀크씨슬',
    nameEn: 'Milk Thistle (Silymarin)',
    icon: '🍀',
    color: '#22C55E',
    benefits: ['간 해독', '간 세포 보호', '피로 회복'],
    description: '실리마린 성분이 간 세포막을 보호하고 해독 기능을 돕습니다. 음주가 잦거나 약물 복용이 많은 분에게 특히 권장됩니다.',
    dosage: '실리마린 130mg (1정)',
    timing: ['morning', 'evening'],
    timingNote: '식후 복용',
    buyTip: '실리마린 함량 130mg 이상 건강기능식품 인증 제품 선택',
  },
  'glucosamine': {
    id: 'glucosamine',
    name: '글루코사민',
    nameEn: 'Glucosamine',
    icon: '🦿',
    color: '#0EA5E9',
    benefits: ['관절 연골 보호', '관절 통증 완화', '관절 유연성'],
    description: '관절 연골의 구성 성분을 직접 보충합니다. 계단 오르내리기, 무릎 통증이 있다면 조기에 복용을 시작하는 것이 좋습니다. 효과를 느끼려면 최소 8주 이상 꾸준히 복용하세요.',
    dosage: '1,500mg (2~3정)',
    timing: ['morning', 'lunch'],
    timingNote: '식후 나누어 복용',
    buyTip: '글루코사민 황산염 1,500mg + MSM 복합 제품 권장',
  },
  'rclub': {
    id: 'rclub',
    name: '홍국',
    nameEn: 'Red Yeast Rice',
    icon: '🔴',
    color: '#B91C1C',
    benefits: ['콜레스테롤 관리', '혈관 건강'],
    description: '천연 모나콜린K 성분이 LDL 콜레스테롤 수치를 낮추는 데 도움을 줍니다. 건강검진에서 콜레스테롤 수치가 높게 나왔다면 고려해볼 수 있습니다.',
    dosage: '모나콜린K 4mg (1정)',
    timing: ['evening'],
    timingNote: '저녁 식후',
    buyTip: '모나콜린K 함량 표기 제품, 건강기능식품 인증 확인',
    caution: '스타틴 계열 약물과 병용 주의',
  },
}

// ── 질문 답변 타입 ──
export interface Answers {
  gender: 'm' | 'f'
  age: '20' | '30' | '40' | '50' | '60'
  pregnant: 'y' | 'n'
  sleep: '1' | '2' | '3' | '4'
  exercise: '1' | '2' | '3' | '4'
  alcohol: '1' | '2' | '3' | '4'
  smoking: '1' | '2' | '3'
  sunlight: '1' | '2' | '3'
  concerns: string[]
  medications: string[]
}

// ── URL 인코딩/디코딩 ──
export function encodeAnswers(a: Answers): string {
  const params = new URLSearchParams()
  params.set('g', a.gender)
  params.set('age', a.age)
  if (a.gender === 'f') params.set('preg', a.pregnant)
  params.set('sl', a.sleep)
  params.set('ex', a.exercise)
  params.set('al', a.alcohol)
  params.set('sm', a.smoking)
  params.set('sun', a.sunlight)
  if (a.concerns.length > 0) params.set('c', a.concerns.join(','))
  if (a.medications.length > 0) params.set('med', a.medications.join(','))
  return params.toString()
}

export function decodeAnswers(params: URLSearchParams): Answers | null {
  const g = params.get('g')
  const age = params.get('age')
  if (!g || !age) return null
  return {
    gender: g as Answers['gender'],
    age: age as Answers['age'],
    pregnant: (params.get('preg') || 'n') as Answers['pregnant'],
    sleep: (params.get('sl') || '3') as Answers['sleep'],
    exercise: (params.get('ex') || '2') as Answers['exercise'],
    alcohol: (params.get('al') || '1') as Answers['alcohol'],
    smoking: (params.get('sm') || '1') as Answers['smoking'],
    sunlight: (params.get('sun') || '2') as Answers['sunlight'],
    concerns: params.get('c')?.split(',').filter(Boolean) || [],
    medications: params.get('med')?.split(',').filter(Boolean) || [],
  }
}

// ── 추천 결과 타입 ──
export interface RecommendedSupplement {
  supplement: Supplement
  score: number
  priority: 'essential' | 'recommended' | 'optional'
  reasons: string[]
}

// ── 추천 로직 (약사 수준 교차 분석) ──
export function getRecommendations(answers: Answers): RecommendedSupplement[] {
  const scores: Record<string, { score: number; reasons: string[] }> = {}
  const warnings: Record<string, string[]> = {}

  function add(id: string, pts: number, reason: string) {
    if (!scores[id]) scores[id] = { score: 0, reasons: [] }
    scores[id].score += pts
    if (!scores[id].reasons.includes(reason)) scores[id].reasons.push(reason)
  }
  function warn(id: string, msg: string) {
    if (!warnings[id]) warnings[id] = []
    if (!warnings[id].includes(msg)) warnings[id].push(msg)
  }
  function exclude(id: string, reason: string) {
    scores[id] = { score: -999, reasons: [reason] }
  }

  const age = Number(answers.age)
  const isFemale = answers.gender === 'f'
  const isPregnant = isFemale && answers.pregnant === 'y'
  const poorSleep = answers.sleep === '1' || answers.sleep === '2'
  const noExercise = answers.exercise === '1'
  const heavyExercise = answers.exercise === '3' || answers.exercise === '4'
  const heavyDrinker = answers.alcohol === '3' || answers.alcohol === '4'
  const moderateDrinker = answers.alcohol === '2'
  const currentSmoker = answers.smoking === '3'
  const exSmoker = answers.smoking === '2'
  const lowSun = answers.sunlight === '1'
  const midSun = answers.sunlight === '2'
  const concerns = new Set(answers.concerns)
  const meds = new Set(answers.medications)

  // ================================================================
  // 1. 연령대별 기초 점수 (근거 기반)
  // ================================================================
  // 비타민D: 한국 국민건강영양조사 기준 전 연령 70~80% 부족
  add('vitamin-d', 15, '한국인 10명 중 8명이 부족한 필수 영양소')
  if (age >= 40) {
    add('vitamin-d', 10, '40대 이후 피부의 비타민D 합성 능력 50% 감소')
    add('omega3', 15, '중장년기 심혈관 질환 예방에 필수')
    add('coq10', 12, '40대부터 체내 CoQ10 생산량 급감 (20대 대비 약 40% 감소)')
  }
  if (age >= 50) {
    add('vitamin-b', 18, '50대 이후 위산 분비 감소로 B12 흡수율 저하')
    add('calcium', 15, '50대 이후 연간 골밀도 0.5~1% 감소')
    add('glucosamine', 15, '연골 마모가 진행되는 시기, 관절 보호 필요')
    add('coq10', 8, '50대 CoQ10 수치 20대의 절반 수준')
    add('omega3', 5, '인지 기능 저하 예방 — DHA가 뇌세포막의 주요 구성')
  }
  if (age >= 60) {
    add('vitamin-d', 10, '60대 이상 피부 합성 능력 20대의 25% 수준')
    add('vitamin-b', 10, '고령자 B12 결핍률 10~30% — 신경 손상 예방')
    add('calcium', 10, '골절 위험이 급증하는 시기')
    add('probiotics', 10, '고령자 장내 유익균 다양성 감소')
    add('glucosamine', 10, '퇴행성 관절염 예방·관리')
  }
  if (age <= 30) {
    add('vitamin-b', 8, '활발한 대사를 위한 에너지 보조')
    add('vitamin-c', 8, '젊은 층 면역 기초 체력 유지')
  }

  // ================================================================
  // 2. 성별 맞춤 (내분비학·산부인과학 근거)
  // ================================================================
  if (isFemale) {
    add('iron', 20, '월경으로 매월 철분 15~30mg 손실 — 가임기 여성 필수')
    add('calcium', 8, '여성 골다공증 발생률 남성의 4배')
    if (age >= 40) {
      add('collagen', 12, '에스트로겐 감소로 콜라겐 분해 가속화')
      add('calcium', 10, '폐경 전후 골밀도 급감기 대비')
    }
    if (age >= 50) {
      add('iron', -15, '폐경 후 철분 필요량 감소 — 과잉 섭취 주의')
      add('calcium', 10, '폐경 후 5~7년간 골밀도 연 2~3% 급감')
      add('vitamin-d', 8, '에스트로겐 감소 시 비타민D 대사 변화')
    }
  }
  if (answers.gender === 'm') {
    add('zinc', 12, '남성 전립선 건강과 테스토스테론 합성에 아연 필수')
    if (age >= 40) {
      add('omega3', 8, '남성 심혈관 질환 위험이 여성보다 10년 일찍 증가')
      add('coq10', 8, '남성 심장 근육 에너지 대사 지원')
    }
  }

  // ── 임신·수유 (산부인과·약학 가이드라인) ──
  if (isPregnant) {
    add('iron', 25, '임신 중 혈액량 50% 증가 — 철분 권장량 24mg/일로 상향')
    add('omega3', 20, '태아 뇌·망막 발달에 DHA 필수 (하루 200~300mg)')
    add('vitamin-d', 15, '태아 골격 형성 + 임신성 당뇨 예방')
    add('calcium', 12, '태아 뼈 형성에 하루 1,000mg 필요')
    add('probiotics', 10, '임신 중 질내 환경 변화 — 유산균으로 균형 유지')
    // 임신 중 금기 영양제
    exclude('rclub', '임신 중 금기 — 모나콜린K가 태아 발달에 영향 가능')
    exclude('milk-thistle', '임신 중 안전성 미확인 — 복용 금지 권고')
    // 임신 중 용량 주의
    warn('vitamin-c', '임신 중 비타민C는 하루 1,000mg 이하로 제한하세요')
  }

  // ================================================================
  // 3. 생활습관 분석 (영양역학 근거)
  // ================================================================

  // ── 수면 ──
  if (answers.sleep === '1') {
    add('magnesium', 25, '수면 5시간 이하 — 마그네슘이 GABA 수용체 활성화로 수면 유도')
    add('vitamin-b', 12, '수면 부족 시 B6가 세로토닌·멜라토닌 합성에 관여')
    add('vitamin-c', 5, '수면 부족에 의한 산화 스트레스 증가')
  } else if (answers.sleep === '2') {
    add('magnesium', 15, '수면 6~7시간 — 수면의 질 개선에 마그네슘 도움')
    add('vitamin-b', 5, '피로 누적 방지를 위한 B군 보충')
  }

  // ── 운동 ──
  if (noExercise) {
    add('vitamin-d', 12, '운동 부족 시 근감소증 위험 — 비타민D가 근육 기능 유지')
    add('vitamin-b', 8, '신체 활동 저하로 대사 기능 둔화')
    if (age >= 50) add('calcium', 8, '운동 부족 + 고령 = 골다공증 위험 상승')
  }
  if (heavyExercise) {
    add('magnesium', 12, '격한 운동 시 땀으로 마그네슘 손실 (운동 1시간당 ~15mg)')
    add('coq10', 10, '고강도 운동 시 미토콘드리아 에너지 수요 급증')
    add('zinc', 8, '운동 선수는 비운동인 대비 아연 필요량 약 25% 증가')
    add('vitamin-c', 8, '운동에 의한 활성산소 증가 — 항산화 보호')
    add('omega3', 5, '운동 후 근육 염증 회복 촉진')
    if (isFemale) add('iron', 10, '여성 운동인은 발바닥 충격에 의한 용혈성 철분 손실 추가')
  }

  // ── 음주 (간장약학·영양학 근거) ──
  if (heavyDrinker) {
    add('milk-thistle', 30, '주 1회 이상 음주 — 실리마린이 알코올에 의한 간 세포 손상 보호')
    add('vitamin-b', 18, '알코올이 B1(티아민)·B6·B9(엽산) 흡수를 직접 방해')
    add('zinc', 12, '만성 음주자의 30~50%가 아연 결핍 — 간 재생에 필수')
    add('magnesium', 10, '알코올의 이뇨 작용으로 마그네슘 소변 배출 증가')
    add('vitamin-c', 8, '알코올 대사 과정에서 생성되는 아세트알데히드 해독')
    if (answers.alcohol === '4') {
      add('milk-thistle', 10, '주 3회 이상 음주 — 간 수치(AST/ALT) 상승 위험')
      add('probiotics', 8, '과음이 장 점막 손상 → 장누수증후군 위험')
    }
  } else if (moderateDrinker) {
    add('milk-thistle', 12, '월 1~2회 음주에도 간 보호 보조')
    add('vitamin-b', 5, '음주 시 B군 일시적 소모')
  }

  // ── 흡연 (호흡기약학·영양역학 근거) ──
  if (currentSmoker) {
    add('vitamin-c', 28, '흡연자는 비흡연자 대비 비타민C 필요량 35mg/일 추가 (FDA 권고)')
    add('omega3', 12, '니코틴에 의한 혈관 내피세포 손상 보호')
    add('coq10', 12, '담배 연기의 활성산소가 CoQ10을 직접 파괴')
    add('vitamin-d', 8, '흡연이 비타민D 대사를 방해 — 혈중 농도 저하')
    add('zinc', 8, '흡연자 아연 수치 비흡연자 대비 약 15% 낮음')
    // 흡연 + 음주 복합
    if (heavyDrinker) {
      add('vitamin-c', 10, '흡연+음주 조합 — 산화 스트레스 시너지 효과로 비타민C 고갈 가속')
      add('milk-thistle', 8, '흡연+음주 간 독성 복합 부담')
    }
  } else if (exSmoker) {
    add('vitamin-c', 12, '금연 후에도 폐 조직 회복에 비타민C 필요 (회복기 1~5년)')
    add('omega3', 5, '흡연 시절 손상된 혈관벽 회복 지원')
  }

  // ── 햇빛 노출 ──
  if (lowSun) {
    add('vitamin-d', 28, '하루 햇빛 30분 미만 — 체내 합성 불가, 보충제 필수')
    if (age >= 50) add('vitamin-d', 8, '고령 + 실내 생활 = 비타민D 결핍 고위험군')
    if (isFemale) add('vitamin-d', 5, '자외선 차단제·긴 옷 착용 시 합성 90% 이상 차단')
  } else if (midSun) {
    add('vitamin-d', 10, '30분~1시간 노출로도 겨울·장마철에는 합성 부족 가능')
  }

  // ================================================================
  // 4. 건강 고민별 근거 기반 추천
  // ================================================================
  if (concerns.has('fatigue')) {
    add('vitamin-b', 25, '만성 피로 — B1·B2·B3가 TCA 회로(에너지 생산)의 필수 조효소')
    add('coq10', 18, '세포 에너지 공장(미토콘드리아) 전자전달계의 핵심 성분')
    add('iron', 12, '원인불명 피로의 20%는 잠복 빈혈(페리틴 저하)이 원인')
    add('vitamin-d', 8, '비타민D 부족 시 근육 무력감·만성 피로 증상')
    add('magnesium', 8, '마그네슘 결핍 시 ATP 생산 저하 → 피로')
    // 교차: 피로 + 수면부족
    if (poorSleep) add('magnesium', 8, '수면 부족이 피로를 악화 — 수면 질 개선이 우선')
    // 교차: 피로 + 여성
    if (isFemale && age <= 50) add('iron', 10, '가임기 여성 피로의 흔한 원인: 철 결핍성 빈혈')
  }

  if (concerns.has('insomnia')) {
    add('magnesium', 28, '수면 장애 — 마그네슘이 NMDA 수용체 억제·GABA 활성화로 수면 유도')
    add('vitamin-b', 12, 'B6가 트립토판 → 세로토닌 → 멜라토닌 전환 촉진')
    add('probiotics', 8, '장-뇌 축(Gut-Brain Axis): 장내 미생물이 세로토닌 90% 생산')
    // 교차: 불면 + 스트레스
    if (concerns.has('stress')) add('magnesium', 8, '스트레스성 불면 — 코르티솔 억제 효과')
  }

  if (concerns.has('joint')) {
    add('glucosamine', 28, '관절 — 글루코사민이 연골 기질(프로테오글리칸) 합성 촉진')
    add('collagen', 18, '제2형 콜라겐이 관절 연골의 주성분 (건조중량의 50%)')
    add('vitamin-d', 12, '비타민D 부족 시 관절 주변 근력 약화 → 관절 부담 증가')
    add('omega3', 10, 'EPA가 관절 염증 매개물질(PGE2) 생성 억제')
    add('calcium', 8, '관절 주변 뼈 강도 유지')
    // 교차: 관절 + 50대 이상
    if (age >= 50) add('glucosamine', 10, '50대 이상 퇴행성 관절염 유병률 급증')
    // 교차: 관절 + 운동 부족
    if (noExercise) add('vitamin-d', 5, '운동 부족 시 관절 주변 근육 약화 가속')
  }

  if (concerns.has('eye')) {
    add('lutein', 32, '눈 건강 — 루테인이 황반부 색소 밀도 증가시켜 청색광 차단')
    add('omega3', 18, 'DHA가 망막 광수용체 세포막의 60% 구성 — 안구건조증에도 효과')
    add('vitamin-c', 8, '수정체 내 비타민C 농도는 혈중의 15배 — 백내장 예방')
    add('zinc', 8, '아연이 비타민A → 레티날 전환에 필수 (야간 시력)')
    // 교차: 눈 + 40대 이상
    if (age >= 40) add('lutein', 8, '40대 이후 황반색소 밀도 자연 감소')
  }

  if (concerns.has('digestion')) {
    add('probiotics', 32, '소화·장 건강 — 유산균이 병원성 세균 억제 + 소화효소 분비 촉진')
    add('zinc', 12, '아연이 장 점막 세포 재생과 장벽 기능(Tight Junction) 유지에 필수')
    add('vitamin-b', 8, 'B1이 위장 운동 신경 기능에 관여')
    add('glutamine', 5, '장 점막 세포의 주요 에너지원')
    // 교차: 소화 + 음주
    if (heavyDrinker) add('probiotics', 8, '알코올이 장 점막 손상 → 장누수 위험')
  }

  if (concerns.has('skin')) {
    add('collagen', 25, '피부·모발 — 저분자 콜라겐 펩타이드가 진피층 콜라겐 합성 자극')
    add('vitamin-c', 18, '비타민C가 프롤린하이드록실라제 활성화 → 콜라겐 3중 나선 구조 형성 필수')
    add('zinc', 15, '아연 결핍 시 탈모·피부염·상처 치유 지연 — 케라틴 합성에 관여')
    add('omega3', 8, '피부 장벽(세라마이드) 유지, 건조·염증 완화')
    add('probiotics', 8, '장-피부 축(Gut-Skin Axis): 장내 환경이 피부 염증에 영향')
    // 교차: 피부 + 여성 40대+
    if (isFemale && age >= 40) add('collagen', 10, '폐경기 에스트로겐 감소 → 피부 콜라겐 연 2% 감소')
  }

  if (concerns.has('immunity')) {
    add('vitamin-c', 22, '면역 — 호중구·림프구의 기능과 증식에 비타민C 필수')
    add('vitamin-d', 22, '비타민D가 카텔리시딘(항균 펩타이드) 생산 촉진 → 선천 면역 강화')
    add('zinc', 18, '아연 결핍 시 T세포 성숙 장애 — 감염 취약성 2~3배 증가')
    add('probiotics', 12, '장 관련 림프 조직(GALT)이 면역 세포의 70% 보유')
    add('vitamin-b', 5, 'B6·B12가 항체(면역글로불린) 생산에 관여')
    // 교차: 면역 + 수면부족
    if (poorSleep) add('zinc', 5, '수면 부족 시 면역 기능 40~60% 저하 — 아연이 NK세포 활성화')
  }

  if (concerns.has('cardiovascular')) {
    add('omega3', 28, '심혈관 — EPA/DHA가 중성지방 15~30% 감소 (FDA 인정 건강강조표시)')
    add('coq10', 22, 'CoQ10이 심근 세포 에너지 생산 + 혈관 내피 기능 개선')
    add('rclub', 20, '모나콜린K가 HMG-CoA 환원효소 억제 → LDL 콜레스테롤 감소')
    add('magnesium', 10, '마그네슘이 혈관 평활근 이완 → 혈압 조절 보조')
    add('vitamin-d', 8, '비타민D 결핍 시 고혈압·심혈관 질환 위험 증가')
    // 교차: 심혈관 + 흡연
    if (currentSmoker) add('omega3', 8, '흡연에 의한 동맥경화 가속 — EPA의 항염 효과')
    // 교차: 심혈관 + 남성 40대+
    if (answers.gender === 'm' && age >= 40) add('coq10', 8, '남성 40대+ 심근경색 위험 상승기')
  }

  if (concerns.has('stress')) {
    add('magnesium', 28, '스트레스 — 마그네슘이 HPA축(시상하부-뇌하수체-부신) 과활성 억제')
    add('vitamin-b', 22, '스트레스 시 부신에서 B5(판토텐산) 대량 소비 — B군 전체 보충 필요')
    add('vitamin-c', 12, '부신에서 코르티솔 합성 시 비타민C 사용 → 스트레스 시 고갈')
    add('omega3', 8, 'EPA가 뇌 염증 감소 → 불안 증상 완화 (메타분석 근거)')
    add('probiotics', 8, '장-뇌 축: 유산균이 GABA 생산 → 불안 감소')
    // 교차: 스트레스 + 수면부족
    if (poorSleep) add('vitamin-b', 8, '수면 부족+스트레스 복합 — B군 고갈 가속')
    // 교차: 스트레스 + 음주
    if (heavyDrinker) add('magnesium', 8, '음주+스트레스 — 마그네슘 이중 소실')
  }

  if (concerns.has('menopause')) {
    add('calcium', 22, '갱년기 — 에스트로겐 감소로 파골세포 활성화 → 골 흡수 증가')
    add('vitamin-d', 18, '칼슘 흡수 촉진 + 에스트로겐 대체 골 보호 효과')
    add('omega3', 12, '갱년기 관절통·우울감에 오메가3의 항염·기분 조절 효과')
    add('collagen', 12, '폐경 후 5년간 피부 콜라겐 약 30% 감소')
    add('magnesium', 10, '갱년기 불면·심박항진·근육경련에 마그네슘 효과')
    add('probiotics', 8, '갱년기 질내 pH 변화 → 유산균으로 환경 유지')
    // 교차: 갱년기 + 관절
    if (concerns.has('joint')) add('calcium', 8, '갱년기+관절 문제 = 골관절 동시 관리 필수')
  }

  if (concerns.has('weight')) {
    add('vitamin-b', 15, '체중 관리 — B1·B2·B3이 탄수화물·지방 대사 효소의 조효소')
    add('probiotics', 12, '특정 유산균(L. gasseri 등)이 내장지방 감소에 도움')
    add('vitamin-d', 10, '비타민D 정상 수준 유지 시 체중 감량 효과 향상 (메타분석)')
    add('omega3', 8, '오메가3가 지방세포의 지방산 산화(연소) 촉진')
    add('magnesium', 5, '인슐린 감수성 개선 → 혈당 안정 → 식욕 조절')
    // 교차: 체중 + 운동 부족
    if (noExercise) add('vitamin-b', 5, '운동 없이 식이 조절만 할 경우 B군 보충이 대사 유지에 중요')
  }

  // ================================================================
  // 5. 복합 생활습관 교차 분석 (시너지 효과)
  // ================================================================
  // 수면부족 + 스트레스 + 음주 = 비타민B 삼중 고갈
  if (poorSleep && concerns.has('stress') && heavyDrinker) {
    add('vitamin-b', 15, '수면 부족·스트레스·음주 삼중 복합 — B군 고갈 위험 매우 높음')
  }
  // 실내 생활 + 운동 부족 + 고령 = 비타민D·칼슘 필수
  if (lowSun && noExercise && age >= 50) {
    add('vitamin-d', 10, '실내 생활+운동 부족+고령 — 골다공증 고위험군')
    add('calcium', 10, '복합 위험인자 해당 — 칼슘 적극 보충 권고')
  }
  // 흡연 + 음주 + 스트레스 = 전신 산화 스트레스
  if (currentSmoker && heavyDrinker && concerns.has('stress')) {
    add('vitamin-c', 10, '흡연+음주+스트레스 — 체내 항산화 방어 시스템 과부하')
    add('coq10', 8, '다중 산화 스트레스 원인으로 세포 보호 시급')
  }
  // 여성 + 운동 + 수면 부족 + 피로 = 철분·마그네슘
  if (isFemale && heavyExercise && poorSleep && concerns.has('fatigue')) {
    add('iron', 10, '여성 운동인+수면 부족+피로 — 스포츠 빈혈 가능성 체크')
    add('magnesium', 8, '운동+수면 부족 복합 — 근육 피로 회복 필수')
  }

  // ================================================================
  // 6. 약물 상호작용 (약학·약리학 근거)
  // ================================================================
  if (meds.has('blood-thinner')) {
    warn('omega3', '⚠️ 혈액희석제(아스피린·와파린) + 오메가3: 출혈 시간 연장 위험 — 반드시 담당 의사 상담 후 복용 (용량 조절 필요)')
    warn('coq10', '⚠️ CoQ10이 와파린 효과를 감소시킬 수 있음 — INR 수치 모니터링 필요')
    warn('vitamin-c', '⚠️ 고용량 비타민C(2,000mg+)가 와파린 효과에 영향 — 1,000mg 이하 권장')
    // 은행잎추출물은 DB에 없지만 경고
  }
  if (meds.has('bp-med')) {
    warn('coq10', 'CoQ10이 혈압 강하 효과가 있어 혈압약과 병용 시 저혈압 가능 — 의사와 용량 상의')
    warn('calcium', '칼슘이 일부 혈압약(칼슘채널차단제)의 작용과 상충 가능 — 약사 상담 권장')
    warn('magnesium', '마그네슘이 혈압 강하 효과 — 혈압약과 병용 시 과도한 혈압 저하 주의')
  }
  if (meds.has('diabetes-med')) {
    warn('rclub', '⚠️ 홍국(모나콜린K)이 일부 당뇨약과 상호작용 — 의사 상담 필수')
    warn('omega3', '고용량 오메가3(3g+)가 혈당에 영향 줄 수 있음 — 혈당 모니터링')
    warn('zinc', '아연이 인슐린 기능에 영향 — 당뇨약 용량 조절 필요할 수 있음')
    warn('magnesium', '마그네슘이 인슐린 감수성 변화 — 혈당 체크 병행')
  }
  if (meds.has('multivitamin')) {
    // 종합비타민과 중복 방지 — 점수 감소 + 이유 설명
    if (scores['vitamin-b']) { scores['vitamin-b'].score -= 15; add('vitamin-b', 0, '종합비타민에 B군 포함 — 추가 복용 시 과잉 주의') }
    if (scores['vitamin-c']) { scores['vitamin-c'].score -= 12; add('vitamin-c', 0, '종합비타민에 비타민C 포함 — 합산 1,000mg 이하 권장') }
    if (scores['vitamin-d']) { scores['vitamin-d'].score -= 8; add('vitamin-d', 0, '종합비타민 내 비타민D 함량 확인 후 추가 용량 결정') }
    if (scores['zinc']) { scores['zinc'].score -= 8; add('zinc', 0, '종합비타민에 아연 포함 — 합산 40mg 초과 주의') }
    if (scores['iron']) { scores['iron'].score -= 10; add('iron', 0, '종합비타민에 철분 포함 — 중복 복용 시 위장 장애 위험') }
  }

  // ================================================================
  // 7. 점수 정렬 + 상위 3~5개 선택
  // ================================================================
  const results: RecommendedSupplement[] = Object.entries(scores)
    .filter(([, v]) => v.score >= 20)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 5)
    .map(([id, v]) => {
      const supp = supplements[id]
      if (!supp) return null
      const priority: RecommendedSupplement['priority'] =
        v.score >= 70 ? 'essential' :
        v.score >= 40 ? 'recommended' : 'optional'

      const reasons = [...v.reasons]
      if (warnings[id]) reasons.push(...warnings[id])

      return { supplement: supp, score: v.score, priority, reasons }
    })
    .filter((r): r is RecommendedSupplement => r !== null)

  // 최소 3개 보장
  if (results.length < 3) {
    const defaults = ['vitamin-d', 'vitamin-c', 'magnesium', 'omega3', 'vitamin-b']
    for (const id of defaults) {
      if (results.length >= 3) break
      if (results.some(r => r.supplement.id === id)) continue
      const supp = supplements[id]
      if (supp) {
        results.push({
          supplement: supp,
          score: 25,
          priority: 'optional',
          reasons: ['기본 건강 유지를 위한 범용 영양소'],
        })
      }
    }
  }

  return results
}

// ── 조합 가이드 ──
export interface CombinationTip {
  type: 'good' | 'caution' | 'warning'
  icon: string
  text: string
}

export function getCombinationTips(recs: RecommendedSupplement[], answers: Answers): CombinationTip[] {
  const ids = new Set(recs.map(r => r.supplement.id))
  const meds = new Set(answers.medications)
  const tips: CombinationTip[] = []

  // ── 시너지 조합 (흡수율·효능 향상) ──
  if (ids.has('vitamin-d') && ids.has('calcium')) {
    tips.push({ type: 'good', icon: '✅', text: '비타민D + 칼슘: 비타민D가 장에서 칼슘 흡수율을 30~40% 높여줍니다. 함께 저녁 식후 복용이 가장 효과적입니다.' })
  }
  if (ids.has('iron') && ids.has('vitamin-c')) {
    tips.push({ type: 'good', icon: '✅', text: '철분 + 비타민C: 비타민C가 Fe³⁺(비헴철)을 Fe²⁺로 환원하여 흡수율을 2~6배 높입니다. 아침 공복에 함께 복용하세요.' })
  }
  if (ids.has('collagen') && ids.has('vitamin-c')) {
    tips.push({ type: 'good', icon: '✅', text: '콜라겐 + 비타민C: 비타민C 없이는 콜라겐 3중 나선 구조가 형성되지 않습니다. 콜라겐 복용 시 비타민C는 필수입니다.' })
  }
  if (ids.has('omega3') && ids.has('vitamin-d')) {
    tips.push({ type: 'good', icon: '✅', text: '오메가3 + 비타민D: 둘 다 지용성이므로 기름진 식사 후 함께 복용하면 흡수율이 극대화됩니다.' })
  }
  if (ids.has('omega3') && ids.has('coq10')) {
    tips.push({ type: 'good', icon: '✅', text: '오메가3 + CoQ10: 둘 다 지용성이고 심혈관에 시너지 효과. 아침 식후 함께 복용하세요.' })
  }
  if (ids.has('probiotics') && ids.has('vitamin-d')) {
    tips.push({ type: 'good', icon: '✅', text: '유산균 + 비타민D: 비타민D가 장 점막 면역을 강화하여 유산균 정착을 도울 수 있습니다.' })
  }
  if (ids.has('magnesium') && ids.has('vitamin-b')) {
    tips.push({ type: 'good', icon: '✅', text: '마그네슘 + 비타민B6: B6가 마그네슘의 세포 내 이동을 촉진합니다. 단, 마그네슘은 저녁/취침 전, B군은 아침에 복용하세요.' })
  }
  if (ids.has('zinc') && ids.has('vitamin-c')) {
    tips.push({ type: 'good', icon: '✅', text: '아연 + 비타민C: 면역 시너지 조합. 감기 초기에 함께 복용하면 증상 기간을 단축할 수 있습니다.' })
  }
  if (ids.has('lutein') && ids.has('omega3')) {
    tips.push({ type: 'good', icon: '✅', text: '루테인 + 오메가3: 루테인은 지용성이므로 오메가3 캡슐과 함께 복용하면 흡수율이 높아집니다.' })
  }

  // ── 시간 간격 필요 (흡수 경쟁·상호 방해) ──
  if (ids.has('iron') && ids.has('calcium')) {
    tips.push({ type: 'caution', icon: '⚠️', text: '철분 ↔ 칼슘: 같은 수송체(DMT1)를 사용하여 흡수를 방해합니다. 철분은 아침 공복, 칼슘은 저녁 식후로 분리하세요.' })
  }
  if (ids.has('zinc') && ids.has('iron')) {
    tips.push({ type: 'caution', icon: '⚠️', text: '아연 ↔ 철분: 흡수 경쟁이 심합니다. 철분은 아침, 아연은 저녁으로 시간대를 완전히 분리하세요.' })
  }
  if (ids.has('zinc') && ids.has('calcium')) {
    tips.push({ type: 'caution', icon: '⚠️', text: '아연 ↔ 칼슘: 고용량 칼슘(500mg+)이 아연 흡수를 방해합니다. 2시간 이상 간격을 두세요.' })
  }
  if (ids.has('iron') && ids.has('probiotics')) {
    tips.push({ type: 'caution', icon: '⚠️', text: '철분 ↔ 유산균: 철분이 장내 유해균 증식을 촉진할 수 있어 유산균과 1~2시간 간격 권장합니다.' })
  }
  if (ids.has('magnesium') && ids.has('calcium')) {
    tips.push({ type: 'caution', icon: '⚠️', text: '마그네슘 ↔ 칼슘: 고용량 동시 복용 시 서로 흡수를 방해합니다. 칼슘은 식후, 마그네슘은 취침 전으로 분리하세요.' })
  }

  // ── 약물 상호작용 (의약품-건강기능식품 상호작용) ──
  if (ids.has('omega3') && meds.has('blood-thinner')) {
    tips.push({ type: 'warning', icon: '❌', text: '오메가3 + 혈액희석제: EPA가 혈소판 응집을 추가 억제하여 출혈 위험 증가. 복용 전 반드시 담당 의사에게 알리세요.' })
  }
  if (ids.has('coq10') && meds.has('blood-thinner')) {
    tips.push({ type: 'warning', icon: '❌', text: 'CoQ10 + 와파린: CoQ10의 구조가 비타민K와 유사하여 와파린 효과를 감소시킬 수 있습니다. INR 모니터링 필수.' })
  }
  if (ids.has('rclub') && (meds.has('diabetes-med') || meds.has('bp-med'))) {
    tips.push({ type: 'warning', icon: '❌', text: '홍국 + 처방약: 모나콜린K는 스타틴과 동일 기전이므로 간 기능 모니터링이 필요합니다. 의사 상담 필수.' })
  }
  if (ids.has('calcium') && meds.has('bp-med')) {
    tips.push({ type: 'warning', icon: '❌', text: '칼슘 + 혈압약(칼슘채널차단제): 칼슘 보충제가 약효를 방해할 수 있습니다. 2시간 이상 간격을 두고 복용하세요.' })
  }
  if (ids.has('magnesium') && meds.has('bp-med')) {
    tips.push({ type: 'warning', icon: '❌', text: '마그네슘 + 혈압약: 마그네슘의 혈압 강하 효과가 겹쳐 저혈압 위험. 소량부터 시작하고 혈압 체크하세요.' })
  }

  // ── 기본 복용 원칙 ──
  tips.push({ type: 'good', icon: '✅', text: '지용성(A·D·E·K, 오메가3, CoQ10, 루테인)은 기름기 있는 식사 후, 수용성(B·C)은 식후 바로 복용하세요.' })

  return tips
}

// ── 복용 시간표 ──
export type TimeSlot = 'morning' | 'lunch' | 'evening' | 'bedtime'

export const timeSlotLabels: Record<TimeSlot, { label: string; icon: string }> = {
  morning: { label: '아침', icon: '🌅' },
  lunch: { label: '점심', icon: '☀️' },
  evening: { label: '저녁', icon: '🌙' },
  bedtime: { label: '취침 전', icon: '💤' },
}

export function getSchedule(recs: RecommendedSupplement[]): Record<TimeSlot, Supplement[]> {
  const schedule: Record<TimeSlot, Supplement[]> = {
    morning: [],
    lunch: [],
    evening: [],
    bedtime: [],
  }
  for (const rec of recs) {
    for (const t of rec.supplement.timing) {
      schedule[t].push(rec.supplement)
    }
  }
  return schedule
}

// ── 약사 총평 생성 (프로필 전체 교차 분석) ──
export function getPharmacistComment(answers: Answers, recs: RecommendedSupplement[]): string {
  const parts: string[] = []
  const age = Number(answers.age)
  const essentials = recs.filter(r => r.priority === 'essential')
  const isFemale = answers.gender === 'f'
  const isPregnant = isFemale && answers.pregnant === 'y'

  // 리스크 카운트
  let riskCount = 0
  if (answers.sleep === '1') riskCount++
  if (answers.exercise === '1') riskCount++
  if (answers.alcohol === '3' || answers.alcohol === '4') riskCount++
  if (answers.smoking === '3') riskCount++
  if (answers.sunlight === '1') riskCount++

  // ── 연령대 + 성별 맞춤 총평 ──
  if (isPregnant) {
    parts.push('임신·수유 중에는 태아의 발달을 위해 철분, DHA(오메가3), 비타민D, 칼슘의 요구량이 크게 증가합니다. 일반 영양제가 아닌 산모 전용 제품을 선택하시고, 모든 영양제를 산부인과 주치의와 상의 후 복용하세요.')
  } else if (age <= 30 && isFemale) {
    parts.push(`${answers.age}대 여성은 월경에 의한 철분 손실과 다이어트로 인한 영양 불균형에 주의해야 합니다. 특히 극단적 식이제한은 뼈 건강과 호르몬 균형에 악영향을 줍니다. 지금의 영양 관리가 40~50대 건강의 토대가 됩니다.`)
  } else if (age <= 30 && !isFemale) {
    parts.push(`${answers.age}대 남성은 체력이 좋아 건강을 소홀히 하기 쉽지만, 불규칙한 식습관과 음주·흡연 습관이 누적되면 40대에 한꺼번에 문제가 나타납니다. 기본 영양소 관리를 지금부터 시작하는 것이 현명합니다.`)
  } else if (age === 40 && isFemale) {
    parts.push('40대 여성은 에스트로겐이 서서히 감소하면서 골밀도 저하, 피부 콜라겐 감소, 심혈관 위험이 증가하기 시작합니다. 비타민D+칼슘으로 뼈를 지키고, 항산화 영양소로 노화를 늦추는 것이 핵심입니다.')
  } else if (age === 40 && !isFemale) {
    parts.push('40대 남성은 대사가 느려지고 내장지방이 쌓이기 시작하는 시기입니다. 심혈관 건강(오메가3, CoQ10)과 전립선 건강(아연)에 신경 쓰시고, 체내에서 합성이 줄어드는 CoQ10과 비타민D를 보충하세요.')
  } else if (age === 50 && isFemale) {
    parts.push('50대 여성은 폐경 전후로 에스트로겐이 급감하면서 골다공증, 관절통, 심혈관 위험, 피부 노화가 동시에 진행됩니다. 칼슘+비타민D는 필수이며, 갱년기 증상 관리를 위한 영양 지원이 중요합니다.')
  } else if (age === 50 && !isFemale) {
    parts.push('50대 남성은 테스토스테론 감소와 함께 근감소증, 관절 퇴행, 심혈관 질환 위험이 높아집니다. 관절 보호(글루코사민), 심장 건강(CoQ10, 오메가3), 전립선 건강(아연)을 중심으로 관리하세요.')
  } else if (age >= 60) {
    parts.push(`60대 이상은 위산 분비와 장 흡수력이 모두 저하되어 음식만으로는 영양 보충이 어렵습니다. 흡수율 높은 활성형 영양제를 선택하고, 특히 비타민B12·비타민D·칼슘은 적극적으로 보충하셔야 합니다.`)
  }

  // ── 필수 영양제 강조 ──
  if (essentials.length > 0) {
    const names = essentials.map(r => `${r.supplement.icon} ${r.supplement.name}`).join(', ')
    parts.push(`분석 결과, ${names}이(가) 현재 가장 시급하게 필요한 영양소로 판단됩니다. 이 영양소부터 우선 시작하시길 권합니다.`)
  }

  // ── 생활습관별 맞춤 조언 ──
  if (answers.sleep === '1') {
    parts.push('수면이 5시간 이하로 심각하게 부족합니다. 만성 수면 부족은 면역력 저하, 비만, 인지 기능 감퇴의 원인이 됩니다. 마그네슘을 취침 30분 전에 복용하면 수면의 질 개선에 도움이 되지만, 근본적으로 수면 환경과 습관을 개선하시는 것이 우선입니다.')
  }
  if (answers.alcohol === '4') {
    parts.push('주 3회 이상 음주는 간 건강뿐 아니라 비타민B1(티아민)·B9(엽산)·아연·마그네슘을 심각하게 고갈시킵니다. 밀크씨슬만으로는 한계가 있으므로 음주 횟수를 줄이는 것이 가장 효과적인 영양 관리입니다.')
  } else if (answers.alcohol === '3') {
    parts.push('주 1~2회 음주도 간에 부담을 줍니다. 밀크씨슬(실리마린)로 간 세포를 보호하되, 음주 전후 비타민B군을 추가로 보충하면 알코올 대사에 도움이 됩니다.')
  }
  if (answers.smoking === '3') {
    parts.push('흡연은 비타민C 필요량을 비흡연자 대비 하루 35mg 이상 추가로 요구합니다(FDA 기준). 또한 담배 연기의 활성산소가 폐·혈관·피부를 동시에 손상시키므로 항산화 영양소(비타민C·E, CoQ10) 보충이 중요합니다. 물론 금연이 최선의 영양 관리입니다.')
  }
  if (answers.sunlight === '1' && answers.exercise === '1') {
    parts.push('실내 생활이 많고 운동도 부족한 상태입니다. 이 조합은 비타민D 결핍과 근감소증 위험을 크게 높입니다. 하루 15~20분이라도 야외 산책을 시작하시면 비타민D 합성과 근력 유지에 큰 도움이 됩니다.')
  }

  // ── 리스크 종합 평가 ──
  if (riskCount >= 3) {
    parts.push('생활습관 위험 요인이 여러 가지 겹쳐 있어 영양 불균형 가능성이 높습니다. 영양제만으로 모든 것을 해결하기는 어렵습니다. 식습관 개선과 함께 정기적인 건강검진(혈액검사 포함)을 받으시길 강력히 권합니다.')
  }

  // ── 마무리 ──
  parts.push('영양제는 건강한 식습관과 생활습관을 "보완"하는 것이지 "대체"하는 것이 아닙니다. 균형 잡힌 식사·적절한 운동·충분한 수면이 기본이며, 부족한 부분을 영양제로 메꿔주세요.')

  return parts.join(' ')
}

// ── 복용 시 주의사항 생성 (개인별 맞춤) ──
export function getCautions(answers: Answers, recs: RecommendedSupplement[]): string[] {
  const cautions: string[] = []
  const ids = new Set(recs.map(r => r.supplement.id))
  const meds = new Set(answers.medications)

  // ── 복용 시작 원칙 ──
  cautions.push('처음 영양제를 시작할 때는 한 번에 5가지를 모두 시작하지 마세요. 1~2가지씩 1주 간격으로 추가하며 이상 반응 여부를 확인하세요.')
  cautions.push('소화불량, 두드러기, 메스꺼움, 어지러움 등 이상 반응이 나타나면 즉시 해당 영양제를 중단하고 약사 또는 의사와 상담하세요.')

  // ── 약물 복용자 맞춤 경고 ──
  if (meds.has('blood-thinner')) {
    cautions.push('혈액희석제(아스피린·와파린·NOAC) 복용 중이시므로 오메가3·비타민E·CoQ10·은행잎추출물은 출혈 위험을 높일 수 있습니다. 반드시 담당 의사에게 영양제 목록을 보여주고 허락을 받은 후 복용하세요.')
    cautions.push('수술이나 시술 예정 시 최소 2주 전에 오메가3·비타민E 복용을 중단해야 합니다.')
  }
  if (meds.has('bp-med')) {
    cautions.push('혈압약 복용 중이시므로 마그네슘·CoQ10 등 혈압 강하 효과가 있는 영양제를 추가할 때 저혈압(어지러움, 현기증)에 주의하세요. 소량부터 시작하고 혈압을 자주 측정하세요.')
    cautions.push('칼슘채널차단제(암로디핀 등) 복용 시 자몽주스와 칼슘 보충제를 약 복용 2시간 전후로 분리하세요.')
  }
  if (meds.has('diabetes-med')) {
    cautions.push('당뇨약 복용 중이시므로 마그네슘·아연·크롬·홍국 등은 인슐린 감수성이나 혈당에 영향을 줄 수 있습니다. 영양제 추가 시 혈당 모니터링을 강화하고 주치의에게 알리세요.')
    cautions.push('메트포르민 장기 복용 시 비타민B12 흡수가 감소할 수 있으므로 정기적으로 B12 수치를 검사받으세요.')
  }

  // ── 임신·수유 ──
  if (answers.pregnant === 'y') {
    cautions.push('임신 중 비타민A(레티놀)는 하루 3,000 IU를 초과하면 기형 유발 위험이 있습니다. 종합비타민 선택 시 레티놀이 아닌 베타카로틴 형태인지 반드시 확인하세요.')
    cautions.push('임신 중 허브 성분(밀크씨슬, 인삼, 은행잎 등)은 안전성이 확인되지 않았으므로 복용을 피하세요.')
    cautions.push('모든 영양제는 산부인과 주치의와 상의 후 복용하세요. "천연"이라고 안전한 것은 아닙니다.')
  }

  // ── 영양소별 과량 복용 주의 ──
  if (ids.has('vitamin-d')) {
    cautions.push('비타민D는 지용성이라 체내에 축적됩니다. 하루 4,000 IU(상한 섭취량)를 초과하면 고칼슘혈증(구역, 구토, 근육 약화)이 나타날 수 있습니다. 종합비타민과 합산하여 계산하세요.')
  }
  if (ids.has('iron')) {
    cautions.push('철분은 공복에 복용하면 흡수가 좋지만 위장 자극이 있을 수 있습니다. 구역감이 심하면 가벼운 식사 후 복용으로 변경하세요. 변이 검게 변하는 것은 정상입니다.')
    if (answers.gender === 'm' || (answers.gender === 'f' && Number(answers.age) >= 60)) {
      cautions.push('폐경 후 여성이나 남성은 철분 과잉 축적(철 과부하) 위험이 있으므로, 혈액검사(페리틴 수치)로 확인 후 복용하세요.')
    }
  }
  if (ids.has('zinc')) {
    cautions.push('아연은 하루 40mg(상한 섭취량)을 초과하면 구리 결핍을 유발합니다. 3개월 이상 장기 복용 시 구리 1~2mg을 함께 보충하거나, 구리가 포함된 제품을 선택하세요.')
  }
  if (ids.has('calcium')) {
    cautions.push('칼슘은 1회 500mg 이하로 나누어 복용해야 흡수율이 높습니다. 하루 2,000mg 이상 과량 섭취 시 신장결석·심혈관 위험이 보고되어 있으니 음식 섭취량을 합산하여 총 1,000~1,200mg을 목표로 하세요.')
  }
  if (ids.has('magnesium')) {
    cautions.push('마그네슘 보충제는 고용량(400mg+) 복용 시 설사가 나타날 수 있습니다. 이 경우 비스글리시네이트 형태로 변경하거나 용량을 나누어 복용하세요.')
  }
  if (ids.has('omega3')) {
    cautions.push('오메가3는 고용량(3g+ EPA+DHA) 복용 시 출혈 경향이 증가할 수 있습니다. 생선 비린 뒤맛이 불편하면 냉동 보관 후 식사 직전에 복용하세요.')
  }

  // ── 일반 원칙 ──
  cautions.push('영양제는 "건강기능식품 GMP" 인증과 "건기식 마크"가 있는 제품을 선택하고, 해외 직구 제품은 국내 기준과 함량이 다를 수 있으니 성분표를 꼼꼼히 확인하세요.')
  cautions.push('영양제를 6개월 이상 장기 복용할 때는 연 1회 이상 혈액검사(비타민D, 철분, 간수치 등)로 과부족을 점검하시길 권합니다.')

  return cautions
}

// ── 건강 고민 옵션 ──
export const concernOptions = [
  { id: 'fatigue', label: '만성 피로·무기력', icon: '😴' },
  { id: 'insomnia', label: '수면 장애·불면', icon: '🌃' },
  { id: 'joint', label: '관절·뼈 건강', icon: '🦴' },
  { id: 'eye', label: '눈 건강 (시력, 안구건조)', icon: '👁️' },
  { id: 'digestion', label: '소화·장 건강', icon: '🫃' },
  { id: 'skin', label: '피부·모발 (탈모, 건조)', icon: '💇' },
  { id: 'immunity', label: '면역력 (잔병치레)', icon: '🤧' },
  { id: 'cardiovascular', label: '혈압·혈당·콜레스테롤', icon: '❤️‍🩹' },
  { id: 'stress', label: '스트레스·불안', icon: '😰' },
  { id: 'menopause', label: '갱년기 증상', icon: '🌡️' },
  { id: 'weight', label: '체중 관리', icon: '⚖️' },
]

// ── 복용 약물 옵션 ──
export const medicationOptions = [
  { id: 'none', label: '없음', icon: '✅' },
  { id: 'bp-med', label: '혈압약', icon: '💊' },
  { id: 'diabetes-med', label: '당뇨약', icon: '💉' },
  { id: 'blood-thinner', label: '혈액희석제 (아스피린 등)', icon: '🩸' },
  { id: 'multivitamin', label: '종합비타민', icon: '💎' },
  { id: 'other-supp', label: '기타 영양제', icon: '🧴' },
]

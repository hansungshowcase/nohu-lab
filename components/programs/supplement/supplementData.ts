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

// ── 추천 로직 ──
export function getRecommendations(answers: Answers): RecommendedSupplement[] {
  const scores: Record<string, { score: number; reasons: string[] }> = {}

  function add(id: string, pts: number, reason: string) {
    if (!scores[id]) scores[id] = { score: 0, reasons: [] }
    scores[id].score += pts
    if (!scores[id].reasons.includes(reason)) scores[id].reasons.push(reason)
  }

  // ── 연령대별 기본 추천 ──
  if (answers.age === '40' || answers.age === '50' || answers.age === '60') {
    add('vitamin-d', 20, '40대 이상 필수 영양소')
    add('omega3', 15, '중장년 혈관 건강')
    add('coq10', 15, '나이 들수록 체내 생성 감소')
    add('calcium', 15, '골밀도 감소 예방')
  }
  if (answers.age === '50' || answers.age === '60') {
    add('glucosamine', 20, '50대 이상 관절 보호')
    add('vitamin-b', 15, '나이 들수록 흡수율 감소')
    add('calcium', 10, '골다공증 예방 강화')
  }
  if (answers.age === '20' || answers.age === '30') {
    add('vitamin-b', 10, '활발한 에너지 대사 지원')
    add('vitamin-c', 10, '기초 면역력')
  }

  // ── 성별 ──
  if (answers.gender === 'f') {
    add('iron', 25, '여성 철분 필요량 높음')
    add('calcium', 10, '여성 골다공증 예방')
    add('collagen', 10, '피부·관절 건강')
  }
  if (answers.gender === 'f' && answers.pregnant === 'y') {
    add('iron', 20, '임신·수유 중 철분 보충 필수')
    add('vitamin-d', 15, '태아 뼈 발달')
    add('omega3', 15, '태아 뇌 발달 (DHA)')
    // 임신 중 제외할 영양제
    scores['rclub'] = { score: -100, reasons: ['임신 중 복용 금지'] }
  }

  // ── 수면 ──
  if (answers.sleep === '1' || answers.sleep === '2') {
    add('magnesium', 25, '수면 부족 — 근육 이완·수면 질 개선')
    add('vitamin-b', 10, '수면 부족으로 인한 피로')
  }

  // ── 운동 ──
  if (answers.exercise === '1') {
    add('vitamin-d', 10, '운동 부족 — 근력 유지')
    add('vitamin-b', 10, '에너지 대사 활성화')
  }
  if (answers.exercise === '3' || answers.exercise === '4') {
    add('magnesium', 10, '운동 후 근육 회복')
    add('coq10', 10, '운동 시 세포 에너지')
    add('zinc', 10, '운동으로 인한 아연 소모')
  }

  // ── 음주 ──
  if (answers.alcohol === '3' || answers.alcohol === '4') {
    add('milk-thistle', 30, '잦은 음주 — 간 보호 필수')
    add('vitamin-b', 15, '알코올이 B군 고갈')
    add('zinc', 10, '음주로 인한 아연 결핍')
  }
  if (answers.alcohol === '2') {
    add('milk-thistle', 15, '주기적 음주 — 간 건강 지원')
  }

  // ── 흡연 ──
  if (answers.smoking === '3') {
    add('vitamin-c', 25, '흡연자 비타민C 소모량 2배')
    add('omega3', 10, '흡연으로 인한 혈관 보호')
    add('coq10', 10, '흡연에 의한 산화 스트레스')
  }
  if (answers.smoking === '2') {
    add('vitamin-c', 10, '과거 흡연 — 항산화 보충')
  }

  // ── 햇빛 ──
  if (answers.sunlight === '1') {
    add('vitamin-d', 30, '햇빛 노출 30분 미만 — 비타민D 합성 부족')
  }
  if (answers.sunlight === '2') {
    add('vitamin-d', 10, '겨울철 비타민D 보충 권장')
  }

  // ── 건강 고민 ──
  const concernMap: Record<string, [string, number, string][]> = {
    'fatigue': [['vitamin-b', 25, '만성 피로 개선'], ['coq10', 15, '세포 에너지 생성'], ['iron', 10, '피로의 원인 빈혈 체크']],
    'insomnia': [['magnesium', 25, '수면 장애 개선'], ['vitamin-b', 10, '신경 안정']],
    'joint': [['glucosamine', 25, '관절 연골 보호'], ['vitamin-d', 10, '뼈·관절 건강'], ['collagen', 15, '관절 연골 구성 성분']],
    'eye': [['lutein', 30, '눈 건강·황반 보호'], ['omega3', 15, '안구건조 개선'], ['vitamin-c', 5, '수정체 항산화']],
    'digestion': [['probiotics', 30, '장 건강·소화 개선'], ['zinc', 10, '소화 효소 구성']],
    'skin': [['collagen', 25, '피부 탄력 개선'], ['vitamin-c', 15, '콜라겐 합성 촉진'], ['zinc', 15, '피부·모발 건강']],
    'immunity': [['vitamin-c', 20, '면역 세포 활성화'], ['vitamin-d', 20, '면역 조절'], ['zinc', 15, '면역 기능 강화'], ['probiotics', 10, '장내 면역']],
    'cardiovascular': [['omega3', 25, '혈중 중성지방 감소'], ['coq10', 20, '심장 기능 지원'], ['rclub', 20, '콜레스테롤 관리']],
    'stress': [['magnesium', 25, '스트레스 완화·신경 안정'], ['vitamin-b', 20, '스트레스 시 B군 소모 증가'], ['vitamin-c', 10, '코르티솔 조절']],
    'menopause': [['calcium', 20, '폐경 후 골밀도 감소'], ['vitamin-d', 15, '칼슘 흡수 촉진'], ['omega3', 10, '갱년기 염증 완화'], ['collagen', 10, '피부·관절 보호']],
    'weight': [['vitamin-b', 15, '에너지 대사 활성화'], ['probiotics', 10, '장내 환경 개선'], ['vitamin-d', 10, '체중 관리 지원']],
  }

  for (const concern of answers.concerns) {
    const items = concernMap[concern]
    if (items) {
      for (const [id, pts, reason] of items) {
        add(id, pts, reason)
      }
    }
  }

  // ── 약물 상호작용 체크 ──
  const warnings: Record<string, string[]> = {}

  if (answers.medications.includes('blood-thinner')) {
    // 혈액희석제 복용 시 오메가3 주의
    if (scores['omega3']) {
      if (!warnings['omega3']) warnings['omega3'] = []
      warnings['omega3'].push('⚠️ 혈액희석제와 병용 시 출혈 위험 — 반드시 의사 상담')
    }
    if (scores['vitamin-e']) {
      if (!warnings['vitamin-e']) warnings['vitamin-e'] = []
      warnings['vitamin-e'].push('⚠️ 혈액희석제와 병용 주의')
    }
  }
  if (answers.medications.includes('bp-med')) {
    if (scores['coq10']) {
      if (!warnings['coq10']) warnings['coq10'] = []
      warnings['coq10'].push('혈압약과 함께 복용 가능하나 용량 조절 필요할 수 있음')
    }
  }
  if (answers.medications.includes('diabetes-med')) {
    if (!warnings['rclub']) warnings['rclub'] = []
    warnings['rclub'].push('⚠️ 당뇨약 복용 시 의사 상담 후 복용')
  }
  if (answers.medications.includes('multivitamin')) {
    // 종합비타민 이미 복용 중이면 개별 비타민 점수 감소
    if (scores['vitamin-b']) scores['vitamin-b'].score -= 10
    if (scores['vitamin-c']) scores['vitamin-c'].score -= 10
    if (scores['vitamin-d']) scores['vitamin-d'].score -= 5
  }

  // ── 점수 정렬 + 상위 3~5개 선택 ──
  const results: RecommendedSupplement[] = Object.entries(scores)
    .filter(([, v]) => v.score >= 20)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 5)
    .map(([id, v]) => {
      const supp = supplements[id]
      if (!supp) return null
      const priority: RecommendedSupplement['priority'] =
        v.score >= 80 ? 'essential' :
        v.score >= 50 ? 'recommended' : 'optional'

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
          reasons: ['기본 건강 유지에 도움'],
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
  const ids = recs.map(r => r.supplement.id)
  const tips: CombinationTip[] = []

  // 좋은 조합
  if (ids.includes('vitamin-d') && ids.includes('calcium')) {
    tips.push({ type: 'good', icon: '✅', text: '비타민D + 칼슘: 칼슘 흡수율을 높여주는 최고의 조합' })
  }
  if (ids.includes('iron') && ids.includes('vitamin-c')) {
    tips.push({ type: 'good', icon: '✅', text: '철분 + 비타민C: 비타민C가 철분 흡수율을 2~3배 높여줍니다' })
  }
  if (ids.includes('collagen') && ids.includes('vitamin-c')) {
    tips.push({ type: 'good', icon: '✅', text: '콜라겐 + 비타민C: 콜라겐 합성에 비타민C 필수' })
  }
  if (ids.includes('omega3') && ids.includes('vitamin-d')) {
    tips.push({ type: 'good', icon: '✅', text: '오메가3 + 비타민D: 둘 다 지용성, 함께 식후 복용 효율적' })
  }
  if (ids.includes('probiotics') && ids.includes('zinc')) {
    tips.push({ type: 'good', icon: '✅', text: '유산균 + 아연: 장내 면역 시너지 효과' })
  }

  // 시간 간격 주의
  if (ids.includes('iron') && ids.includes('calcium')) {
    tips.push({ type: 'caution', icon: '⚠️', text: '철분과 칼슘은 최소 2시간 간격을 두고 복용하세요' })
  }
  if (ids.includes('iron') && ids.includes('probiotics')) {
    tips.push({ type: 'caution', icon: '⚠️', text: '철분과 유산균은 1~2시간 간격이 좋습니다' })
  }
  if (ids.includes('zinc') && ids.includes('iron')) {
    tips.push({ type: 'caution', icon: '⚠️', text: '아연과 철분은 흡수를 방해하므로 시간대를 분리하세요' })
  }

  // 약물 상호작용 경고
  if (ids.includes('omega3') && answers.medications.includes('blood-thinner')) {
    tips.push({ type: 'warning', icon: '❌', text: '오메가3 + 혈액희석제(아스피린 등): 출혈 위험 증가, 반드시 의사 상담 필요' })
  }
  if (ids.includes('rclub') && answers.medications.includes('diabetes-med')) {
    tips.push({ type: 'warning', icon: '❌', text: '홍국 + 당뇨약: 병용 시 의사 상담 필수' })
  }

  // 기본 팁 추가
  if (tips.filter(t => t.type === 'good').length === 0) {
    tips.push({ type: 'good', icon: '✅', text: '수용성 비타민(B, C)은 식후 바로, 지용성 비타민(A, D, E, K)은 기름진 음식과 함께 복용' })
  }

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

// ── 약사 총평 생성 ──
export function getPharmacistComment(answers: Answers, recs: RecommendedSupplement[]): string {
  const parts: string[] = []
  const age = answers.age
  const essentials = recs.filter(r => r.priority === 'essential')

  // 연령대별 코멘트
  if (age === '20' || age === '30') {
    parts.push(`${age}대는 아직 젊은 나이지만, 불규칙한 생활습관이 쌓이면 30~40대에 건강 문제로 나타날 수 있습니다.`)
  } else if (age === '40') {
    parts.push('40대는 체내 영양소 합성 능력이 떨어지기 시작하는 시기입니다. 지금부터 기본 영양소를 챙기면 50~60대 건강이 크게 달라집니다.')
  } else if (age === '50') {
    parts.push('50대는 호르몬 변화와 함께 뼈·관절·심혈관 건강에 특별한 관심이 필요한 시기입니다.')
  } else {
    parts.push('60대 이상은 영양소 흡수력이 저하되므로 흡수율 높은 형태의 영양제를 선택하는 것이 중요합니다.')
  }

  // 필수 영양제가 있으면 강조
  if (essentials.length > 0) {
    const names = essentials.map(r => r.supplement.name).join(', ')
    parts.push(`특히 ${names}은(는) 현재 상태에서 가장 시급하게 보충이 필요한 영양소입니다.`)
  }

  // 생활습관 코멘트
  if (answers.sleep === '1') {
    parts.push('수면 시간이 5시간 이하로 매우 부족합니다. 영양제와 함께 수면 습관 개선도 병행하시길 권합니다.')
  }
  if (answers.alcohol === '4') {
    parts.push('잦은 음주는 간뿐 아니라 비타민B·아연·마그네슘 등 다양한 영양소를 고갈시킵니다.')
  }
  if (answers.smoking === '3') {
    parts.push('흡연은 비타민C를 일반인의 2배 이상 소모시키므로 적극적인 보충이 필요합니다.')
  }

  // 마무리
  parts.push('영양제는 건강한 식습관을 보완하는 것이지 대체하는 것이 아닙니다. 균형 잡힌 식사를 기본으로 하되, 부족한 부분을 영양제로 채워주세요.')

  return parts.join(' ')
}

// ── 복용 시 주의사항 생성 ──
export function getCautions(answers: Answers, recs: RecommendedSupplement[]): string[] {
  const cautions: string[] = []

  // 공통 주의사항
  cautions.push('영양제를 처음 시작할 때는 한 가지씩 추가하며 2주간 반응을 관찰하세요.')
  cautions.push('이상 반응(소화불량, 두드러기, 어지러움 등)이 나타나면 즉시 복용을 중단하세요.')

  // 약물 상호작용
  if (answers.medications.includes('blood-thinner')) {
    cautions.push('혈액희석제를 복용 중이시므로 오메가3, 비타민E, 은행잎추출물은 반드시 담당 의사와 상의 후 복용하세요.')
  }
  if (answers.medications.includes('bp-med')) {
    cautions.push('혈압약 복용 중이시므로 칼륨, 마그네슘 보충제는 의사와 상의가 필요합니다.')
  }
  if (answers.medications.includes('diabetes-med')) {
    cautions.push('당뇨약 복용 중이시므로 크롬, 알파리포산, 홍국 등은 혈당에 영향을 줄 수 있어 의사 상담이 필요합니다.')
  }

  // 임신
  if (answers.pregnant === 'y') {
    cautions.push('임신·수유 중에는 비타민A(레티놀) 고용량, 홍국, 일부 허브 성분을 피해야 합니다. 반드시 산부인과 의사와 상의하세요.')
  }

  // 과량 복용 주의
  const ids = recs.map(r => r.supplement.id)
  if (ids.includes('iron')) {
    cautions.push('철분은 과량 복용 시 위장 장애, 변비가 생길 수 있습니다. 권장량을 초과하지 마세요.')
  }
  if (ids.includes('zinc')) {
    cautions.push('아연은 하루 40mg을 초과하면 구리 흡수를 방해할 수 있으므로 장기 복용 시 주의하세요.')
  }
  if (ids.includes('vitamin-d')) {
    cautions.push('비타민D는 지용성이라 과량 축적될 수 있습니다. 하루 4,000 IU를 초과하지 마세요.')
  }

  // 건강기능식품 주의
  cautions.push('영양제는 건강기능식품 인증(건기식 마크) 표시가 있는 제품을 선택하세요.')

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

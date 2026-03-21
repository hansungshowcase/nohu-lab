// ── 영양제 데이터베이스 + 추천 로직 ──

export interface Supplement {
  id: string
  name: string
  nameEn: string
  icon: string
  color: string
  benefits: string[]
  dosage: string
  timing: ('morning' | 'lunch' | 'evening' | 'bedtime')[]
  timingNote: string
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
    dosage: '1,000~2,000 IU (1정)',
    timing: ['morning'],
    timingNote: '식후 복용 (지용성)',
  },
  'omega3': {
    id: 'omega3',
    name: '오메가3',
    nameEn: 'Omega-3 (EPA/DHA)',
    icon: '🐟',
    color: '#3B82F6',
    benefits: ['혈관 건강', '눈 건조 개선', '뇌 기능 지원'],
    dosage: 'EPA+DHA 1,000mg (1~2캡슐)',
    timing: ['morning', 'evening'],
    timingNote: '식후 복용 (지용성)',
    caution: '혈액희석제 복용 시 의사 상담 필요',
  },
  'magnesium': {
    id: 'magnesium',
    name: '마그네슘',
    nameEn: 'Magnesium',
    icon: '🌙',
    color: '#8B5CF6',
    benefits: ['수면 질 개선', '근육 이완', '스트레스 완화'],
    dosage: '300~400mg (1정)',
    timing: ['bedtime'],
    timingNote: '취침 30분 전',
  },
  'vitamin-b': {
    id: 'vitamin-b',
    name: '비타민B군',
    nameEn: 'Vitamin B Complex',
    icon: '⚡',
    color: '#EF4444',
    benefits: ['에너지 대사', '만성 피로 개선', '신경 기능'],
    dosage: 'B군 복합제 1정',
    timing: ['morning'],
    timingNote: '아침 식후 (저녁 복용 시 수면 방해 가능)',
  },
  'vitamin-c': {
    id: 'vitamin-c',
    name: '비타민C',
    nameEn: 'Vitamin C',
    icon: '🍊',
    color: '#F97316',
    benefits: ['면역력 강화', '피부 건강', '항산화'],
    dosage: '500~1,000mg (1~2정)',
    timing: ['morning', 'evening'],
    timingNote: '식후 복용',
  },
  'probiotics': {
    id: 'probiotics',
    name: '유산균',
    nameEn: 'Probiotics',
    icon: '🦠',
    color: '#10B981',
    benefits: ['장 건강', '소화 개선', '면역력 지원'],
    dosage: '100억 CFU 이상 (1캡슐)',
    timing: ['morning'],
    timingNote: '아침 공복 또는 식전',
  },
  'lutein': {
    id: 'lutein',
    name: '루테인',
    nameEn: 'Lutein & Zeaxanthin',
    icon: '👁️',
    color: '#06B6D4',
    benefits: ['눈 건강', '황반변성 예방', '블루라이트 차단'],
    dosage: '20mg (1캡슐)',
    timing: ['morning'],
    timingNote: '식후 복용 (지용성)',
  },
  'zinc': {
    id: 'zinc',
    name: '아연',
    nameEn: 'Zinc',
    icon: '🛡️',
    color: '#6366F1',
    benefits: ['면역력 강화', '피부·모발 건강', '상처 회복'],
    dosage: '15~30mg (1정)',
    timing: ['evening'],
    timingNote: '식후 복용',
  },
  'iron': {
    id: 'iron',
    name: '철분',
    nameEn: 'Iron (Ferrous)',
    icon: '🩸',
    color: '#DC2626',
    benefits: ['빈혈 예방', '피로 개선', '산소 운반'],
    dosage: '12~18mg (1정)',
    timing: ['morning'],
    timingNote: '공복 복용 권장 (비타민C와 함께)',
    caution: '칼슘·유제품과 2시간 간격',
  },
  'calcium': {
    id: 'calcium',
    name: '칼슘',
    nameEn: 'Calcium',
    icon: '🦴',
    color: '#F5F5F4',
    benefits: ['뼈·골다공증 예방', '치아 건강', '근육 기능'],
    dosage: '500~600mg (1~2정)',
    timing: ['evening'],
    timingNote: '식후 복용 (비타민D와 함께)',
    caution: '철분과 2시간 간격',
  },
  'coq10': {
    id: 'coq10',
    name: '코엔자임Q10',
    nameEn: 'Coenzyme Q10',
    icon: '❤️',
    color: '#E11D48',
    benefits: ['심장 건강', '세포 에너지 생성', '항산화'],
    dosage: '100~200mg (1캡슐)',
    timing: ['morning'],
    timingNote: '식후 복용 (지용성)',
  },
  'collagen': {
    id: 'collagen',
    name: '콜라겐',
    nameEn: 'Collagen Peptide',
    icon: '✨',
    color: '#EC4899',
    benefits: ['피부 탄력', '관절 건강', '모발·손톱 강화'],
    dosage: '2,000~5,000mg (1포)',
    timing: ['bedtime'],
    timingNote: '취침 전 공복',
  },
  'milk-thistle': {
    id: 'milk-thistle',
    name: '밀크씨슬',
    nameEn: 'Milk Thistle (Silymarin)',
    icon: '🍀',
    color: '#22C55E',
    benefits: ['간 해독', '간 세포 보호', '피로 회복'],
    dosage: '실리마린 130mg (1정)',
    timing: ['morning', 'evening'],
    timingNote: '식후 복용',
  },
  'glucosamine': {
    id: 'glucosamine',
    name: '글루코사민',
    nameEn: 'Glucosamine',
    icon: '🦿',
    color: '#0EA5E9',
    benefits: ['관절 연골 보호', '관절 통증 완화', '관절 유연성'],
    dosage: '1,500mg (2~3정)',
    timing: ['morning', 'lunch'],
    timingNote: '식후 나누어 복용',
  },
  'rclub': {
    id: 'rclub',
    name: '홍국',
    nameEn: 'Red Yeast Rice',
    icon: '🔴',
    color: '#B91C1C',
    benefits: ['콜레스테롤 관리', '혈관 건강'],
    dosage: '모나콜린K 4mg (1정)',
    timing: ['evening'],
    timingNote: '저녁 식후',
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

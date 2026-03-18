export interface Question {
  id: number
  text: string
}

export interface LikertOption {
  value: number
  label: string
}

export interface Scale {
  id: string
  name: string
  description: string
  questions: Question[]
  likertOptions: LikertOption[]
  levels: { label: string; min: number; max: number; color: string }[]
  reverseItems?: number[]
}

// ── PHQ-9 공식 한국어판 ──
const PHQ9_QUESTIONS: Question[] = [
  { id: 1, text: '기분이 가라앉거나, 우울하거나, 희망이 없다고 느꼈다' },
  { id: 2, text: '평소 하던 일에 대한 흥미가 없어지거나 즐거움을 느끼지 못했다' },
  { id: 3, text: '잠들기가 어렵거나 자주 깼다, 혹은 너무 많이 잤다' },
  { id: 4, text: '평소보다 식욕이 줄었다, 혹은 평소보다 많이 먹었다' },
  { id: 5, text: '다른 사람들이 눈치 챌 정도로 평소보다 말과 행동이 느려졌다, 혹은 너무 안절부절 못해서 가만히 앉아있을 수 없었다' },
  { id: 6, text: '피곤하고 기운이 없었다' },
  { id: 7, text: '내가 잘못 했거나, 실패했다는 생각이 들었다, 혹은 자신과 가족을 실망시켰다고 생각했다' },
  { id: 8, text: '신문을 읽거나 TV를 보는 것과 같은 일상적인 일에도 집중할 수가 없었다' },
  { id: 9, text: '차라리 죽는 것이 더 낫겠다고 생각했다, 혹은 자해할 생각을 했다' },
]

const PHQ9_LIKERT: LikertOption[] = [
  { value: 0, label: '전혀 아니다' },
  { value: 1, label: '여러 날 동안' },
  { value: 2, label: '일주일 이상' },
  { value: 3, label: '거의 매일' },
]

// ── GAD-7 공식 한국어판 ──
const GAD7_QUESTIONS: Question[] = [
  { id: 1, text: '초조하거나 불안하거나 조마조마하게 느꼈다' },
  { id: 2, text: '걱정하는 것을 멈추거나 조절할 수가 없었다' },
  { id: 3, text: '여러 가지 것들에 대해 걱정을 너무 많이 했다' },
  { id: 4, text: '편하게 있기가 어려웠다' },
  { id: 5, text: '너무 안절부절못해서 가만히 있기가 힘들었다' },
  { id: 6, text: '쉽게 짜증이 나거나 쉽게 성을 내게 되었다' },
  { id: 7, text: '마치 끔찍한 일이 생길 것처럼 두렵게 느껴졌다' },
]

const GAD7_LIKERT: LikertOption[] = [
  { value: 0, label: '전혀 방해 받지 않았다' },
  { value: 1, label: '며칠 동안 방해 받았다' },
  { value: 2, label: '일주일 이상 방해 받았다' },
  { value: 3, label: '거의 매일 방해 받았다' },
]

// ── PSS-10 공식 한국어판 ──
const PSS10_QUESTIONS: Question[] = [
  { id: 1, text: '예상치 못했던 일 때문에 당황했던 적이 얼마나 있었습니까?' },
  { id: 2, text: '인생에서 중요한 일들을 조절할 수 없다는 느낌을 얼마나 경험하였습니까?' },
  { id: 3, text: '신경이 예민해지고 스트레스를 받고 있다는 느낌을 얼마나 경험하였습니까?' },
  { id: 4, text: '당신의 개인적 문제들을 다루는 데 있어서 얼마나 자주 자신감을 느꼈습니까?' },
  { id: 5, text: '일상의 일들이 당신의 생각대로 진행되고 있다는 느낌을 얼마나 경험하였습니까?' },
  { id: 6, text: '당신이 꼭 해야 하는 일을 처리할 수 없다고 생각한 적이 얼마나 있었습니까?' },
  { id: 7, text: '일상생활의 짜증을 얼마나 자주 잘 다스릴 수 있었습니까?' },
  { id: 8, text: '최상의 컨디션이라고 얼마나 자주 느끼셨습니까?' },
  { id: 9, text: '당신이 통제할 수 없는 일 때문에 화가 난 경험이 얼마나 있었습니까?' },
  { id: 10, text: '어려운 일들이 너무 많이 쌓여서 극복하지 못할 것 같은 느낌을 얼마나 자주 경험하셨습니까?' },
]

const PSS10_LIKERT: LikertOption[] = [
  { value: 0, label: '전혀 없었다' },
  { value: 1, label: '거의 없었다' },
  { value: 2, label: '때때로 있었다' },
  { value: 3, label: '자주 있었다' },
  { value: 4, label: '매우 자주 있었다' },
]

// ── RSES-10 로젠버그 자존감 척도 한국어판 ──
// 출처: Rosenberg Self-Esteem Scale 한국어 타당화
const RSES_QUESTIONS: Question[] = [
  { id: 1, text: '나는 내가 적어도 다른 사람만큼은 가치 있는 사람이라고 느낀다' },
  { id: 2, text: '나는 좋은 자질을 많이 가지고 있다고 느낀다' },
  { id: 3, text: '대체로 나는 실패한 사람이라는 느낌이 든다' },
  { id: 4, text: '나는 대부분의 다른 사람들만큼 일을 잘 할 수 있다' },
  { id: 5, text: '나에게는 자랑할 만한 것이 별로 없다고 느낀다' },
  { id: 6, text: '나는 나 자신에 대해 긍정적인 태도를 가지고 있다' },
  { id: 7, text: '나는 대체로 나 자신에 대해 만족한다' },
  { id: 8, text: '나 자신을 좀 더 존경할 수 있었으면 좋겠다' },
  { id: 9, text: '나는 가끔 내가 쓸모없는 사람이라고 느낀다' },
  { id: 10, text: '때때로 나는 내가 좋지 않은 사람이라고 생각한다' },
]

const RSES_LIKERT: LikertOption[] = [
  { value: 0, label: '전혀 그렇지 않다' },
  { value: 1, label: '그렇지 않다' },
  { value: 2, label: '그렇다' },
  { value: 3, label: '매우 그렇다' },
]

// ── ISI-7 불면증 심각도 척도 한국어판 ──
// 출처: Insomnia Severity Index 한국어 타당화
const ISI_QUESTIONS: Question[] = [
  { id: 1, text: '잠들기 어려운 정도가 어떻습니까?' },
  { id: 2, text: '잠을 유지하기 어려운 정도가 어떻습니까?' },
  { id: 3, text: '너무 일찍 깨는 문제가 어떻습니까?' },
  { id: 4, text: '현재 수면 양상에 대해 얼마나 만족/불만족합니까?' },
  { id: 5, text: '수면 문제가 낮 동안의 기능(피로, 집중력 등)에 얼마나 방해가 됩니까?' },
  { id: 6, text: '수면 문제로 인한 삶의 질 저하가 남에게 얼마나 드러납니까?' },
  { id: 7, text: '현재 수면 문제에 대해 얼마나 걱정/고민하고 있습니까?' },
]

const ISI_LIKERT: LikertOption[] = [
  { value: 0, label: '전혀 없다' },
  { value: 1, label: '약간' },
  { value: 2, label: '보통' },
  { value: 3, label: '심함' },
  { value: 4, label: '매우 심함' },
]

export const PSS_REVERSE_ITEMS = [4, 5, 7, 8]
// RSES 역채점: 긍정 문항(1,2,4,6,7)은 역채점 → 높을수록 낮은 자존감
// 원래 RSES는 높을수록 높은 자존감이지만, 이 도구는 "심리 문제 선별"이므로
// 부정 문항(3,5,8,9,10) 그대로 + 긍정 문항(1,2,4,6,7) 역채점 → 높을수록 낮은 자존감
export const RSES_REVERSE_ITEMS = [1, 2, 4, 6, 7]

export const SCALES: Scale[] = [
  {
    id: 'depression',
    name: '우울 (PHQ-9)',
    description: '지난 2주일 동안 다음의 문제들로 인해서 얼마나 자주 방해를 받았습니까?',
    questions: PHQ9_QUESTIONS,
    likertOptions: PHQ9_LIKERT,
    levels: [
      { label: '정상', min: 0, max: 4, color: '#22c55e' },
      { label: '경미한 우울', min: 5, max: 9, color: '#eab308' },
      { label: '중등도 우울', min: 10, max: 14, color: '#f97316' },
      { label: '중등도 심한 우울', min: 15, max: 19, color: '#ef4444' },
      { label: '심한 우울', min: 20, max: 27, color: '#dc2626' },
    ],
    reverseItems: [],
  },
  {
    id: 'anxiety',
    name: '불안 (GAD-7)',
    description: '지난 2주 동안 다음의 문제들로 인해 얼마나 자주 방해를 받았습니까?',
    questions: GAD7_QUESTIONS,
    likertOptions: GAD7_LIKERT,
    levels: [
      { label: '정상', min: 0, max: 4, color: '#22c55e' },
      { label: '경미한 불안', min: 5, max: 9, color: '#eab308' },
      { label: '중등도 불안', min: 10, max: 14, color: '#f97316' },
      { label: '심한 불안', min: 15, max: 21, color: '#ef4444' },
    ],
    reverseItems: [],
  },
  {
    id: 'stress',
    name: '스트레스 (PSS-10)',
    description: '지난 한 달 동안 어떤 감정과 생각이 들었는지 답변해주세요.',
    questions: PSS10_QUESTIONS,
    likertOptions: PSS10_LIKERT,
    levels: [
      { label: '정상', min: 0, max: 13, color: '#22c55e' },
      { label: '경도 스트레스', min: 14, max: 16, color: '#eab308' },
      { label: '중등도 스트레스', min: 17, max: 18, color: '#f97316' },
      { label: '심한 스트레스', min: 19, max: 40, color: '#ef4444' },
    ],
    reverseItems: PSS_REVERSE_ITEMS,
  },
  {
    id: 'selfesteem',
    name: '자존감 (RSES-10)',
    description: '아래 문항을 읽고 자신에게 해당하는 정도를 선택해주세요.',
    questions: RSES_QUESTIONS,
    likertOptions: RSES_LIKERT,
    levels: [
      { label: '정상', min: 0, max: 14, color: '#22c55e' },
      { label: '경미한 저하', min: 15, max: 19, color: '#eab308' },
      { label: '중등도 저하', min: 20, max: 24, color: '#f97316' },
      { label: '심한 저하', min: 25, max: 30, color: '#ef4444' },
    ],
    reverseItems: RSES_REVERSE_ITEMS,
  },
  {
    id: 'insomnia',
    name: '수면 (ISI-7)',
    description: '최근 2주 동안의 수면 상태에 대해 답변해주세요.',
    questions: ISI_QUESTIONS,
    likertOptions: ISI_LIKERT,
    levels: [
      { label: '정상', min: 0, max: 7, color: '#22c55e' },
      { label: '역치 이하 불면', min: 8, max: 14, color: '#eab308' },
      { label: '중등도 불면', min: 15, max: 21, color: '#f97316' },
      { label: '심한 불면', min: 22, max: 28, color: '#ef4444' },
    ],
    reverseItems: [],
  },
]

// PHQ-9 기능 장해 추가 문항
export const FUNCTIONAL_IMPAIRMENT_QUESTION = '위의 문제들 중 하나라도 해당되는 것이 있다면, 이러한 문제들로 인해 일을 하거나 집안일을 하거나 다른 사람들과 어울려 지내는 데 얼마나 어려움이 있었습니까?'

export const FUNCTIONAL_IMPAIRMENT_OPTIONS: LikertOption[] = [
  { value: 0, label: '전혀 어렵지 않았다' },
  { value: 1, label: '약간 어려웠다' },
  { value: 2, label: '많이 어려웠다' },
  { value: 3, label: '매우 많이 어려웠다' },
]

export function calculateScore(scaleId: string, answers: Record<string, number>): number {
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return 0
  const maxPerItem = scale.likertOptions[scale.likertOptions.length - 1].value
  const reverseItems = scale.reverseItems ?? []

  return scale.questions.reduce((sum, q) => {
    const key = `${scaleId}-${q.id}`
    const raw = answers[key] ?? 0
    if (reverseItems.includes(q.id)) {
      return sum + (maxPerItem - raw)
    }
    return sum + raw
  }, 0)
}

export function getLevel(scaleId: string, score: number) {
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return { label: '알 수 없음', color: 'gray', min: 0, max: 0 }
  return scale.levels.find((l) => score >= l.min && score <= l.max) ?? scale.levels[0]
}

export function getMaxScore(scaleId: string): number {
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return 0
  const maxPerItem = scale.likertOptions[scale.likertOptions.length - 1].value
  return scale.questions.length * maxPerItem
}

export function hasSuicideRisk(answers: Record<string, number>): boolean {
  return (answers['depression-9'] ?? 0) >= 1
}

export interface ItemAnalysis {
  questionText: string
  score: number
  maxScore: number
}

export function getHighScoringItems(scaleId: string, answers: Record<string, number>, threshold: number = 2): ItemAnalysis[] {
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return []
  const maxPerItem = scale.likertOptions[scale.likertOptions.length - 1].value
  const reverseItems = scale.reverseItems ?? []

  return scale.questions
    .map((q) => {
      const raw = answers[`${scaleId}-${q.id}`] ?? 0
      const effectiveScore = reverseItems.includes(q.id) ? (maxPerItem - raw) : raw
      return { questionText: q.text, score: effectiveScore, maxScore: maxPerItem }
    })
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
}

export function getOverallRisk(results: { scaleId: string; score: number }[]): {
  level: 'low' | 'moderate' | 'high' | 'critical'
  label: string
  color: string
  description: string
} {
  let maxSeverity = 0
  for (const r of results) {
    const scale = SCALES.find((s) => s.id === r.scaleId)
    if (!scale) continue
    const levelIdx = scale.levels.findIndex((l) => r.score >= l.min && r.score <= l.max)
    if (levelIdx > maxSeverity) maxSeverity = levelIdx
  }

  const moderateCount = results.filter((r) => {
    const scale = SCALES.find((s) => s.id === r.scaleId)
    if (!scale) return false
    const idx = scale.levels.findIndex((l) => r.score >= l.min && r.score <= l.max)
    return idx >= 2
  }).length

  if (moderateCount >= 2 && maxSeverity < 3) maxSeverity = Math.min(maxSeverity + 1, 3)

  const levels = [
    { level: 'low' as const, label: '양호', color: '#22c55e', description: '현재 심리 상태가 전반적으로 양호합니다. 현재의 생활 습관을 유지하시기 바랍니다.' },
    { level: 'moderate' as const, label: '주의', color: '#eab308', description: '일부 영역에서 경미한 증상이 관찰됩니다. 생활 습관 개선과 자기 관리를 통해 호전될 수 있습니다.' },
    { level: 'high' as const, label: '경고', color: '#f97316', description: '중등도 이상의 증상이 관찰됩니다. 전문 상담사 또는 정신건강의학과 상담을 권장합니다.' },
    { level: 'critical' as const, label: '위험', color: '#ef4444', description: '심각한 수준의 증상이 관찰됩니다. 가능한 빨리 정신건강의학과 전문의 진료를 받으시기 바랍니다.' },
  ]

  return levels[Math.min(maxSeverity, 3)]
}

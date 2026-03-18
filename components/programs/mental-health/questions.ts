export interface Question {
  id: number
  text: string
}

export interface Scale {
  id: string
  name: string
  description: string
  questions: Question[]
  levels: { label: string; min: number; max: number; color: string }[]
}

const PHQ9_QUESTIONS: Question[] = [
  { id: 1, text: '일을 하는 것에 대한 흥미나 즐거움을 느끼지 못했다' },
  { id: 2, text: '기분이 가라앉거나 우울하거나 희망이 없다고 느꼈다' },
  { id: 3, text: '잠들기 어렵거나 자주 깨거나, 혹은 너무 많이 잤다' },
  { id: 4, text: '피곤하다고 느끼거나 기운이 거의 없었다' },
  { id: 5, text: '식욕이 줄었거나 과식을 했다' },
  { id: 6, text: '자신이 나쁜 사람이라고 느끼거나, 자신을 실패자라고 느꼈다' },
  { id: 7, text: '신문이나 TV에 집중하기 어려웠다' },
  { id: 8, text: '다른 사람들이 눈치챌 정도로 느리게 움직이거나, 반대로 안절부절못했다' },
  { id: 9, text: '차라리 죽는 것이 낫겠다는 생각이 들었다' },
]

const GAD7_QUESTIONS: Question[] = [
  { id: 1, text: '초조하거나 불안하거나 조마조마하게 느꼈다' },
  { id: 2, text: '걱정하는 것을 멈추거나 조절할 수 없었다' },
  { id: 3, text: '여러 가지 것들에 대해 지나치게 걱정했다' },
  { id: 4, text: '편하게 쉬기 어려웠다' },
  { id: 5, text: '너무 안절부절못해서 가만히 있기 힘들었다' },
  { id: 6, text: '쉽게 짜증이 나거나 화가 났다' },
  { id: 7, text: '무서운 일이 일어날 것 같은 느낌이 들었다' },
]

const PSS10_QUESTIONS: Question[] = [
  { id: 1, text: '예상치 못한 일이 생겨서 기분이 상한 적이 있었다' },
  { id: 2, text: '중요한 일들을 통제할 수 없다고 느꼈다' },
  { id: 3, text: '초조하고 스트레스를 받고 있다고 느꼈다' },
  { id: 4, text: '개인적인 문제를 잘 처리할 수 있다고 자신했다' },
  { id: 5, text: '일이 내 뜻대로 진행되고 있다고 느꼈다' },
  { id: 6, text: '해야 할 일을 감당할 수 없다고 느꼈다' },
  { id: 7, text: '짜증나는 일을 잘 다스릴 수 있었다' },
  { id: 8, text: '모든 것이 잘 되어가고 있다고 느꼈다' },
  { id: 9, text: '통제할 수 없는 일 때문에 화가 났다' },
  { id: 10, text: '어려운 일이 너무 많아져서 극복할 수 없다고 느꼈다' },
]

// PSS-10 역채점 문항 (4, 5, 7, 8번)
export const PSS_REVERSE_ITEMS = [4, 5, 7, 8]

export const SCALES: Scale[] = [
  {
    id: 'depression',
    name: '우울 (PHQ-9)',
    description: '최근 2주 동안 아래 증상으로 얼마나 자주 불편을 겪었는지 표시해주세요.',
    questions: PHQ9_QUESTIONS,
    levels: [
      { label: '정상', min: 0, max: 4, color: '#22c55e' },
      { label: '경미', min: 5, max: 9, color: '#eab308' },
      { label: '중등도', min: 10, max: 14, color: '#f97316' },
      { label: '심각', min: 15, max: 27, color: '#ef4444' },
    ],
  },
  {
    id: 'anxiety',
    name: '불안 (GAD-7)',
    description: '최근 2주 동안 아래 증상으로 얼마나 자주 불편을 겪었는지 표시해주세요.',
    questions: GAD7_QUESTIONS,
    levels: [
      { label: '정상', min: 0, max: 4, color: '#22c55e' },
      { label: '경미', min: 5, max: 9, color: '#eab308' },
      { label: '중등도', min: 10, max: 14, color: '#f97316' },
      { label: '심각', min: 15, max: 21, color: '#ef4444' },
    ],
  },
  {
    id: 'stress',
    name: '스트레스 (PSS-10)',
    description: '최근 한 달 동안 아래와 같은 경험을 얼마나 자주 했는지 표시해주세요.',
    questions: PSS10_QUESTIONS,
    levels: [
      { label: '정상', min: 0, max: 13, color: '#22c55e' },
      { label: '경미', min: 14, max: 18, color: '#eab308' },
      { label: '중등도', min: 19, max: 25, color: '#f97316' },
      { label: '심각', min: 26, max: 40, color: '#ef4444' },
    ],
  },
]

export const LIKERT_OPTIONS = [
  { value: 0, label: '전혀 아니다' },
  { value: 1, label: '가끔 그렇다' },
  { value: 2, label: '자주 그렇다' },
  { value: 3, label: '거의 항상 그렇다' },
]

export function calculateScore(scaleId: string, answers: Record<string, number>): number {
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return 0

  return scale.questions.reduce((sum, q) => {
    const key = `${scaleId}-${q.id}`
    const raw = answers[key] ?? 0

    // PSS-10 역채점
    if (scaleId === 'stress' && PSS_REVERSE_ITEMS.includes(q.id)) {
      return sum + (3 - raw)
    }
    return sum + raw
  }, 0)
}

export function getLevel(scaleId: string, score: number) {
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return scale

  return scale.levels.find((l) => score >= l.min && score <= l.max) ?? scale.levels[0]
}

export function getMaxScore(scaleId: string): number {
  const scale = SCALES.find((s) => s.id === scaleId)
  return scale ? scale.questions.length * 3 : 0
}

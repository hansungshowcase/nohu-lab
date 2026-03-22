import {
  MAJOR_ARCANA,
  CARD_COMBINATIONS,
  ELEMENT_INTERPRETATIONS,
  LUCKY_COLORS,
  LUCKY_DIRECTIONS,
  TarotCard,
  SpreadType,
} from './tarotData'

// ── 타입 정의 ──

export interface SelectedCard {
  card: TarotCard
  isReversed: boolean
  position: string
}

export interface TarotResult {
  spread: SpreadType
  cards: SelectedCard[]
  question: string
  combinations: { theme: string; interpretation: string }[]
  overallMessage: string
  dominantElement: string
  elementMessage: string
  luckyColor: string
  luckyNumber: number
  luckyDirection: string
}

// ── Fisher-Yates 셔플 ──

export function shuffleCards(): number[] {
  const indices = Array.from({ length: MAJOR_ARCANA.length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

// ── 정/역방향 랜덤 결정 ──

export function randomOrientation(): boolean {
  return Math.random() < 0.5
}

// ── 카드 조합 해석 찾기 ──

function findCombinations(cardIds: number[]): { theme: string; interpretation: string }[] {
  const results: { theme: string; interpretation: string }[] = []
  for (let i = 0; i < cardIds.length; i++) {
    for (let j = i + 1; j < cardIds.length; j++) {
      const a = cardIds[i]
      const b = cardIds[j]
      const combo = CARD_COMBINATIONS.find(
        (c) => (c.cards[0] === a && c.cards[1] === b) || (c.cards[0] === b && c.cards[1] === a)
      )
      if (combo) {
        results.push({ theme: combo.theme, interpretation: combo.interpretation })
      }
    }
  }
  return results
}

// ── 지배 원소 계산 ──

function getDominantElement(cards: SelectedCard[]): { element: string; message: string } {
  const counts: Record<string, number> = {}
  for (const sc of cards) {
    const el = sc.card.element
    counts[el] = (counts[el] || 0) + 1
  }

  let maxEl = ''
  let maxCount = 0
  for (const [el, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxEl = el
      maxCount = count
    }
  }

  if (maxCount <= 1 && cards.length > 1) {
    return { element: '균형', message: '다양한 원소가 균형을 이루고 있어, 여러 방면에서 에너지가 골고루 작용합니다.' }
  }

  return {
    element: maxEl,
    message: ELEMENT_INTERPRETATIONS[maxEl] || '다양한 에너지가 작용하고 있습니다.',
  }
}

// ── 종합 메시지 생성 ──

function generateOverallMessage(cards: SelectedCard[], spread: SpreadType, question: string): string {
  const totalNumber = cards.reduce((sum, sc) => sum + sc.card.number, 0)
  const reversedCount = cards.filter((sc) => sc.isReversed).length
  const uprightCount = cards.length - reversedCount

  let tone = ''
  if (uprightCount > reversedCount) {
    tone = '전반적으로 긍정적인 에너지가 흐르고 있습니다.'
  } else if (reversedCount > uprightCount) {
    tone = '현재 내면의 성찰과 변화가 필요한 시기입니다.'
  } else {
    tone = '긍정과 도전이 공존하는 균형의 시기입니다.'
  }

  let energy = ''
  if (totalNumber <= 10) {
    energy = '초기의 순수한 에너지가 강합니다. 새로운 시작과 가능성의 시기입니다.'
  } else if (totalNumber <= 30) {
    energy = '성장과 발전의 에너지가 넘칩니다. 꾸준한 노력이 결실을 맺을 시기입니다.'
  } else if (totalNumber <= 50) {
    energy = '성숙과 깨달음의 에너지입니다. 인생의 중요한 교훈을 배우는 시기입니다.'
  } else {
    energy = '완성과 통합의 에너지가 강합니다. 높은 차원의 깨달음과 성취가 가능합니다.'
  }

  let spreadMsg = ''
  if (spread.id === 'one-card') {
    spreadMsg = '오늘 이 카드가 전하는 메시지를 마음에 새기고, 하루를 의미 있게 보내세요.'
  } else if (spread.id === 'three-card') {
    spreadMsg = '과거의 경험을 토대로 현재를 충실히 살며, 밝은 미래를 향해 나아가세요.'
  } else {
    spreadMsg = '관계에서 서로를 이해하고 존중하는 마음이 가장 중요합니다.'
  }

  const questionMsg = question ? `"${question}"에 대한 카드의 답변입니다. ` : ''

  return `${questionMsg}${tone} ${energy} ${spreadMsg}`
}

// ── 행운 생성 (카드 기반 시드) ──

function generateLucky(cards: SelectedCard[]): { color: string; number: number; direction: string } {
  const seed = cards.reduce((sum, sc) => sum + sc.card.number * (sc.isReversed ? 3 : 7), 0)
  const today = new Date()
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const combined = seed + dateSeed

  return {
    color: LUCKY_COLORS[combined % LUCKY_COLORS.length],
    number: (combined % 99) + 1,
    direction: LUCKY_DIRECTIONS[(combined + seed) % LUCKY_DIRECTIONS.length],
  }
}

// ── 전체 해석 생성 ──

export function generateReading(
  spread: SpreadType,
  selectedCards: { cardIndex: number; isReversed: boolean }[],
  question: string
): TarotResult {
  const cards: SelectedCard[] = selectedCards.map((sc, i) => ({
    card: MAJOR_ARCANA[sc.cardIndex],
    isReversed: sc.isReversed,
    position: spread.positions[i],
  }))

  const cardIds = cards.map((c) => c.card.id)
  const combinations = findCombinations(cardIds)
  const { element: dominantElement, message: elementMessage } = getDominantElement(cards)
  const overallMessage = generateOverallMessage(cards, spread, question)
  const lucky = generateLucky(cards)

  return {
    spread,
    cards,
    question,
    combinations,
    overallMessage,
    dominantElement,
    elementMessage,
    luckyColor: lucky.color,
    luckyNumber: lucky.number,
    luckyDirection: lucky.direction,
  }
}

// ── URL 인코딩/디코딩 ──

export function encodeResultToUrl(result: TarotResult): string {
  const params = new URLSearchParams()
  params.set('s', result.spread.id)
  params.set('c', result.cards.map((sc) => sc.card.number).join(','))
  params.set('r', result.cards.map((sc) => (sc.isReversed ? '1' : '0')).join(','))
  if (result.question) params.set('q', result.question)
  return params.toString()
}

export function decodeResultFromUrl(
  searchParams: URLSearchParams,
  spreads: SpreadType[]
): { spreadId: string; cardIndices: number[]; reversals: boolean[]; question: string } | null {
  const s = searchParams.get('s')
  const c = searchParams.get('c')
  const r = searchParams.get('r')
  if (!s || !c || !r) return null

  const spread = spreads.find((sp) => sp.id === s)
  if (!spread) return null

  const cardIndices = c.split(',').map(Number)
  const reversals = r.split(',').map((v) => v === '1')

  if (cardIndices.length !== spread.cardCount || reversals.length !== spread.cardCount) return null
  if (cardIndices.some((idx) => isNaN(idx) || idx < 0 || idx > 21)) return null

  const question = searchParams.get('q') || ''

  return { spreadId: s, cardIndices, reversals, question }
}

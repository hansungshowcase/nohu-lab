import {
  MAJOR_ARCANA,
  CARD_COMBINATIONS,
  ELEMENT_INTERPRETATIONS,
  LUCKY_COLORS,
  LUCKY_DIRECTIONS,
  POSITION_FRAMES,
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
  // 기본 해석
  combinations: { theme: string; interpretation: string }[]
  overallMessage: string
  dominantElement: string
  elementMessage: string
  luckyColor: string
  luckyNumber: number
  luckyDirection: string
  // 강화된 해석
  positionReadings: string[]
  narrative: string
  energyScore: number
  energyLabel: string
  readingTitle: string
  readingEmoji: string
  actionItems: string[]
  spiritualMessage: string
  viralSummary: string
  healthGuidance: string
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

export function randomOrientation(): boolean {
  return Math.random() < 0.5
}

// ── 카드 에너지 점수 (0~100) ──

const CARD_ENERGY: Record<number, number> = {
  0: 70, 1: 85, 2: 65, 3: 90, 4: 75, 5: 60, 6: 88,
  7: 80, 8: 78, 9: 55, 10: 82, 11: 65, 12: 45, 13: 40,
  14: 70, 15: 30, 16: 25, 17: 92, 18: 35, 19: 98, 20: 72, 21: 95,
}

function calculateEnergyScore(cards: SelectedCard[]): { score: number; label: string } {
  let total = 0
  for (const sc of cards) {
    const base = CARD_ENERGY[sc.card.number] ?? 50
    total += sc.isReversed ? Math.max(base - 25, 10) : base
  }
  const score = Math.round(total / cards.length)

  let label: string
  if (score >= 85) label = '강한 긍정 에너지 ✨'
  else if (score >= 70) label = '긍정적 흐름 🌟'
  else if (score >= 55) label = '균형 잡힌 에너지 ⚖️'
  else if (score >= 40) label = '성찰의 에너지 🌙'
  else label = '내면 변화의 에너지 🔮'

  return { score, label }
}

// ── 리딩 타이틀 생성 ──

function generateReadingTitle(cards: SelectedCard[], score: number): { title: string; emoji: string } {
  const hasLove = cards.some(c => [6, 3].includes(c.card.number) && !c.isReversed)
  const hasSuccess = cards.some(c => [19, 21, 7].includes(c.card.number) && !c.isReversed)
  const hasChange = cards.some(c => [13, 16, 10].includes(c.card.number))
  const hasWisdom = cards.some(c => [2, 9, 5].includes(c.card.number) && !c.isReversed)
  const hasDanger = cards.some(c => [15, 16, 18].includes(c.card.number) && c.isReversed)

  if (hasSuccess && score >= 80) return { title: '빛나는 성공의 계절', emoji: '☀️' }
  if (hasLove && score >= 70) return { title: '사랑이 피어나는 시기', emoji: '💕' }
  if (hasChange) return { title: '변환과 성장의 문턱', emoji: '🦋' }
  if (hasWisdom) return { title: '깊은 깨달음의 시간', emoji: '🏔️' }
  if (hasDanger) return { title: '조심스러운 전진이 필요한 때', emoji: '🌙' }
  if (score >= 75) return { title: '순풍에 돛을 달 시기', emoji: '⛵' }
  if (score >= 55) return { title: '균형과 조화의 시간', emoji: '🌿' }
  if (score >= 40) return { title: '내면을 돌볼 시기', emoji: '🕯️' }
  return { title: '깊은 성찰이 필요한 때', emoji: '🌊' }
}

// ── 한국어 조사 처리 ──

function hasJongseong(str: string): boolean {
  const last = str.charCodeAt(str.length - 1)
  if (last < 0xAC00 || last > 0xD7A3) return false
  return (last - 0xAC00) % 28 !== 0
}

function josa(name: string, particles: [string, string]): string {
  return hasJongseong(name) ? particles[0] : particles[1]
}

// ── 위치별 해석 생성 ──

function generatePositionReading(sc: SelectedCard): string {
  const frame = POSITION_FRAMES[sc.position]
  const interp = sc.isReversed ? sc.card.reversed : sc.card.upright
  const direction = sc.isReversed ? '역방향' : '정방향'

  const prefix = frame?.prefix || ''
  const suffix = frame?.suffix || ''

  return `${prefix} ${direction}의 "${sc.card.name}" 카드가 이 자리에 나타났습니다. ${interp.meaning} ${suffix}`
}

// ── 내러티브 생성 (카드들을 연결하는 이야기) ──

function generateNarrative(cards: SelectedCard[], spread: SpreadType, question: string): string {
  if (cards.length === 1) {
    const c = cards[0]
    const interp = c.isReversed ? c.card.reversed : c.card.upright
    const dir = c.isReversed ? '역방향' : '정방향'
    const qText = question ? `"${question}"이라는 질문에 대해 카드가 답합니다.\n\n` : ''
    return `${qText}오늘 당신에게 나타난 카드는 ${dir}의 "${c.card.name}"입니다.\n\n${interp.meaning}\n\n카드가 전하는 조언입니다. ${interp.advice}`
  }

  const qText = question ? `"${question}"에 대해 카드가 이야기합니다.\n\n` : ''

  if (spread.id === 'three-card') {
    const [past, present, future] = cards
    const pastI = past.isReversed ? past.card.reversed : past.card.upright
    const presentI = present.isReversed ? present.card.reversed : present.card.upright
    const futureI = future.isReversed ? future.card.reversed : future.card.upright
    const pastDir = past.isReversed ? '역방향' : '정방향'
    const presentDir = present.isReversed ? '역방향' : '정방향'
    const futureDir = future.isReversed ? '역방향' : '정방향'

    const pastSection = `[과거] ${pastDir}의 "${past.card.name}"\n${pastI.meaning.split('.').slice(0, 2).join('.')}.\n→ 교훈: ${pastI.advice.split('.')[0]}.`

    const presentSection = `[현재] ${presentDir}의 "${present.card.name}"\n${presentI.meaning.split('.').slice(0, 2).join('.')}.\n→ 지금 필요한 것: ${presentI.advice.split('.')[0]}.`

    const futureSection = `[미래] ${futureDir}의 "${future.card.name}"\n${futureI.meaning.split('.').slice(0, 2).join('.')}.\n→ 조언: ${futureI.advice.split('.')[0]}.`

    const conclusion = `\n과거의 "${past.card.name}"에서 배운 교훈${josa(past.card.name, ['을', '를'])} 현재에 적용하고, 다가올 "${future.card.name}"의 에너지에 대비하세요.`

    return `${qText}${pastSection}\n\n${presentSection}\n\n${futureSection}\n${conclusion}`
  }

  if (spread.id === 'relationship') {
    const [self, other, direction] = cards
    const selfI = self.isReversed ? self.card.reversed : self.card.upright
    const otherI = other.isReversed ? other.card.reversed : other.card.upright
    const dirI = direction.isReversed ? direction.card.reversed : direction.card.upright
    const selfDir = self.isReversed ? '역방향' : '정방향'
    const otherDir = other.isReversed ? '역방향' : '정방향'
    const dirDir = direction.isReversed ? '역방향' : '정방향'

    const selfSection = `[나] ${selfDir}의 "${self.card.name}"\n${selfI.love}`

    const otherSection = `[상대] ${otherDir}의 "${other.card.name}"\n${otherI.love}`

    const dirSection = `[관계의 방향] ${dirDir}의 "${direction.card.name}"\n${dirI.love}\n\n→ 조언: ${dirI.advice}`

    return `${qText}${selfSection}\n\n${otherSection}\n\n${dirSection}`
  }

  return ''
}

// ── 카드 조합 해석 (수동 + 자동) ──

function findCombinations(cards: SelectedCard[]): { theme: string; interpretation: string }[] {
  const results: { theme: string; interpretation: string }[] = []
  const cardIds = cards.map(c => c.card.id)

  // 수동 정의된 조합 찾기
  for (let i = 0; i < cardIds.length; i++) {
    for (let j = i + 1; j < cardIds.length; j++) {
      const a = cardIds[i], b = cardIds[j]
      const combo = CARD_COMBINATIONS.find(
        c => (c.cards[0] === a && c.cards[1] === b) || (c.cards[0] === b && c.cards[1] === a)
      )
      if (combo) {
        results.push({ theme: combo.theme, interpretation: combo.interpretation })
      }
    }
  }

  // 수동 조합이 없을 경우 자동 생성
  if (results.length === 0 && cards.length > 1) {
    // 같은 원소 체크
    const elements = cards.map(c => c.card.element)
    const uniqueEls = [...new Set(elements)]
    if (uniqueEls.length === 1) {
      results.push({
        theme: `${uniqueEls[0]}의 공명`,
        interpretation: `모든 카드가 ${uniqueEls[0]} 원소에 속해 있어 이 에너지가 매우 강하게 작용합니다. ${ELEMENT_INTERPRETATIONS[uniqueEls[0]] || ''}`,
      })
    }

    // 모두 정방향 또는 모두 역방향
    const allUpright = cards.every(c => !c.isReversed)
    const allReversed = cards.every(c => c.isReversed)
    if (allUpright) {
      results.push({
        theme: '전면 긍정의 흐름',
        interpretation: '모든 카드가 정방향으로 나타나 강한 긍정 에너지가 흐르고 있습니다. 우주가 당신의 현재 방향을 지지하고 있습니다. 자신감을 갖고 앞으로 나아가세요.',
      })
    } else if (allReversed) {
      results.push({
        theme: '깊은 내면 성찰의 시간',
        interpretation: '모든 카드가 역방향입니다. 이것은 불운이 아니라, 지금 내면 깊이 들여다봐야 할 때라는 강력한 메시지입니다. 외부 행동보다 내적 성찰에 집중하세요.',
      })
    }

    // 번호 연속 체크
    const sorted = [...cardIds].sort((a, b) => a - b)
    const isConsecutive = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1)
    if (isConsecutive && cards.length > 1) {
      results.push({
        theme: '자연스러운 진화의 흐름',
        interpretation: '연속된 번호의 카드가 나타나 자연스러운 성장과 발전의 과정을 보여주고 있습니다. 현재 당신은 영혼의 여정에서 순탄한 진화를 경험하고 있습니다.',
      })
    }
  }

  return results
}

// ── 지배 원소 ──

function getDominantElement(cards: SelectedCard[]): { element: string; message: string } {
  const counts: Record<string, number> = {}
  for (const sc of cards) {
    counts[sc.card.element] = (counts[sc.card.element] || 0) + 1
  }

  let maxEl = '', maxCount = 0
  for (const [el, count] of Object.entries(counts)) {
    if (count > maxCount) { maxEl = el; maxCount = count }
  }

  if (maxCount <= 1 && cards.length > 1) {
    return { element: '균형', message: '네 원소(불·물·바람·땅)의 에너지가 골고루 분포되어 있습니다. 어느 한쪽에 치우치지 않는 균형 잡힌 시기이며, 다양한 관점에서 상황을 바라볼 수 있는 유리한 위치에 있습니다.' }
  }

  return { element: maxEl, message: ELEMENT_INTERPRETATIONS[maxEl] || '' }
}

// ── 종합 메시지 ──

function generateOverallMessage(cards: SelectedCard[], spread: SpreadType, question: string, score: number): string {
  const reversedCount = cards.filter(c => c.isReversed).length
  const uprightCount = cards.length - reversedCount

  let tone: string
  if (uprightCount === cards.length) {
    tone = '모든 카드가 정방향입니다. 지금 가고 있는 방향이 맞습니다. 자신감을 갖고 나아가세요.'
  } else if (reversedCount === cards.length) {
    tone = '모든 카드가 역방향입니다. 지금은 행동보다 멈춰서 생각할 때입니다. 서두르지 마세요.'
  } else if (uprightCount > reversedCount) {
    tone = '전체적으로 좋은 흐름이지만, 일부 조심할 부분이 있습니다.'
  } else {
    tone = '돌아봐야 할 것들이 있지만, 긍정적인 가능성도 함께 보입니다.'
  }

  let spreadAdvice: string
  if (spread.id === 'one-card') {
    const name = cards[0].card.name
    spreadAdvice = `오늘 하루, "${name}" 카드의 메시지를 기억하세요. 선택의 순간마다 이 카드를 떠올리면 도움이 됩니다.`
  } else if (spread.id === 'three-card') {
    spreadAdvice = `과거에서 교훈을 얻고, 현재에 집중하며, 미래를 준비하세요. 세 카드가 하나의 흐름으로 연결되어 있습니다.`
  } else {
    spreadAdvice = `관계에서 가장 중요한 것은 서로를 있는 그대로 이해하는 것입니다. 나 자신을 먼저 알아야 상대도 이해할 수 있습니다.`
  }

  const questionNote = question ? `\n\n"${question}"에 대한 답: ${tone}` : ''

  return `${tone}\n\n${spreadAdvice}${questionNote}`
}

// ── 액션 아이템 생성 ──

function generateActionItems(cards: SelectedCard[], spread: SpreadType): string[] {
  const items: string[] = []
  const mainCard = cards[cards.length > 1 ? 1 : 0] // 현재/중심 카드
  const interp = mainCard.isReversed ? mainCard.card.reversed : mainCard.card.upright

  // 핵심 카드 기반 액션
  items.push(interp.advice)

  // 원소 기반 액션
  const elements = cards.map(c => c.card.element)
  if (elements.includes('불')) items.push('오늘 중 하나의 작은 행동을 실행에 옮기세요. 생각만 하지 말고 5분 안에 시작할 수 있는 것부터.')
  else if (elements.includes('물')) items.push('조용한 시간을 10분 확보하고, 지금 느끼는 감정을 종이에 적어보세요.')
  else if (elements.includes('바람')) items.push('오늘 한 사람에게 진심 어린 대화를 나눠보세요. 소통이 답을 열어줍니다.')
  else items.push('오늘 하루 재정 지출을 기록하고, 꼭 필요한 것과 아닌 것을 구분해보세요.')

  // 건강 관련 액션
  const healthCard = cards.find(c => [8, 14, 19].includes(c.card.number))
  if (healthCard) {
    items.push('30분 이상 걷기 또는 가벼운 운동으로 몸의 에너지를 순환시키세요.')
  } else {
    items.push('잠들기 전 5분 명상으로 하루를 마무리하세요. 오늘 카드의 메시지를 되새기며.')
  }

  return items.slice(0, 3)
}

// ── 영적 메시지 ──

function generateSpiritualMessage(cards: SelectedCard[]): string {
  const archetypes = cards.map(c => c.card.archetype).join(', ')
  const mainCard = cards[Math.floor(cards.length / 2)]
  return `오늘 당신에게 나타난 원형(archetype)은 "${archetypes}"입니다. 특히 ${mainCard.card.name}의 "${mainCard.card.archetype}" 에너지가 강하게 작용하고 있습니다. ${mainCard.card.affirmation} — 이 확언을 오늘 하루 세 번 반복해보세요.`
}

// ── 건강 종합 ──

function generateHealthGuidance(cards: SelectedCard[]): string {
  const messages = cards.map(c => {
    const interp = c.isReversed ? c.card.reversed : c.card.upright
    return interp.health
  })
  if (cards.length === 1) return messages[0]
  return `${messages[0]} 또한, ${messages[messages.length - 1].charAt(0).toLowerCase()}${messages[messages.length - 1].slice(1)}`
}

// ── 바이럴 요약 ──

function generateViralSummary(cards: SelectedCard[], readingTitle: string): string {
  const emojis = cards.map(c => c.card.emoji).join('')
  const names = cards.map(c => `${c.card.name}${c.isReversed ? '(역)' : ''}`).join(' + ')
  return `${emojis} ${readingTitle}\n내 타로: ${names}`
}

// ── 행운 생성 ──

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

  const combinations = findCombinations(cards)
  const { element: dominantElement, message: elementMessage } = getDominantElement(cards)
  const { score: energyScore, label: energyLabel } = calculateEnergyScore(cards)
  const { title: readingTitle, emoji: readingEmoji } = generateReadingTitle(cards, energyScore)
  const overallMessage = generateOverallMessage(cards, spread, question, energyScore)
  const lucky = generateLucky(cards)
  const positionReadings = cards.map(generatePositionReading)
  const narrative = generateNarrative(cards, spread, question)
  const actionItems = generateActionItems(cards, spread)
  const spiritualMessage = generateSpiritualMessage(cards)
  const healthGuidance = generateHealthGuidance(cards)
  const viralSummary = generateViralSummary(cards, readingTitle)

  return {
    spread, cards, question, combinations, overallMessage,
    dominantElement, elementMessage,
    luckyColor: lucky.color, luckyNumber: lucky.number, luckyDirection: lucky.direction,
    positionReadings, narrative, energyScore, energyLabel,
    readingTitle, readingEmoji, actionItems, spiritualMessage,
    viralSummary, healthGuidance,
  }
}

// ── URL 인코딩/디코딩 ──

export function encodeResultToUrl(result: TarotResult): string {
  const params = new URLSearchParams()
  params.set('s', result.spread.id)
  params.set('c', result.cards.map(sc => sc.card.number).join(','))
  params.set('r', result.cards.map(sc => (sc.isReversed ? '1' : '0')).join(','))
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

  const spread = spreads.find(sp => sp.id === s)
  if (!spread) return null

  const cardIndices = c.split(',').map(Number)
  const reversals = r.split(',').map(v => v === '1')

  if (cardIndices.length !== spread.cardCount || reversals.length !== spread.cardCount) return null
  if (cardIndices.some(idx => isNaN(idx) || idx < 0 || idx > 21)) return null

  return { spreadId: s, cardIndices, reversals, question: searchParams.get('q') || '' }
}

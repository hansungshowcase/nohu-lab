export interface MemoryCard {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

const EMOJI_POOL = [
  '🧠', '⚡', '💎', '🎯', '🚀', '🔮', '🌿', '🔥',
  '🪐', '🎧', '🧩', '🏆', '✨', '📚', '🛡️', '🕹️',
]

export function generateMemoryBoard(pairs: number): MemoryCard[] {
  const selected = EMOJI_POOL.slice(0, pairs)
  const cards = [...selected, ...selected].map((emoji, id) => ({
    id,
    emoji,
    flipped: false,
    matched: false,
  }))

  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }

  return cards
}

export function getMemoryDifficulty(level: number): { pairs: number; previewMs: number } {
  if (level <= 1) return { pairs: 4, previewMs: 3200 }
  if (level <= 2) return { pairs: 6, previewMs: 4200 }
  return { pairs: 8, previewMs: 5200 }
}

export function scoreMemory(mistakes: number, timeMs: number, pairs: number): number {
  const targetTime = pairs * 1700
  const timeScore = Math.max(0, 100 - Math.max(0, timeMs - targetTime) / targetTime * 42)
  const mistakeScore = Math.max(0, 100 - mistakes * 11)
  return Math.round(Math.min(100, Math.max(0, timeScore * 0.48 + mistakeScore * 0.52)))
}

export interface MathProblem {
  question: string
  answer: number
  options: number[]
}

export function generateMathProblems(level: number, count: number): MathProblem[] {
  const problems: MathProblem[] = []

  for (let i = 0; i < count; i += 1) {
    let a = 0
    let b = 0
    let op: '+' | '-' | '×' = '+'
    let answer = 0

    if (level <= 1) {
      a = Math.floor(Math.random() * 50) + 10
      b = Math.floor(Math.random() * 30) + 5
      op = Math.random() > 0.5 ? '+' : '-'
    } else if (level <= 2) {
      if (Math.random() > 0.35) {
        a = Math.floor(Math.random() * 90) + 20
        b = Math.floor(Math.random() * 60) + 10
        op = Math.random() > 0.45 ? '+' : '-'
      } else {
        a = Math.floor(Math.random() * 12) + 3
        b = Math.floor(Math.random() * 9) + 3
        op = '×'
      }
    } else if (Math.random() > 0.45) {
      a = Math.floor(Math.random() * 220) + 60
      b = Math.floor(Math.random() * 120) + 20
      op = Math.random() > 0.45 ? '+' : '-'
    } else {
      a = Math.floor(Math.random() * 16) + 4
      b = Math.floor(Math.random() * 13) + 4
      op = '×'
    }

    if (op === '-' && a < b) [a, b] = [b, a]
    answer = op === '+' ? a + b : op === '-' ? a - b : a * b

    const wrongSet = new Set<number>()
    while (wrongSet.size < 3) {
      const offset = Math.floor(Math.random() * (level >= 3 ? 28 : 18)) + 1
      const wrong = Math.random() > 0.5 ? answer + offset : answer - offset
      if (wrong !== answer && wrong >= 0) wrongSet.add(wrong)
    }

    const options = [answer, ...wrongSet]
    for (let j = options.length - 1; j > 0; j -= 1) {
      const k = Math.floor(Math.random() * (j + 1))
      ;[options[j], options[k]] = [options[k], options[j]]
    }

    problems.push({ question: `${a} ${op} ${b}`, answer, options })
  }

  return problems
}

export function scoreMath(correct: number, total: number, avgTimeMs: number): number {
  const accuracyScore = (correct / total) * 100
  const speedScore = Math.max(0, 100 - Math.max(0, avgTimeMs - 1600) / 25)
  return Math.round(Math.min(100, accuracyScore * 0.76 + speedScore * 0.24))
}

export type ReactionTarget = {
  type: 'go' | 'nogo'
  color: string
  shape: string
  delay: number
}

export function generateReactionTargets(level: number, count: number): ReactionTarget[] {
  const targets: ReactionTarget[] = []
  const goRatio = level <= 1 ? 0.78 : level <= 2 ? 0.68 : 0.58
  const minDelay = level <= 1 ? 900 : level <= 2 ? 700 : 550
  const spread = level <= 1 ? 1700 : level <= 2 ? 1500 : 1300

  for (let i = 0; i < count; i += 1) {
    const isGo = Math.random() < goRatio
    targets.push({
      type: isGo ? 'go' : 'nogo',
      color: isGo ? '#10b981' : '#ef4444',
      shape: isGo ? 'circle' : 'square',
      delay: Math.floor(Math.random() * spread) + minDelay,
    })
  }

  return targets
}

export function scoreReaction(
  avgReactionMs: number,
  falsePositives: number,
  misses: number,
  total: number
): number {
  const speedScore = Math.max(0, 100 - Math.max(0, avgReactionMs - 260) / 8.5)
  const accuracyPenalty = (falsePositives + misses) * (110 / total)
  return Math.round(Math.max(0, Math.min(100, speedScore - accuracyPenalty)))
}

export interface BrainResult {
  memoryScore: number
  mathScore: number
  reactionScore: number
  totalScore: number
  brainAge: number
  percentile: number
}

export function calculateBrainAge(
  memoryScore: number,
  mathScore: number,
  reactionScore: number,
  realAge: number
): BrainResult {
  const totalScore = Math.round(memoryScore * 0.36 + mathScore * 0.34 + reactionScore * 0.3)
  const ageAnchor = Math.max(26, Math.min(72, realAge * 0.72 + 20))
  let brainAge = Math.round(ageAnchor + (58 - totalScore) * 0.48)

  if (realAge >= 60 && totalScore >= 82) brainAge -= 4
  else if (realAge >= 50 && totalScore >= 74) brainAge -= 2

  brainAge = Math.max(20, Math.min(82, brainAge))

  const peerMean = Math.max(30, Math.min(72, realAge * 0.78 + 14))
  const percentile = Math.round(Math.min(99, Math.max(1, 50 + (peerMean - brainAge) * 3.2 + (totalScore - 60) * 0.28)))

  return { memoryScore, mathScore, reactionScore, totalScore, brainAge, percentile }
}

export function getAutoLevel(prevScore: number | null): number {
  if (prevScore === null) return 1
  if (prevScore >= 82) return 3
  if (prevScore >= 58) return 2
  return 1
}

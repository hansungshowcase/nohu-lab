// 미니게임 로직 + 뇌나이 환산 엔진

/* ── 1. 기억력 카드 뒤집기 ── */
export interface MemoryCard {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

const EMOJI_POOL = [
  '🍎','🍊','🍋','🍇','🍓','🍑','🍒','🥝','🍌','🥭',
  '🌸','🌻','🌺','🪻','🌷','🌹','🍀','🌿','🌵','🪴',
  '🐶','🐱','🐰','🦊','🐻','🐼','🐯','🦁','🐸','🦋',
]

export function generateMemoryBoard(pairs: number): MemoryCard[] {
  const selected = EMOJI_POOL.slice(0, pairs)
  const cards = [...selected, ...selected].map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }))
  // Fisher-Yates 셔플
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

export function getMemoryDifficulty(level: number): { pairs: number; previewMs: number } {
  if (level <= 1) return { pairs: 4, previewMs: 3000 }   // 4쌍 = 8장 (2x4)
  if (level <= 2) return { pairs: 6, previewMs: 4000 }   // 6쌍 = 12장 (3x4)
  return { pairs: 8, previewMs: 5000 }                     // 8쌍 = 16장 (4x4)
}

/** 기억력 점수: 실수 횟수 + 소요 시간 기반 (0~100) */
export function scoreMemory(mistakes: number, timeMs: number, pairs: number): number {
  const perfectTime = pairs * 1500          // 최적 시간 추정
  const timeScore = Math.max(0, 100 - ((timeMs - perfectTime) / perfectTime) * 40)
  const mistakeScore = Math.max(0, 100 - mistakes * 12)
  return Math.round(timeScore * 0.5 + mistakeScore * 0.5)
}

/* ── 2. 암산 속도 ── */
export interface MathProblem {
  question: string
  answer: number
  options: number[]
}

export function generateMathProblems(level: number, count: number): MathProblem[] {
  const problems: MathProblem[] = []
  for (let i = 0; i < count; i++) {
    let a: number, b: number, op: string, answer: number

    if (level <= 1) {
      // 쉬움: 두 자릿수 덧셈/뺄셈
      a = Math.floor(Math.random() * 50) + 10
      b = Math.floor(Math.random() * 30) + 5
      if (Math.random() > 0.5) {
        op = '+'
        answer = a + b
      } else {
        op = '−'
        if (a < b) [a, b] = [b, a]
        answer = a - b
      }
    } else if (level <= 2) {
      // 보통: 세 자릿수 or 곱셈
      if (Math.random() > 0.4) {
        a = Math.floor(Math.random() * 90) + 10
        b = Math.floor(Math.random() * 50) + 10
        op = Math.random() > 0.5 ? '+' : '−'
        if (op === '−' && a < b) [a, b] = [b, a]
        answer = op === '+' ? a + b : a - b
      } else {
        a = Math.floor(Math.random() * 12) + 2
        b = Math.floor(Math.random() * 9) + 2
        op = '×'
        answer = a * b
      }
    } else {
      // 어려움: 큰 수 or 복합 연산
      if (Math.random() > 0.5) {
        a = Math.floor(Math.random() * 200) + 50
        b = Math.floor(Math.random() * 100) + 20
        op = Math.random() > 0.5 ? '+' : '−'
        if (op === '−' && a < b) [a, b] = [b, a]
        answer = op === '+' ? a + b : a - b
      } else {
        a = Math.floor(Math.random() * 15) + 3
        b = Math.floor(Math.random() * 12) + 3
        op = '×'
        answer = a * b
      }
    }

    const question = `${a} ${op} ${b}`

    // 오답 생성 (정답 근처 ±1~20)
    const wrongSet = new Set<number>()
    while (wrongSet.size < 3) {
      const offset = Math.floor(Math.random() * 20) + 1
      const wrong = Math.random() > 0.5 ? answer + offset : answer - offset
      if (wrong !== answer && wrong >= 0) wrongSet.add(wrong)
    }

    const options = [answer, ...wrongSet]
    // 셔플
    for (let j = options.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1))
      ;[options[j], options[k]] = [options[k], options[j]]
    }

    problems.push({ question, answer, options })
  }
  return problems
}

/** 암산 점수: 정답률 + 평균 응답 시간 기반 (0~100) */
export function scoreMath(correct: number, total: number, avgTimeMs: number): number {
  const accuracyScore = (correct / total) * 100
  const speedBonus = Math.max(0, 20 - (avgTimeMs - 2000) / 200)
  return Math.round(Math.min(100, accuracyScore * 0.7 + speedBonus * 0.3))
}

/* ── 3. 반응속도 테스트 ── */
export type ReactionTarget = {
  type: 'go' | 'nogo'
  color: string
  shape: string
  delay: number  // ms before appearing
}

export function generateReactionTargets(level: number, count: number): ReactionTarget[] {
  const targets: ReactionTarget[] = []
  const goRatio = level <= 1 ? 0.8 : level <= 2 ? 0.7 : 0.6

  for (let i = 0; i < count; i++) {
    const isGo = Math.random() < goRatio
    targets.push({
      type: isGo ? 'go' : 'nogo',
      color: isGo ? '#22c55e' : '#ef4444',
      shape: isGo ? '원' : '사각형',
      delay: Math.floor(Math.random() * 2000) + 1000,
    })
  }
  return targets
}

/** 반응속도 점수: 평균 반응 시간 + 오탐률 기반 (0~100) */
export function scoreReaction(
  avgReactionMs: number,
  falsePositives: number,
  misses: number,
  total: number
): number {
  // 300ms = 완벽, 800ms = 보통, 1500ms+ = 느림
  const speedScore = Math.max(0, 100 - ((avgReactionMs - 300) / 10))
  const accuracyPenalty = (falsePositives + misses) * 10
  return Math.round(Math.max(0, Math.min(100, speedScore - accuracyPenalty)))
}

/* ── 뇌나이 환산 엔진 ── */
export interface BrainResult {
  memoryScore: number
  mathScore: number
  reactionScore: number
  totalScore: number
  brainAge: number
  percentile: number
}

/**
 * 종합 점수 → 뇌나이 환산
 * 만점(100) = 20세, 0점 = 80세 (선형)
 * 실제나이 보정: 고령일수록 같은 점수에 더 좋은 뇌나이 부여
 */
export function calculateBrainAge(
  memoryScore: number,
  mathScore: number,
  reactionScore: number,
  realAge: number
): BrainResult {
  const totalScore = Math.round(memoryScore * 0.35 + mathScore * 0.35 + reactionScore * 0.3)

  // 뇌나이 = 80 - (totalScore * 0.6) 기본값
  let brainAge = Math.round(80 - totalScore * 0.6)

  // 나이 보정: 60대 이상이 80점 넘으면 추가 보너스
  if (realAge >= 60 && totalScore >= 80) {
    brainAge = Math.max(brainAge - 3, 20)
  } else if (realAge >= 50 && totalScore >= 70) {
    brainAge = Math.max(brainAge - 2, 20)
  }

  brainAge = Math.max(20, Math.min(80, brainAge))

  // 또래 퍼센타일 (정규분포 기반 시뮬레이션)
  const ageMean = Math.max(30, realAge * 0.85) // 나이별 평균 뇌나이
  const diff = ageMean - brainAge
  const percentile = Math.round(Math.min(99, Math.max(1, 50 + diff * 3)))

  return { memoryScore, mathScore, reactionScore, totalScore, brainAge, percentile }
}

/** 난이도 자동 조절: 이전 점수 기반 */
export function getAutoLevel(prevScore: number | null): number {
  if (prevScore === null) return 1
  if (prevScore >= 80) return 3
  if (prevScore >= 50) return 2
  return 1
}

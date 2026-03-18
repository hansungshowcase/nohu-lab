// 일주 검증: 2024-01-01 실제 간지 확인
// 만세력 기준: 2024-01-01 = 갑진(甲辰)일? 병진(丙辰)일?
// 공식 만세력: 2024년 1월 1일 = 병진일(丙辰) → stem=2(병), branch=4(진)
// 검증: https://sajuplus.com 등 여러 만세력 사이트 기준

// 코드의 getDayPillar 로직 시뮬레이션
function testDayPillar(year: number, month: number, day: number) {
  const ref = new Date(2024, 0, 1)
  const target = new Date(year, month - 1, day)
  const diffDays = Math.round((target.getTime() - ref.getTime()) / 86400000)
  const stem = (((diffDays + 2) % 10) + 10) % 10
  const branch = (((diffDays + 4) % 12) + 12) % 12
  return { stem, branch, diffDays }
}

const STEMS = ['갑','을','병','정','무','기','경','신','임','계']
const BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해']

// 알려진 일주들로 검증 (만세력 기준)
// 2024-01-01 = 병진(丙辰) → stem=2, branch=4
// 2024-01-02 = 정사(丁巳) → stem=3, branch=5
// 2024-06-15 = ? (만세력으로 확인 필요)
const tests = [
  { y: 2024, m: 1, d: 1, expected: '병진' },
  { y: 2024, m: 1, d: 2, expected: '정사' },
  { y: 2024, m: 1, d: 3, expected: '무오' },
  { y: 2000, m: 1, d: 1, expected: '갑진' },  // 만세력 기준
  { y: 1990, m: 5, d: 1, expected: '경자' },  // 만세력 기준
]

console.log('=== 일주 검증 ===')
for (const t of tests) {
  const r = testDayPillar(t.y, t.m, t.d)
  const result = `${STEMS[r.stem]}${BRANCHES[r.branch]}`
  console.log(`${t.y}-${String(t.m).padStart(2,'0')}-${String(t.d).padStart(2,'0')} | 계산: ${result} | 기대: ${t.expected} | ${result === t.expected ? '✅' : '❌'}`)
}

// 시주 검증
console.log('\n=== 시주(getHourBranch) 검증 ===')
function getHourBranch(hour: number): number {
  if (hour === 23 || hour === 0) return 0
  return Math.floor((hour + 1) / 2)
}

// 정확한 시간 → 지지 매핑:
// 23~01 → 자(0), 01~03 → 축(1), 03~05 → 인(2), 05~07 → 묘(3)
// 07~09 → 진(4), 09~11 → 사(5), 11~13 → 오(6), 13~15 → 미(7)
// 15~17 → 신(8), 17~19 → 유(9), 19~21 → 술(10), 21~23 → 해(11)
const hourExpected: [number, string][] = [
  [0, '자'], [1, '축'], [2, '축'], [3, '인'], [4, '인'], [5, '묘'],
  [6, '묘'], [7, '진'], [8, '진'], [9, '사'], [10, '사'], [11, '오'],
  [12, '오'], [13, '미'], [14, '미'], [15, '신'], [16, '신'], [17, '유'],
  [18, '유'], [19, '술'], [20, '술'], [21, '해'], [22, '해'], [23, '자']
]

for (const [hour, expected] of hourExpected) {
  const result = getHourBranch(hour)
  const name = BRANCHES[result]
  const pass = name === expected
  if (!pass) console.log(`hour=${hour} | 계산: ${name}(${result}) | 기대: ${expected} | ❌ FAIL`)
}
console.log('시주 검증 완료 (FAIL만 표시)')

// birthHour 검증
console.log('\n=== birthHour=-1 URL 파라미터 검증 ===')
const result_hour = -1
console.log(`birthHour !== null: ${result_hour !== null}`)
console.log(`→ h=-1이 URL에 포함될 수 있음: ${result_hour !== null ? 'YES (버그)' : 'NO'}`)

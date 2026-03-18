/**
 * 커밋 전 기능 퇴보 방지 자동 검증 스크립트
 * 사용법: node scripts/pre-commit-check.mjs
 *
 * 이 스크립트는 코드 수정 후 기존 기능이 깨지지 않았는지 검증합니다.
 * 모든 항목이 PASS여야 커밋할 수 있습니다.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
let pass = 0, fail = 0
const errors = []

function check(name, condition) {
  if (condition) { pass++; console.log(`  ✅ ${name}`) }
  else { fail++; errors.push(name); console.log(`  ❌ ${name}`) }
}

function fileContains(filePath, text) {
  const full = resolve(ROOT, filePath)
  if (!existsSync(full)) return false
  return readFileSync(full, 'utf-8').includes(text)
}

function fileNotContainsDuplicate(filePath, funcName) {
  const full = resolve(ROOT, filePath)
  if (!existsSync(full)) return true
  const content = readFileSync(full, 'utf-8')
  const regex = new RegExp(`(function ${funcName}|const ${funcName})`, 'g')
  const matches = content.match(regex)
  return !matches || matches.length <= 1
}

console.log('\n🔍 기능 퇴보 방지 검증 시작\n')

// ═══ 1. MentalHealth.tsx 핵심 기능 ═══
console.log('── 심리 자가진단 (MentalHealth.tsx) ──')
const mh = 'components/programs/MentalHealth.tsx'

check('카카오 SDK 키 존재', fileContains(mh, '3913fde247b12ce25084eb42a9b17ed9'))
check('Kakao.Share.sendDefault 호출', fileContains(mh, 'Share.sendDefault'))
check('카카오 fallback (navigator.share)', fileContains(mh, 'navigator.share'))
check('이미지 저장 (html-to-image)', fileContains(mh, "import('html-to-image')"))
check('이미지 저장 (toPng)', fileContains(mh, 'toPng'))
check('Blob 다운로드', fileContains(mh, 'createObjectURL'))
check('URL 파라미터 읽기 (sharedScores)', fileContains(mh, 'sharedScores'))
check('무료 제한 (FREE_LIMIT)', fileContains(mh, 'FREE_LIMIT'))
check('무료 제한 (getTestCount)', fileContains(mh, 'getTestCount'))
check('localStorage try/catch', fileContains(mh, 'catch'))
check('자살위험 경고', fileContains(mh, 'suicideRisk'))
check('분석 중 애니메이션', fileContains(mh, 'AnalyzingScreen'))
check('자동 전환 (advanceToNext)', fileContains(mh, 'advanceToNext'))
check('transitionLock (더블탭 방지)', fileContains(mh, 'transitionLock'))
check('scrollTo top', fileContains(mh, 'scrollTo'))
check('모바일 반응형 (max-w-lg)', fileContains(mh, 'max-w-lg'))
check('break-keep (줄바꿈)', fileContains(mh, 'break-keep'))

// ═══ 2. questions.ts 핵심 기능 ═══
console.log('\n── 설문 데이터 (questions.ts) ──')
const q = 'components/programs/mental-health/questions.ts'

check('5개 스케일 존재', fileContains(q, "id: 'insomnia'"))
check('역채점 (reverseItems)', fileContains(q, 'reverseItems'))
check('미응답 제외 (key in answers)', fileContains(q, '!(key in answers)'))
check('자살위험 함수', fileContains(q, 'hasSuicideRisk'))
check('종합위험도 함수', fileContains(q, 'getOverallRisk'))
check('문항분석 함수', fileContains(q, 'getHighScoringItems'))

// ═══ 3. tips.ts 핵심 기능 ═══
console.log('\n── 소견 데이터 (tips.ts) ──')
const t = 'components/programs/mental-health/tips.ts'

check('교차해석 함수', fileContains(t, 'getCrossInterpretation'))
check('5개 스케일 tips (insomnia)', fileContains(t, 'insomnia:'))
check('5개 스케일 tips (selfesteem)', fileContains(t, 'selfesteem:'))

// ═══ 4. PensionTiming.tsx 핵심 기능 ═══
console.log('\n── 연금 프로그램 (PensionTiming.tsx) ──')
const pt = 'components/programs/PensionTiming.tsx'

check('getShareUrl 중복 없음', fileNotContainsDuplicate(pt, 'getShareUrl'))
check('handleCalc 존재', fileContains(pt, 'handleCalc'))
check('kakaoMsg 존재', fileContains(pt, 'kakaoMsg'))

// ═══ 5. 등록/라우팅 ═══
console.log('\n── 등록/라우팅 ──')
const reg = 'app/programs/registry.ts'
const page = 'app/programs/[programId]/page.tsx'

check('registry: mental-health', fileContains(reg, "id: 'mental-health'"))
check('page: MentalHealth lazy import', fileContains(page, "import('@/components/programs/MentalHealth')"))
check('page: PensionTiming lazy import', fileContains(page, "import('@/components/programs/PensionTiming')"))

// ═══ 6. 레이아웃 ═══
console.log('\n── 레이아웃 ──')
check('Kakao SDK 스크립트 로드', fileContains('app/layout.tsx', 'kakao_js_sdk'))

// ═══ 결과 ═══
console.log(`\n${'═'.repeat(40)}`)
console.log(`결과: ✅ ${pass} / ❌ ${fail} / 총 ${pass + fail}`)
if (errors.length) {
  console.log(`\n🚨 실패 항목:`)
  errors.forEach(e => console.log(`   - ${e}`))
  console.log('\n⛔ 이 상태로 커밋하면 안 됩니다!')
}
console.log(`${'═'.repeat(40)}\n`)

process.exit(fail > 0 ? 1 : 0)

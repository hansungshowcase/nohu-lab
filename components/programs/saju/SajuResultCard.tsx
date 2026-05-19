'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES_HANJA,
  ELEMENTS, ELEMENTS_HANJA, Pillar, pillarToHanja,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  getYearFortune, getViralSummary,
  getUsefulGodAdvice,
  getDaeunInterpretation,
  SINSAL_INTERPRETATIONS,
  TEN_GOD_INTERPRETATIONS,
  HAPCHUNG_INTERPRETATIONS,
  EXTRA_SINSAL_INTERPRETATIONS,
  ROOT_STRENGTH_LABELS,
  GONGMANG_SEVERITY_LABELS,
  JONGGUK_INTERPRETATIONS,
} from './sajuData'

interface Props {
  result: SajuResult
}

const DAY_MASTER_PLAIN = [
  { label: '원칙이 강한 리더형', match: '차분하게 균형을 잡아주는 사람', caution: '지나치게 날카롭거나 통제하려는 사람' },
  { label: '부드럽지만 생활력이 강한 실속형', match: '따뜻하게 밀어주고 현실을 함께 챙기는 사람', caution: '기준이 너무 높고 차가운 사람' },
  { label: '밝고 추진력 있는 표현형', match: '섬세하게 보완해주고 품격을 맞춰주는 사람', caution: '감정 기복이 크거나 너무 자유로운 사람' },
  { label: '조용하지만 직감이 좋은 몰입형', match: '큰 그림을 잡아주고 안정감을 주는 사람', caution: '예민함을 더 자극하는 사람' },
  { label: '믿음직하고 책임감 강한 관리자형', match: '따뜻하게 움직이게 해주는 사람', caution: '너무 급하고 자기주장이 강한 사람' },
  { label: '꼼꼼하고 사람을 잘 챙기는 현실형', match: '기준이 분명하고 약속을 지키는 사람', caution: '우유부단하거나 감정적으로 흔드는 사람' },
  { label: '결단력 있고 승부욕 강한 실행형', match: '유연하게 받아주면서 현실감 있는 사람', caution: '자존심 싸움을 크게 만드는 사람' },
  { label: '섬세하고 기준이 높은 완성형', match: '밝고 따뜻하게 마음을 열어주는 사람', caution: '무례하거나 압박이 강한 사람' },
  { label: '아이디어가 많고 활동 반경이 넓은 기획형', match: '깊이를 알아주고 감정적으로 안정된 사람', caution: '답답하게 묶어두는 사람' },
  { label: '차분하고 눈치가 빠른 분석형', match: '중심을 잡아주고 꾸준히 지켜주는 사람', caution: '성급하고 감정 표현이 과한 사람' },
] as const

function getPlainProfile(dayMaster: number) {
  return DAY_MASTER_PLAIN[dayMaster] || DAY_MASTER_PLAIN[0]
}

function getCoreProfileReading(result: SajuResult): string {
  const profile = getPlainProfile(result.dayMaster)
  const strength = result.isDayMasterStrong
    ? '자기 판단으로 방향을 정하고 밀고 갈 때 성과가 빠르게 나는 편입니다.'
    : '혼자 밀어붙이기보다 좋은 환경, 믿을 만한 사람, 자격과 경험의 도움을 받을수록 안정됩니다.'

  const readings = [
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 큰 방향을 보면 책임감과 주도성이 강하고, 한 번 정한 기준은 쉽게 바꾸지 않습니다. ${strength}`,
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 부드럽게 맞춰주는 듯 보여도 생활력과 지속력이 강하고, 시간이 갈수록 실속을 만드는 타입입니다. ${strength}`,
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 표현이 밝고 추진 속도가 빠르며, 사람 앞에서 에너지가 살아나는 타입입니다. ${strength}`,
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 조용해 보여도 눈치와 직감이 빠르고, 분위기와 사람 마음을 읽는 감각이 좋습니다. ${strength}`,
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 쉽게 흔들리지 않고 책임을 지려는 기질이 강해, 주변에서 믿고 맡기는 일이 생기기 쉽습니다. ${strength}`,
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 현실 감각이 좋고 사람을 챙기는 힘이 있어, 관계와 생활 기반을 차분히 쌓아가는 타입입니다. ${strength}`,
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 결단이 빠르고 승부욕이 있어, 해야 한다고 판단하면 행동으로 밀어붙이는 힘이 큽니다. ${strength}`,
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 기준이 높고 완성도를 중요하게 보며, 대충 넘어가기보다 정확하게 다듬어야 마음이 놓이는 타입입니다. ${strength}`,
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 생각의 폭이 넓고 흐름을 읽는 감각이 좋아, 한곳에 갇히기보다 판을 크게 보는 타입입니다. ${strength}`,
    `먼저 보이는 중심 성향은 '${profile.label}'입니다. 관찰력과 판단이 빠르고, 겉으로 드러내기 전까지 속으로 계산을 끝내는 타입입니다. ${strength}`,
  ]

  return readings[result.dayMaster] || readings[0]
}

/* ── 사주 기둥 박스 ── */
function PillarBox({ label, pillar, tenGod, isMe }: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }) {
  const stemEl = STEM_ELEMENT[pillar.stem]
  const branchEl = BRANCH_ELEMENT[pillar.branch]
  const elColors = ['text-green-700','text-red-600','text-yellow-700','text-gray-600','text-blue-700']
  const elBgs = ['bg-green-50','bg-red-50','bg-yellow-50','bg-gray-100','bg-blue-50']
  const yinyang = STEM_YINYANG[pillar.stem] === 1 ? '양' : '음'

  return (
    <div className={`flex flex-col items-center flex-1 min-w-0 ${isMe ? 'relative' : ''}`}>
      {isMe && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs bg-orange-500 text-white px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap font-bold">★ 나</div>}
      <span className="text-xs text-gray-400 mb-0.5 truncate">{label}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded mb-1 truncate ${isMe ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>{tenGod || '-'}</span>
      <div className={`border-2 rounded-xl w-full max-w-[72px] overflow-hidden ${isMe ? 'border-orange-400 shadow-sm shadow-orange-100' : 'border-gray-200'}`}>
        <div className={`${elBgs[stemEl]} p-1.5 sm:p-2 text-center`}>
          <div className={`text-xl sm:text-2xl font-black ${elColors[stemEl]}`}>{STEMS_HANJA[pillar.stem]}</div>
          <div className="text-xs text-gray-500 leading-tight">{STEMS[pillar.stem]}·{ELEMENTS[stemEl]}·{yinyang}</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className={`${elBgs[branchEl]} p-1.5 sm:p-2 text-center`}>
          <div className={`text-xl sm:text-2xl font-black ${elColors[branchEl]}`}>{BRANCHES_HANJA[pillar.branch]}</div>
          <div className="text-xs text-gray-500">{ELEMENTS[branchEl]}</div>
        </div>
      </div>
    </div>
  )
}

function EmptyPillarBox() {
  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <span className="text-xs text-gray-400 mb-0.5">시주(時)</span>
      <span className="text-xs px-1.5 py-0.5 rounded mb-1 bg-gray-100 text-gray-400">-</span>
      <div className="border-2 border-dashed border-gray-200 rounded-xl w-full max-w-[72px] overflow-hidden">
        <div className="bg-gray-50 p-1.5 sm:p-2 text-center">
          <div className="text-xl sm:text-2xl text-gray-300">?</div>
          <div className="text-xs text-gray-300">미입력</div>
        </div>
        <div className="border-t border-gray-100" />
        <div className="bg-gray-50 p-1.5 sm:p-2 text-center">
          <div className="text-xl sm:text-2xl text-gray-300">?</div>
          <div className="text-xs text-gray-300">-</div>
        </div>
      </div>
    </div>
  )
}

/* ── 오행 밸런스 바 ── */
function ElementBar({ counts, total }: { counts: number[]; total: number }) {
  const colors = ['bg-green-500','bg-red-500','bg-yellow-500','bg-gray-400','bg-blue-500']
  const names = ['목','화','토','금','수']
  const fullNames = ['목(木)','화(火)','토(土)','금(金)','수(水)']
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-4 mb-2.5">
        {counts.map((c, i) => (
          c > 0 && <div key={i} className={`${colors[i]} transition-all`} style={{ width: `${(c/total)*100}%` }} />
        ))}
      </div>
      <div className="flex justify-between text-xs">
        {counts.map((c, i) => (
          <span key={i} className={`${c === 0 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
            <span className="hidden sm:inline">{fullNames[i]}</span>
            <span className="sm:hidden">{names[i]}</span>
            {' '}{c > 0 ? c.toFixed(1) : '-'}
          </span>
        ))}
      </div>
    </div>
  )
}

function getSeasonName(monthBranch: number): string {
  if ([2, 3].includes(monthBranch)) return '봄 목기(木氣)'
  if ([5, 6].includes(monthBranch)) return '여름 화기(火氣)'
  if ([8, 9].includes(monthBranch)) return '가을 금기(金氣)'
  if ([11, 0].includes(monthBranch)) return '겨울 수기(水氣)'
  return '환절기 토기(土氣)'
}

function getTopTenGod(result: SajuResult): string {
  const entries = Object.entries(result.yearAnalysis.tenGodCounts)
    .filter(([name]) => name !== '일주')
    .sort((a, b) => b[1] - a[1])
  return entries[0]?.[0] || result.yearAnalysis.dominantTenGod || result.tenGods[1] || '비견'
}

function getElementTone(result: SajuResult): string {
  const max = Math.max(...result.elementCounts)
  const min = Math.min(...result.elementCounts)
  const strong = result.elementCounts.findIndex((v) => v === max)
  const weak = result.elementCounts.findIndex((v) => v === min)
  return `${ELEMENTS[strong]}(${ELEMENTS_HANJA[strong]}) 기운이 가장 강하고 ${ELEMENTS[weak]}(${ELEMENTS_HANJA[weak]}) 기운이 가장 약합니다. 강한 기운은 장점이지만 과하면 고집·과로·편중으로 드러나고, 약한 기운은 보완해야 운이 부드럽게 풀립니다.`
}

function getDaeunTheme(tenGod: string): string {
  if (tenGod.includes('재')) return `현재 큰 흐름은 ${tenGod}운입니다. 쉽게 말해 돈, 사업, 거래, 성과를 직접 만지는 시기입니다. 벌 기회가 늘지만 지출과 욕심도 같이 커지므로 계약서, 세금, 현금흐름을 먼저 확인해야 합니다.`
  if (tenGod.includes('관')) return `현재 큰 흐름은 ${tenGod}운입니다. 직장, 책임, 직함, 시험, 평판이 중요해지는 시기입니다. 부담은 늘지만 규칙을 지키고 실력을 증명하면 승진, 합격, 신뢰로 이어질 수 있습니다.`
  if (tenGod.includes('인')) return `현재 큰 흐름은 ${tenGod}운입니다. 공부, 자격증, 문서, 윗사람 도움으로 운이 열립니다. 당장 돈을 크게 벌기보다 실력, 학력, 자격, 안전장치를 만드는 쪽이 훨씬 유리합니다.`
  if (tenGod.includes('식') || tenGod.includes('상')) return `현재 큰 흐름은 ${tenGod}운입니다. 말, 글, 기술, 콘텐츠, 결과물을 밖으로 꺼내야 기회가 생깁니다. 다만 말실수, 과로, 즉흥적인 결정은 손해로 이어질 수 있습니다.`
  return `현재 큰 흐름은 ${tenGod}운입니다. 사람, 경쟁, 독립, 동업 문제가 두드러지는 시기입니다. 내 힘을 키우기에는 좋지만 돈이 사람 때문에 새지 않도록 선을 분명히 해야 합니다.`
}

function getPillarPlainName(pillar: string): string {
  if (pillar.includes('일')) return '나 자신, 배우자, 가까운 관계의 자리'
  if (pillar.includes('월')) return '직장, 부모, 생활 기반의 자리'
  if (pillar.includes('년')) return '윗사람, 외부 평판, 오래된 환경의 자리'
  if (pillar.includes('시')) return '자녀, 말년, 실행 결과의 자리'
  return '중요한 자리'
}

function getGyeokPlain(result: SajuResult, topTenGod: string): string {
  const name = result.gyeokguk.name
  const topRole = getTenGodPlainRole(topTenGod)
  if (name.includes('식신')) return `격국은 ${name}으로 봅니다. 쉽게 말하면 타고난 재능을 꾸준히 꺼내 사람들에게 신뢰를 얻는 구조입니다. 말, 글, 기술, 콘텐츠, 요리, 교육, 상담처럼 내가 만든 결과물이 분명할 때 길이 열립니다. ${topRole}`
  if (name.includes('상관')) return `격국은 ${name}으로 봅니다. 쉽게 말하면 남과 다른 표현력, 기획력, 문제를 비트는 감각으로 길이 열리는 구조입니다. 단, 말이 세지거나 규칙을 무시하면 손해가 나므로 결과물은 자유롭게 만들되 계약과 조직 질서는 지켜야 합니다. ${topRole}`
  if (name.includes('정재')) return `격국은 ${name}으로 봅니다. 쉽게 말하면 성실하게 모으고 관리해서 재산을 만드는 구조입니다. 월급, 고정 수입, 부동산, 장기 저축처럼 안정적인 흐름이 맞습니다. ${topRole}`
  if (name.includes('편재')) return `격국은 ${name}으로 봅니다. 쉽게 말하면 시장 감각, 거래 감각, 사람을 움직이는 감각으로 돈이 열리는 구조입니다. 사업, 영업, 투자, 유통에 재능이 있지만 속도가 빠른 만큼 지출도 커질 수 있습니다. ${topRole}`
  if (name.includes('정관')) return `격국은 ${name}으로 봅니다. 쉽게 말하면 신뢰, 직함, 규칙, 사회적 평가로 올라가는 구조입니다. 공공기관, 대기업, 전문직, 관리직처럼 책임이 분명한 자리에 강합니다. ${topRole}`
  if (name.includes('편관') || name.includes('칠살')) return `격국은 ${name}으로 봅니다. 쉽게 말하면 압박, 경쟁, 위기 대응 속에서 실력이 드러나는 구조입니다. 남들이 피하는 문제를 해결하거나 책임이 큰 자리에서 성과가 납니다. 다만 무리하면 스트레스가 몸으로 오기 쉬우니 승부욕보다 전략과 규칙이 먼저입니다. ${topRole}`
  if (name.includes('정인') || name.includes('편인')) return `격국은 ${name}으로 봅니다. 쉽게 말하면 공부, 자격, 문서, 전문성, 윗사람 도움으로 길이 열리는 구조입니다. 당장 큰돈보다 실력을 쌓아 몸값을 올리는 쪽이 맞습니다. ${topRole}`
  if (name.includes('비견') || name.includes('겁재')) return `격국은 ${name}으로 봅니다. 쉽게 말하면 독립심, 경쟁심, 자기 힘으로 버티는 힘이 강한 구조입니다. 동업과 인간관계에서 기회도 오지만 돈이 새기 쉬우니 기준과 경계선이 중요합니다. ${topRole}`
  return `격국은 ${name}으로 봅니다. ${result.gyeokguk.description} ${topRole}`
}

function getTenGodPlainRole(tenGod: string): string {
  if (tenGod.includes('정관')) return '여기에 정관 흐름이 함께 보이면, 자유롭게만 움직이기보다 자격, 직함, 규칙, 공신력이 있는 자리에서 재능이 돈과 평판으로 바뀝니다.'
  if (tenGod.includes('편관') || tenGod.includes('칠살')) return '여기에 편관 흐름이 함께 보이면, 경쟁이 있거나 책임이 큰 자리에서 실력이 빨리 드러납니다. 단, 압박을 혼자 떠안지 말고 역할과 기준을 분명히 해야 오래 갑니다.'
  if (tenGod.includes('정재')) return '여기에 정재 흐름이 함께 보이면, 한 번에 크게 벌기보다 고정 수입, 계약, 예산 관리처럼 안정적인 구조를 만들 때 돈이 쌓입니다.'
  if (tenGod.includes('편재')) return '여기에 편재 흐름이 함께 보이면, 사람을 만나고 판을 넓히는 과정에서 기회가 생깁니다. 다만 수입보다 지출이 먼저 커지지 않게 현금흐름을 잡아야 합니다.'
  if (tenGod.includes('식신')) return '여기에 식신 흐름이 함께 보이면, 꾸준히 만든 결과물이 신뢰가 되고 그 신뢰가 수입으로 이어집니다. 급하게 승부보기보다 오래 팔릴 실력을 쌓는 쪽이 좋습니다.'
  if (tenGod.includes('상관')) return '여기에 상관 흐름이 함께 보이면, 표현력과 기획력이 강해집니다. 다만 직설적인 말이나 과한 자신감이 손해가 되지 않게 결과물로 설득하는 방식이 좋습니다.'
  if (tenGod.includes('정인') || tenGod.includes('편인')) return '여기에 인성 흐름이 함께 보이면, 공부, 자격, 문서, 전문성, 윗사람 도움을 통해 운이 열립니다. 배운 것을 실제 결과물로 바꾸는 실행이 중요합니다.'
  if (tenGod.includes('비견') || tenGod.includes('겁재')) return '여기에 비겁 흐름이 함께 보이면, 독립심과 경쟁심이 강해집니다. 사람을 넓히기보다 내 편과 아닌 사람을 구분하고 돈의 경계선을 분명히 해야 합니다.'
  return `여기에 ${tenGod} 흐름이 함께 보이므로, 타고난 장점을 실제 직업, 돈, 관계에서 어떻게 쓰는지가 핵심입니다.`
}

function getJohuPlain(result: SajuResult): string {
  const neededElement = `${ELEMENTS[result.johu.neededElement]}(${ELEMENTS_HANJA[result.johu.neededElement]})`
  const seasonText = `${result.johu.season}·${result.johu.temperature}`
  if (result.johu.temperature.includes('추') || result.johu.season.includes('겨울')) {
    return `태어난 계절 흐름은 ${seasonText} 쪽입니다. 쉽게 말해 생각은 깊고 판단은 섬세하지만, 몸과 마음이 움츠러들거나 결정이 늦어질 수 있습니다. 그래서 ${neededElement} 기운을 보완해야 합니다. 실제 생활에서는 햇빛, 온기, 따뜻한 음식, 규칙적인 운동, 사람과의 적당한 교류를 늘리는 것이 좋습니다.`
  }
  if (result.johu.temperature.includes('더') || result.johu.season.includes('여름')) {
    return `태어난 계절 흐름은 ${seasonText} 쪽입니다. 쉽게 말해 추진력은 강하지만 마음이 급해지고 과열되기 쉽습니다. 그래서 ${neededElement} 기운을 보완해야 합니다. 실제 생활에서는 수면, 휴식, 물가 산책, 차분한 일정 관리, 감정이 올라올 때 바로 결정하지 않는 습관이 중요합니다.`
  }
  return `태어난 계절 흐름은 ${seasonText} 쪽입니다. 크게 한쪽으로 치우치기보다 환경에 따라 컨디션 차이가 나는 편입니다. ${neededElement} 기운을 보완하면 판단이 안정됩니다. 실제 생활에서는 생활 리듬, 공간 정리, 꾸준한 운동처럼 기본 루틴을 잡는 것이 좋습니다.`
}

function asDirectionParticle(label: string): string {
  return label.endsWith('리') ? `${label}로` : `${label}으로`
}

function getAnnualTrigger(result: SajuResult): string {
  const y = result.yearAnalysis
  const signals: string[] = []
  if (y.hasCheonganHap) {
    const target = y.hapTarget || '사주 한 자리'
    signals.push(`올해는 ${target}와 합이 들어옵니다. 합은 사람이 붙고 제안이 들어오고 일이 연결되는 신호입니다. 특히 ${getPillarPlainName(target)}에서 도움, 협업, 소개가 생기기 쉽습니다.`)
  }
  if (y.hasJijiHap) signals.push('관계가 서로 묶이는 흐름도 있습니다. 혼자 밀어붙이기보다 소개, 협업, 기존 인맥을 활용할수록 일이 빨리 풀립니다.')
  if (y.hasJijiChung) {
    const target = y.chungTarget || '중요한 자리'
    signals.push(`${target}에 충이 있습니다. 충은 나쁜 뜻만이 아니라 흔들어서 바꾸는 힘입니다. ${getPillarPlainName(target)}에서 이사, 부서 이동, 일정 변경, 관계 정리, 생활 패턴 변화가 생길 수 있으니 미리 여지를 두는 편이 좋습니다.`)
  }
  if (signals.length === 0) signals.push('올해는 큰 충돌보다 누적과 정리가 중요한 해입니다. 갑작스러운 승부보다 꾸준한 관리, 정리, 준비가 유리합니다.')
  return signals.join(' ')
}

function getPremiumDiagnosis(result: SajuResult, currentDaeun: SajuResult['daeun'][number] | undefined) {
  const topTenGod = getTopTenGod(result)
  const root = ROOT_STRENGTH_LABELS[result.tuganTonggeun.rootStrength]
  const rootDetail = root?.detail
    .replace('일간이', '내 중심 기운이')
    .replace('지지에', '사주 안에서')
    .replace('통근하고 있어', '받쳐지고 있어')
    .replace('종격의 가능성이 있습니다.', '환경을 바꾸면 오히려 유연함이 장점이 될 수 있습니다.')
  const current = currentDaeun ? getDaeunTheme(currentDaeun.tenGod) : '현재 대운을 특정하기 어려워 원래 사주와 올해 흐름을 우선 기준으로 봅니다.'

  return [
    {
      label: '성향의 핵심',
      text: getCoreProfileReading(result),
    },
    {
      label: '먹고사는 방식',
      text: getGyeokPlain(result, topTenGod),
    },
    {
      label: '계절 보완점',
      text: getJohuPlain(result),
    },
    {
      label: '버티는 힘',
      text: `버티는 힘은 ${asDirectionParticle(root ? root.label : '보통')} 봅니다. ${rootDetail || '환경을 잘 고르면 안정적으로 힘을 쓰는 구조입니다.'} 그래서 혼자 버티는 승부보다 안정적인 직장, 검증된 파트너, 일정한 생활 루틴, 장기 계약처럼 기반을 만들어두는 것이 중요합니다.`,
    },
    {
      label: '지금 10년 운',
      text: current,
    },
    {
      label: '올해 사건 포인트',
      text: getAnnualTrigger(result),
    },
  ]
}

function getDecisionGuides(result: SajuResult, currentDaeun: SajuResult['daeun'][number] | undefined) {
  const topTenGod = getTopTenGod(result)
  const current = currentDaeun?.tenGod || ''
  const wealthFocus = current.includes('재') || topTenGod.includes('재')
  const careerFocus = current.includes('관') || topTenGod.includes('관')
  const studyFocus = current.includes('인') || result.enhancedSinsal.hasMunchang || result.enhancedSinsal.hasHakdang
  const expressionFocus = current.includes('식') || current.includes('상') || topTenGod.includes('식') || topTenGod.includes('상')

  return [
    {
      title: '돈',
      verdict: wealthFocus ? '공격과 방어를 같이 봐야 합니다.' : '무리한 확장보다 새는 돈을 막는 쪽이 먼저입니다.',
      detail: wealthFocus
        ? '돈을 벌 기회가 있을 때도 계약, 세금, 현금흐름을 먼저 확인해야 오래 남습니다. 단기 수익보다 반복 수익 구조가 맞습니다.'
        : '큰 투자보다 저축, 보험, 연금, 고정비 정리가 운을 안정시킵니다. 돈은 크게 벌기보다 흩어지지 않게 붙잡는 전략이 좋습니다.',
    },
    {
      title: '직업',
      verdict: careerFocus ? '직함, 승진, 시험, 조직 안 평가가 중요합니다.' : expressionFocus ? '기술과 결과물을 밖으로 보여줘야 합니다.' : '전문성을 쌓아 다음 운에서 쓰는 흐름입니다.',
      detail: careerFocus
        ? '책임이 늘어나는 자리를 피하지 않는 것이 좋습니다. 단, 규정 위반이나 말실수는 평판에 바로 반영될 수 있습니다.'
        : expressionFocus
          ? '포트폴리오, 글, 콘텐츠, 발표, 영업처럼 보이는 결과물을 만들어야 기회가 붙습니다.'
          : '조급하게 이직하기보다 자격, 경력, 실무 능력을 쌓아 몸값을 올리는 전략이 맞습니다.',
    },
    {
      title: '관계',
      verdict: result.hapChung.hasClash ? '관계가 한 번 흔들리며 정리되는 운이 있습니다.' : '관계를 넓히기보다 오래 갈 사람을 가리는 편이 좋습니다.',
      detail: result.hapChung.hasClash
        ? '충·형·파·해가 보이면 말 한마디가 크게 번질 수 있습니다. 가까운 사람일수록 돈, 약속, 경계선을 분명히 해야 합니다.'
        : '합이 좋게 들어오면 소개, 협업, 귀인 도움을 받을 수 있습니다. 다만 모두에게 잘하려 하면 에너지가 흩어집니다.',
    },
    {
      title: '성장',
      verdict: studyFocus ? '공부와 자격이 바로 운을 여는 카드입니다.' : '생활 루틴을 먼저 잡아야 운이 버텨줍니다.',
      detail: studyFocus
        ? '올해는 배움에 쓴 시간과 돈이 실력, 평판, 수입으로 이어지기 쉽습니다. 분야를 넓히기보다 하나를 끝내는 방식이 좋습니다.'
        : '수면, 운동, 식사, 정리처럼 기본 루틴이 흔들리면 좋은 운도 오래 못 갑니다. 몸의 리듬을 잡는 것이 개운의 시작입니다.',
    },
  ]
}

function getMonthlyWindows(result: SajuResult) {
  const sorted = [...result.wolun].sort((a, b) => b.rating - a.rating)
  const best = sorted.slice(0, 3).map(w => `${w.month}월(${w.keyword})`).join(', ')
  const caution = [...result.wolun].sort((a, b) => a.rating - b.rating).slice(0, 3).map(w => `${w.month}월(${w.keyword})`).join(', ')
  return {
    best,
    caution,
    advice: `좋은 달에는 새 제안, 계약, 발표, 시험, 투자 검토처럼 앞으로 나가는 일을 배치하세요. 주의 달에는 결정 자체보다 점검, 정리, 건강관리, 갈등 예방에 집중하는 편이 낫습니다.`,
  }
}

function getRelationshipInsight(result: SajuResult): string {
  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const plain = getPlainProfile(result.dayMaster)
  return `연애는 ${profile.loveStyle} 잘 맞는 사람은 ${plain.match}입니다. 반대로 ${plain.caution}과는 초반 끌림이 있어도 주도권 다툼을 조심해야 합니다.`
}

function getCareerInsight(result: SajuResult): string {
  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const topTenGod = getTopTenGod(result)
  const tenGodInfo = TEN_GOD_INTERPRETATIONS[topTenGod]
  const root = ROOT_STRENGTH_LABELS[result.tuganTonggeun.rootStrength]
  return `${profile.careerFit.join(' · ')} 계열이 기본 적성입니다. ${tenGodInfo ? tenGodInfo.career : ''} ${root ? `통근은 '${root.label}'이라 ${root.detail}` : ''}`
}

function getRiskInsight(result: SajuResult): string {
  const warnings = result.yearAnalysis.healthRisk.map((h) => `${h.organ}: ${h.warning}`)
  if (warnings.length > 0) return warnings.join(' / ')
  return DAY_MASTER_PROFILES[result.dayMaster].healthTip
}

function clampScore(n: number): number {
  return Math.max(35, Math.min(95, Math.round(n)))
}

function getTrendScores(result: SajuResult, currentDaeun: SajuResult['daeun'][number] | undefined) {
  const c = result.yearAnalysis.tenGodCounts
  const get = (name: string) => Number(c[name] || 0)
  const hasHarmony = result.hapChung.hasHarmony ? 6 : 0
  const hasClash = result.hapChung.hasClash ? -6 : 0
  const rooted = result.tuganTonggeun.rootStrength === 'strong' ? 8 : result.tuganTonggeun.rootStrength === 'medium' ? 4 : result.tuganTonggeun.rootStrength === 'weak' ? -2 : -5
  const current = currentDaeun?.tenGod || ''

  const wealth = 50 + get('정재') * 7 + get('편재') * 8 + (current.includes('재') ? 10 : 0) + (result.isDayMasterStrong ? 5 : -3) + hasClash
  const career = 50 + get('정관') * 8 + get('편관') * 7 + (current.includes('관') ? 10 : 0) + rooted + hasHarmony
  const expression = 50 + get('식신') * 8 + get('상관') * 8 + (current.includes('식') || current.includes('상') ? 10 : 0) + (result.enhancedSinsal.hasMunchang ? 6 : 0)
  const relationship = 50 + (result.hapChung.hasHarmony ? 10 : 0) + get('정재') * 3 + get('정관') * 3 + (result.enhancedSinsal.hasDohwa ? 8 : 0) + (result.enhancedSinsal.hasHongyeom ? 6 : 0) + hasClash
  const study = 50 + get('정인') * 8 + get('편인') * 8 + (current.includes('인') ? 10 : 0) + (result.enhancedSinsal.hasMunchang ? 8 : 0) + (result.enhancedSinsal.hasHakdang ? 8 : 0)
  const mobility = 50 + (result.enhancedSinsal.hasYeokma ? 15 : 0) + (result.enhancedSinsal.hasGyeokgak ? 8 : 0) + (result.hapChung.hasClash ? 8 : 0) + get('상관') * 3

  return [
    { label: '재물 축적', score: clampScore(wealth), desc: wealth >= 70 ? '돈이 움직이는 신호가 강합니다. 벌기보다 지키는 기준까지 세우면 좋습니다.' : '큰 한방보다 안정적 축적이 맞습니다. 소비 통제가 재물운을 올립니다.' },
    { label: '직업 상승', score: clampScore(career), desc: career >= 70 ? '조직·직함·책임을 잡을수록 성과가 납니다.' : '무리한 승부보다 기술과 기반을 쌓는 흐름이 좋습니다.' },
    { label: '표현/콘텐츠', score: clampScore(expression), desc: expression >= 70 ? '말·글·콘텐츠·기술 표현으로 기회가 열립니다.' : '아이디어는 있으나 실행 루틴을 만들어야 결과가 납니다.' },
    { label: '인연 안정', score: clampScore(relationship), desc: relationship >= 70 ? '인연운이 살아 있으나 선을 지키는 것이 오래 가는 핵심입니다.' : '감정보다 생활 리듬과 신뢰를 먼저 맞춰야 합니다.' },
    { label: '학습/자격', score: clampScore(study), desc: study >= 70 ? '공부·자격증·전문성 투자가 바로 운을 여는 구조입니다.' : '필요한 공부를 좁게 정해 반복해야 효율이 납니다.' },
    { label: '이동/변화', score: clampScore(mobility), desc: mobility >= 70 ? '이사·이직·출장·해외 등 움직일수록 운이 트입니다.' : '큰 이동보다 현재 기반을 다지는 쪽이 안정적입니다.' },
  ]
}

function getSinsalBadge(key: string) {
  const extra = EXTRA_SINSAL_INTERPRETATIONS[key]
  if (extra) return extra

  const base = SINSAL_INTERPRETATIONS[key]
  if (!base) return null

  return {
    emoji: base.emoji,
    name: base.name,
    isPositive: !['yangin', 'geobsal'].includes(key),
  }
}

/* ═══════════════════════════════════════════════ */
/* ── 메인 결과 카드 ── */
/* ═══════════════════════════════════════════════ */
const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const plainProfile = getPlainProfile(result.dayMaster)
  const fortune = getYearFortune(result.dayMasterElement, new Date().getFullYear(), result.isDayMasterStrong, result.dayMaster)
  const viralSummary = getViralSummary(result.dayMaster, result.isDayMasterStrong)
  const strength = STRENGTH_INTERPRETATIONS[result.isDayMasterStrong ? 'strong' : 'weak']
  const totalElements = result.elementCounts.reduce((a, b) => a + b, 0) || 1
  const year = new Date().getFullYear()
  const usefulGodAdvice = getUsefulGodAdvice(result.usefulGod)

  // 현재 대운
  const currentDaeun = result.daeun.find(d => d.isCurrent)
  const topTenGod = getTopTenGod(result)
  const topTenGodInfo = TEN_GOD_INTERPRETATIONS[topTenGod]
  const rootLabel = ROOT_STRENGTH_LABELS[result.tuganTonggeun.rootStrength]
  const gongmangLabel = GONGMANG_SEVERITY_LABELS[result.enhancedGongmang.severity]
  const specialSinsal = [
    result.enhancedSinsal.hasCheoneul && 'cheoneul',
    result.enhancedSinsal.hasMunchang && 'munchang',
    result.enhancedSinsal.hasYeokma && 'yeokma',
    result.enhancedSinsal.hasDohwa && 'dohwa',
    result.enhancedSinsal.hasHwagae && 'hwagae',
    result.enhancedSinsal.hasBaekho && 'baekho',
    result.enhancedSinsal.hasHongyeom && 'hongyeom',
    result.enhancedSinsal.hasCheonui && 'cheonui',
    result.enhancedSinsal.hasHakdang && 'hakdang',
    result.enhancedSinsal.hasCheonduk && 'cheonduk',
    result.enhancedSinsal.hasWolduk && 'wolduk',
    result.enhancedSinsal.hasGwimungwan && 'gwimungwan',
    result.enhancedSinsal.hasWonjin && 'wonjin',
    result.enhancedSinsal.hasBokseong && 'bokseong',
    result.enhancedSinsal.hasGeumyeo && 'geumyeo',
    result.enhancedSinsal.hasTaeguk && 'taeguk',
  ].filter((key): key is string => Boolean(key) && Boolean(getSinsalBadge(String(key)))).slice(0, 5)
  const trendScores = getTrendScores(result, currentDaeun)
  const visibleInteractions = result.hapChung.details.slice(0, 4)
  const premiumDiagnosis = getPremiumDiagnosis(result, currentDaeun)
  const decisionGuides = getDecisionGuides(result, currentDaeun)
  const monthlyWindows = getMonthlyWindows(result)

  const pillars: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }[] = [
    { label: '시주(時)', pillar: result.hourPillar || { stem: 0, branch: 0 }, tenGod: result.tenGods[3] || '' },
    { label: '일주(日)', pillar: result.dayPillar, tenGod: '나', isMe: true },
    { label: '월주(月)', pillar: result.monthPillar, tenGod: result.tenGods[1] },
    { label: '년주(年)', pillar: result.yearPillar, tenGod: result.tenGods[0] },
  ]

  const missingAdvice: Record<number, string> = {
    0: '녹색 옷이나 식물을 가까이 두세요. 동쪽 방향에서 기운을 받으실 수 있습니다.',
    1: '빨간색 소품이나 촛불이 도움이 됩니다. 남쪽으로 에너지를 충전하세요.',
    2: '노란색·갈색 계열을 활용하세요. 등산, 정원 가꾸기 같은 흙과 가까운 활동을 추천합니다.',
    3: '흰색·은색 계열 액세서리가 좋습니다. 서쪽 방향에서 기운을 받으세요.',
    4: '파란색·검정색 계열을 활용하고, 물 가까이에서 재충전하세요.',
  }

  return (
    <div
      ref={ref}
      className="saju-result-card bg-white print:shadow-none print:rounded-none"
      style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}
    >
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          .saju-result-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 px-4 sm:px-6 py-5 sm:py-7 text-white rounded-t-2xl print:rounded-none">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 mb-1.5">
          <p className="text-orange-200 text-xs tracking-[0.15em] uppercase">四柱命理 분석 리포트</p>
          <p className="text-orange-200 text-xs sm:text-sm">{result.animal}띠 · {result.gender === 'male' ? '남' : '여'}성 · {result.birthYear}.{String(result.birthMonth).padStart(2,'0')}.{String(result.birthDay).padStart(2,'0')}</p>
        </div>
        <h2 className="text-xl sm:text-2xl font-black leading-snug">{profile.emoji} {profile.title}</h2>
        <p className="text-orange-100 text-sm sm:text-base mt-1">{viralSummary}</p>
      </div>

      <div className="px-3 sm:px-5 py-4 sm:py-5 space-y-5 sm:space-y-6 print:space-y-4">

        {/* ═══ 1. 당신의 사주팔자 ═══ */}
        <div>
          <div className="flex gap-1.5 sm:gap-2 justify-center pt-2 pb-4 px-2 sm:px-1">
            {pillars.map((p, i) => (
              result.hourPillar || i > 0 ? (
                <PillarBox key={i} label={p.label} pillar={p.pillar} tenGod={p.tenGod} isMe={p.isMe} />
              ) : (
                <EmptyPillarBox key={i} />
              )
            ))}
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 sm:p-5 border border-orange-200">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-4xl sm:text-5xl flex-shrink-0">{profile.emoji}</span>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-black text-orange-800 leading-tight">
                  당신의 중심 성향 · {plainProfile.label}
                </p>
                <p className="text-xs sm:text-sm text-orange-600 mt-0.5">상담 요약 · {strength.label}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.personality.map(k => (
                    <span key={k} className="text-xs bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-medium">#{k}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-800 leading-[1.9] font-medium">{profile.description}</p>
          </div>
        </div>

        {/* ═══ 10만원 상담식 정밀 리딩 ═══ */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-gray-900">
          <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gray-900 rounded-full" />
            정밀 상담 리딩
          </h3>
          <p className="text-xs text-gray-500 mb-3">타고난 성향, 먹고사는 방식, 계절 보완점, 현재 10년 운, 올해 변화를 쉬운 말로 묶어 본 핵심 판단입니다.</p>
          <div className="space-y-2.5">
            {premiumDiagnosis.map((point, i) => (
              <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-xs font-black text-gray-400 mb-1">판단 {i + 1} · {point.label}</p>
                <p className="text-sm sm:text-base text-gray-800 leading-[1.85]">{point.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 분야별 처방 ═══ */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
            돈·직업·관계·성장 처방
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {decisionGuides.map((item) => (
              <div key={item.title} className="rounded-xl p-3.5 bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700">
                    {item.title}
                  </span>
                  <p className="text-sm font-black text-gray-900">{item.verdict}</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 실행 타이밍 ═══ */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-5 border border-orange-200">
          <h3 className="text-base sm:text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-500 rounded-full" />
            올해 실행 타이밍
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-xs font-black text-emerald-600 mb-1">밀고 나갈 달</p>
              <p className="text-sm font-bold text-gray-900">{monthlyWindows.best}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-xs font-black text-red-500 mb-1">점검할 달</p>
              <p className="text-sm font-bold text-gray-900">{monthlyWindows.caution}</p>
            </div>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{monthlyWindows.advice}</p>
        </div>

        {/* ═══ 명리 근거 ═══ */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gray-700 rounded-full" />
            왜 이렇게 풀이하나
          </h3>
          <div className="grid gap-2.5">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-500 mb-1">명식 구조</p>
              <p className="text-sm text-gray-800 leading-relaxed">
                년주 {pillarToHanja(result.yearPillar)} · 월주 {pillarToHanja(result.monthPillar)} · 일주 {pillarToHanja(result.dayPillar)}
                {result.hourPillar ? ` · 시주 ${pillarToHanja(result.hourPillar)}` : ' · 시주 미입력'} 기준입니다.
                월지는 {getSeasonName(result.monthPillar.branch)}라 계절 기운이 판단의 중심입니다.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="text-xs font-bold text-orange-700 mb-1">신강/신약</p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  점수 {result.dayMasterScore.toFixed(1)}점으로 {strength.label}입니다. {strength.advice}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-1">십신 핵심</p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  핵심 십신은 {topTenGod}입니다. {topTenGodInfo ? `${topTenGodInfo.keyword} 성향이 강하고, ${topTenGodInfo.personality}` : '이 기운이 성격과 선택 방식에 크게 작용합니다.'}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700 mb-1">통근/뿌리</p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {rootLabel ? `${rootLabel.label}: ${rootLabel.detail}` : '내 성향이 얼마나 안정적으로 받쳐지는지 사주 안의 기반을 확인했습니다.'}
                </p>
              </div>
              <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                <p className="text-xs font-bold text-violet-700 mb-1">공망/빈자리</p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {gongmangLabel ? `${gongmangLabel.label}: ${gongmangLabel.detail}` : '공망 영향은 크지 않습니다.'}
                </p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-xs font-bold text-amber-700 mb-1">오행 판단</p>
              <p className="text-sm text-gray-800 leading-relaxed">{getElementTone(result)}</p>
            </div>
          </div>
        </div>

        {/* ═══ 분야별 상담 포인트 ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-200">
            <p className="text-sm font-black text-blue-800 mb-1">💼 직업 선택</p>
            <p className="text-sm text-gray-800 leading-relaxed">{getCareerInsight(result)}</p>
          </div>
          <div className="bg-pink-50 rounded-xl p-3.5 border border-pink-200">
            <p className="text-sm font-black text-pink-800 mb-1">❤️ 인연 패턴</p>
            <p className="text-sm text-gray-800 leading-relaxed">{getRelationshipInsight(result)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3.5 border border-green-200">
            <p className="text-sm font-black text-green-800 mb-1">🏥 건강 포인트</p>
            <p className="text-sm text-gray-800 leading-relaxed">{getRiskInsight(result)}</p>
          </div>
        </div>

        {/* ═══ 경향 점수화 ═══ */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            명식 경향 점수
          </h3>
          <p className="text-xs text-gray-400 mb-3">오행·십신·대운·합충·신살 신호를 합산한 내부 가중 점수입니다.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {trendScores.map((item) => (
              <div key={item.label} className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-gray-800">{item.label}</p>
                  <p className={`text-sm font-black ${item.score >= 75 ? 'text-orange-600' : item.score >= 60 ? 'text-emerald-600' : 'text-gray-500'}`}>{item.score}</p>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden mb-2 border border-gray-100">
                  <div
                    className={`h-full rounded-full ${item.score >= 75 ? 'bg-orange-500' : item.score >= 60 ? 'bg-emerald-500' : 'bg-gray-400'}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {(visibleInteractions.length > 0 || specialSinsal.length > 0 || result.jongguk) && (
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-slate-500 rounded-full" />
              특수 신호
            </h3>
            {result.jongguk && (
              <div className="mb-3 bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-sm font-black text-slate-800">
                  {JONGGUK_INTERPRETATIONS[result.jongguk.type]?.emoji || '✨'} {result.jongguk.name}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  {JONGGUK_INTERPRETATIONS[result.jongguk.type]?.description || result.jongguk.description}
                </p>
              </div>
            )}
            {visibleInteractions.length > 0 && (
              <div className="space-y-2 mb-3">
                {visibleInteractions.map((d, i) => {
                  const info = HAPCHUNG_INTERPRETATIONS[d.type]
                  return (
                    <div key={`${d.type}-${i}`} className="bg-white rounded-xl p-3 border border-slate-100">
                      <p className="text-sm font-bold text-slate-800">{info?.emoji || '•'} {info?.name || d.type} · {d.description}</p>
                      <p className="text-xs text-gray-600 leading-relaxed mt-1">{info?.detail || '명식 안의 관계 신호입니다.'}</p>
                    </div>
                  )
                })}
              </div>
            )}
            {specialSinsal.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {specialSinsal.map((key) => {
                  const info = getSinsalBadge(key)
                  return info ? (
                    <span key={key} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${info.isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {info.emoji} {info.name}
                    </span>
                  ) : null
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ 2. 오행 밸런스 ═══ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            오행 밸런스
          </h3>
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200">
            <ElementBar counts={result.elementCounts} total={totalElements} />
            {result.missingElements.length > 0 && (
              <div className="mt-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-sm font-bold text-orange-800 mb-1">
                  부족한 기운: {result.missingElements.map(e => `${ELEMENTS[e]}(${ELEMENTS_HANJA[e]})`).join(', ')}
                </p>
                <p className="text-sm text-orange-700 leading-relaxed">
                  {missingAdvice[result.missingElements[0]]}
                </p>
              </div>
            )}
            {result.missingElements.length === 0 && (
              <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm font-bold text-green-800">오행이 고루 갖춰진 균형 잡힌 사주입니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 대운 흐름 ═══ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            대운(大運) 흐름
          </h3>
          <div className="space-y-2">
            <div className="flex gap-1 overflow-x-auto pb-2 pr-3">
              {result.daeun.map((d, i) => (
                <div key={i} className={`flex-shrink-0 text-center rounded-xl p-2 sm:p-2.5 min-w-[60px] sm:min-w-[70px] border-2 ${
                  d.isCurrent ? 'bg-orange-50 border-orange-400 shadow-sm' : 'bg-gray-50 border-gray-200'
                }`}>
                  {d.isCurrent && <p className="text-xs text-orange-500 font-bold mb-0.5">▶ 현재</p>}
                  <p className="text-xs text-gray-500">{d.startAge}~{d.startAge + 9}세</p>
                  <p className="text-sm sm:text-base font-bold text-gray-800">{d.tenGod}</p>
                </div>
              ))}
            </div>
            {currentDaeun && (
              <div className="bg-orange-50 rounded-xl p-3.5 sm:p-4 border border-orange-200">
                <h4 className="text-sm font-black text-orange-800 mb-1.5">
                  현재 대운: {currentDaeun.tenGod}운 ({currentDaeun.startAge}~{currentDaeun.startAge + 9}세)
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getDaeunInterpretation(currentDaeun.tenGod, currentDaeun.element)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 3. 올해 운세 ═══ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            {year}년 운세
          </h3>
          <div className="space-y-3">
            {/* 총운 */}
            <div className="bg-orange-50 rounded-xl p-4 sm:p-5 border border-orange-200">
              <h4 className="text-base sm:text-lg font-black text-orange-800 mb-2">🔮 총운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.overview}</p>
            </div>

            {/* 재물운 */}
            <div className="bg-amber-50 rounded-xl p-4 sm:p-5 border border-amber-200">
              <h4 className="text-base sm:text-lg font-black text-amber-800 mb-2">💰 재물운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.money}</p>
              <p className="text-sm font-medium text-amber-700 bg-amber-100 rounded-lg px-3 py-2 mt-3">💡 {strength.money}</p>
            </div>

            {/* 연애운 */}
            <div className="bg-pink-50 rounded-xl p-4 sm:p-5 border border-pink-200">
              <h4 className="text-base sm:text-lg font-black text-pink-800 mb-2">❤️ 연애운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.love}</p>
              <p className="text-sm font-medium text-pink-700 bg-pink-100 rounded-lg px-3 py-2 mt-3">💡 {strength.relationship}</p>
            </div>

            {/* 직업운 */}
            <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200">
              <h4 className="text-base sm:text-lg font-black text-blue-800 mb-2">💼 직업운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.career}</p>
            </div>

            {/* 건강운 */}
            <div className="bg-green-50 rounded-xl p-4 sm:p-5 border border-green-200">
              <h4 className="text-base sm:text-lg font-black text-green-800 mb-2">🏥 건강운</h4>
              <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.health}</p>
            </div>

            {/* 인간관계운 */}
            {fortune.relationship && (
              <div className="bg-violet-50 rounded-xl p-4 sm:p-5 border border-violet-200">
                <h4 className="text-base sm:text-lg font-black text-violet-800 mb-2">🤝 인간관계운</h4>
                <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{fortune.relationship}</p>
              </div>
            )}

            {/* 주요 사건 */}
            {fortune.keyEvents && fortune.keyEvents.length > 0 && (
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 sm:p-5 text-white">
                <h4 className="text-base sm:text-lg font-black mb-3">📅 올해 주요 시기</h4>
                <div className="space-y-2">
                  {fortune.keyEvents.map((event, i) => (
                    <div key={i} className="bg-white/15 rounded-lg px-3 py-2">
                      <p className="text-sm text-white/95 leading-relaxed">{event}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 행동지침 */}
            {fortune.action && fortune.action.length > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4 sm:p-5 border border-emerald-200">
                <h4 className="text-base sm:text-lg font-black text-emerald-800 mb-3">✅ 올해 이렇게 하세요</h4>
                <ul className="space-y-2">
                  {fortune.action.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-gray-800 leading-relaxed">
                      <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 주의사항 */}
            {fortune.caution && fortune.caution.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 sm:p-5 border border-red-200">
                <h4 className="text-base sm:text-lg font-black text-red-800 mb-3">⚠️ 이것만은 조심하세요</h4>
                <ul className="space-y-2">
                  {fortune.caution.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-gray-800 leading-relaxed">
                      <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 월운 (Monthly Fortune) ═══ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-400 rounded-full" />
            {year}년 월별 운세
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {result.wolun.map((w) => {
              const ratingColors: Record<number, string> = {
                5: 'bg-yellow-50 border-yellow-300 text-yellow-800',
                4: 'bg-green-50 border-green-300 text-green-800',
                3: 'bg-gray-50 border-gray-200 text-gray-600',
                2: 'bg-orange-50 border-orange-300 text-orange-800',
                1: 'bg-red-50 border-red-300 text-red-800',
              }
              const ratingEmoji: Record<number, string> = { 5: '🌟', 4: '😊', 3: '😐', 2: '😟', 1: '⚠️' }
              return (
                <div key={w.month} className={`rounded-lg p-2 sm:p-2.5 border text-center ${ratingColors[w.rating] || ratingColors[3]}`}>
                  <p className="text-xs font-bold">{w.month}월 {ratingEmoji[w.rating] || '😐'}</p>
                  <p className="text-xs font-medium mt-0.5 leading-tight">{w.keyword}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ 4. 행운/주의 달 ═══ */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200 text-center">
            <p className="text-xs text-green-600 font-medium mb-1">행운의 달</p>
            <p className="text-base sm:text-lg font-black text-green-800">{fortune.bestMonths}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200 text-center">
            <p className="text-xs text-red-600 font-medium mb-1">주의할 달</p>
            <p className="text-base sm:text-lg font-black text-red-800">{fortune.worstMonths}</p>
          </div>
        </div>

        {/* ═══ 6. 개운법 (용신 기반) ═══ */}
        <div className="bg-orange-50 rounded-2xl p-4 sm:p-5 border border-orange-200">
          <h3 className="text-base sm:text-lg font-black text-orange-800 mb-2">🍀 당신만의 개운법</h3>
          <p className="text-sm text-orange-700 leading-relaxed mb-2">
            당신에게 필요한 기운은 <strong>{ELEMENTS[result.usefulGod]}({ELEMENTS_HANJA[result.usefulGod]})</strong>입니다.
          </p>
          <p className="text-sm sm:text-base text-gray-800 leading-[1.9]">{usefulGodAdvice}</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
            <div className="bg-white rounded-lg p-2 sm:p-2.5 border border-orange-100 min-w-0">
              <p className="text-xs text-gray-500">행운 색</p>
              <p className="text-xs sm:text-base font-bold text-gray-800 break-keep">{profile.luckyColor}</p>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-2.5 border border-orange-100 min-w-0">
              <p className="text-xs text-gray-500">행운 방향</p>
              <p className="text-xs sm:text-base font-bold text-gray-800 break-keep">{profile.luckyDirection}</p>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-2.5 border border-orange-100 min-w-0">
              <p className="text-xs text-gray-500">행운 숫자</p>
              <p className="text-xs sm:text-base font-bold text-gray-800 break-keep">{profile.luckyNumber}</p>
            </div>
          </div>
        </div>

        {/* ═══ Footer ═══ */}
        <div className="text-center pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">노후연구소 · retireplan.kr · 사주명리학 기반</p>
        </div>
      </div>
    </div>
  )
})

SajuResultCard.displayName = 'SajuResultCard'
export default SajuResultCard

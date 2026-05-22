'use client'

import { forwardRef } from 'react'
import {
  SajuResult, STEMS, STEMS_HANJA, BRANCHES_HANJA,
  ELEMENTS, ELEMENTS_HANJA, Pillar, pillarToHanja,
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG,
} from './sajuEngine'
import {
  DAY_MASTER_PROFILES, STRENGTH_INTERPRETATIONS,
  getViralSummary,
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

function getTopTenGod(result: SajuResult): string {
  const entries = Object.entries(result.yearAnalysis.tenGodCounts)
    .filter(([name]) => name !== '일주')
    .sort((a, b) => b[1] - a[1])
  return entries[0]?.[0] || result.yearAnalysis.dominantTenGod || result.tenGods[1] || '비견'
}

function getDaeunTheme(tenGod: string): string {
  if (tenGod.includes('재')) return `현재 10년 흐름은 ${tenGod}운입니다. 돈, 거래, 성과를 키울 수 있지만 계약과 현금흐름을 먼저 봐야 오래 남습니다.`
  if (tenGod.includes('관')) return `현재 10년 흐름은 ${tenGod}운입니다. 직장, 책임, 시험, 평판이 중요해지고 규칙 안에서 실력을 증명할수록 유리합니다.`
  if (tenGod.includes('인')) return `현재 10년 흐름은 ${tenGod}운입니다. 공부, 자격, 문서, 윗사람 도움으로 길이 열리므로 실력을 쌓는 전략이 맞습니다.`
  if (tenGod.includes('식') || tenGod.includes('상')) return `현재 10년 흐름은 ${tenGod}운입니다. 말, 글, 기술, 콘텐츠처럼 결과물을 밖으로 꺼낼수록 기회가 생깁니다.`
  return `현재 10년 흐름은 ${tenGod}운입니다. 독립, 경쟁, 사람 문제가 커지기 쉬우니 내 편과 돈의 경계선을 분명히 해야 합니다.`
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
  if (name.includes('식신')) return `격국은 ${name}입니다. 꾸준히 만든 결과물이 신뢰와 수입으로 이어지는 구조입니다. ${topRole}`
  if (name.includes('상관')) return `격국은 ${name}입니다. 표현력과 기획력으로 길이 열리지만, 말과 규칙을 조심해야 합니다. ${topRole}`
  if (name.includes('정재')) return `격국은 ${name}입니다. 크게 벌기보다 안정적으로 모으고 관리할 때 돈이 붙는 구조입니다. ${topRole}`
  if (name.includes('편재')) return `격국은 ${name}입니다. 거래, 영업, 사업 감각이 살아나지만 지출과 확장을 통제해야 합니다. ${topRole}`
  if (name.includes('정관')) return `격국은 ${name}입니다. 신뢰, 직함, 규칙, 사회적 평가로 올라가는 구조입니다. ${topRole}`
  if (name.includes('편관') || name.includes('칠살')) return `격국은 ${name}입니다. 경쟁과 책임이 큰 자리에서 실력이 드러납니다. 무리한 승부보다 전략이 먼저입니다. ${topRole}`
  if (name.includes('정인') || name.includes('편인')) return `격국은 ${name}입니다. 공부, 자격, 문서, 전문성으로 몸값을 올리는 구조입니다. ${topRole}`
  if (name.includes('비견') || name.includes('겁재')) return `격국은 ${name}입니다. 독립심과 경쟁심이 강해 내 기준과 돈의 경계선이 중요합니다. ${topRole}`
  return `격국은 ${name}입니다. 타고난 장점을 실제 직업, 돈, 관계에서 어떻게 쓰는지가 핵심입니다.`
}

function getTenGodPlainRole(tenGod: string): string {
  if (tenGod.includes('정관')) return '자격, 직함, 규칙이 있는 자리에서 재능이 평판으로 바뀝니다.'
  if (tenGod.includes('편관') || tenGod.includes('칠살')) return '책임이 큰 자리에서 실력이 빨리 드러나지만 역할 경계가 필요합니다.'
  if (tenGod.includes('정재')) return '고정 수입, 계약, 예산 관리처럼 안정적인 구조가 맞습니다.'
  if (tenGod.includes('편재')) return '사람을 만나 판을 넓히되 현금흐름을 먼저 잡아야 합니다.'
  if (tenGod.includes('식신')) return '꾸준히 만든 결과물이 신뢰가 되고 수입으로 이어집니다.'
  if (tenGod.includes('상관')) return '표현력은 강하지만 결과물로 설득하는 방식이 좋습니다.'
  if (tenGod.includes('정인') || tenGod.includes('편인')) return '공부, 자격, 문서, 전문성이 운을 여는 카드입니다.'
  if (tenGod.includes('비견') || tenGod.includes('겁재')) return '내 편과 아닌 사람을 구분하고 돈의 선을 분명히 해야 합니다.'
  return `${tenGod} 흐름을 직업과 돈에서 어떻게 쓰는지가 핵심입니다.`
}

function getJohuPlain(result: SajuResult): string {
  const neededElement = `${ELEMENTS[result.johu.neededElement]}(${ELEMENTS_HANJA[result.johu.neededElement]})`
  const seasonText = `${result.johu.season}·${result.johu.temperature}`
  if (result.johu.temperature.includes('추') || result.johu.season.includes('겨울')) {
    return `계절 흐름은 ${seasonText} 쪽입니다. 생각은 깊지만 결정이 늦어질 수 있어 ${neededElement} 기운, 즉 온기와 활동성을 보완하는 것이 좋습니다.`
  }
  if (result.johu.temperature.includes('더') || result.johu.season.includes('여름')) {
    return `계절 흐름은 ${seasonText} 쪽입니다. 추진력은 강하지만 과열되기 쉬워 ${neededElement} 기운, 즉 휴식과 차분한 판단을 보완해야 합니다.`
  }
  return `계절 흐름은 ${seasonText} 쪽입니다. 환경에 따라 컨디션 차이가 나므로 ${neededElement} 기운을 보완하고 생활 리듬을 일정하게 잡는 것이 좋습니다.`
}

function getAnnualTrigger(result: SajuResult): string {
  const y = result.yearAnalysis
  const signals: string[] = []
  if (y.hasCheonganHap) {
    const target = y.hapTarget || '사주 한 자리'
    signals.push(`올해는 ${target}와 합이 들어와 ${getPillarPlainName(target)}에서 도움, 협업, 소개가 생기기 쉽습니다.`)
  }
  if (y.hasJijiHap) signals.push('혼자 밀기보다 소개, 협업, 기존 인맥을 쓰는 편이 유리합니다.')
  if (y.hasJijiChung) {
    const target = y.chungTarget || '중요한 자리'
    signals.push(`${target}에 충이 있어 ${getPillarPlainName(target)}에서 이동, 일정 변경, 관계 정리가 생길 수 있습니다.`)
  }
  if (signals.length === 0) signals.push('올해는 큰 승부보다 누적, 정리, 준비가 유리한 해입니다.')
  return signals.join(' ')
}

function getPremiumDiagnosis(result: SajuResult, currentDaeun: SajuResult['daeun'][number] | undefined) {
  const topTenGod = getTopTenGod(result)
  const current = currentDaeun ? getDaeunTheme(currentDaeun.tenGod) : '현재 대운을 특정하기 어려워 원래 사주와 올해 흐름을 우선 기준으로 봅니다.'

  return [
    {
      label: '성향의 핵심',
      text: getCoreProfileReading(result),
    },
    {
      label: '일과 돈의 방향',
      text: getGyeokPlain(result, topTenGod),
    },
    {
      label: '올해 사건 포인트',
      text: `${getJohuPlain(result)} ${current} ${getAnnualTrigger(result)}`,
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

/* ═══════════════════════════════════════════════ */
/* ── 메인 결과 카드 ── */
/* ═══════════════════════════════════════════════ */
const SajuResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const plainProfile = getPlainProfile(result.dayMaster)
  const viralSummary = getViralSummary(result.dayMaster, result.isDayMasterStrong)
  const strength = STRENGTH_INTERPRETATIONS[result.isDayMasterStrong ? 'strong' : 'weak']

  // 현재 대운
  const currentDaeun = result.daeun.find(d => d.isCurrent)
  const premiumDiagnosis = getPremiumDiagnosis(result, currentDaeun)
  const monthlyWindows = getMonthlyWindows(result)

  const pillars: { label: string; pillar: Pillar; tenGod?: string; isMe?: boolean }[] = [
    { label: '시주(時)', pillar: result.hourPillar || { stem: 0, branch: 0 }, tenGod: result.tenGods[3] || '' },
    { label: '일주(日)', pillar: result.dayPillar, tenGod: '나', isMe: true },
    { label: '월주(月)', pillar: result.monthPillar, tenGod: result.tenGods[1] },
    { label: '년주(年)', pillar: result.yearPillar, tenGod: result.tenGods[0] },
  ]

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
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 px-4 sm:px-6 py-4 sm:py-5 text-white rounded-t-2xl print:rounded-none">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 mb-1.5">
          <p className="text-orange-200 text-xs tracking-[0.15em] uppercase">四柱命理 분석 리포트</p>
          <p className="text-orange-200 text-xs sm:text-sm">{result.animal}띠 · {result.gender === 'male' ? '남' : '여'}성 · {result.birthYear}.{String(result.birthMonth).padStart(2,'0')}.{String(result.birthDay).padStart(2,'0')}</p>
        </div>
        <h2 className="text-xl sm:text-2xl font-black leading-snug">{profile.emoji} {plainProfile.label}</h2>
        <p className="text-orange-100 text-sm sm:text-base mt-1">{viralSummary}</p>
      </div>

      <div className="px-3 sm:px-5 py-4 sm:py-5 space-y-4 print:space-y-3">

        {/* ═══ 사주 원국 요약 ═══ */}
        <div className="bg-orange-50 rounded-2xl p-3 sm:p-4 border border-orange-200">
          <p className="text-xs font-black text-orange-600 mb-2">원국 요약 · {strength.label}</p>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {pillars.map((p, i) => (
              <div key={i} className={`rounded-xl border px-1.5 py-2 text-center ${p.isMe ? 'bg-white border-orange-300' : 'bg-white/70 border-orange-100'}`}>
                <p className="text-[11px] text-gray-400">{p.label.replace(/\(.+\)/, '')}</p>
                <p className="text-base sm:text-lg font-black text-gray-900">{result.hourPillar || i > 0 ? pillarToHanja(p.pillar) : '-'}</p>
                <p className="text-[11px] text-orange-600 font-bold">{p.tenGod || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 압축 상담 리딩 ═══ */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-gray-900">
          <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gray-900 rounded-full" />
            정밀 상담 리딩
          </h3>
          <p className="text-xs text-gray-500 mb-3">길게 늘이지 않고 실제 상담 핵심만 남겼습니다.</p>
          <div className="space-y-2">
            {premiumDiagnosis.map((point, i) => (
              <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 p-3 sm:p-3.5">
                <p className="text-xs font-black text-gray-500 mb-1">{i + 1}. {point.label}</p>
                <p className="text-sm sm:text-[15px] text-gray-800 leading-[1.65]">{point.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 실행 타이밍 ═══ */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3.5 sm:p-4 border border-orange-200">
          <h3 className="text-base font-bold text-orange-900 mb-2.5 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-orange-500 rounded-full" />
            올해 실행 타이밍
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-xs font-black text-emerald-600 mb-1">밀고 나갈 달</p>
              <p className="text-sm font-bold text-gray-900">{monthlyWindows.best}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-xs font-black text-red-500 mb-1">점검할 달</p>
              <p className="text-sm font-bold text-gray-900">{monthlyWindows.caution}</p>
            </div>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">좋은 달에는 새 제안과 계약을 배치하고, 주의 달에는 점검과 갈등 예방에 집중하세요.</p>
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

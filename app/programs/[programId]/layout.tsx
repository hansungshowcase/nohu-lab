import { Metadata } from 'next'
import { getProgramById } from '@/app/programs/registry'

interface Props {
  params: Promise<{ programId: string }>
  children: React.ReactNode
}

const SEO_DESCRIPTIONS: Record<string, string> = {
  'retirement-test': 'retireplan.kr 노후 준비 점수 테스트: 재정·건강·주거·마인드 4영역 20문항, 80점 만점 S~F등급 판정. 무료, 2분 소요.',
  'saju-reading': 'retireplan.kr 무료 사주풀이: 생년월일 입력으로 일간 성격, 오행 분석, 재물운, 연애운, 2026년 운세 확인. 사주명리학 기반.',
  'pension-timing': 'retireplan.kr 연금 수령 타이밍 분석: 조기수령(60세) vs 정상수령(65세) vs 연기수령(70세) 총 수령액 비교. 2026 연금개혁 반영.',
  'text-counter': 'retireplan.kr 글자수 세기: 글자수, 공백 제외, 단어수, 줄수, 바이트를 실시간 계산. 무료 온라인 도구.',
  'image-resizer': 'retireplan.kr 이미지 리사이저: 이미지 크기를 픽셀 단위로 변경, 비율 유지, PNG 다운로드. 무료.',
  'nickname-generator': 'retireplan.kr 랜덤 닉네임 생성기: 한국어 형용사+명사 조합 닉네임을 중복 없이 생성. 무료.',
  'hashtag-recommender': 'retireplan.kr 해시태그 추천기: 게시글 내용 입력 시 SNS용 해시태그 자동 추천. 무료.',
  'text-converter': 'retireplan.kr 텍스트 변환기: 대소문자, 한영 자판, 텍스트 뒤집기, 공백 제거 등 7가지 변환. 무료.',
  'mental-health': 'retireplan.kr 심리 자가진단: PHQ-9(우울), GAD-7(불안), PSS-10(스트레스), RSES(자존감), ISI(수면) 5개 공인 척도. 무료.',
  'supplement-recommend': 'retireplan.kr 맞춤 영양제 추천: 나이·성별·생활습관·건강고민 분석으로 약사가 추천하는 영양제 조합·복용법·시간표 제공. 무료.',
  'event-money': 'retireplan.kr 경조사비 계산기: 결혼식·장례식·돌잔치·집들이·개업·출산 등 행사별, 관계별 적정 경조사비 금액을 2026년 최신 기준으로 추천. 무료.',
  'brain-training': 'retireplan.kr 브레인 트레이닝: 기억력·계산력·반응속도 3가지 미니게임으로 뇌나이 측정. 매일 도전, 또래 비교, 7일 추이 그래프. 무료.',
  'dividend-calc': 'retireplan.kr 배당주 계산기: 금융·통신·에너지·리츠·ETF 분야별 배당주 정보, 투자금별 배당금·세금·수령주기 시뮬레이션. 실시간 시세 반영. 무료.',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programId } = await params
  const program = getProgramById(programId)

  if (!program) {
    return { title: '프로그램 없음' }
  }

  const desc = SEO_DESCRIPTIONS[programId] || program.description

  return {
    title: `${program.name} - 무료 온라인 도구`,
    description: desc,
    alternates: { canonical: `/programs/${programId}` },
    openGraph: {
      title: `${program.name} - 노후연구소`,
      description: desc,
      type: 'website',
      images: [{ url: '/api/og', width: 800, height: 400, alt: program.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${program.name} - 노후연구소`,
      description: desc,
    },
  }
}

export default function ProgramLayout({ children }: Props) {
  return children
}

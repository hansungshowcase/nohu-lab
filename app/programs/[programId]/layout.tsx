import { Metadata } from 'next'
import { getProgramById } from '@/app/programs/registry'

interface Props {
  params: Promise<{ programId: string }>
  children: React.ReactNode
}

const SEO_DESCRIPTIONS: Record<string, string> = {
  'retirement-test': '나의 노후 준비 점수는 몇 점? 재정, 건강, 주거, 마인드 4개 영역 20문항으로 은퇴 준비 상태를 무료 진단합니다.',
  'saju-reading': '내 사주는 어떤 운명? 생년월일로 타고난 성격, 오행 밸런스, 재물운, 연애운, 올해 운세를 AI가 무료로 분석합니다.',
  'pension-timing': '연금 언제 받는 게 유리할까? 조기·정상·연기수령 총 수령액을 비교하여 나에게 최적인 연금 개시 시점을 찾아드립니다.',
  'text-counter': '글자수 세기 도구. 텍스트의 글자수, 공백 제외 글자수, 단어수, 줄수, 바이트를 실시간으로 계산합니다.',
  'image-resizer': '이미지 크기 변경 도구. 이미지를 원하는 크기로 간편하게 리사이즈하고 PNG로 다운로드합니다.',
  'nickname-generator': '랜덤 닉네임 생성기. 재미있는 한국어 닉네임을 한 번에 여러 개 생성하고 복사할 수 있습니다.',
  'hashtag-recommender': '해시태그 추천기. 게시글 내용을 입력하면 SNS에 적합한 해시태그를 자동으로 추천해드립니다.',
  'text-converter': '텍스트 변환기. 대소문자 변환, 한영 자판 변환, 텍스트 뒤집기 등 다양한 텍스트 변환 도구입니다.',
  'mental-health': '나의 심리 상태는? 우울, 불안, 스트레스 수준을 간단한 자가진단으로 체크하고 맞춤 관리 팁을 받아보세요.',
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

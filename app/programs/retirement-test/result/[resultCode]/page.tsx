import { Metadata } from 'next'
import { getResultByCode, resultTypes } from '@/components/programs/retirement-test/results'
import RetirementTestResultClient from './client'

interface Props {
  params: Promise<{ resultCode: string }>
}

export async function generateStaticParams() {
  return resultTypes.map((r) => ({ resultCode: r.code }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultCode } = await params
  const result = getResultByCode(resultCode)

  if (!result) {
    return {
      title: '노후 준비 점수 테스트 - 노후연구소',
    }
  }

  const title = `${result.icon} ${result.grade} - 노후 준비 점수 테스트`
  const description = result.description

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [`/og/retirement-test/${result.code}.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/og/retirement-test/${result.code}.png`],
    },
  }
}

export default async function ResultPage({ params }: Props) {
  const { resultCode } = await params
  return <RetirementTestResultClient resultCode={resultCode} />
}

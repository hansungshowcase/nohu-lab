import { Metadata } from 'next'
import { getProgramById } from '@/app/programs/registry'

interface Props {
  params: Promise<{ programId: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programId } = await params
  const program = getProgramById(programId)

  if (!program) {
    return { title: '프로그램 없음' }
  }

  return {
    title: `${program.name}`,
    description: program.description,
    alternates: { canonical: `/programs/${programId}` },
    openGraph: {
      title: `${program.name} - 노후연구소`,
      description: program.description,
      type: 'website',
      images: [{ url: '/api/og', width: 800, height: 400, alt: program.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${program.name} - 노후연구소`,
      description: program.description,
    },
  }
}

export default function ProgramLayout({ children }: Props) {
  return children
}

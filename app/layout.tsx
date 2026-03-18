import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ea580c',
}

export const metadata: Metadata = {
  title: {
    default: '노후연구소 - 은퇴 준비의 모든 것',
    template: '%s | 노후연구소',
  },
  description: '노후 준비 점수 테스트, AI 사주풀이, 연금 수령 타이밍 분석 등 은퇴 준비를 위한 무료 도구 모음. 네이버 카페 회원 전용 서비스.',
  keywords: ['노후 준비', '은퇴 준비', '사주풀이', '연금', '노후 자금', '은퇴 계획', '노후연구소'],
  metadataBase: new URL('https://nohu-lab.vercel.app'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '노후연구소',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: '노후연구소 - 은퇴 준비의 모든 것',
    description: '노후 준비 점수 테스트, AI 사주풀이, 연금 수령 타이밍 분석 등 은퇴 준비를 위한 무료 도구 모음.',
    url: 'https://nohu-lab.vercel.app',
    siteName: '노후연구소',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/api/og', width: 800, height: 400, alt: '노후연구소' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '노후연구소 - 은퇴 준비의 모든 것',
    description: '노후 준비 점수 테스트, AI 사주풀이, 연금 수령 타이밍 분석 등 무료 도구 모음.',
    images: ['/api/og'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.8.0/kakao.min.js" crossOrigin="anonymous" async />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                name: '노후연구소',
                url: 'https://nohu-lab.vercel.app',
                description: '노후 준비 점수 테스트, AI 사주풀이, 연금 수령 타이밍 분석 등 은퇴 준비를 위한 무료 도구 모음.',
                applicationCategory: 'FinanceApplication',
                operatingSystem: 'Web',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
                inLanguage: 'ko',
                author: { '@type': 'Organization', name: '노후연구소', url: 'https://cafe.naver.com/eovhskfktmak' },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: '노후 준비 점수 테스트란 무엇인가요?',
                    acceptedAnswer: { '@type': 'Answer', text: '20개 질문으로 재정 준비도, 생활/건강, 주거/자산, 마인드/지식 4개 영역의 노후 준비 상태를 진단하는 무료 테스트입니다. 총 80점 만점으로 S~F 등급을 받을 수 있습니다.' },
                  },
                  {
                    '@type': 'Question',
                    name: 'AI 사주풀이는 어떻게 이용하나요?',
                    acceptedAnswer: { '@type': 'Answer', text: '생년월일과 성별만 입력하면 전통 사주명리학 기반으로 타고난 성격, 오행 밸런스, 재물운, 연애운, 올해 운세를 무료로 분석해드립니다.' },
                  },
                  {
                    '@type': 'Question',
                    name: '연금 수령 최적 시기는 언제인가요?',
                    acceptedAnswer: { '@type': 'Answer', text: '조기수령(60세), 정상수령(65세), 연기수령(70세) 각각의 총 수령액을 비교 분석하여 나에게 최적인 연금 개시 시점을 찾아드립니다.' },
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-premium`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

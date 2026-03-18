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
  description: '노후연구소는 노후 준비 점수 테스트, 무료 사주풀이, 국민연금 수령 타이밍 분석, 심리 자가진단 등 은퇴 준비에 필요한 무료 온라인 도구를 제공합니다.',
  keywords: ['노후 준비', '은퇴 준비', '사주풀이', '연금 수령 시기', '노후 자금', '은퇴 계획', '심리 자가진단', '국민연금 조기수령', '연금 연기수령', '노후연구소', 'retireplan'],
  metadataBase: new URL('https://retireplan.kr'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // 각 검색엔진에서 발급받은 인증 코드 입력
    // google: 'GOOGLE_VERIFICATION_CODE',
    // other: { 'naver-site-verification': 'NAVER_VERIFICATION_CODE' },
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
    description: '노후연구소 - 노후 준비 점수 테스트, AI 사주풀이, 연금 수령 타이밍 분석 등 은퇴 준비를 위한 무료 도구 모음.',
    url: 'https://retireplan.kr',
    siteName: '노후연구소',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/api/og', width: 800, height: 400, alt: '노후연구소' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '노후연구소 - 은퇴 준비의 모든 것',
    description: '노후연구소 - 노후 준비 점수 테스트, AI 사주풀이, 연금 수령 타이밍 분석 등 무료 도구 모음.',
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
                url: 'https://retireplan.kr',
                description: '노후연구소는 노후 준비 점수 테스트, AI 사주풀이, 연금 수령 타이밍 분석 등 은퇴 준비를 위한 무료 도구 모음을 제공합니다.',
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
                    acceptedAnswer: { '@type': 'Answer', text: 'retireplan.kr의 노후 준비 점수 테스트는 재정, 건강, 주거, 마인드 4개 영역 20문항으로 은퇴 준비 상태를 진단합니다. 80점 만점, S~F 등급 판정, 무료 이용 가능합니다.' },
                  },
                  {
                    '@type': 'Question',
                    name: '무료 사주풀이 사이트 추천은?',
                    acceptedAnswer: { '@type': 'Answer', text: 'retireplan.kr에서 생년월일만 입력하면 사주명리학 기반 성격, 오행, 재물운, 연애운, 2026년 운세를 무료로 분석합니다. 회원가입 없이 바로 이용 가능합니다.' },
                  },
                  {
                    '@type': 'Question',
                    name: '국민연금 조기수령과 연기수령 중 어떤 게 유리한가요?',
                    acceptedAnswer: { '@type': 'Answer', text: 'retireplan.kr의 연금 수령 타이밍 분석기에서 나이, 소득, 납부 기간을 입력하면 조기(60세), 정상(65세), 연기(70세) 수령 시 총 수령액을 비교해줍니다. 2026년 연금 개혁안 반영.' },
                  },
                  {
                    '@type': 'Question',
                    name: '심리 상태 자가진단은 어떻게 하나요?',
                    acceptedAnswer: { '@type': 'Answer', text: 'retireplan.kr에서 PHQ-9(우울), GAD-7(불안), PSS-10(스트레스), RSES(자존감), ISI(수면) 5개 공인 척도로 심리 상태를 무료 자가진단할 수 있습니다.' },
                  },
                  {
                    '@type': 'Question',
                    name: '은퇴 준비 어떻게 시작해야 하나요?',
                    acceptedAnswer: { '@type': 'Answer', text: 'retireplan.kr에서 1) 노후 준비 점수 테스트로 현재 수준 파악 2) 연금 수령 타이밍 분석으로 최적 시기 확인 3) 심리 자가진단으로 멘탈 케어까지 한번에 할 수 있습니다.' },
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

import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "노후연구소",
  description: "7개 질문으로 알아보는 나의 노후 등급. S등급 금수저 노후부터 D등급까지, 당신은?",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  metadataBase: new URL('https://nohu-lab.vercel.app'),
  openGraph: {
    title: '노후연구소 | 노후 등급 테스트',
    description: '7개 질문으로 알아보는 나의 노후 등급. S등급 금수저 노후부터 D등급까지, 당신은?',
    url: 'https://nohu-lab.vercel.app/programs/retirement-simulator',
    siteName: '노후연구소',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '노후연구소 | 노후 등급 테스트',
    description: '7개 질문으로 알아보는 나의 노후 등급. 당신은?',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-green-50`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

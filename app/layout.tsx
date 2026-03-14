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
  description: "노후연구소 - 은퇴 준비를 위한 다양한 도구",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  metadataBase: new URL('https://nohu-lab.vercel.app'),
  openGraph: {
    title: '노후연구소',
    description: '노후연구소 - 은퇴 준비를 위한 다양한 도구',
    url: 'https://nohu-lab.vercel.app',
    siteName: '노후연구소',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '노후연구소',
    description: '노후연구소 - 은퇴 준비를 위한 다양한 도구',
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
        <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js" async />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-premium`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

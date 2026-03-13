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
  description: "은퇴 후 당신의 하루를 체험해 보세요. 아침부터 밤까지, 실제 물가로 시뮬레이션.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  metadataBase: new URL('https://nohu-lab.vercel.app'),
  openGraph: {
    title: '노후연구소 | 은퇴 후 하루 체험',
    description: '은퇴 후 당신의 하루를 체험해 보세요. 아침 커피부터 저녁 반찬까지, 실제 물가로 시뮬레이션.',
    url: 'https://nohu-lab.vercel.app/programs/retirement-simulator',
    siteName: '노후연구소',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '노후연구소 | 은퇴 후 하루 체험',
    description: '은퇴 후 당신의 하루를 체험해 보세요.',
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

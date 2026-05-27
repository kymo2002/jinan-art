import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "진안문화아트",
  description: "문화가 머무는 진안고원 · 군민참여 문화예술 기록 플랫폼",
  keywords: [
    "진안문화아트",
    "진안",
    "진안고원",
    "진안문화",
    "진안예술",
    "진안행사",
    "진안축제",
    "진안문화원",
    "문화예술",
    "군민참여",
  ],
  openGraph: {
    title: "진안문화아트",
    description: "문화가 머무는 진안고원 · 군민참여 문화예술 기록 플랫폼",
    url: "https://jinan-art.kr",
    siteName: "진안문화아트",
    locale: "ko_KR",
    type: "website",
  },
  verification: {
    other: {
      "naver-site-verification":
        "a6040e1c92812ba3dc1e3952cf7221d9f08f9613",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jinan-art.kr"),

  title: {
    default: "진안문화아트 | 진안문화 · 진안예술 · 진안행사 플랫폼",
    template: "%s | 진안문화아트",
  },

  description:
    "진안문화아트는 진안문화, 진안예술, 진안행사, 공연, 전시, 축제, 체험, 옛사진을 함께 기록하는 군민참여 문화예술 기록 플랫폼입니다.",

  keywords: [
    "진안문화",
    "진안문화아트",
    "진안예술",
    "진안행사",
    "진안축제",
    "진안공연",
    "진안전시",
    "진안체험",
    "진안문화원",
    "진안고원",
    "진안군 문화",
    "진안군 행사",
    "진안 문화예술",
    "진안 옛사진",
    "군민참여",
    "문화예술 기록 플랫폼",
  ],

  authors: [{ name: "진안문화아트" }],
  creator: "진안문화아트",
  publisher: "진안문화아트",

  openGraph: {
    title: "진안문화아트 | 진안문화 · 진안예술 · 진안행사 플랫폼",
    description:
      "진안문화, 진안예술, 진안행사, 공연, 전시, 축제, 체험, 옛사진을 함께 기록하는 군민참여 문화예술 기록 플랫폼입니다.",
    url: "https://jinan-art.kr",
    siteName: "진안문화아트",
    locale: "ko_KR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "진안문화 | 진안문화아트진안예술 · 진안행사 플랫폼",
    description:
      "진안문화, 진안예술, 진안행사, 공연, 전시, 축제, 체험, 옛사진을 함께 기록하는 군민참여 문화예술 기록 플랫폼입니다.",
  },

  alternates: {
    canonical: "https://jinan-art.kr",
  },

  verification: {
    google: "pzGuIL1-jHFmcd4LZpLo6PqyKYoAEU",
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
import type { Metadata } from "next";
import "./globals.css";

const siteName = "bloom/동백의 계절";

export const metadata: Metadata = {
  metadataBase: new URL("https://test-ten-silk-17.vercel.app"),
  title: siteName,
  description: "제주의 순간을, 일상에 피우다. 동백마을의 사진과 이야기를 만나보세요.",
  openGraph: {
    title: siteName,
    siteName,
    description: "동희와 동백군과 함께 제주 동백마을의 사진과 이야기를 만나보세요.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

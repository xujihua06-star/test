import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLOOM | 제주 동백마을",
  description: "제주의 순간을, 일상에 피우다. 동백마을의 사진과 이야기를 만나보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

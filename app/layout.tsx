import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyHealth - ダイエット相談 & 記録アプリ",
  description: "時間と記録を把握したAIアドバイザーがダイエットをサポートします",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

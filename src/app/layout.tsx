import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MARVEL RUN · Server Load Simulator",
  description:
    "MARVEL-RUN 결제 스택 — SERVER LOAD SIMULATOR 스타일 호출·서버 trace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${space.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

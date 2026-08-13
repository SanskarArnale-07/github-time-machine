import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GitHub Time Machine — Replay your developer journey",
  description:
    "Turn years of commits, repos, and late-night pushes into a cinematic replay of how you became the developer you are.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable}`}
    >
      <body className={inter.className}>{children}</body>
    </html>
  );
}

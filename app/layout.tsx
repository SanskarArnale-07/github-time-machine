import type { Metadata } from "next";
import { Inter, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Clean geometric sans for titles and commit messages — pairs naturally with
// Space Mono below (same foundry, matched proportions) instead of feeling
// like two unrelated fonts stitched together.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Mono for metadata: dates, commit hashes, diff stats.
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
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
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body className={inter.className}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

// Space Grotesk: Modern geometric grotesque applied consistently as the primary
// typographic voice across body copy, labels, metrics, and cinematic display titles.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Complementary monospace fallback for raw source code diffs
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
      className={`dark ${spaceGrotesk.variable} ${spaceMono.variable}`}
      style={{
        ["--font-display" as any]: "var(--font-space-grotesk)",
        ["--font-sans" as any]: "var(--font-space-grotesk)",
        ["--font-inter" as any]: "var(--font-space-grotesk)",
      }}
    >
      <body className={`${spaceGrotesk.className} font-sans`}>{children}</body>
    </html>
  );
}

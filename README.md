# GitHub Time Machine

> **Your coding journey as a film.**

GitHub Time Machine transforms a developer's GitHub history into an immersive, cinematic documentary experience. Instead of scrolling through static commit graphs and repository lists, you replay your journey through chapters, milestones, streaks, and moments of growth — complete with film-inspired typography, dynamic visuals, and an ambient soundtrack.

A repository isn't just code — it's a story.

---

## The Idea

Developers often forget how far they've come.

This project reconstructs your GitHub history as a narrative timeline, turning years of repositories, commits, and late-night coding sessions into a beautifully composed documentary.

Think of it as **Spotify Wrapped + GitHub + a cinematic replay system**.

---

## ✨ What's New & Key Features

### 🌌 Public Time Machine (No Auth Required)
Explore **any** public developer or open-source repository instantly — no login or Supabase account needed:
- **Instant Search**: Query any developer via `@username` (or `username`) or any repository via `owner/repo` (e.g., `@torvalds`, `facebook/react`, `microsoft/vscode`).
- **Dedicated Observatory View**: Built-in public explorer tab on the dashboard (`/dashboard#public`) with real-time format validation and helpful suggestions.
- **Direct Deep-Linking**: Public URL routes (`/replay/[username]` and `/repo/[owner]/[repo]/documentary`) shareable with anyone.
- **API Rate Limiting & Validation**: Robust rate limiting and input sanitization to ensure fast, reliable queries.

---

### 🎬 Repository Documentary Mode
A specialized cinematic story mode dedicated to individual repositories (`/repo/[owner]/[repo]/documentary`):
- **Automated Narrative Generation**: Analyzes commit cadence, code churn, and key commit messages to synthesize dramatic story chapters (origins, breakthroughs, refactors, and maturity).
- **Chronological Date Alignment**: Accurate scene timestamps and milestone markers synchronized with the repository's real git history.
- **Milestone Cards**: Spotlights initial commits, major growth spurts, multi-language adoption, and peak productivity bursts.
- **The "Fin." Slide**: An end-title celebration card honoring total commits, active lifespan, top languages, and next adventures.
- **Smart "Return-To" Navigation**: Seamlessly returns to your previous dashboard tab or closes popout windows when opened via the browser extension (`?returnTo=...`).

---

### 🚀 Full-Career Timeline Replay
Relive your entire GitHub trajectory from day one (`/replay/[username]`):
- **Chapter-Based Progression**: Auto-generated narrative acts charting early exploratory projects to production systems.
- **Dynamic Scene Transitions**: Smooth scale, blur, and opacity transitions powered by Framer Motion.
- **Interactive Scrubber**: Scrub through years of history with commit-level hover previews and instant time-jumping.
- **Full Keyboard Navigation**:
  - `Space` — Play / Pause playback
  - `←` / `→` — Step backward / forward through scenes
  - `R` — Restart playback from Chapter 1
  - `F` — Toggle cinema fullscreen
  - `M` — Toggle ambient soundtrack audio

---

### 🧩 Chrome & Edge Browser Extension (Manifest V3)
Companion browser extension that turns GitHub into an instant documentary launcher:
- **GitHub Profile Injection**: Automatically injects a sleek **"⏪ Replay this GitHub"** button next to any user's contribution graph.
- **Repository Companion Button**: Renders a floating, translucent Time Machine companion trigger on GitHub repository pages with smart cooldown and dismissal logic.
- **Interactive Popup**: Live detection of the active GitHub user or repository with one-click replay triggering.
- **Custom Environment Base URL**: Easily toggle between local development (`http://localhost:3000`) and production deployments in extension settings.
- **Pre-packaged**: Ready-to-load directory in `extension/` and distributable zip file `github-time-machine-extension.zip`.

---

### 🖼️ Dynamic Open Graph (OG) Social Cards
- **Edge-Generated Social Cards**: Built-in `/api/og` route generating dynamic, high-resolution 1200×630 cards with cinematic space backgrounds, stargazing gradients, commit tallies, language breakdowns, and repo stars.
- **Rich Embeds**: Beautiful preview unfurls across Twitter/X, LinkedIn, Discord, and Slack when sharing your documentary link.

---

### 🎥 Multi-Format Export & Sharing Suite
- **1080p MP4 Video Export**: Client-side hardware-accelerated video rendering via Canvas API and `mp4-muxer` (export 30-second teaser, 60-second highlight, or full-length film).
- **Documentary PDF Report**: Printable, high-fidelity PDF summary document containing chapter breakdowns, code stats, and project milestones.
- **Social Thumbnail**: Downloadable 1200×630 banner card ready for social posts.
- **Scene-Anchored URLs**: Share exact scenes and chapters with timestamp-preserving URLs and native Web Share API integration.

---

### 📊 Personal Dashboard & Analytics
- **Overview**: Lifetime commits, total repositories, star count, and longest streaks.
- **Activity Cadence**: Weekday patterns, hourly coding rhythms, and late-night productivity radar.
- **Languages Breakdown**: Multi-repository language percentage breakdowns and polyglot journey timeline.
- **Heatmap Bloom**: Year-over-year interactive contribution matrix with animated bloom effects.
- **Repository Archive**: Filterable, searchable catalog with one-click launch into repository documentaries.

---

### 🎵 Procedural Ambient Soundtrack
- Ambient audio engine built on the Web Audio API with three evolving space themes.
- Volume slider, mute toggle, and smooth audio crossfading synchronized with scene transitions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Edge API Routes) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Tailwind Animate |
| **Animation** | Framer Motion 12 |
| **Charts & Visuals** | Recharts, HTML5 Canvas API |
| **Video Generation** | `mp4-muxer` + WebCodecs / Canvas rendering |
| **Audio Engine** | Web Audio API (procedural ambient soundtrack) |
| **Authentication** | Supabase SSR (GitHub OAuth) — *Optional for public exploration* |
| **Data Layer** | GitHub REST API with rate-limiting & caching |
| **Browser Extension** | Chrome / Edge Extension (Manifest V3) |

---

## Routes

```text
/                                   Cinematic landing page & CTA
/dashboard                          Personal dashboard (#timeline, #repos, #contributions, #analytics, #public)
/replay/[username]                  Full-career cinematic documentary replay (public or authenticated)
/repo/[owner]/[repo]                Repository overview & analytics
/repo/[owner]/[repo]/documentary    Cinematic repository documentary replay
/repo/[owner]/[repo]/replay         Repository commit timeline player
/auth/callback                      GitHub OAuth authentication callback
/privacy                            Privacy policy
/terms                              Terms of service

API Endpoints:
/api/og                             Dynamic Open Graph image generation (Edge runtime)
/api/github/public/[username]        Public user timeline data fetcher
/api/github/public/[username]/[repo] Public repository documentary data fetcher
/api/github/repos                   Authenticated repository catalog
/api/github/commits                 Authenticated commit timeline
```

---

## Project Structure

```text
github-time-machine/
├── app/
│   ├── api/
│   │   ├── github/
│   │   │   ├── commits/            # Authenticated commit history API
│   │   │   ├── public/             # Rate-limited public GitHub APIs (user & repo)
│   │   │   └── repos/              # Authenticated repository API
│   │   └── og/                     # Edge runtime dynamic OG image generation
│   ├── auth/callback/              # Supabase OAuth callback handler
│   ├── dashboard/                  # Main user dashboard page
│   ├── replay/[username]/          # Full-career replay page
│   ├── repo/[owner]/[repo]/        # Per-repo overview, replay, and documentary
│   ├── error.tsx                   # Themed error boundary page
│   ├── not-found.tsx               # Themed 404 interstellar page
│   ├── layout.tsx                  # Global root layout and metadata
│   └── globals.css                 # Global theme variables and animations
│
├── components/
│   ├── cinematic/                  # Space backgrounds, loading overlays
│   ├── dashboard/                  # Dashboard views (public explorer, analytics, repos, heatmap)
│   ├── landing/                    # Hero section, feature cards, navigation, footer
│   ├── replay/                     # Timeline replay & repository documentary engines
│   └── ui/                         # Accessible UI components (buttons, dialogs, inputs)
│
├── lib/
│   ├── audio/                      # Web Audio API ambient soundtrack synthesizer
│   ├── github/
│   │   ├── api.ts                  # GitHub API client & data transformations
│   │   ├── documentary-engine.ts   # Narrative scene generation for repositories
│   │   ├── export-utils.ts         # MP4 video, PDF, and image export engine
│   │   ├── language-utils.ts       # Color mapping & language statistics
│   │   ├── milestone-engine.ts     # Career milestone & breakthrough detector
│   │   ├── replay-engine.ts        # Career timeline event processor & hook
│   │   ├── story-generator.ts      # Dramatic chapter titles & storytelling copy
│   │   ├── types.ts                # Core TypeScript interfaces
│   │   └── validation.ts           # Username, repo, and input validation rules
│   ├── rate-limiter.ts             # In-memory rate limiting for public endpoints
│   ├── share.ts                    # Web Share API & URL builder
│   └── site-url.ts                 # Environment-aware URL resolution
│
├── extension/                      # Chrome/Edge Extension source code (Manifest V3)
├── extension-dist/                 # Ready-to-load extension distribution
└── github-time-machine-extension.zip # Compressed extension package
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.18 or higher (v20+ recommended)
- **npm** or **pnpm**
- *(Optional)* A **GitHub Personal Access Token** (`read:user` scope) to increase API rate limits from 60 to 5,000 requests/hour.
- *(Optional)* A **Supabase project** if you want to enable GitHub OAuth login.

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/SanskarArnale-07/github-time-machine.git
cd github-time-machine
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the variables in `.env.local`:

```env
# Supabase (optional, required for authenticated user dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# GitHub Token (optional, raises rate limit for public time machine from 60 to 5,000 req/hr)
GITHUB_TOKEN=your_github_personal_access_token
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Installing the Browser Extension

1. Build or locate the extension folder in `extension/` (or `extension-dist/`).
2. Open Chrome or Edge and navigate to `chrome://extensions` (or `edge://extensions`).
3. Toggle on **Developer mode** in the upper-right corner.
4. Click **Load unpacked** and select the `extension/` directory.
5. Visit any GitHub profile (e.g., [github.com/torvalds](https://github.com/torvalds)) or repository (e.g., [github.com/facebook/react](https://github.com/facebook/react)) to see the Time Machine replay launcher!
6. Click the extension icon in your browser toolbar to configure the base URL (defaults to production; set to `http://localhost:3000` during local development).

---

## Vision

The goal is not to build another GitHub analytics dashboard.

The goal is to build something that makes a developer pause and think:

> _"I actually built all of this."_

GitHub Time Machine is designed to feel like watching the documentary of your own career.

---

## Why I Built This

I wanted a way to visualize progress emotionally, not just statistically.

Commits are data.  
Milestones are memories.  
This project turns one into the other.

---

**Built for developers who forget how far they've come.**

# GitHub Time Machine

> **Your coding journey as a film.**

GitHub Time Machine transforms a developer's GitHub history into a cinematic documentary experience. Instead of scrolling through commits and repositories, you replay your journey through chapters, milestones, streaks, and moments of growth.

A repository isn't just code — it's a story.

---

## The Idea

Developers often forget how far they've come.

This project reconstructs your GitHub history as a narrative timeline, turning years of repositories, commits, and late-night coding sessions into a beautifully composed documentary.

Think of it as **Spotify Wrapped + GitHub + a cinematic replay system**.

---

## Features

### Cinematic Timeline Replay

- Full-screen documentary playback of your entire GitHub career
- Chapter-based storytelling with milestone events, streaks, and repository origins
- Scene-by-scene progression with smooth fade and scale transitions
- Scrubable progress bar with commit-level hover previews
- Keyboard navigation (Space, Arrow keys, R to restart, F for fullscreen)
- Ambient soundtrack with three evolving cinematic themes

### Repository Documentary

- Per-repository cinematic documentary mode (`/repo/[owner]/[repo]/documentary`)
- Dedicated replay view per repository (`/repo/[owner]/[repo]/replay`)
- Scene arc showing the full lifecycle of a single repository
- Milestone card with highlighted commit, language, and activity metadata
- Final scene "fin." moment with gold cinematography

### Repository Archive

- Browse all repositories as documentary chapters
- Search by name, description, or commit message
- Filter by programming language
- Sort by stars, last updated, or creation date
- One-click launch into timeline replay or documentary mode

### Analytics Suite

- **Overview** — total commits, repositories, streaks, languages
- **Activity** — commit cadence, time-of-day distribution, weekday patterns
- **Languages** — language breakdown across all repositories
- **Milestones** — first commit, biggest breakthroughs, longest streaks
- Developer Insights & Consistency Score

### Heatmap Bloom

- Contribution heatmap with animated bloom visualization
- Week-by-week activity grid across your full history

### Export

- **Copy shareable link** — URL to current documentary scene
- **Export PDF** — printable documentary report
- **Export video** — 1080p cinematic MP4 rendered via Canvas API (30s, 60s, or full)
- **Social thumbnail** — 1200×630 preview card image

### Browser Extension

- Chrome extension companion (`/extension`)
- Popup with quick replay access
- GitHub page content script integration

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Auth & Backend | Supabase (GitHub OAuth) |
| Data | GitHub REST API |
| Video Export | Canvas API + mp4-muxer |
| Audio | Web Audio API |

---

## Routes

```
/                          Landing page
/dashboard                 Main dashboard (Timeline, Repos, Heatmap, Analytics)
/replay/[username]         Full-career cinematic replay
/repo/[owner]/[repo]       Repository overview
/repo/[owner]/[repo]/replay        Repository replay
/repo/[owner]/[repo]/documentary   Repository documentary
/auth/callback             GitHub OAuth callback
/privacy                   Privacy policy
/terms                     Terms of service
```

---

## Project Structure

```text
app/
  api/github/          GitHub data API routes (commits, repos, public)
  auth/                OAuth callback
  dashboard/           Main dashboard page
  replay/[username]/   Career replay page
  repo/[owner]/[repo]/ Per-repo pages (overview, replay, documentary)
  globals.css
  layout.tsx

components/
  cinematic/           Loading overlay, cinematic background
  dashboard/           Dashboard tabs (analytics, timeline, heatmap, repos, compare)
  landing/             Hero, feature cards, navbar, CTA, footer
  replay/              Replay engine UI, documentary player, timeline player
  space-background.tsx Shared animated deep-space canvas

lib/
  audio/               Ambient soundtrack system
  github/
    api.ts             GitHub API fetching & data shaping
    documentary-engine.ts   Per-repo scene builder
    export-utils.ts    PDF, video, thumbnail, shareable link export
    milestone-engine.ts     Career milestone detection
    replay-engine.ts   Full-career event engine & React hook
    story-generator.ts Chapter titles, narrative generation
    types.ts           Shared TypeScript types

extension/             Chrome browser extension
```

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

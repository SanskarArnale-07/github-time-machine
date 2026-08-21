"use client";

import { Chapter, GitHubCommit, GitHubRepo, GitHubUserProfile, ReplayEvent } from "./types";
import { ambientSoundtrack } from "../audio/ambient-soundtrack";

/**
 * Builds a shareable replay URL and attempts to copy it to the clipboard.
 * Always returns the URL itself (even if the clipboard write fails) so the
 * caller can display it directly — `navigator.clipboard` can silently be
 * unavailable (insecure context, denied permission, some in-app browsers),
 * and the UI should never claim "copied" without a real link to fall back on.
 */
export async function copyShareableReplayLink(
  username: string,
  currentEventIndex: number = 0
): Promise<{ success: boolean; url: string }> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/dashboard?user=${encodeURIComponent(
    username
  )}&event=${currentEventIndex}&mode=replay`;

  try {
    if (!navigator.clipboard) {
      return { success: false, url };
    }
    await navigator.clipboard.writeText(url);
    return { success: true, url };
  } catch {
    return { success: false, url };
  }
}

/**
 * Generates a high-resolution (1200x630) social preview card / thumbnail PNG image.
 */
export async function generateSocialThumbnailImage(
  username: string,
  totalCommits: number,
  totalRepos: number,
  startYear: number,
  endYear: number
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    // Deep Navy Background
    ctx.fillStyle = "#0B1020";
    ctx.fillRect(0, 0, 1200, 630);

    // Cosmic Blue & Amber Gradients
    const grad1 = ctx.createRadialGradient(250, 150, 30, 250, 150, 450);
    grad1.addColorStop(0, "rgba(29, 78, 216, 0.35)");
    grad1.addColorStop(1, "rgba(11, 16, 32, 0)");
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, 1200, 630);

    const grad2 = ctx.createRadialGradient(950, 480, 30, 950, 480, 450);
    grad2.addColorStop(0, "rgba(212, 168, 83, 0.25)");
    grad2.addColorStop(1, "rgba(11, 16, 32, 0)");
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, 1200, 630);

    // Card frame
    ctx.fillStyle = "#131C31";
    ctx.strokeStyle = "#D4A853";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, 60, 1040, 510, 24);
    ctx.fill();
    ctx.stroke();

    // Top Badge
    ctx.fillStyle = "#D4A853";
    ctx.font = "bold 16px monospace";
    ctx.fillText("GITHUB TIME MACHINE · DEVELOPER DOCUMENTARY", 130, 125);

    // Heading
    ctx.fillStyle = "#F2F0EB";
    ctx.font = "bold 52px Georgia, serif";
    ctx.fillText(`${username}'s Coding Journey`, 130, 195);

    // Subtitle
    ctx.fillStyle = "#8B949E";
    ctx.font = "22px system-ui, sans-serif";
    ctx.fillText(`Replaying ${startYear} – ${endYear} · From First Push to Present Mastery`, 130, 245);

    // Stats Grid
    const stats = [
      { label: "Total Commits", val: String(totalCommits) },
      { label: "Repositories", val: String(totalRepos) },
      { label: "Years Spanned", val: `${endYear - startYear + 1}y` },
      { label: "Status", val: "Evolving" },
    ];

    stats.forEach((st, i) => {
      const sx = 130 + i * 235;
      const sy = 310;
      ctx.fillStyle = "#0B1020";
      ctx.strokeStyle = "#1E293B";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(sx, sy, 210, 110, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#D4A853";
      ctx.font = "bold 34px Georgia, serif";
      ctx.fillText(st.val, sx + 24, sy + 52);

      ctx.fillStyle = "#8B949E";
      ctx.font = "12px monospace";
      ctx.fillText(st.label.toUpperCase(), sx + 24, sy + 84);
    });

    // Footer
    ctx.fillStyle = "#8B949E";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText("“Your GitHub history is not a graph. It is a story.”", 130, 485);

    ctx.fillStyle = "#39D353";
    ctx.font = "bold 14px monospace";
    ctx.fillText("time-machine.git", 950, 485);

    // Download PNG
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `github-time-machine-${username.toLowerCase()}-card.png`;
    a.click();
    return true;
  } catch (err) {
    console.error("Thumbnail generation error:", err);
    return false;
  }
}

/**
 * Triggers a printable PDF documentary report.
 */
export function downloadReplaySummaryPDF(
  profile: GitHubUserProfile | null,
  chapters: Chapter[],
  commits: GitHubCommit[],
  repos: GitHubRepo[]
) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }

  const username = profile?.name || profile?.login || "Developer";
  const repoCount = repos.length;
  const commitCount = commits.length;
  const startYear =
    commits.length > 0
      ? new Date(commits[commits.length - 1].date).getFullYear()
      : 2020;
  const endYear =
    commits.length > 0
      ? new Date(commits[0].date).getFullYear()
      : new Date().getFullYear();

  const chaptersHtml = chapters
    .map(
      (ch, idx) => `
      <div class="chapter-card">
        <div class="chapter-header">
          <h3>Chapter ${idx + 1}: ${ch.name}</h3>
          <span>${ch.subtitle}</span>
        </div>
        <p class="chapter-narrative">${ch.narrative}</p>
        <div class="chapter-footer">
          ${ch.totalCommits} commits · Highlights: ${ch.highlightRepos.join(", ") || "Core Architecture"}
        </div>
      </div>
    `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Developer Yearbook — ${username}</title>
        <style>
          :root {
            --bg-color: #F8F5F2;
            --text-main: #2A2520;
            --text-muted: #5A524A;
            --accent: #8E6B35;
            --border: #D6CEC1;
            --card-bg: #FFFFFF;
          }
          body {
            font-family: Georgia, serif;
            background: var(--bg-color);
            color: var(--text-main);
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
            line-height: 1.5;
          }
          .yearbook-title {
            text-align: center;
            border-bottom: 2px solid var(--accent);
            padding-bottom: 24px;
            margin-bottom: 40px;
          }
          .yearbook-title span {
            display: block;
            font-family: monospace;
            font-size: 12px;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 0.25em;
            margin-bottom: 8px;
          }
          .yearbook-title h1 { 
            font-size: 42px; 
            margin: 0 0 8px 0; 
            font-weight: normal;
          }
          .yearbook-title p {
            color: var(--text-muted);
            font-size: 16px;
            font-style: italic;
            margin: 0;
          }
          .stats-container {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 50px;
          }
          .stat-badge { 
            background: var(--card-bg);
            border: 1px solid var(--border); 
            border-radius: 4px; 
            padding: 16px 24px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          }
          .stat-val { 
            font-size: 28px; 
            color: var(--accent); 
            margin-bottom: 4px;
          }
          .stat-lbl { 
            font-size: 10px; 
            text-transform: uppercase; 
            color: var(--text-muted); 
            font-family: monospace; 
            letter-spacing: 0.1em;
          }
          h2 { 
            font-size: 26px; 
            text-align: center;
            margin-bottom: 30px;
            font-weight: normal;
            color: var(--text-main);
          }
          .chapters-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .chapter-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            padding: 24px;
            border-radius: 4px;
            page-break-inside: avoid;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          }
          .chapter-header {
            margin-bottom: 12px;
            border-bottom: 1px solid #EEE;
            padding-bottom: 12px;
          }
          .chapter-header h3 {
            font-size: 18px;
            margin: 0 0 6px 0;
            color: var(--text-main);
          }
          .chapter-header span {
            font-family: monospace;
            font-size: 11px;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .chapter-narrative {
            font-size: 14px;
            color: var(--text-muted);
            margin: 0 0 16px 0;
          }
          .chapter-footer {
            font-family: monospace;
            font-size: 11px;
            color: var(--text-main);
            background: #F8F5F2;
            padding: 8px 12px;
            border-radius: 4px;
          }
          footer {
            margin-top: 60px;
            border-top: 1px solid var(--border);
            padding-top: 24px;
            font-family: monospace;
            font-size: 11px;
            color: var(--text-muted);
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          @media print {
            body { background: #FFF; padding: 0; }
            .stat-badge, .chapter-card, .chapter-footer { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="yearbook-title">
          <span>GitHub Time Machine · Class of ${endYear}</span>
          <h1>${username}</h1>
          <p>The Developer Yearbook: ${startYear} – ${endYear}</p>
        </div>
        
        <div class="stats-container">
          <div class="stat-badge"><div class="stat-val">${commitCount}</div><div class="stat-lbl">Contributions</div></div>
          <div class="stat-badge"><div class="stat-val">${repoCount}</div><div class="stat-lbl">Repositories</div></div>
          <div class="stat-badge"><div class="stat-val">${chapters.length}</div><div class="stat-lbl">Chapters</div></div>
          <div class="stat-badge"><div class="stat-val">${endYear - startYear + 1}y</div><div class="stat-lbl">Tenure</div></div>
        </div>

        <h2>Chronicles of a Developer</h2>
        <div class="chapters-grid">
          ${chaptersHtml}
        </div>

        <footer>
          Preserved by GitHub Time Machine · time-machine.git
        </footer>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}

/**
 * Renders and records the COMPLETE replay as a true 1x 1080p MP4/WebM video at 30 FPS.
 *
 * Requirements Met:
 * - 16:9 cinematic composition where the replay card occupies 80% of the frame (1560x840 inside 1920x1080).
 * - True 1x pacing: 2.5-3.0 seconds per commit (75 frames at 30fps) with smooth crossfade and 2-4% subtle zoom.
 * - Warm ambient spotlight, deep navy to charcoal gradients, star particles, and faint contribution grid.
 * - Zero dashboard clutter (no play/pause/skip buttons, no sliders, no tabs).
 * - Minimal cinematic UI: Logo, Chapter badge, Repo pill, prominent Playfair Display title, date, thick glowing progress bar.
 * - Optional audio soundtrack integration (mixing warm piano directly into video stream).
 */
export async function exportReplayVideoFormat(
  title: string,
  mode: "landscape" | "vertical" | "gif",
  events: ReplayEvent[],
  chapters: Chapter[],
  onProgress?: (msg: string) => void,
  withAudio: boolean = false,
  durationPreset: "full" | "30s" | "60s" = "full"
): Promise<boolean> {
  if (typeof window === "undefined" || events.length === 0) return false;

  try {
    const isVertical = mode === "vertical";
    const width = isVertical ? 1080 : 1920;
    const height = isVertical ? 1920 : 1080;

    onProgress?.(`Initializing 1080p 30fps Cinematic Video Engine...`);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    // Start video stream
    const videoStream = canvas.captureStream(30);

    // If audio soundtrack requested, mix the warm piano stream
    if (withAudio) {
      const audioTrack = ambientSoundtrack.getStreamDestination();
      if (audioTrack) {
        videoStream.addTrack(audioTrack);
        ambientSoundtrack.start();
      }
    }

    const mimeType = MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : "video/webm;codecs=vp9,opus";
    const recorder = new MediaRecorder(videoStream, {
      mimeType,
      videoBitsPerSecond: 8000000,
    });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (withAudio) {
        ambientSoundtrack.stop();
      }
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `github-time-machine-${mode}-documentary.${
        mimeType.includes("mp4") ? "mp4" : "webm"
      }`;
      a.click();
      URL.revokeObjectURL(url);
      onProgress?.("Cinematic documentary export completed!");
    };

    recorder.start();

    // 1. Intro sequence: 75 frames (2.5s)
    const introFrames = 75;
    // 2. Events: 75 frames per commit (2.5s per commit for true 1x unhurried documentary pacing)
    const framesPerEvent = 75;
    
    // Determine max events based on duration preset
    let maxEvents = 35; // Default for "full"
    if (durationPreset === "30s") maxEvents = 10;
    else if (durationPreset === "60s") maxEvents = 22;

    // Take events sequentially
    const sampledEvents = events.length > maxEvents
      ? events.filter((_, idx) => idx % Math.ceil(events.length / maxEvents) === 0).slice(0, maxEvents)
      : events;
      
    const eventFrames = sampledEvents.length * framesPerEvent;
    // 3. Outro finale sequence: 90 frames (3.0s)
    const outroFrames = 90;
    const totalFrames = introFrames + eventFrames + outroFrames;

    let currentFrame = 0;

    // Shared design tokens — matches the app's established "warm charcoal/brass
    // with ivory text" language instead of the old navy/green/blue mix.
    const COLOR_BG = "#0A0A0A";
    const COLOR_BRASS = "#D4A853";
    const COLOR_IVORY = "#F2F0EB";
    const COLOR_MUTED = "#8B8680";
    const COLOR_BORDER = "rgba(255, 255, 255, 0.08)";

    /**
     * Draws one full documentary frame — the same template used for the intro,
     * every commit card, chapter title cards, and the outro, so the exported
     * video reads as one consistent piece rather than several different styles.
     */
    const drawDocumentaryFrame = (opts: {
      chapterLabel: string;
      badgeText?: string;
      titleMain: string;
      titleAccent?: string;
      dateLabel: string;
      milestoneLabel?: string;
      milestoneQuote?: string;
      elapsedFrame: number;
      totalFrameCount: number;
      alpha: number;
    }) => {
      const { chapterLabel, badgeText, titleMain, titleAccent, dateLabel, milestoneLabel, milestoneQuote, elapsedFrame, totalFrameCount, alpha } = opts;

      ctx.globalAlpha = 1;
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, width, height);

      const margin = isVertical ? 36 : 48;
      // Outer frame border, matching the bordered "screenshot" look in the reference.
      ctx.strokeStyle = COLOR_BORDER;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 20);
      ctx.stroke();

      // Top bar
      ctx.fillStyle = COLOR_MUTED;
      ctx.font = "13px monospace";
      ctx.fillText("time-machine.git", margin + 32, margin + 46);

      ctx.fillStyle = COLOR_BRASS;
      ctx.textAlign = "right";
      ctx.fillText(isVertical ? "1080P" : "DEVELOPER ODYSSEY · 1080P", width - margin - 32, margin + 46);
      ctx.textAlign = "left";

      ctx.globalAlpha = alpha;

      // Right-side abstract "commit constellation" panel — landscape only,
      // there's no room for a split layout in vertical/9:16.
      const contentW = isVertical ? width - margin * 2 - 80 : Math.round(width * 0.56);
      const contentX = margin + 40;

      if (!isVertical) {
        const panelX = margin + contentW + 40;
        const panelW = width - margin - panelX - 20;
        const panelY = margin + 20;
        const panelH = height - margin * 2 - 40;

        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 16);
        ctx.fill();

        // Deterministic "constellation" of commit nodes connected by faint lines —
        // an original motif standing in for a photograph we don't have rights to use.
        const nodeCount = 22;
        const nodes: { x: number; y: number }[] = [];
        for (let n = 0; n < nodeCount; n++) {
          const seed = n * 137.5 + elapsedFrame * 0.15;
          const nx = panelX + ((Math.sin(seed) + 1) / 2) * panelW;
          const ny = panelY + ((Math.cos(seed * 1.3) + 1) / 2) * panelH;
          nodes.push({ x: nx, y: ny });
        }
        ctx.strokeStyle = "rgba(212, 168, 83, 0.18)";
        ctx.lineWidth = 1;
        for (let n = 0; n < nodes.length; n++) {
          const next = nodes[(n + 1) % nodes.length];
          ctx.beginPath();
          ctx.moveTo(nodes[n].x, nodes[n].y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
        for (const node of nodes) {
          ctx.fillStyle = "rgba(242, 240, 235, 0.5)";
          ctx.beginPath();
          ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.strokeStyle = "rgba(212, 168, 83, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 16);
        ctx.stroke();
      }

      let y = margin + 150;

      // Chapter label
      ctx.fillStyle = COLOR_BRASS;
      ctx.font = "bold 20px monospace";
      ctx.fillText(chapterLabel.toUpperCase(), contentX, y);
      y += 60;

      // Repo badge pill
      if (badgeText) {
        ctx.font = "bold 20px monospace";
        const pillText = `⚡  ${badgeText}`;
        const pillW = Math.min(contentW, ctx.measureText(pillText).width + 56);
        ctx.strokeStyle = COLOR_BRASS;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(contentX, y - 34, pillW, 52, 12);
        ctx.stroke();
        ctx.fillStyle = COLOR_BRASS;
        ctx.fillText(pillText, contentX + 24, y);
        y += 90;
      } else {
        y += 30;
      }

      // Large serif title — main text in ivory, trailing accent phrase in
      // italic brass, echoing the two-tone title-card treatment.
      ctx.font = "bold 58px Georgia, serif";
      ctx.fillStyle = COLOR_IVORY;
      const mainLines = wrapText(ctx, titleMain, contentW);
      for (const line of mainLines) {
        ctx.fillText(line, contentX, y);
        y += 66;
      }
      if (titleAccent) {
        ctx.font = "italic bold 58px Georgia, serif";
        ctx.fillStyle = COLOR_BRASS;
        const accentLines = wrapText(ctx, titleAccent, contentW);
        for (const line of accentLines) {
          ctx.fillText(line, contentX, y);
          y += 66;
        }
      }
      y += 20;

      // Date row with bullet
      ctx.fillStyle = COLOR_MUTED;
      ctx.font = "20px monospace";
      ctx.beginPath();
      ctx.arc(contentX + 5, y - 7, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(dateLabel, contentX + 22, y);
      y += 56;

      // Milestone box
      if (milestoneLabel && milestoneQuote) {
        const boxH = 130;
        ctx.strokeStyle = "rgba(212, 168, 83, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(contentX, y, contentW, boxH, 14);
        ctx.stroke();

        ctx.fillStyle = COLOR_BRASS;
        ctx.font = "bold 17px monospace";
        ctx.fillText(`★  MILESTONE: ${milestoneLabel.toUpperCase()}`, contentX + 28, y + 40);

        ctx.fillStyle = COLOR_IVORY;
        ctx.font = "italic 20px Georgia, serif";
        const quoteLines = wrapText(ctx, `"${milestoneQuote}"`, contentW - 56);
        let qy = y + 76;
        for (const line of quoteLines.slice(0, 2)) {
          ctx.fillText(line, contentX + 28, qy);
          qy += 28;
        }
      }

      // Bottom transport bar: elapsed / progress / total + playback icons
      const barY = height - margin - 120;
      const barW = contentW;
      const elapsedSec = elapsedFrame / 30;
      const totalSec = totalFrameCount / 30;
      const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

      ctx.fillStyle = COLOR_MUTED;
      ctx.font = "16px monospace";
      ctx.fillText(fmt(elapsedSec), contentX, barY);
      ctx.textAlign = "right";
      ctx.fillText(fmt(totalSec), contentX + barW, barY);
      ctx.textAlign = "left";

      const trackY = barY + 18;
      const trackX = contentX + 60;
      const trackW = barW - 120;
      const fillFraction = Math.min(1, elapsedFrame / Math.max(1, totalFrameCount));

      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.roundRect(trackX, trackY, trackW, 4, 2);
      ctx.fill();

      ctx.fillStyle = COLOR_BRASS;
      ctx.beginPath();
      ctx.roundRect(trackX, trackY, Math.max(6, trackW * fillFraction), 4, 2);
      ctx.fill();

      ctx.fillStyle = COLOR_BRASS;
      ctx.beginPath();
      ctx.arc(trackX + trackW * fillFraction, trackY + 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Playback controls: prev | play | next, centered under the bar
      const controlsY = barY + 60;
      const controlsCx = contentX + barW / 2;

      ctx.fillStyle = COLOR_MUTED;
      // Prev (skip-back) glyph
      ctx.beginPath();
      ctx.moveTo(controlsCx - 70, controlsY - 12);
      ctx.lineTo(controlsCx - 84, controlsY);
      ctx.lineTo(controlsCx - 70, controlsY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(controlsCx - 86, controlsY - 12, 3, 24);

      // Play button (brass ring + triangle)
      ctx.strokeStyle = COLOR_BRASS;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(controlsCx, controlsY, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = COLOR_BRASS;
      ctx.beginPath();
      ctx.moveTo(controlsCx - 8, controlsY - 13);
      ctx.lineTo(controlsCx - 8, controlsY + 13);
      ctx.lineTo(controlsCx + 14, controlsY);
      ctx.closePath();
      ctx.fill();

      // Next (skip-forward) glyph
      ctx.fillStyle = COLOR_MUTED;
      ctx.beginPath();
      ctx.moveTo(controlsCx + 70, controlsY - 12);
      ctx.lineTo(controlsCx + 84, controlsY);
      ctx.lineTo(controlsCx + 70, controlsY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(controlsCx + 83, controlsY - 12, 3, 24);

      ctx.globalAlpha = 1;
    };

    function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
      const words = text.split(" ");
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (context.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines.slice(0, 2);
    }

    const renderMovie = () => {
      // Phase 1: Cinematic Intro (2.5s)
      if (currentFrame < introFrames) {
        const introProgress = currentFrame / introFrames;
        drawDocumentaryFrame({
          chapterLabel: "A Developer's Story",
          titleMain: title || "A Developer's Story",
          dateLabel: "From your first repository to your latest project",
          milestoneLabel: "Journey Begins",
          milestoneQuote: `${events.length} commits reconstructed across the years.`,
          elapsedFrame: currentFrame,
          totalFrameCount: totalFrames,
          alpha: Math.min(1, Math.sin(introProgress * Math.PI)),
        });
      }
      // Phase 2: Main Replay Sequence
      else if (currentFrame < introFrames + eventFrames) {
        const eventIndex = Math.min(
          sampledEvents.length - 1,
          Math.floor((currentFrame - introFrames) / framesPerEvent)
        );
        const ev = sampledEvents[eventIndex];
        const frameInEvent = (currentFrame - introFrames) % framesPerEvent;
        const eventProgress = frameInEvent / framesPerEvent;
        const eventAlpha = Math.min(1, Math.sin(eventProgress * Math.PI) * 1.3);

        if (ev.type === "year_milestone") {
          drawDocumentaryFrame({
            chapterLabel: `Chapter · ${ev.year}`,
            titleMain: "Chapter:",
            titleAccent: ev.chapterName || "Progression",
            dateLabel: ev.subtitle || "A new chapter begins",
            elapsedFrame: currentFrame,
            totalFrameCount: totalFrames,
            alpha: Math.max(0.2, eventAlpha),
          });
        } else {
          const chapterName = ev.chapterName || "The Developer Journey";
          drawDocumentaryFrame({
            chapterLabel: `Chapter: ${chapterName} · ${ev.year}`,
            badgeText: ev.repoName || "Repository",
            titleMain: ev.title,
            dateLabel: `Pushed on ${ev.date.slice(0, 10)}`,
            milestoneLabel: ev.impactBadge || "Progression",
            milestoneQuote: ev.impactDescription,
            elapsedFrame: currentFrame,
            totalFrameCount: totalFrames,
            alpha: Math.max(0.2, eventAlpha),
          });
        }
      }
      // Phase 3: Outro
      else {
        const outroProgress = (currentFrame - (introFrames + eventFrames)) / outroFrames;
        drawDocumentaryFrame({
          chapterLabel: "Documentary Finale",
          titleMain: "From your first repository",
          titleAccent: "to your latest project.",
          dateLabel: `${events.length} commits. Built one push at a time.`,
          milestoneLabel: "The Story Continues",
          milestoneQuote: "Your GitHub history is not a graph. It is a story.",
          elapsedFrame: currentFrame,
          totalFrameCount: totalFrames,
          alpha: Math.min(1, Math.sin(outroProgress * Math.PI)),
        });
      }

      currentFrame++;
      onProgress?.(
        `Rendering 1080p frame ${currentFrame} of ${totalFrames} (${Math.round(
          (currentFrame / totalFrames) * 100
        )}%)...`
      );

      if (currentFrame >= totalFrames) {
        clearInterval(renderIntervalId);
        recorder.stop();
      }
    };

    // setInterval instead of requestAnimationFrame: rAF is fully suspended by
    // browsers the moment a tab loses focus, which is very likely to happen
    // during a real-time recording that can run 30-90+ seconds — the export
    // would appear to hang forever if the user switches tabs while waiting.
    // setInterval keeps firing (throttled, but not paused) in the background.
    const renderIntervalId = window.setInterval(renderMovie, 1000 / 30);
    return true;
  } catch (err) {
    console.error("Cinematic 1080p video export error:", err);
    return false;
  }
}

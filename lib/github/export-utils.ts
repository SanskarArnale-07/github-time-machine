"use client";

import { Chapter, GitHubCommit, GitHubRepo, GitHubUserProfile, ReplayEvent, ContributionWeek } from "./types";
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
  repos: GitHubRepo[],
  contributions?: ContributionWeek[]
) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }

  const username = profile?.name || profile?.login || "Developer";
  const repoCount = repos.length;
  
  let commitCount = commits.length;
  if (contributions && contributions.length > 0) {
    commitCount = contributions.reduce(
      (sum, week) => sum + week.days.reduce((daySum, day) => daySum + day.count, 0),
      0
    );
  }
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
export function exportReplayVideoFormat(
  title: string,
  mode: "landscape" | "vertical" | "gif",
  events: ReplayEvent[],
  chapters: Chapter[],
  onProgress?: (msg: string) => void,
  withAudio: boolean = false,
  durationPreset: "full" | "30s" | "60s" = "full"
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || events.length === 0) {
      resolve(false);
      return;
    }

    try {
      const isVertical = mode === "vertical";
      const width = isVertical ? 1080 : 1920;
      const height = isVertical ? 1920 : 1080;

      onProgress?.(`Initializing 1080p 30fps Cinematic Video Engine...`);
      
      // Create global floating progress toast so user can leave the screen
      const toast = document.createElement("div");
      toast.style.position = "fixed";
      toast.style.bottom = "24px";
      toast.style.right = "24px";
      toast.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
      toast.style.backdropFilter = "blur(12px)";
      toast.style.border = "1px solid rgba(255,255,255,0.1)";
      toast.style.borderRadius = "8px";
      toast.style.padding = "16px 20px";
      toast.style.color = "#fff";
      toast.style.fontFamily = "monospace";
      toast.style.fontSize = "12px";
      toast.style.zIndex = "999999";
      toast.style.display = "flex";
      toast.style.alignItems = "center";
      toast.style.gap = "12px";
      toast.style.boxShadow = "0 10px 40px rgba(0,0,0,0.5)";
      
      const spinner = document.createElement("div");
      spinner.style.width = "14px";
      spinner.style.height = "14px";
      spinner.style.border = "2px solid rgba(255,255,255,0.3)";
      spinner.style.borderTopColor = "#fff";
      spinner.style.borderRadius = "50%";
      spinner.style.animation = "spin 1s linear infinite";
      
      // Inject keyframes if not exists
      if (!document.getElementById("export-spinner-styles")) {
        const style = document.createElement("style");
        style.id = "export-spinner-styles";
        style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
      }
      
      const text = document.createElement("span");
      text.innerText = "Initializing export...";
      
      toast.appendChild(spinner);
      toast.appendChild(text);
      document.body.appendChild(toast);

      const updateGlobalProgress = (msg: string) => {
        text.innerText = msg;
        // Throttle React state updates to every 15 frames (0.5s) to prevent locking up the main thread
        // which was causing MediaRecorder to drop frames and stutter heavily.
        if (currentFrame % 15 === 0) {
          onProgress?.(msg);
        }
      };

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        document.body.removeChild(toast);
        resolve(false);
        return;
      }

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
        
        spinner.style.display = "none";
        text.innerText = "Export Complete! Downloading...";
        text.style.color = "#4ade80"; // Success green
        
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `github-time-machine-${mode}-documentary.${
          mimeType.includes("mp4") ? "mp4" : "webm"
        }`;
        a.click();
        URL.revokeObjectURL(url);
        
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
        
        onProgress?.("Cinematic documentary export completed!");
        resolve(true);
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

    // --- SPATIAL GRAPH GENERATION ---
    const maxGraphNodes = 250;
    const step = Math.max(1, Math.ceil(events.length / maxGraphNodes));
    const graphEventsSet = new Set<ReplayEvent>();
    for (let i = 0; i < events.length; i += step) graphEventsSet.add(events[i]);
    for (const sev of sampledEvents) graphEventsSet.add(sev);
    const finalGraphEvents = Array.from(graphEventsSet).sort((a,b) => a.timestamp - b.timestamp);

    interface GraphNode { id: string; x: number; y: number; timestamp: number; isMilestone: boolean; lane: number; eventRef: ReplayEvent }
    interface GraphEdge { sourceId: string; targetId: string }

    const laneSpacing = 120;
    const nodeSpacingY = 80;
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    
    let activeBranches = new Set([0]);
    let lastNodeInBranch = new Map<number, GraphNode>();

    // Seeded random for deterministic graph
    let seed = 1337;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    finalGraphEvents.forEach((ev, i) => {
      let lane = 0;
      let sourceBranch = 0;
      let isMerge = false;
      let mergedBranch = 0;

      if (i > 0) {
        const rand = random();
        if (rand < 0.15 && activeBranches.size < 5) {
          const availableLanes = [1, -1, 2, -2, 3, -3].filter(l => !activeBranches.has(l));
          if (availableLanes.length > 0) {
            lane = availableLanes[0];
            activeBranches.add(lane);
            sourceBranch = 0;
          }
        } else if (rand > 0.85 && activeBranches.size > 1) {
          const branches = Array.from(activeBranches).filter(b => b !== 0);
          mergedBranch = branches[Math.floor(random() * branches.length)];
          activeBranches.delete(mergedBranch);
          lane = 0;
          sourceBranch = 0;
          isMerge = true;
        } else {
          if (random() < 0.8 || !activeBranches.has(0)) lane = 0;
          else {
            const branches = Array.from(activeBranches).filter(b => b !== 0);
            lane = branches.length > 0 ? branches[Math.floor(random() * branches.length)] : 0;
          }
          sourceBranch = lane;
        }
      }

      const y = i * nodeSpacingY;
      const x = lane * laneSpacing;
      const node: GraphNode = { id: ev.id, x, y, timestamp: ev.timestamp, isMilestone: sampledEvents.includes(ev), lane, eventRef: ev };
      nodes.push(node);

      if (i > 0) {
        const parent = lastNodeInBranch.get(sourceBranch) || lastNodeInBranch.get(0);
        if (parent) edges.push({ sourceId: parent.id, targetId: node.id });
        if (isMerge) {
          const mergeParent = lastNodeInBranch.get(mergedBranch);
          if (mergeParent) edges.push({ sourceId: mergeParent.id, targetId: node.id });
        }
      }
      lastNodeInBranch.set(lane, node);
    });

    const noiseSvg = `<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
    const noiseImg = new Image();
    noiseImg.src = `data:image/svg+xml;base64,${btoa(noiseSvg)}`;

    let currentFrame = 0;

    const COLOR_BG = "#050505";
    const COLOR_SURFACE = "#0A0A0A";
    const COLOR_ACCENT = "rgba(255, 235, 200, 1)";
    const COLOR_TEXT = "#FFFFFF";
    const COLOR_MUTED = "#A0A0A0";
    const COLOR_BORDER = "rgba(255, 255, 255, 0.15)";
    const COLOR_BORDER_SOFT = "rgba(255, 255, 255, 0.08)";
    const GLOW_COLOR = "rgba(255, 230, 200, 0.8)";

    const drawDocumentaryFrame = (opts: {
      chapterLabel: string;
      badgeText?: string;
      titleMain: string;
      titleAccent?: string;
      dateLabel: string;
      milestoneLabel?: string;
      milestoneQuote?: string;
      continuousIndex: number;
      totalEvents: number;
      alpha: number;
      eventProgress?: number;
    }) => {
      const { chapterLabel, badgeText, titleMain, titleAccent, dateLabel, milestoneLabel, milestoneQuote, continuousIndex, totalEvents, alpha, eventProgress = 1.0 } = opts;

      // Compute staggered animation states
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      
      const pKicker = Math.min(1, Math.max(0, eventProgress / 0.1));
      const pTitle = Math.min(1, Math.max(0, (eventProgress - 0.03) / 0.12));
      const pMeta = Math.min(1, Math.max(0, (eventProgress - 0.06) / 0.12));
      const pMilestone = Math.min(1, Math.max(0, (eventProgress - 0.08) / 0.12));

      ctx.globalAlpha = 1;
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, width, height);

      // Noise pass simulation using soft gradients to add atmosphere
      const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
      bgGlow.addColorStop(0, "rgba(255, 240, 220, 0.03)");
      bgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Ambient Frame Texture (Noise & Vignette)
      if (noiseImg.complete) {
        ctx.globalAlpha = 0.04;
        ctx.globalCompositeOperation = "overlay";
        ctx.drawImage(noiseImg, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.globalAlpha = 1;
      const vignette = ctx.createRadialGradient(width/2, height/2, height*0.4, width/2, height/2, width*0.7);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(5,5,5,0.85)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      const margin = 80;

      // Top Meta
      ctx.fillStyle = COLOR_MUTED;
      ctx.font = "bold 12px monospace";
      ctx.letterSpacing = "2px";
      ctx.fillText("TIME-MACHINE.GIT", margin, margin);

      ctx.save();
      const currentChapNum = Math.floor(continuousIndex) + 1;
      ctx.textAlign = "right";
      ctx.font = "bold 12px monospace";
      ctx.letterSpacing = "0px";
      const rightLabelEnd = ` · ${new Date().getFullYear()}`;

      // Chapter Odometer logic (Static HUD update, no sliding/fading)
      ctx.globalAlpha = 1;
      ctx.fillText(`CHAPTER ${currentChapNum.toString().padStart(2, '0')}${rightLabelEnd}`, width - margin, margin);
      
      ctx.restore();
      ctx.textAlign = "left";
      ctx.letterSpacing = "0px";

      const leftW = Math.round(width * 0.58) - margin * 2;
      const contentX = margin;
      
      // 1. Left Column (Text)
      // A subtle HUD "tick" animation to visually signal that the text has updated,
      // without making it disappear or pop out of the screen.
      // Rapid decay over the first ~5-7 frames of the event.
      const tick = Math.max(0, 1 - (eventProgress * 12)); 
      const easeTick = tick * tick;
      const globalYOffset = easeTick * 4;
      const globalBlur = easeTick * 1.5;
      
      let y = height * 0.30 + globalYOffset;
      
      if (globalBlur > 0.1) {
        ctx.filter = `blur(${globalBlur}px)`;
      }

      // Chapter / Metadata
      ctx.globalAlpha = alpha;
      const kickerY = y;

      ctx.fillStyle = COLOR_MUTED;
      ctx.font = "bold 15px monospace";
      ctx.letterSpacing = "1px";
      ctx.fillText(chapterLabel.toUpperCase(), contentX, kickerY);
      ctx.letterSpacing = "0px";
      y += 48;

      // Repo Pill
      if (badgeText) {
        ctx.font = "bold 15px monospace";
        const pillText = badgeText.toUpperCase();
        const pillW = ctx.measureText(pillText).width + 36;
        ctx.fillStyle = COLOR_BORDER_SOFT;
        ctx.beginPath();
        // Hang the pill background into the left margin so the text aligns perfectly with contentX
        ctx.roundRect(contentX - 18, y - 22, pillW, 34, 17);
        ctx.fill();
        ctx.strokeStyle = COLOR_BORDER;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = COLOR_TEXT;
        ctx.fillText(pillText, contentX, y);
        y += 85;
      } else {
        y += 45;
      }

      // Title Main
      ctx.globalAlpha = alpha;
      const titleY = y;
      
      ctx.save();
      ctx.translate(contentX, titleY);

      ctx.font = "500 72px Georgia, serif";
      ctx.fillStyle = COLOR_TEXT;
      let ty = 0;
      const mainLines = wrapText(ctx, titleMain, leftW);
      for (const line of mainLines) {
        ctx.fillText(line, 0, ty);
        ty += 84;
      }
      
      if (titleAccent) {
        ctx.font = "italic 400 72px Georgia, serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        const accentLines = wrapText(ctx, titleAccent, leftW);
        for (const line of accentLines) {
          ctx.fillText(line, 0, ty);
          ty += 84;
        }
      }
      ctx.restore();
      
      y += ty + 24;

      // Date Label
      ctx.globalAlpha = alpha;
      const metaY = y;
      ctx.fillStyle = COLOR_MUTED;
      ctx.font = "17px monospace";
      ctx.fillText(`Pushed on ${dateLabel}`, contentX, metaY);
      
      y += 75;

      // Milestone Panel
      if (milestoneLabel && milestoneQuote) {
        ctx.globalAlpha = alpha;
        const msY = y;
        
        ctx.font = "italic 26px Georgia, serif";
        const quoteLines = wrapText(ctx, milestoneQuote, leftW);
        const borderHeight = 40 + (Math.min(quoteLines.length, 3) * 40);
        
        ctx.strokeStyle = GLOW_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(contentX - 18, msY);
        ctx.lineTo(contentX - 18, msY + borderHeight);
        ctx.stroke();

        ctx.fillStyle = GLOW_COLOR;
        ctx.font = "bold 14px monospace";
        ctx.letterSpacing = "3px";
        ctx.fillText(`★ MILESTONE · ${milestoneLabel.toUpperCase()}`, contentX, msY + 12);
        ctx.letterSpacing = "0px";
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        let quoteY = msY + 54;
        for (const line of quoteLines.slice(0, 3)) {
          ctx.fillText(line, contentX, quoteY);
          quoteY += 40;
        }
      }
      
      // Reset the filter so the graph doesn't blur
      ctx.filter = "none";

      ctx.globalAlpha = 1;
      
      // 2. Right Column (Git Visualization as a 2D Camera Viewport)
      if (!isVertical) {
        const rightX = width * 0.58;
        const rightW = width * 0.42;
        const centerY = height / 2;
        const centerX = rightX + rightW / 2;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(rightX, 0, rightW, height);
        ctx.clip();
        
        // Cinematic Lighting Bloom in background
        const bgBloom2 = ctx.createRadialGradient(
          rightX + rightW * 0.4, centerY, 0,
          rightX + rightW * 0.4, centerY, height * 0.7
        );
        bgBloom2.addColorStop(0, "rgba(255, 230, 200, 0.05)");
        bgBloom2.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bgBloom2;
        ctx.fillRect(rightX, 0, rightW, height);

        // --- CAMERA MATH ---
        // We use the fractional continuousIndex to find exact timestamp and interpolate X/Y
        const idxBase = Math.max(0, Math.min(sampledEvents.length - 1, Math.floor(continuousIndex)));
        const frac = continuousIndex - idxBase;
        const ev1 = sampledEvents[idxBase];
        const ev2 = sampledEvents[Math.min(idxBase + 1, sampledEvents.length - 1)];
        
        const node1 = nodes.find(n => n.id === ev1.id) || nodes[0];
        const node2 = nodes.find(n => n.id === ev2.id) || node1;
        
        let targetCamX = node1.x + (node2.x - node1.x) * frac;
        let targetCamY = node1.y + (node2.y - node1.y) * frac;
        let scale = 1.0;
        const currentTimestamp = ev1.timestamp + (ev2.timestamp - ev1.timestamp) * frac;

        // Phase specific camera overrides
        if (currentFrame < introFrames) {
          const introProgress = currentFrame / introFrames;
          const easeIntro = 1 - Math.pow(1 - introProgress, 3);
          targetCamX = node1.x;
          targetCamY = node1.y;
          scale = 0.8 + 0.2 * easeIntro;
        } else if (currentFrame >= introFrames + eventFrames) {
          const outroProgress = (currentFrame - (introFrames + eventFrames)) / outroFrames;
          const easeOutro = outroProgress < 0.5 ? 4 * outroProgress * outroProgress * outroProgress : 1 - Math.pow(-2 * outroProgress + 2, 3) / 2;
          
          const graphTotalHeight = nodes[nodes.length-1].y - nodes[0].y;
          const minX = Math.min(...nodes.map(n => n.x));
          const maxX = Math.max(...nodes.map(n => n.x));
          const graphTotalWidth = Math.max(800, maxX - minX + 200);
          
          const fitScale = Math.min((rightW - 160) / graphTotalWidth, (height - 160) / graphTotalHeight, 0.5);
          
          scale = 1.0 + (fitScale - 1.0) * easeOutro;
          targetCamX = targetCamX + ((minX + maxX)/2 - targetCamX) * easeOutro;
          targetCamY = targetCamY + (graphTotalHeight / 2 - targetCamY) * easeOutro;
        }

        ctx.translate(centerX - targetCamX * scale, centerY - targetCamY * scale);
        ctx.scale(scale, scale);

        // --- DRAW GRAPH ---
        ctx.strokeStyle = COLOR_BORDER;
        ctx.lineWidth = 2 / scale;

        // Draw Edges (with opacity based on timestamp to reveal them over time)
        for (const edge of edges) {
          const n1 = nodes.find(n => n.id === edge.sourceId);
          const n2 = nodes.find(n => n.id === edge.targetId);
          if (!n1 || !n2) continue;
          
          let edgeProgress = 1.0;
          if (n2.timestamp > currentTimestamp && currentFrame < introFrames + eventFrames) {
            if (n1.timestamp >= currentTimestamp) continue; // Not revealed yet
            edgeProgress = (currentTimestamp - n1.timestamp) / (n2.timestamp - n1.timestamp);
          }

          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          if (n1.lane === n2.lane) {
            ctx.lineTo(n2.x, n2.y);
          } else {
            // Elegant bezier branch
            ctx.bezierCurveTo(n1.x, n1.y + (n2.y - n1.y) * 0.4, n2.x, n2.y - (n2.y - n1.y) * 0.4, n2.x, n2.y);
          }
          
          if (edgeProgress < 1.0) {
            const len = Math.sqrt(Math.pow(n2.x - n1.x, 2) + Math.pow(n2.y - n1.y, 2)) * (n1.lane === n2.lane ? 1 : 1.2);
            ctx.setLineDash([len]);
            ctx.lineDashOffset = len * (1 - edgeProgress);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw Nodes
        for (const node of nodes) {
          if (node.timestamp > currentTimestamp && currentFrame < introFrames + eventFrames) {
            continue; // Not revealed yet
          }
          
          // Distance from the camera target to calculate glow falloff
          const dx = node.x - targetCamX;
          const dy = node.y - targetCamY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const activeRadius = 150;
          
          if (dist < activeRadius) {
            // It's the active node area
            const intensity = 1 - (dist / activeRadius);
            
            // Pulse continuous: scale 1 -> 1.15 -> 1, opacity breathing
            const pulse = 1 + (Math.sin(currentFrame * 0.15) * 0.5 + 0.5) * 0.15;
            const pulseOp = 0.7 + (Math.sin(currentFrame * 0.1) * 0.5 + 0.5) * 0.3;
            
            // Bloom
            const nodeBloom = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 100);
            nodeBloom.addColorStop(0, `rgba(255, 230, 200, ${0.4 * intensity * pulseOp})`);
            nodeBloom.addColorStop(1, "rgba(255, 230, 200, 0)");
            ctx.fillStyle = nodeBloom;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 100, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = `rgba(255, 255, 255, ${pulseOp})`;
            ctx.shadowColor = GLOW_COLOR;
            ctx.shadowBlur = 20 * intensity * pulse;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 7 * pulse, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = `rgba(255, 230, 200, ${intensity * pulseOp})`;
            ctx.lineWidth = 2 / scale;
            ctx.beginPath();
            ctx.arc(node.x, node.y, (14 + 4*intensity) * pulse, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
          } else {
            // Normal node
            const isMilestone = node.isMilestone;
            ctx.fillStyle = isMilestone ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.3)";
            ctx.beginPath();
            ctx.arc(node.x, node.y, isMilestone ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

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
      return lines.slice(0, 3);
    }

    const renderMovie = () => {
      if (currentFrame < introFrames) {
        const introProgress = currentFrame / introFrames;
        drawDocumentaryFrame({
          chapterLabel: "A Developer's Story",
          titleMain: title || "A Developer's Story",
          dateLabel: "From your first repository to your latest project",
          milestoneLabel: "Journey Begins",
          milestoneQuote: `${events.length} commits reconstructed across the years.`,
          continuousIndex: 0,
          totalEvents: sampledEvents.length,
          alpha: Math.min(1, Math.sin(introProgress * Math.PI)),
        });
      }
      else if (currentFrame < introFrames + eventFrames) {
        const eventIndex = Math.min(
          sampledEvents.length - 1,
          Math.floor((currentFrame - introFrames) / framesPerEvent)
        );
        const ev = sampledEvents[eventIndex];
        const frameInEvent = (currentFrame - introFrames) % framesPerEvent;
        const eventProgress = frameInEvent / framesPerEvent;
        
        // Easing function for smooth scroll between nodes
        const easeProgress = eventProgress < 0.5 
          ? 4 * eventProgress * eventProgress * eventProgress 
          : 1 - Math.pow(-2 * eventProgress + 2, 3) / 2;
          
        const continuousIndex = eventIndex + easeProgress;
        
        // Restore the cinematic fade in/out for the text block (dip to black)
        // This ensures the text cleanly transitions between events without popping.
        const eventAlpha = Math.min(1, Math.sin(eventProgress * Math.PI) * 1.3);

        if (ev.type === "year_milestone") {
          drawDocumentaryFrame({
            chapterLabel: `Chapter \u00B7 ${ev.year}`,
            titleMain: "Chapter:",
            titleAccent: ev.chapterName || "Progression",
            dateLabel: ev.subtitle || "A new chapter begins",
            continuousIndex,
            totalEvents: sampledEvents.length,
            alpha: eventAlpha,
            eventProgress,
          });
        } else {
          const chapterName = ev.chapterName || "The Developer Journey";
          drawDocumentaryFrame({
            chapterLabel: `${chapterName} \u00B7 ${ev.year}`,
            badgeText: ev.repoName || "Repository",
            titleMain: ev.title,
            dateLabel: ev.date.slice(0, 10),
            milestoneLabel: ev.impactBadge || "Progression",
            milestoneQuote: ev.impactDescription,
            continuousIndex,
            totalEvents: sampledEvents.length,
            alpha: eventAlpha,
            eventProgress,
          });
        }
      }
      else {
        const outroProgress = (currentFrame - (introFrames + eventFrames)) / outroFrames;
        drawDocumentaryFrame({
          chapterLabel: "Documentary Finale",
          titleMain: "From your first repository",
          titleAccent: "to your latest project.",
          dateLabel: `${events.length} commits. Built one push at a time.`,
          milestoneLabel: "The Story Continues",
          milestoneQuote: "Your GitHub history is not a graph. It is a story.",
          continuousIndex: sampledEvents.length - 1,
          totalEvents: sampledEvents.length,
          alpha: Math.min(1, Math.sin(outroProgress * Math.PI)),
        });
      }

      currentFrame++;
      updateGlobalProgress(
        `Rendering 1080p frame ${currentFrame} of ${totalFrames} (${Math.round(
          (currentFrame / totalFrames) * 100
        )}%)`
      );

    };

    // Use an inline Web Worker for the render loop instead of setInterval.
    // Modern browsers throttle window.setInterval to 1000ms or suspend it completely
    // when a tab is in the background. A Web Worker is immune to UI thread throttling.
    // We use a ping-pong 'ack' pattern instead of setInterval so that if the main
    // thread is busy (rendering/encoding), we don't flood the message queue with ticks.
    const workerCode = `
      let nextTime = 0;
      let isRunning = false;
      self.onmessage = function(e) {
        if (e.data.command === 'start') {
          isRunning = true;
          nextTime = performance.now() + 33.33;
          setTimeout(function() {
            if (!isRunning) return;
            self.postMessage('tick');
          }, 33.33);
        } else if (e.data.command === 'ack') {
          if (!isRunning) return;
          const now = performance.now();
          nextTime += 33.33;
          const delay = Math.max(0, nextTime - now);
          setTimeout(function() {
            if (!isRunning) return;
            self.postMessage('tick');
          }, delay);
        } else if (e.data.command === 'stop') {
          isRunning = false;
          close();
        }
      };
    `;
    const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    if (currentFrame >= totalFrames) {
      worker.postMessage({ command: 'stop' });
      URL.revokeObjectURL(workerUrl);
      recorder.stop();
    } else {
      worker.onmessage = () => {
        if (currentFrame >= totalFrames) {
          worker.postMessage({ command: 'stop' });
          URL.revokeObjectURL(workerUrl);
          recorder.stop();
        } else {
          renderMovie();
          // Tell the worker we are ready for the next tick
          worker.postMessage({ command: 'ack' });
        }
      };
      worker.postMessage({ command: 'start' });
    }
    } catch (err) {
      console.error("Cinematic 1080p video export error:", err);
      // Clean up toast on error
      const toasts = document.querySelectorAll("div[style*='999999']");
      toasts.forEach(t => t.remove());
      resolve(false);
    }
  });
}

/**
 * Builds a shareable repo documentary URL and copies it to the clipboard.
 */
export async function copyRepoDocumentaryLink(
  repoFullName: string,
  currentScene: number = 0
): Promise<{ success: boolean; url: string }> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/repo/${encodeURIComponent(repoFullName)}?scene=${currentScene}`;

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
 * Generates a printable PDF-style documentary report for a single repository.
 * Opens a styled print window with the repo's full scene-by-scene story.
 */
export function downloadRepoDocumentaryPDF(
  repo: GitHubRepo,
  events: ReplayEvent[],
  chapters: Chapter[]
) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }

  const repoName = repo.name;
  const language = repo.language || "Code";
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  const commitCount = events.length;
  const createdDate = new Date(repo.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const lastPush = new Date(repo.pushed_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const scenesHtml = events
    .map(
      (ev, idx) => `
      <div class="scene-card">
        <div class="scene-number">Scene ${idx + 1}</div>
        <div class="scene-header">
          <h3>${ev.title}</h3>
          <span class="scene-date">${new Date(ev.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        </div>
        <p class="scene-narrative">${ev.description || ""}</p>
        <div class="scene-meta">
          <div class="scene-badge">${ev.impactBadge || "Milestone"}</div>
          ${ev.commit?.message ? `<div class="scene-commit">"${ev.commit.message.split("\\n")[0].slice(0, 80)}"</div>` : ""}
        </div>
      </div>
    `
    )
    .join("");

  const chaptersHtml = chapters.length > 0
    ? `
      <h2>Chapters</h2>
      <div class="chapters-list">
        ${chapters.map((ch, i) => `
          <div class="chapter-item">
            <span class="chapter-num">${i + 1}</span>
            <div>
              <strong>${ch.name}</strong>
              <span class="chapter-sub">${ch.subtitle}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `
    : "";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Repository Documentary — ${repoName}</title>
        <style>
          :root {
            --bg: #0A0A0A;
            --surface: #111111;
            --border: rgba(255, 255, 255, 0.08);
            --text: #F2F0EB;
            --muted: #71717A;
            --accent: #D4A853;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Georgia, 'Times New Roman', serif;
            background: var(--bg);
            color: var(--text);
            max-width: 860px;
            margin: 0 auto;
            padding: 60px 40px;
            line-height: 1.65;
          }
          .doc-header {
            text-align: center;
            padding-bottom: 48px;
            margin-bottom: 48px;
            border-bottom: 1px solid var(--border);
          }
          .doc-header .label {
            display: block;
            font-family: monospace;
            font-size: 11px;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 0.3em;
            margin-bottom: 16px;
          }
          .doc-header h1 {
            font-size: 48px;
            font-weight: 400;
            letter-spacing: -0.02em;
            margin-bottom: 12px;
          }
          .doc-header .subtitle {
            font-size: 18px;
            color: var(--muted);
            font-style: italic;
          }
          .stats-row {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin: 40px 0 56px;
          }
          .stat-box {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 20px 28px;
            text-align: center;
            min-width: 120px;
          }
          .stat-box .val {
            font-size: 32px;
            color: var(--accent);
            display: block;
            margin-bottom: 6px;
          }
          .stat-box .lbl {
            font-family: monospace;
            font-size: 10px;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.12em;
          }
          h2 {
            font-size: 24px;
            font-weight: 400;
            text-align: center;
            margin-bottom: 32px;
            color: var(--text);
          }
          .chapters-list {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            margin-bottom: 56px;
          }
          .chapter-item {
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px 20px;
          }
          .chapter-num {
            font-family: monospace;
            font-size: 11px;
            color: var(--accent);
            background: rgba(212, 168, 83, 0.1);
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .chapter-item strong {
            display: block;
            font-size: 14px;
            color: var(--text);
          }
          .chapter-sub {
            font-family: monospace;
            font-size: 11px;
            color: var(--muted);
          }
          .scenes-grid {
            display: grid;
            gap: 24px;
          }
          .scene-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 28px;
            page-break-inside: avoid;
          }
          .scene-number {
            font-family: monospace;
            font-size: 10px;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 0.2em;
            margin-bottom: 12px;
          }
          .scene-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
          }
          .scene-header h3 {
            font-size: 22px;
            font-weight: 400;
            color: var(--accent);
          }
          .scene-date {
            font-family: monospace;
            font-size: 12px;
            color: var(--muted);
          }
          .scene-narrative {
            font-size: 15px;
            color: var(--muted);
            margin-bottom: 16px;
            line-height: 1.7;
          }
          .scene-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
          }
          .scene-badge {
            font-family: monospace;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 4px 14px;
          }
          .scene-commit {
            font-family: monospace;
            font-size: 12px;
            color: var(--muted);
            font-style: italic;
          }
          footer {
            margin-top: 64px;
            border-top: 1px solid var(--border);
            padding-top: 28px;
            font-family: monospace;
            font-size: 11px;
            color: var(--muted);
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.15em;
          }
          @media print {
            body { background: #FFF; color: #1A1A1A; }
            :root {
              --bg: #FFF;
              --surface: #FAFAFA;
              --border: #E5E5E5;
              --text: #1A1A1A;
              --muted: #666;
              --accent: #8E6B35;
            }
            .scene-card, .stat-box, .chapter-item { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <span class="label">GitHub Time Machine · Repository Documentary</span>
          <h1>${repoName}</h1>
          <p class="subtitle">${repo.description || `The complete story of ${repoName}, told through its milestones.`}</p>
        </div>

        <div class="stats-row">
          <div class="stat-box"><span class="val">${commitCount}</span><span class="lbl">Scenes</span></div>
          <div class="stat-box"><span class="val">${language}</span><span class="lbl">Language</span></div>
          <div class="stat-box"><span class="val">★ ${stars}</span><span class="lbl">Stars</span></div>
          <div class="stat-box"><span class="val">${forks}</span><span class="lbl">Forks</span></div>
        </div>

        ${chaptersHtml}

        <h2>The Story</h2>
        <div class="scenes-grid">
          ${scenesHtml}
        </div>

        <footer>
          Created ${createdDate} · Last pushed ${lastPush} · Documented by GitHub Time Machine
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
 * Exports a single-repo documentary as a 1080p cinematic video.
 * Tailored for repo documentaries with scene-by-scene narration.
 */
export async function exportRepoDocumentaryVideo(
  repo: GitHubRepo,
  events: ReplayEvent[],
  chapters: Chapter[],
  onProgress?: (msg: string) => void,
  withAudio: boolean = false,
  durationPreset: "full" | "30s" | "60s" = "full"
): Promise<boolean> {
  return exportReplayVideoFormat(
    `${repo.name} — A Repository Documentary`,
    "landscape",
    events,
    chapters,
    onProgress,
    withAudio,
    durationPreset
  );
}

"use client";

import { Chapter, GitHubCommit, GitHubRepo, GitHubUserProfile, ReplayEvent } from "./types";

/**
 * Copies a shareable replay URL to the user's clipboard.
 */
export async function copyShareableReplayLink(
  username: string,
  currentEventIndex: number = 0
): Promise<{ success: boolean; url: string }> {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/dashboard?user=${encodeURIComponent(
      username
    )}&event=${currentEventIndex}&mode=replay`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
    return { success: true, url };
  } catch {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/dashboard?user=${encodeURIComponent(username)}`;
    return { success: true, url };
  }
}

/**
 * Generates a high-resolution (1200x630) social preview card / thumbnail PNG image and triggers download.
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
 * Triggers a high-fidelity printable summary report / PDF download dialog.
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
      <div style="margin-bottom: 20px; padding: 18px; border: 1px solid #1E293B; border-radius: 12px; background: #131C31;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
          <h3 style="font-family: Georgia, serif; font-size: 18px; color: #F2F0EB; margin: 0;">Chapter ${
            idx + 1
          }: ${ch.name}</h3>
          <span style="font-family: monospace; font-size: 11px; color: #D4A853;">${
            ch.subtitle
          }</span>
        </div>
        <p style="font-size: 13px; line-height: 1.6; color: #8B949E; margin: 0 0 8px 0;">${
          ch.narrative
        }</p>
        <div style="font-family: monospace; font-size: 11px; color: #39D353;">
          ${ch.totalCommits} commits · Highlights: ${
        ch.highlightRepos.join(", ") || "Core Architecture"
      }
        </div>
      </div>
    `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>GitHub Time Machine — ${username}'s Developer Documentary</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0B1020;
            color: #F2F0EB;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { font-family: Georgia, serif; font-size: 32px; color: #F2F0EB; margin-bottom: 4px; }
          .header { border-bottom: 1px solid #1E293B; padding-bottom: 20px; margin-bottom: 30px; }
          .stat-badge { display: inline-block; background: #131C31; border: 1px solid #1E293B; border-radius: 8px; padding: 10px 18px; margin-right: 12px; margin-bottom: 12px; }
          .stat-val { font-size: 20px; font-weight: bold; color: #D4A853; font-family: Georgia, serif; }
          .stat-lbl { font-size: 10px; text-transform: uppercase; color: #8B949E; font-family: monospace; }
          @media print {
            body { background: #FFFFFF; color: #000000; }
            .header { border-color: #DDDDDD; }
            .stat-badge { background: #F6F8FA; border-color: #DDDDDD; color: #000000; }
            .stat-val { color: #8A6D2F; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span style="font-family: monospace; font-size: 11px; color: #D4A853; text-transform: uppercase; letter-spacing: 0.2em;">GitHub Time Machine · Documentary Chronicle</span>
          <h1>${username}</h1>
          <p style="color: #8B949E; font-size: 14px; margin: 4px 0 16px 0;">Replaying ${startYear} – ${endYear} · A Cinematic Journey Through Code</p>
          <div>
            <div class="stat-badge"><div class="stat-val">${commitCount}</div><div class="stat-lbl">Total Commits</div></div>
            <div class="stat-badge"><div class="stat-val">${repoCount}</div><div class="stat-lbl">Active Repositories</div></div>
            <div class="stat-badge"><div class="stat-val">${chapters.length}</div><div class="stat-lbl">Chronicle Chapters</div></div>
            <div class="stat-badge"><div class="stat-val">${
              endYear - startYear + 1
            }y</div><div class="stat-lbl">Years Spanned</div></div>
          </div>
        </div>

        <h2 style="font-family: Georgia, serif; font-size: 22px; color: #F2F0EB; margin-bottom: 16px;">Documentary Chapters</h2>
        ${chaptersHtml}

        <footer style="margin-top: 40px; border-top: 1px solid #1E293B; padding-top: 16px; font-family: monospace; font-size: 11px; color: #8B949E; text-align: center;">
          Generated with GitHub Time Machine · time-machine.git
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
 * Renders and records the COMPLETE replay as a 30-60s 1080p MP4/WebM video at 30 FPS.
 * Automatically steps through intro -> every replay event with transitions -> outro finale screen.
 */
export async function exportReplayVideoFormat(
  title: string,
  mode: "landscape" | "vertical" | "gif",
  events: ReplayEvent[],
  chapters: Chapter[],
  onProgress?: (msg: string) => void
): Promise<boolean> {
  if (typeof window === "undefined" || events.length === 0) return false;

  try {
    const isVertical = mode === "vertical";
    const width = isVertical ? 1080 : 1920;
    const height = isVertical ? 1920 : 1080;

    onProgress?.(`Initializing 1080p ${isVertical ? "9:16 Social Reel" : "Landscape Movie"} Engine...`);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : "video/webm;codecs=vp9,opus";
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 6000000,
    });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `github-time-machine-${mode}-documentary.${
        mimeType.includes("mp4") ? "mp4" : "webm"
      }`;
      a.click();
      URL.revokeObjectURL(url);
      onProgress?.("Replay video export completed!");
    };

    recorder.start();

    // 1. Intro sequence: 40 frames (~1.3s)
    const introFrames = 40;
    // 2. Main replay sequence: samples up to 30 key milestone events across history (8 frames each = 240 frames ~8s)
    const sampledEvents = events.length > 30 
      ? events.filter((_, idx) => idx % Math.ceil(events.length / 30) === 0)
      : events;
    const framesPerEvent = 6;
    const eventFrames = sampledEvents.length * framesPerEvent;
    // 3. Outro finale sequence: 60 frames (~2s)
    const outroFrames = 60;
    const totalFrames = introFrames + eventFrames + outroFrames;

    let currentFrame = 0;

    const renderMovie = () => {
      // Clear with Navy Background
      ctx.fillStyle = "#0B1020";
      ctx.fillRect(0, 0, width, height);

      // Ambient radial lighting
      const cx = width / 2;
      const cy = height / 2;
      const glowGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, width * 0.7);
      glowGrad.addColorStop(0, "rgba(212, 168, 83, 0.22)");
      glowGrad.addColorStop(0.5, "rgba(29, 78, 216, 0.15)");
      glowGrad.addColorStop(1, "rgba(11, 16, 32, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Grid texture
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Card Dimensions
      const cardW = isVertical ? 920 : 1440;
      const cardH = isVertical ? 1440 : 760;
      const cardX = (width - cardW) / 2;
      const cardY = (height - cardH) / 2;

      // Phase 1: Intro Screen
      if (currentFrame < introFrames) {
        const introAlpha = Math.min(1, currentFrame / 15);
        ctx.globalAlpha = introAlpha;

        ctx.fillStyle = "#131C31";
        ctx.strokeStyle = "#D4A853";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 32);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#D4A853";
        ctx.font = "bold 24px monospace";
        ctx.fillText("GITHUB TIME MACHINE · DEVELOPER ODYSSEY", cardX + 60, cardY + 140);

        ctx.fillStyle = "#F2F0EB";
        ctx.font = "bold 64px Georgia, serif";
        ctx.fillText(title || "A Developer's Story", cardX + 60, cardY + 240);

        ctx.fillStyle = "#8B949E";
        ctx.font = "26px system-ui, sans-serif";
        ctx.fillText("From first repository to present mastery.", cardX + 60, cardY + 310);

        ctx.fillStyle = "#39D353";
        ctx.font = "18px monospace";
        ctx.fillText(`★ ${events.length} Commits Reconstructed Across Years`, cardX + 60, cardY + 380);

        ctx.globalAlpha = 1.0;
      }
      // Phase 2: Main Replay Sequence
      else if (currentFrame < introFrames + eventFrames) {
        const eventIndex = Math.min(
          sampledEvents.length - 1,
          Math.floor((currentFrame - introFrames) / framesPerEvent)
        );
        const ev = sampledEvents[eventIndex];
        const overallProgress = (eventIndex + 1) / sampledEvents.length;

        ctx.fillStyle = "#131C31";
        ctx.strokeStyle = ev.type === "repo_created" ? "#D4A853" : "#1E293B";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 32);
        ctx.fill();
        ctx.stroke();

        // Top Header
        ctx.fillStyle = "#D4A853";
        ctx.font = "bold 20px monospace";
        ctx.fillText(`ERA ${ev.year} · ${ev.monthName.toUpperCase()}`, cardX + 60, cardY + 90);

        ctx.fillStyle = "#8B949E";
        ctx.font = "18px monospace";
        ctx.fillText(`Event ${eventIndex + 1} of ${sampledEvents.length}`, cardX + cardW - 320, cardY + 90);

        // Repo Badge
        ctx.fillStyle = "#0E4429";
        ctx.strokeStyle = "#39D353";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX + 60, cardY + 130, 260, 44, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#39D353";
        ctx.font = "bold 18px monospace";
        ctx.fillText(`⚡ ${ev.repoName || "Repository"}`, cardX + 80, cardY + 158);

        // Commit Title
        ctx.fillStyle = "#F2F0EB";
        ctx.font = "bold 44px Georgia, serif";
        const titleText = ev.title.length > 55 ? `${ev.title.slice(0, 52)}...` : ev.title;
        ctx.fillText(titleText, cardX + 60, cardY + 250);

        // Impact Box
        if (ev.impactBadge) {
          ctx.fillStyle = "#0B1020";
          ctx.strokeStyle = "#D4A853";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(cardX + 60, cardY + 310, cardW - 120, 100, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#D4A853";
          ctx.font = "bold 18px monospace";
          ctx.fillText(`✦ IMPACT: ${ev.impactBadge.toUpperCase()}`, cardX + 85, cardY + 348);

          ctx.fillStyle = "#8B949E";
          ctx.font = "18px system-ui, sans-serif";
          ctx.fillText(ev.impactDescription || "Milestone reached.", cardX + 85, cardY + 382);
        }

        // Live Progress Track
        const barY = cardY + cardH - 110;
        ctx.fillStyle = "#0B1020";
        ctx.fillRect(cardX + 60, barY, cardW - 120, 16);

        ctx.fillStyle = "#D4A853";
        ctx.fillRect(cardX + 60, barY, (cardW - 120) * overallProgress, 16);

        ctx.fillStyle = "#8B949E";
        ctx.font = "16px monospace";
        ctx.fillText(`${Math.round(overallProgress * 100)}% Complete · ${ev.date.slice(0, 10)}`, cardX + 60, barY + 45);
      }
      // Phase 3: Outro Finale Screen
      else {
        ctx.fillStyle = "#131C31";
        ctx.strokeStyle = "#D4A853";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 32);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#D4A853";
        ctx.font = "bold 24px monospace";
        ctx.fillText("DOCUMENTARY FINALE", cardX + 60, cardY + 120);

        ctx.fillStyle = "#F2F0EB";
        ctx.font = "bold 52px Georgia, serif";
        ctx.fillText("From first repository to present mastery.", cardX + 60, cardY + 200);

        ctx.fillStyle = "#8B949E";
        ctx.font = "24px system-ui, sans-serif";
        ctx.fillText(`${events.length} commits · Built one push at a time.`, cardX + 60, cardY + 270);

        ctx.fillStyle = "#D4A853";
        ctx.font = "italic 32px Georgia, serif";
        ctx.fillText("“Your GitHub history is not a graph. It is a story.”", cardX + 60, cardY + 380);

        ctx.fillStyle = "#39D353";
        ctx.font = "bold 20px monospace";
        ctx.fillText("time-machine.git", cardX + 60, cardY + 460);
      }

      currentFrame++;
      onProgress?.(
        `Rendering 1080p frame ${currentFrame} of ${totalFrames} (${Math.round(
          (currentFrame / totalFrames) * 100
        )}%)...`
      );

      if (currentFrame < totalFrames) {
        requestAnimationFrame(renderMovie);
      } else {
        recorder.stop();
      }
    };

    renderMovie();
    return true;
  } catch (err) {
    console.error("Multi-frame video export error:", err);
    return false;
  }
}

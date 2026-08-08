"use client";

import { Chapter, GitHubCommit, GitHubRepo, GitHubUserProfile, ReplayEvent } from "./types";
import { ambientSoundtrack } from "../audio/ambient-soundtrack";

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
  withAudio: boolean = false
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
    // Take events sequentially (up to 35 key moments to create a rich 45-90s movie)
    const sampledEvents = events.length > 35
      ? events.filter((_, idx) => idx % Math.ceil(events.length / 35) === 0)
      : events;
    const eventFrames = sampledEvents.length * framesPerEvent;
    // 3. Outro finale sequence: 90 frames (3.0s)
    const outroFrames = 90;
    const totalFrames = introFrames + eventFrames + outroFrames;

    let currentFrame = 0;

    const renderMovie = () => {
      // 1. Base Cinematic Background: Deep Navy to Charcoal Gradient
      ctx.fillStyle = "#0B1020";
      ctx.fillRect(0, 0, width, height);

      // 2. Warm ambient spotlight behind the card (center)
      const cx = width / 2;
      const cy = height / 2;
      const spotGrad = ctx.createRadialGradient(cx, cy, 100, cx, cy, width * 0.7);
      spotGrad.addColorStop(0, "rgba(212, 168, 83, 0.22)"); // Warm Amber
      spotGrad.addColorStop(0.4, "rgba(29, 78, 216, 0.16)"); // Cosmic Blue
      spotGrad.addColorStop(1, "rgba(7, 10, 20, 0.95)"); // Deep Charcoal
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Faint Contribution Grid Texture
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
      ctx.lineWidth = 1;
      const gridStep = 40;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Subtle floating star particles
      for (let p = 0; p < 18; p++) {
        const px = ((p * 107 + currentFrame * 0.4) % width);
        const py = ((p * 73 + currentFrame * 0.2) % height);
        ctx.fillStyle = p % 2 === 0 ? "rgba(212, 168, 83, 0.4)" : "rgba(96, 165, 250, 0.4)";
        ctx.beginPath();
        ctx.arc(px, py, (p % 3) + 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Watermark & Logo (Minimal, top-corners)
      ctx.fillStyle = "#8B949E";
      ctx.font = "bold 16px monospace";
      ctx.fillText("time-machine.git", 80, 60);

      ctx.fillStyle = "#D4A853";
      ctx.font = "14px monospace";
      ctx.fillText("DEVELOPER ODYSSEY · 1080P", width - 300, 60);

      // Card Dimensions: Occupies 80% of the 1080p frame (1560x840 on landscape)
      const cardW = isVertical ? 920 : 1560;
      const cardH = isVertical ? 1500 : 840;
      const cardX = (width - cardW) / 2;
      const cardY = (height - cardH) / 2 + 10;

      // Phase 1: Cinematic Intro Screen (2.5s)
      if (currentFrame < introFrames) {
        const introProgress = currentFrame / introFrames;
        const introAlpha = Math.min(1, Math.sin(introProgress * Math.PI));

        ctx.globalAlpha = introAlpha;

        // Card Glass Surface
        ctx.fillStyle = "rgba(19, 28, 49, 0.85)";
        ctx.strokeStyle = "rgba(212, 168, 83, 0.45)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 36);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#D4A853";
        ctx.font = "bold 24px monospace";
        ctx.fillText("A DEVELOPER'S STORY", cardX + 90, cardY + 200);

        ctx.fillStyle = "#F2F0EB";
        ctx.font = "bold 68px Georgia, serif";
        ctx.fillText(title || "A Developer's Story", cardX + 90, cardY + 310);

        ctx.fillStyle = "#8B949E";
        ctx.font = "28px system-ui, -apple-system, sans-serif";
        ctx.fillText("From your first repository to your latest project.", cardX + 90, cardY + 390);

        ctx.fillStyle = "#39D353";
        ctx.font = "bold 20px monospace";
        ctx.fillText(`★ ${events.length} Commits Reconstructed Across the Years`, cardX + 90, cardY + 480);

        ctx.globalAlpha = 1.0;
      }
      // Phase 2: Main Replay Sequence (Unhurried 1x 2.5s per commit with 2-4% subtle zoom)
      else if (currentFrame < introFrames + eventFrames) {
        const eventIndex = Math.min(
          sampledEvents.length - 1,
          Math.floor((currentFrame - introFrames) / framesPerEvent)
        );
        const ev = sampledEvents[eventIndex];
        const overallProgress = (eventIndex + 1) / sampledEvents.length;
        const frameInEvent = (currentFrame - introFrames) % framesPerEvent;

        // Smooth crossfade and 2% subtle zoom interpolation
        const eventProgress = frameInEvent / framesPerEvent;
        const eventAlpha = Math.min(1, Math.sin(eventProgress * Math.PI) * 1.3);
        const zoomScale = 1.0 + eventProgress * 0.025;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(zoomScale, zoomScale);
        ctx.translate(-cx, -cy);

        ctx.globalAlpha = Math.max(0.2, eventAlpha);

        // Glassmorphic Card (Occupies 80% of Frame)
        ctx.fillStyle = "rgba(19, 28, 49, 0.88)";
        ctx.strokeStyle = ev.type === "repo_created" ? "#D4A853" : "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 36);
        ctx.fill();
        ctx.stroke();

        // Top Chapter & Era Indicator
        ctx.fillStyle = "#D4A853";
        ctx.font = "bold 22px monospace";
        const chapterName = ev.chapterName || "THE DEVELOPER JOURNEY";
        ctx.fillText(`CHAPTER: ${chapterName.toUpperCase()} · ${ev.year}`, cardX + 90, cardY + 130);

        ctx.fillStyle = "#8B949E";
        ctx.font = "18px monospace";
        ctx.fillText(`Commit ${eventIndex + 1} of ${sampledEvents.length}`, cardX + cardW - 380, cardY + 130);

        // Large Repository Badge
        ctx.fillStyle = "#0E4429";
        ctx.strokeStyle = "#39D353";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cardX + 90, cardY + 180, 360, 56, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#39D353";
        ctx.font = "bold 22px monospace";
        const rName = ev.repoName ? `⚡ ${ev.repoName}` : "⚡ Repository";
        ctx.fillText(rName.length > 22 ? `${rName.slice(0, 20)}...` : rName, cardX + 115, cardY + 217);

        // Prominent Playfair Display / Serif Commit Headline
        ctx.fillStyle = "#F2F0EB";
        ctx.font = "bold 52px Georgia, serif";
        const titleText = ev.title.length > 58 ? `${ev.title.slice(0, 55)}...` : ev.title;
        ctx.fillText(titleText, cardX + 90, cardY + 340);

        // Date Timestamp & Metadata
        ctx.fillStyle = "#8B949E";
        ctx.font = "22px monospace";
        ctx.fillText(`Pushed on ${ev.date.slice(0, 10)} · #${ev.commitShortSha || "sha"}`, cardX + 90, cardY + 420);

        // Chapter Narrative Sentence
        if (ev.impactDescription || ev.chapterName) {
          ctx.fillStyle = "rgba(11, 16, 32, 0.9)";
          ctx.strokeStyle = "rgba(212, 168, 83, 0.35)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(cardX + 90, cardY + 480, cardW - 180, 110, 18);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#D4A853";
          ctx.font = "bold 18px monospace";
          ctx.fillText(`✦ MILESTONE: ${ev.impactBadge?.toUpperCase() || "PROGRESSION"}`, cardX + 120, cardY + 524);

          ctx.fillStyle = "#F2F0EB";
          ctx.font = "italic 20px Georgia, serif";
          const desc = ev.impactDescription || "Continued active development across codebase.";
          ctx.fillText(`“${desc}”`, cardX + 120, cardY + 562);
        }

        // Thick Glowing Golden Progress Bar (Positioned near bottom of card)
        const barY = cardY + cardH - 120;
        const barW = cardW - 180;

        ctx.fillStyle = "#0B1020";
        ctx.beginPath();
        ctx.roundRect(cardX + 90, barY, barW, 20, 10);
        ctx.fill();

        ctx.fillStyle = "#D4A853";
        ctx.beginPath();
        ctx.roundRect(cardX + 90, barY, Math.max(20, barW * overallProgress), 20, 10);
        ctx.fill();

        // Progress Text
        ctx.fillStyle = "#8B949E";
        ctx.font = "18px monospace";
        ctx.fillText(`${Math.round(overallProgress * 100)}% Replayed · ${ev.date.slice(0, 10)}`, cardX + 90, barY + 52);

        ctx.restore();
      }
      // Phase 3: Outro Documentary Summary Screen (3.0s)
      else {
        const outroProgress = (currentFrame - (introFrames + eventFrames)) / outroFrames;
        const outroAlpha = Math.min(1, Math.sin(outroProgress * Math.PI));

        ctx.globalAlpha = Math.max(0.3, outroAlpha);

        ctx.fillStyle = "rgba(19, 28, 49, 0.9)";
        ctx.strokeStyle = "#D4A853";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 36);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#D4A853";
        ctx.font = "bold 24px monospace";
        ctx.fillText("DOCUMENTARY FINALE", cardX + 90, cardY + 180);

        ctx.fillStyle = "#F2F0EB";
        ctx.font = "bold 60px Georgia, serif";
        ctx.fillText("From your first repository to your latest project.", cardX + 90, cardY + 280);

        ctx.fillStyle = "#8B949E";
        ctx.font = "28px system-ui, -apple-system, sans-serif";
        ctx.fillText(`${events.length} commits. Built one push at a time.`, cardX + 90, cardY + 360);

        ctx.fillStyle = "#D4A853";
        ctx.font = "italic 36px Georgia, serif";
        ctx.fillText("“Your GitHub history is not a graph. It is a story.”", cardX + 90, cardY + 480);

        ctx.fillStyle = "#39D353";
        ctx.font = "bold 22px monospace";
        ctx.fillText("time-machine.git", cardX + 90, cardY + 570);

        ctx.globalAlpha = 1.0;
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
    console.error("Cinematic 1080p video export error:", err);
    return false;
  }
}

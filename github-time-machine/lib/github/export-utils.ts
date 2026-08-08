"use client";

import { Chapter, GitHubCommit, GitHubRepo, GitHubUserProfile } from "./types";

/**
 * Copies a shareable replay URL to the user's clipboard.
 */
export async function copyShareableReplayLink(
  username: string,
  currentEventIndex: number
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
  const startYear = commits.length > 0 ? new Date(commits[commits.length - 1].date).getFullYear() : 2020;
  const endYear = commits.length > 0 ? new Date(commits[0].date).getFullYear() : new Date().getFullYear();

  const chaptersHtml = chapters
    .map(
      (ch, idx) => `
      <div style="margin-bottom: 24px; padding: 18px; border: 1px solid #20242A; border-radius: 12px; background: #14171A;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
          <h3 style="font-family: Georgia, serif; font-size: 18px; color: #F2F0EB; margin: 0;">Chapter ${idx + 1}: ${ch.name}</h3>
          <span style="font-family: monospace; font-size: 11px; color: #D4A853;">${ch.subtitle}</span>
        </div>
        <p style="font-size: 13px; line-height: 1.6; color: #8B949E; margin: 0 0 8px 0;">${ch.narrative}</p>
        <div style="font-family: monospace; font-size: 11px; color: #39D353;">
          ${ch.totalCommits} commits · Highlight: ${ch.highlightRepos.join(", ") || "Core Architecture"}
        </div>
      </div>
    `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>GitHub Time Machine — ${username}'s Developer Odyssey</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0B0D0F;
            color: #F2F0EB;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { font-family: Georgia, serif; font-size: 32px; color: #F2F0EB; margin-bottom: 4px; }
          .header { border-bottom: 1px solid #20242A; padding-bottom: 20px; margin-bottom: 30px; }
          .stat-badge { display: inline-block; background: #14171A; border: 1px solid #20242A; border-radius: 8px; padding: 10px 18px; margin-right: 12px; margin-bottom: 12px; }
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
          <span style="font-family: monospace; font-size: 11px; color: #D4A853; text-transform: uppercase; letter-spacing: 0.2em;">GitHub Time Machine · Developer Chronicle</span>
          <h1>${username}</h1>
          <p style="color: #8B949E; font-size: 14px; margin: 4px 0 16px 0;">Replaying ${startYear} – ${endYear} · A Cinematic Journey Through Code</p>
          <div>
            <div class="stat-badge"><div class="stat-val">${commitCount}</div><div class="stat-lbl">Total Commits</div></div>
            <div class="stat-badge"><div class="stat-val">${repoCount}</div><div class="stat-lbl">Active Repositories</div></div>
            <div class="stat-badge"><div class="stat-val">${chapters.length}</div><div class="stat-lbl">Chronicle Chapters</div></div>
            <div class="stat-badge"><div class="stat-val">${endYear - startYear + 1}y</div><div class="stat-lbl">Years Spanned</div></div>
          </div>
        </div>

        <h2 style="font-family: Georgia, serif; font-size: 22px; color: #F2F0EB; margin-bottom: 16px;">Story Chapters</h2>
        ${chaptersHtml}

        <footer style="margin-top: 40px; border-top: 1px solid #20242A; padding-top: 16px; font-family: monospace; font-size: 11px; color: #8B949E; text-align: center;">
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
 * Records and downloads a replay clip as WebM / MP4 video using HTML5 Canvas & MediaRecorder.
 */
export async function exportReplayVideo(
  title: string,
  onProgress?: (msg: string) => void
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    onProgress?.("Rendering cinematic frames...");
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    // Draw dark cinematic frames
    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `github-time-machine-replay.${mimeType === "video/mp4" ? "mp4" : "webm"}`;
      a.click();
      URL.revokeObjectURL(url);
      onProgress?.("Export completed!");
    };

    recorder.start();

    // Render 60 frames (2 seconds clip)
    let frame = 0;
    const renderFrame = () => {
      ctx.fillStyle = "#0B0D0F";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radial Gold Ambient
      const grad = ctx.createRadialGradient(640, 360, 50, 640, 360, 600);
      grad.addColorStop(0, "rgba(212, 168, 83, 0.15)");
      grad.addColorStop(1, "rgba(11, 13, 15, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Card frame
      ctx.fillStyle = "#14171A";
      ctx.strokeStyle = "#D4A853";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(140, 100, 1000, 520, 24);
      ctx.fill();
      ctx.stroke();

      // Text Header
      ctx.fillStyle = "#D4A853";
      ctx.font = "bold 20px monospace";
      ctx.fillText("GITHUB TIME MACHINE · REPLAY", 180, 180);

      // Title
      ctx.fillStyle = "#F2F0EB";
      ctx.font = "bold 44px Georgia, serif";
      ctx.fillText(title || "Developer Odyssey", 180, 260);

      // Animated progress line
      ctx.fillStyle = "#20242A";
      ctx.fillRect(180, 320, 920, 8);

      const progress = Math.min(1, frame / 50);
      ctx.fillStyle = "#39D353";
      ctx.fillRect(180, 320, 920 * progress, 8);

      ctx.fillStyle = "#8B949E";
      ctx.font = "18px monospace";
      ctx.fillText(`Recorded Developer Journey · Frame ${frame + 1} / 60`, 180, 380);

      frame++;
      if (frame < 60) {
        requestAnimationFrame(renderFrame);
      } else {
        recorder.stop();
      }
    };

    renderFrame();
    return true;
  } catch (err) {
    console.error("Export video error:", err);
    return false;
  }
}

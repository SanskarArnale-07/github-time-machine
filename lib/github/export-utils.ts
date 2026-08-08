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
    )}&event=${currentEventIndex}&mode=replay&speed=1`;

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
      <div style="margin-bottom: 20px; padding: 18px; border: 1px solid #20242A; border-radius: 12px; background: #14171A;">
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
 * Records and downloads an MP4/WebM video in landscape (16:9 1920x1080) or vertical (9:16 1080x1920 social reel).
 */
export async function exportReplayVideoFormat(
  title: string,
  mode: "landscape" | "vertical" | "gif",
  onProgress?: (msg: string) => void
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const isVertical = mode === "vertical";
    const width = isVertical ? 1080 : 1920;
    const height = isVertical ? 1920 : 1080;

    onProgress?.(`Rendering ${isVertical ? "Vertical 9:16 Reel" : "Landscape 1080p Presentation"}...`);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

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
      a.download = `github-time-machine-${mode}.${mimeType === "video/mp4" ? "mp4" : "webm"}`;
      a.click();
      URL.revokeObjectURL(url);
      onProgress?.("Export completed!");
    };

    recorder.start();

    let frame = 0;
    const totalFrames = 60; // 2 seconds high quality clip

    const renderFrame = () => {
      // 1. Background
      ctx.fillStyle = "#0B0D0F";
      ctx.fillRect(0, 0, width, height);

      // 2. Ambient radial glow
      const cx = width / 2;
      const cy = height / 2;
      const grad = ctx.createRadialGradient(cx, cy, 100, cx, cy, width * 0.7);
      grad.addColorStop(0, "rgba(212, 168, 83, 0.22)");
      grad.addColorStop(1, "rgba(11, 13, 15, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 3. Main Cinema Card
      const cardW = isVertical ? 920 : 1440;
      const cardH = isVertical ? 1400 : 760;
      const cardX = (width - cardW) / 2;
      const cardY = (height - cardH) / 2;

      ctx.fillStyle = "#14171A";
      ctx.strokeStyle = "#D4A853";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 32);
      ctx.fill();
      ctx.stroke();

      // 4. Header Badge
      ctx.fillStyle = "#D4A853";
      ctx.font = "bold 26px monospace";
      ctx.fillText("GITHUB TIME MACHINE · DEVELOPER DOCUMENTARY", cardX + 60, cardY + 100);

      // 5. Title
      ctx.fillStyle = "#F2F0EB";
      ctx.font = "bold 56px Georgia, serif";
      ctx.fillText(title || "Developer Odyssey", cardX + 60, cardY + 200);

      // 6. Subtitle
      ctx.fillStyle = "#8B949E";
      ctx.font = "28px system-ui, sans-serif";
      ctx.fillText("From first repository to present mastery.", cardX + 60, cardY + 260);

      // 7. Animated progress bar
      const barY = cardY + cardH - 140;
      ctx.fillStyle = "#20242A";
      ctx.fillRect(cardX + 60, barY, cardW - 120, 14);

      const progress = Math.min(1, frame / (totalFrames - 10));
      ctx.fillStyle = "#39D353";
      ctx.fillRect(cardX + 60, barY, (cardW - 120) * progress, 14);

      // 8. Bottom caption
      ctx.fillStyle = "#8B949E";
      ctx.font = "22px monospace";
      ctx.fillText(`Recorded at 60fps · Frame ${frame + 1} / ${totalFrames}`, cardX + 60, barY + 50);

      frame++;
      if (frame < totalFrames) {
        requestAnimationFrame(renderFrame);
      } else {
        recorder.stop();
      }
    };

    renderFrame();
    return true;
  } catch (err) {
    console.error("Video export error:", err);
    return false;
  }
}

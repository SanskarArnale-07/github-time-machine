/**
 * generate-icons.js
 * Generates PNG icons for the GitHub Time Machine extension using
 * the Canvas API (node-canvas). Run with: node generate-icons.js
 *
 * If node-canvas is not installed, falls back to writing minimal
 * valid PNG buffers (1x1 pixel transparent) as placeholders.
 */

const fs = require("fs");
const path = require("path");

const SIZES = [16, 32, 48, 128];
const OUT_DIR = path.join(__dirname, "icons");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Try to use node-canvas; fall back to embedded PNG data if not available
let createCanvas;
try {
  ({ createCanvas } = require("canvas"));
} catch {
  createCanvas = null;
}

/**
 * Minimal 1x1 transparent PNG — used as placeholder when canvas is unavailable.
 * This is a valid PNG file that Chrome will accept (though it won't look great).
 */
const PLACEHOLDER_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const s = size;

  // Background — pure black
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect(0, 0, s, s, s * 0.2);
  ctx.fill();

  // Outer ring (clock face)
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.38;

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1, s * 0.07);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Hour hand (pointing to 11 — rewinding feel)
  const hourAngle = -Math.PI / 2 - Math.PI / 6;
  const hourLen = r * 0.55;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1.5, s * 0.09);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hourAngle) * hourLen, cy + Math.sin(hourAngle) * hourLen);
  ctx.stroke();

  // Minute hand (pointing to 10)
  const minAngle = -Math.PI / 2 - (Math.PI * 2) / 3;
  const minLen = r * 0.72;
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(minAngle) * minLen, cy + Math.sin(minAngle) * minLen);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1.5, s * 0.06), 0, Math.PI * 2);
  ctx.fill();

  // Rewind arrow — small curved arrow at top-left of clock
  if (size >= 32) {
    const arrowR = r + s * 0.09;
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = Math.max(1, s * 0.055);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, arrowR, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();

    // Arrow head
    const arrowTipAngle = -Math.PI * 0.82;
    const tx = cx + Math.cos(arrowTipAngle) * arrowR;
    const ty = cy + Math.sin(arrowTipAngle) * arrowR;
    const ah = s * 0.09;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + ah * 0.7, ty - ah);
    ctx.lineTo(tx - ah * 0.5, ty - ah * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  return canvas.toBuffer("image/png");
}

for (const size of SIZES) {
  const outPath = path.join(OUT_DIR, `icon${size}.png`);
  if (createCanvas) {
    const buf = drawIcon(size);
    fs.writeFileSync(outPath, buf);
    console.log(`✓ icon${size}.png (canvas)`);
  } else {
    fs.writeFileSync(outPath, PLACEHOLDER_PNG);
    console.log(`⚠ icon${size}.png (placeholder — install 'canvas' for real icons)`);
  }
}

console.log("\nDone. Icons written to:", OUT_DIR);
console.log("To get proper icons: npm install canvas  (then re-run this script)");

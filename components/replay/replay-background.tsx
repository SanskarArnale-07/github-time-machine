"use client";

import { motion } from "framer-motion";

interface ReplayBackgroundProps {
  progress?: number; // 0 to 100
  isFinal?: boolean;
  sceneIndex?: number; // 1-7, controls node network phase
}

// ─── Theme Colors ─────────────────────────────────────────────────────────────
const GOLD_RGB = "216,181,108";
const GOLD_HEX = "#D8B56C";
const BROWN_RGB = "181,138,74";
const BG_BASE = "#050505";
const BG_CAMERA = "#0B0A09";
const BG_BROWN = "139,101,48";
const BG_DARK_BROWN = "51,39,27";

const PARTICLES = Array.from({ length: 18 }, (_, id) => ({
  id,
  left: `${(id * 17.3 + 7) % 96}%`,
  top: `${(id * 23.7 + 11) % 90}%`,
  size: `${id % 3 === 0 ? 2 : 1}px`,
  delay: `${(id % 6) * -1.4}s`,
  duration: `${14 + (id % 5) * 3}s`,
  opacity: 0.16 + (id % 4) * 0.07,
}));

// ─── Git Network Paths ────────────────────────────────────────────────────────
const TRUNK_PATH = "M 500 1000 Q 500 800 500 600 T 500 200";
const BRANCH_1_PATH = "M 500 800 Q 300 600 250 400 T 200 100";
const BRANCH_2_PATH = "M 500 600 Q 750 450 800 300 T 850 50";
const MERGE_1_PATH = "M 250 400 Q 350 300 500 200";
const FORK_1_PATH = "M 800 300 Q 950 200 900 50";
// Dense network paths that appear in later scenes
const BRANCH_3_PATH = "M 500 700 Q 650 550 700 350 T 680 100";
const BRANCH_4_PATH = "M 500 500 Q 350 380 300 200 T 340 30";
const MERGE_2_PATH = "M 700 350 Q 600 280 500 200";
const EXPLOSION_PATHS = [
  "M 500 200 Q 400 100 450 0",
  "M 500 200 Q 600 100 550 0",
  "M 500 200 Q 500 100 500 0",
  "M 500 200 Q 440 80 420 -20",
  "M 500 200 Q 560 80 580 -20",
];

// ─── Nodes — tagged with the scene at which they appear ──────────────────────
const NODES = [
  // Scene 1: lone origin
  { cx: 500, cy: 800, visibleFrom: 1, r: 7 },
  // Scene 2: first branch tips
  { cx: 500, cy: 600, visibleFrom: 2, r: 5 },
  { cx: 375, cy: 600, visibleFrom: 2, r: 5 },
  // Scene 3: mid-network
  { cx: 250, cy: 400, visibleFrom: 3, r: 5 },
  { cx: 500, cy: 400, visibleFrom: 3, r: 5 },
  { cx: 625, cy: 525, visibleFrom: 3, r: 4 },
  // Scene 4: dense branching
  { cx: 700, cy: 350, visibleFrom: 4, r: 4 },
  { cx: 340, cy: 200, visibleFrom: 4, r: 4 },
  { cx: 800, cy: 300, visibleFrom: 4, r: 5 },
  // Scene 5+: merge point and forks
  { cx: 500, cy: 200, visibleFrom: 5, r: 6 },
  { cx: 680, cy: 100, visibleFrom: 5, r: 4 },
  // Scene 6: late fork & explosion base
  { cx: 900, cy: 50, visibleFrom: 6, r: 4 },
  { cx: 450, cy: 50, visibleFrom: 6, r: 3 },
  { cx: 550, cy: 20, visibleFrom: 6, r: 3 },
];

// ─── Per-scene cinematic camera targets ───────────────────────────────────────────
// Each scene drifts the background layer to a unique (x, y, scale) target
// AND has its own transition speed so opening is deliberate, middle accelerates.
const SCENE_CAMERA: Record<number, { x: number; y: number; scale: number; dur: number }> = {
  1: { x:  0,   y:  14,  scale: 1.05, dur: 4.0 }, // pull back, slow open
  2: { x: -16,  y:  6,   scale: 1.08, dur: 3.5 }, // drift left
  3: { x:  14,  y: -10,  scale: 1.10, dur: 3.0 }, // snap right
  4: { x: -10,  y: -16,  scale: 1.11, dur: 2.8 }, // diagonal lift
  5: { x:  16,  y:  4,   scale: 1.13, dur: 2.5 }, // push right, quickening
  6: { x:  -6,  y:  12,  scale: 1.15, dur: 2.5 }, // settle left-down
  7: { x:   0,  y:  0,   scale: 1.22, dur: 6.0 }, // climax: slow zoom to center
};

/** A dedicated, low-contrast field for the replay theater. */
export function ReplayBackground({ progress, isFinal, sceneIndex = 0 }: ReplayBackgroundProps) {
  const drawProgress = progress ?? 100;
  const pathScalar = drawProgress / 100;
  // Clamp to 1–7 range; 0 treated as pre-start
  const scene = Math.max(1, Math.min(7, sceneIndex));

  const camera = isFinal
    ? SCENE_CAMERA[7]
    : (SCENE_CAMERA[scene] ?? { x: 0, y: 0, scale: 1.08, dur: 3.5 });

  // Per-scene path visibility thresholds
  const showBranch1  = scene >= 2;
  const showBranch2  = scene >= 3;
  const showMerge1   = scene >= 4;
  const showBranch3  = scene >= 4;
  const showBranch4  = scene >= 5;
  const showMerge2   = scene >= 5;
  const showFork1    = scene >= 6;
  const showExplosion = isFinal || scene >= 7;

  // Path opacity grows with scene progression for a sense of accumulation
  const networkOpacity = Math.min(0.22, 0.08 + scene * 0.02);

  // Gold glow intensity increases toward the finale
  const glowBrightness = isFinal ? `rgba(${GOLD_RGB},0.28)` : `rgba(${GOLD_RGB},${0.06 + scene * 0.012})`;

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[${BG_BASE}]`}>
      {/* Cinematic Camera Layer — slow drift per scene */}
      <motion.div
        className="absolute inset-0 origin-center"
        animate={{
          scale: camera.scale,
          x: camera.x,
          y: camera.y,
        }}
        transition={{ duration: isFinal ? 6 : camera.dur ?? 3.5, ease: "easeInOut" }}
      >
        <div className={`absolute inset-0 bg-[${BG_CAMERA}]`} />

        {/* Core Lighting — brightens toward final */}
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_34%,rgba(${GOLD_RGB},0.06),transparent_72%)]`} />

        {/* Animated gold orb — scale only, no blur filter to avoid compositor cost */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[40vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{
            backgroundColor: glowBrightness,
            scale: isFinal ? 1.6 : 1 + scene * 0.04,
            opacity: isFinal ? 0.9 : 0.65,
          }}
          style={{ filter: "blur(90px)" }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        {/* Static ambient blobs — baked into a single CSS gradient, zero GPU blur cost */}
        <div
          className="absolute inset-0"
          style={{
            background:
              `radial-gradient(ellipse 58% 68% at 96% 0%, rgba(${BG_BROWN},0.12) 0%, transparent 70%), ` +
              `radial-gradient(ellipse 58% 65% at 0% 110%, rgba(${BG_DARK_BROWN},0.40) 0%, transparent 70%)`,
          }}
        />

        {/* Git Network SVG — progressively reveals paths and nodes by scene */}
        <div
          className="absolute inset-0 mix-blend-screen transition-opacity duration-1000"
          style={{ opacity: networkOpacity / 0.15 * 0.15 }}
        >
          <svg viewBox="0 0 1000 1000" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="doc-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="doc-glow-soft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* ── Trunk (always visible from scene 1) ── */}
            <motion.path
              d={TRUNK_PATH}
              fill="none"
              stroke={`rgba(${GOLD_RGB},0.30)`}
              strokeWidth="2"
              strokeDasharray="1"
              strokeDashoffset={1 - pathScalar}
              pathLength="1"
              filter="url(#doc-glow)"
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* ── Branch 1 — scene 2+ ── */}
            <motion.path
              d={BRANCH_1_PATH}
              fill="none"
              stroke={`rgba(${BROWN_RGB},0.22)`}
              strokeWidth="1.5"
              strokeDasharray="1"
              strokeDashoffset={showBranch1 ? Math.max(0, 1 - Math.max(0, (pathScalar - 0.1) / 0.7)) : 1}
              pathLength="1"
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            {/* ── Branch 2 — scene 3+ ── */}
            <motion.path
              d={BRANCH_2_PATH}
              fill="none"
              stroke={`rgba(${BROWN_RGB},0.20)`}
              strokeWidth="1.5"
              strokeDasharray="1"
              strokeDashoffset={showBranch2 ? Math.max(0, 1 - Math.max(0, (pathScalar - 0.3) / 0.5)) : 1}
              pathLength="1"
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            {/* ── Dense Branch 3 — scene 4+ ── */}
            <motion.path
              d={BRANCH_3_PATH}
              fill="none"
              stroke={`rgba(${BROWN_RGB},0.15)`}
              strokeWidth="1.2"
              strokeDasharray="1"
              strokeDashoffset={showBranch3 ? Math.max(0, 1 - Math.max(0, (pathScalar - 0.25) / 0.6)) : 1}
              pathLength="1"
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            {/* ── Dense Branch 4 — scene 5+ ── */}
            <motion.path
              d={BRANCH_4_PATH}
              fill="none"
              stroke={`rgba(${BROWN_RGB},0.12)`}
              strokeWidth="1.2"
              strokeDasharray="1"
              strokeDashoffset={showBranch4 ? Math.max(0, 1 - Math.max(0, (pathScalar - 0.4) / 0.5)) : 1}
              pathLength="1"
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            {/* ── Merge 1 — scene 4+ ── */}
            <motion.path
              d={MERGE_1_PATH}
              fill="none"
              stroke={`rgba(${GOLD_RGB},0.17)`}
              strokeWidth="1.5"
              strokeDasharray="1"
              strokeDashoffset={showMerge1 ? Math.max(0, 1 - Math.max(0, (pathScalar - 0.5) / 0.4)) : 1}
              pathLength="1"
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            {/* ── Merge 2 — scene 5+ ── */}
            <motion.path
              d={MERGE_2_PATH}
              fill="none"
              stroke={`rgba(${GOLD_RGB},0.13)`}
              strokeWidth="1.2"
              strokeDasharray="1"
              strokeDashoffset={showMerge2 ? Math.max(0, 1 - Math.max(0, (pathScalar - 0.55) / 0.35)) : 1}
              pathLength="1"
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            {/* ── Fork 1 — scene 6+ ── */}
            <motion.path
              d={FORK_1_PATH}
              fill="none"
              stroke={`rgba(${BROWN_RGB},0.15)`}
              strokeWidth="1.5"
              strokeDasharray="1"
              strokeDashoffset={showFork1 ? Math.max(0, 1 - Math.max(0, (pathScalar - 0.6) / 0.4)) : 1}
              pathLength="1"
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            {/* ── Explosion rays — final scene only ── */}
            {EXPLOSION_PATHS.map((path, i) => (
              <motion.path
                key={`exp-${i}`}
                d={path}
                fill="none"
                stroke={`rgba(${GOLD_RGB},0.35)`}
                strokeWidth="1.2"
                strokeDasharray="1"
                strokeDashoffset={showExplosion ? 0 : 1}
                pathLength="1"
                filter="url(#doc-glow)"
                transition={{ duration: 2.5, ease: "easeOut", delay: i * 0.15 }}
              />
            ))}

            {/* ── Nodes — appear per scene ── */}
            {NODES.map((node, i) => {
              const isVisible = scene >= node.visibleFrom || (drawProgress >= node.visibleFrom * 14);
              const nodeOpacity = isVisible
                ? isFinal ? 0.9 : 0.28 + Math.min(0.35, (scene - node.visibleFrom + 1) * 0.08)
                : 0;
              const nodeScale = isVisible ? (isFinal ? 1.3 : 1) : 0;
              return (
                <motion.circle
                  key={i}
                  cx={node.cx}
                  cy={node.cy}
                  r={node.r}
                  fill={GOLD_HEX}
                  animate={{
                    opacity: nodeOpacity,
                    scale: nodeScale,
                  }}
                  transition={{ duration: 1.8, type: "spring", damping: 18 }}
                  filter={isFinal || scene >= 5 ? "url(#doc-glow)" : "url(#doc-glow-soft)"}
                />
              );
            })}
          </svg>
        </div>

        {/* Floating Particles */}
        {PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="absolute rounded-full bg-brass-light motion-safe:animate-particle-drift"
            style={{
              boxShadow: `0 0 10px rgba(${GOLD_RGB},0.45)`,
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              opacity: isFinal ? particle.opacity * 2.2 : particle.opacity * (0.6 + scene * 0.07),
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </motion.div>

      {/* Film Grain Overlay — stays static to screen */}
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-overlay pointer-events-none motion-safe:animate-pulse"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          animationDuration: "4s",
        }}
      />

      {/* Vignette — lifts slightly on final scene */}
      <motion.div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(5,5,5,0.85)_80%,rgba(0,0,0,0.98)_100%)]"
        animate={{ opacity: isFinal ? 0.65 : 1 }}
        transition={{ duration: 4 }}
      />
    </div>
  );
}

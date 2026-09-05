"use client";

import React, { useEffect, useRef, useState, memo, useMemo } from "react";

export type SpaceTheme =
  | "default"
  | "architecture"
  | "performance"
  | "beginning"
  | "refactor"
  | "milestone"
  | "streak";

export interface SpaceBackgroundProps {
  theme?: SpaceTheme;
  variant?: "fixed" | "absolute";
  showNebula?: boolean;
  showStars?: boolean;
  showVignette?: boolean;
  showGrain?: boolean;
  className?: string;
  children?: React.ReactNode;
  isPaused?: boolean;
  starMultiplier?: number;
  showGitGraph?: boolean;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  tier: 1 | 2 | 3;
  baseAlpha: number;
  currentAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  speedX: number;
  speedY: number;
  color: string;
}

interface GitNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isMain: boolean;
  connections: number[];
}

// ── Theme Color Configurations ───────────────────────────────────────────────
const THEME_CONFIGS: Record<
  SpaceTheme,
  {
    nebulaGradients: string;
    starMultiplier: number;
    haloBrightness: number;
  }
> = {
  default: {
    nebulaGradients: `
      radial-gradient(ellipse 65% 55% at 80% 10%, rgba(59, 130, 246, 0.16) 0%, rgba(37, 99, 235, 0.07) 40%, transparent 70%),
      radial-gradient(ellipse 70% 60% at 15% 45%, rgba(124, 58, 237, 0.14) 0%, rgba(91, 33, 182, 0.05) 45%, transparent 72%),
      radial-gradient(ellipse 60% 50% at 50% 85%, rgba(30, 58, 138, 0.14) 0%, rgba(15, 23, 42, 0.06) 50%, transparent 70%)
    `,
    starMultiplier: 1.0,
    haloBrightness: 0.38,
  },
  architecture: {
    nebulaGradients: `
      radial-gradient(ellipse 65% 55% at 80% 10%, rgba(37, 99, 235, 0.18) 0%, rgba(29, 78, 216, 0.08) 40%, transparent 70%),
      radial-gradient(ellipse 70% 60% at 15% 45%, rgba(109, 40, 217, 0.15) 0%, rgba(76, 29, 149, 0.06) 45%, transparent 72%),
      radial-gradient(ellipse 60% 50% at 50% 85%, rgba(30, 27, 75, 0.15) 0%, transparent 70%)
    `,
    starMultiplier: 1.0,
    haloBrightness: 0.35,
  },
  performance: {
    nebulaGradients: `
      radial-gradient(ellipse 65% 55% at 80% 10%, rgba(6, 182, 212, 0.16) 0%, rgba(14, 116, 144, 0.07) 40%, transparent 70%),
      radial-gradient(ellipse 70% 60% at 15% 45%, rgba(30, 64, 175, 0.14) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 50% 85%, rgba(15, 23, 42, 0.16) 0%, transparent 70%)
    `,
    starMultiplier: 1.05,
    haloBrightness: 0.42,
  },
  beginning: {
    nebulaGradients: `
      radial-gradient(ellipse 65% 55% at 80% 10%, rgba(129, 140, 248, 0.18) 0%, transparent 70%),
      radial-gradient(ellipse 70% 60% at 15% 45%, rgba(168, 85, 247, 0.15) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 50% 85%, rgba(49, 46, 129, 0.14) 0%, transparent 70%)
    `,
    starMultiplier: 1.1,
    haloBrightness: 0.45,
  },
  refactor: {
    nebulaGradients: `
      radial-gradient(ellipse 65% 55% at 80% 10%, rgba(139, 92, 246, 0.14) 0%, transparent 70%),
      radial-gradient(ellipse 70% 60% at 15% 45%, rgba(76, 29, 149, 0.12) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 50% 85%, rgba(24, 24, 27, 0.15) 0%, transparent 70%)
    `,
    starMultiplier: 0.95,
    haloBrightness: 0.32,
  },
  milestone: {
    nebulaGradients: `
      radial-gradient(ellipse 65% 55% at 80% 10%, rgba(147, 51, 234, 0.18) 0%, transparent 70%),
      radial-gradient(ellipse 70% 60% at 15% 45%, rgba(59, 130, 246, 0.16) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 50% 85%, rgba(79, 70, 229, 0.15) 0%, transparent 70%)
    `,
    starMultiplier: 1.15,
    haloBrightness: 0.48,
  },
  streak: {
    nebulaGradients: `
      radial-gradient(ellipse 65% 55% at 80% 10%, rgba(56, 189, 248, 0.16) 0%, transparent 70%),
      radial-gradient(ellipse 70% 60% at 15% 45%, rgba(99, 102, 241, 0.14) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 50% 85%, rgba(30, 58, 138, 0.14) 0%, transparent 70%)
    `,
    starMultiplier: 1.25,
    haloBrightness: 0.46,
  },
};

/**
 * Reusable Global Cinematic Deep-Space Background.
 * 
 * Optimized Architecture:
 * - Replaces expensive multi-megapixel blur(80px-100px) Framer Motion loops with zero-cost static CSS radial gradients.
 * - Single high-performance canvas loop with viewport IntersectionObserver detection.
 * - Pauses automatically when tab is hidden or element is scrolled off-screen.
 * - Supports merged git-graph rendering to prevent duplicate canvas loops on the landing page.
 * - Full prefers-reduced-motion support (zero RAF loop, static render).
 */
export const SpaceBackground = memo(function SpaceBackground({
  theme = "default",
  variant = "fixed",
  showNebula = true,
  showStars = true,
  showVignette = true,
  showGrain = true,
  className = "",
  children,
  isPaused = false,
  starMultiplier,
  showGitGraph = false,
}: SpaceBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const gitNodesRef = useRef<GitNode[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const dimensionsRef = useRef<{ width: number; height: number; dpr: number }>({
    width: 0,
    height: 0,
    dpr: 1,
  });

  const isPausedRef = useRef<boolean>(isPaused);
  isPausedRef.current = isPaused;

  const loopRef = useRef<((time: number) => void) | null>(null);
  const drawStaticRef = useRef<(() => void) | null>(null);

  const [hasMounted, setHasMounted] = useState(false);
  const config = useMemo(() => THEME_CONFIGS[theme] || THEME_CONFIGS.default, [theme]);
  const effectiveStarMultiplier = starMultiplier ?? config.starMultiplier;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Canvas starfield & git-graph initialization & render loop
  useEffect(() => {
    if (!hasMounted || !showStars) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const STAR_COLORS = [
      "245, 248, 255", // Diamond / ice white (60%)
      "215, 235, 255", // Soft celestial cyan (20%)
      "232, 226, 255", // Faint cosmic lavender (15%)
      "255, 248, 236", // Antique starlight ivory (5%)
    ];

    const pickColor = () => {
      const r = Math.random();
      if (r < 0.60) return STAR_COLORS[0];
      if (r < 0.80) return STAR_COLORS[1];
      if (r < 0.95) return STAR_COLORS[2];
      return STAR_COLORS[3];
    };

    const drawFrame = (time: number, delta: number, animate: boolean) => {
      const { width: w, height: h, dpr } = dimensionsRef.current;
      if (w === 0 || h === 0) return;

      if (animate && !prefersReducedMotion) {
        mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.035;
        mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.035;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const stars = starsRef.current;
      const speedMultiplier = delta / 16.666;

      // Draw stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (animate && !prefersReducedMotion) {
          star.twinklePhase += star.twinkleSpeed * speedMultiplier;
          const twinkle = Math.sin(star.twinklePhase);
          const alphaScale = star.tier === 3 ? 0.70 + 0.30 * twinkle : 0.80 + 0.20 * twinkle;
          star.currentAlpha = Math.max(0.04, Math.min(1, star.baseAlpha * alphaScale));

          star.x += star.speedX * speedMultiplier;
          star.y += star.speedY * speedMultiplier;

          const pad = 24;
          if (star.x < -pad) star.x = w + pad;
          if (star.x > w + pad) star.x = -pad;
          if (star.y < -pad) star.y = h + pad;
          if (star.y > h + pad) star.y = -pad;
        }

        let px = 0;
        let py = 0;
        if (!prefersReducedMotion) {
          if (star.tier === 1) {
            px = mouseCurrentRef.current.x * 4;
            py = mouseCurrentRef.current.y * 4;
          } else if (star.tier === 2) {
            px = mouseCurrentRef.current.x * 9;
            py = mouseCurrentRef.current.y * 9;
          } else {
            px = mouseCurrentRef.current.x * 16;
            py = mouseCurrentRef.current.y * 16;
          }
        }

        const drawX = star.x + px;
        const drawY = star.y + py;

        if (star.tier === 3) {
          const haloRadius = star.radius * 3.0;
          const halo = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, haloRadius);
          halo.addColorStop(0, `rgba(${star.color}, ${star.currentAlpha * config.haloBrightness})`);
          halo.addColorStop(0.5, `rgba(${star.color}, ${star.currentAlpha * (config.haloBrightness * 0.3)})`);
          halo.addColorStop(1, `rgba(${star.color}, 0)`);

          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(drawX, drawY, haloRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${star.color}, ${star.currentAlpha})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw optional merged Git branch lines & nodes (Zero per-frame allocation)
      if (showGitGraph && gitNodesRef.current.length > 0) {
        const nodes = gitNodesRef.current;
        ctx.lineWidth = 1;

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (animate && !prefersReducedMotion) {
            node.x += node.vx * speedMultiplier;
            node.y += node.vy * speedMultiplier;
            if (node.x < 0 || node.x > w) node.vx *= -1;
            if (node.y < 0 || node.y > h) node.vy *= -1;
          }

          // Pre-defined solid stroke to prevent createLinearGradient allocation in loop
          ctx.strokeStyle = node.isMain ? "rgba(212, 168, 83, 0.20)" : "rgba(88, 166, 255, 0.10)";

          for (let j = 0; j < node.connections.length; j++) {
            const target = nodes[node.connections[j]];
            if (!target) continue;

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            const midY = node.y + (target.y - node.y) / 2;
            ctx.bezierCurveTo(node.x, midY, target.x, midY, target.x, target.y);
            ctx.stroke();
          }

          // Commit node
          ctx.fillStyle = node.isMain ? "rgba(212, 168, 83, 0.75)" : "rgba(88, 166, 255, 0.50)";
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    drawStaticRef.current = () => {
      drawFrame(performance.now(), 16, false);
    };

    const initStars = (w: number, h: number) => {
      const baseCount = Math.floor((w * h) / 14000);
      const targetCount = Math.min(
        110,
        Math.max(45, Math.floor(baseCount * effectiveStarMultiplier))
      );

      const stars: Star[] = [];
      for (let i = 0; i < targetCount; i++) {
        const rand = Math.random();
        let tier: 1 | 2 | 3 = 1;
        let radius = 0.5 + Math.random() * 0.35;
        let baseAlpha = 0.14 + Math.random() * 0.16;
        let speedX = prefersReducedMotion ? 0 : -0.012 - Math.random() * 0.015;
        let speedY = prefersReducedMotion ? 0 : -0.022 - Math.random() * 0.020;

        if (rand > 0.90) {
          tier = 3;
          radius = 1.4 + Math.random() * 0.4;
          baseAlpha = 0.60 + Math.random() * 0.22;
          speedX = prefersReducedMotion ? 0 : -0.03 - Math.random() * 0.025;
          speedY = prefersReducedMotion ? 0 : -0.05 - Math.random() * 0.035;
        } else if (rand > 0.55) {
          tier = 2;
          radius = 0.85 + Math.random() * 0.3;
          baseAlpha = 0.28 + Math.random() * 0.20;
          speedX = prefersReducedMotion ? 0 : -0.02 - Math.random() * 0.02;
          speedY = prefersReducedMotion ? 0 : -0.032 - Math.random() * 0.025;
        }

        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius,
          tier,
          baseAlpha,
          currentAlpha: baseAlpha,
          twinkleSpeed: 0.008 + Math.random() * 0.018,
          twinklePhase: Math.random() * Math.PI * 2,
          speedX,
          speedY,
          color: pickColor(),
        });
      }

      starsRef.current = stars;

      // Optional merged git branch graph (eliminates duplicate canvas on landing page)
      if (showGitGraph) {
        const nodeCount = Math.min(Math.floor(w / 70), 20);
        const nodes: GitNode[] = [];
        for (let i = 0; i < nodeCount; i++) {
          const isMain = Math.random() > 0.6;
          nodes.push({
            x: Math.random() * w,
            y: (Math.random() * 0.75) * h, // Focused in hero / upper viewport
            vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.03,
            vy: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.03 - 0.008,
            radius: isMain ? 3 : 2,
            isMain,
            connections: [],
          });
        }

        // Branch connections
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const distances = nodes
            .map((n, idx) => ({ idx, dist: Math.hypot(n.x - node.x, n.y - node.y) }))
            .filter(d => d.idx !== i && d.dist < 320)
            .sort((a, b) => a.dist - b.dist);

          const connectionCount = Math.floor(Math.random() * 2) + 1;
          for (let j = 0; j < Math.min(connectionCount, distances.length); j++) {
            const targetIdx = distances[j].idx;
            if (!node.connections.includes(targetIdx) && !nodes[targetIdx].connections.includes(i)) {
              node.connections.push(targetIdx);
            }
          }
        }
        gitNodesRef.current = nodes;
      }

      // Paint initial frame immediately so stars are never blank on initial load
      drawFrame(performance.now(), 16, false);
    };

    const handleResize = () => {
      const container = containerRef.current || canvas.parentElement;
      const w = container ? container.clientWidth : window.innerWidth;
      const h = container ? container.clientHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      dimensionsRef.current = { width: w, height: h, dpr };

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      initStars(w, h);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const { width: w, height: h } = dimensionsRef.current;
      if (w <= 0 || h <= 0) return;
      mouseTargetRef.current = {
        x: (e.clientX / w - 0.5) * 2,
        y: (e.clientY / h - 0.5) * 2,
      };
    };

    if (!prefersReducedMotion) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    // Visibility detection: Pause RAF when tab is hidden or element is off-screen
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !isPausedRef.current && isVisibleRef.current) {
        lastTimeRef.current = performance.now();
        if (!animationFrameRef.current && !prefersReducedMotion) {
          animationFrameRef.current = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // IntersectionObserver detection for off-screen canvas pause
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && isTabVisible && !isPausedRef.current && !animationFrameRef.current && !prefersReducedMotion) {
            lastTimeRef.current = performance.now();
            animationFrameRef.current = requestAnimationFrame(render);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    const render = (time: number) => {
      if (!isTabVisible || isPausedRef.current || !isVisibleRef.current) {
        animationFrameRef.current = null;
        return;
      }

      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min(time - lastTimeRef.current, 64);
      lastTimeRef.current = time;

      drawFrame(time, delta, true);

      if (!prefersReducedMotion && !isPausedRef.current) {
        animationFrameRef.current = requestAnimationFrame(render);
      } else {
        animationFrameRef.current = null;
      }
    };

    loopRef.current = render;

    // Start loop if active, or render static frame immediately
    if (!prefersReducedMotion && !isPausedRef.current) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(render);
    } else {
      drawFrame(performance.now(), 16, false);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (observer) observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      loopRef.current = null;
      drawStaticRef.current = null;
    };
  }, [hasMounted, showStars, config, effectiveStarMultiplier, showGitGraph]);

  // Handle play/pause toggles cleanly without rebuilding the starfield
  useEffect(() => {
    isPausedRef.current = isPaused;
    if (!hasMounted || !showStars) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    if (!isPaused && isVisibleRef.current && !document.hidden) {
      if (!animationFrameRef.current && loopRef.current) {
        lastTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(loopRef.current);
      }
    } else if (isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (drawStaticRef.current) {
        drawStaticRef.current();
      }
    }
  }, [isPaused, hasMounted, showStars]);

  const positionClass = variant === "fixed" ? "fixed inset-0" : "absolute inset-0";

  return (
    <div
      ref={containerRef}
      data-space-background="true"
      aria-hidden="true"
      className={`pointer-events-none ${positionClass} z-0 h-full w-full select-none overflow-hidden bg-[#071426] ${className}`}
      style={{ isolation: "isolate" }}
    >
      {/* ── 1. Base Cosmic Navy / Indigo Foundation ───────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 95% at 50% 15%, #0b2450 0%, #091c3d 35%, #071426 70%, #050e1c 100%)",
        }}
      />

      {/* ── 2. High-Performance Static CSS Nebulae (Replaces blur(100px) loops) ── */}
      {showNebula && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: config.nebulaGradients,
          }}
        />
      )}

      {/* ── 3. High-Performance Particle Canvas (Stars & Optional Git Graph) ─ */}
      {showStars && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ display: "block" }}
        />
      )}

      {/* ── 4. Analog 35mm Film Grain Texture ────────────────────────────── */}
      {showGrain && (
        <div
          className="absolute inset-0 opacity-[0.032] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
      )}

      {/* ── 5. Deep Space Vignette (Preserves Text Focus & Contrast) ───────── */}
      {showVignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(7, 20, 38, 0.40) 65%, rgba(5, 14, 28, 0.82) 85%, rgba(4, 10, 20, 0.96) 100%)",
          }}
        />
      )}

      {children}
    </div>
  );
});

"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";

export interface ReplayBackgroundProps {
  progress?: number; // 0 to 100
  isFinal?: boolean;
  sceneIndex?: number;
  chapterIndex?: number;
  currentChapterId?: string;
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

/**
 * Cinematic Deep-Space & Time-Travel Background.
 * 
 * Aesthetic Direction:
 * - Charcoal/Navy base with deep edge vignette
 * - Extremely subtle blue/purple volumetric nebula glow
 * - Sparse, tiny starlight with slow imperceptible temporal drift
 * - Occasional gentle brighter star with soft starlight halo
 * - Very subtle multi-tier depth parallax
 * - Fully performant, non-blocking, pointer-events none
 */
export const ReplayBackground = memo(function ReplayBackground({
  progress: _progress,
  isFinal,
  sceneIndex: _sceneIndex,
  chapterIndex: _chapterIndex,
}: ReplayBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Smooth mouse parallax target and interpolated position
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Responsive dimensions
  const dimensionsRef = useRef<{ width: number; height: number; dpr: number }>({
    width: 0,
    height: 0,
    dpr: 1,
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Initialize and run Canvas Starfield
  useEffect(() => {
    if (!hasMounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Palette: delicate celestial hues, strictly avoid aggressive neon
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

    const initStars = (w: number, h: number) => {
      // Sparse density: ~1 star per 13,500px²
      // e.g. 1920x1080 -> ~150 stars max, capped between 70 and 115
      const count = Math.min(115, Math.max(65, Math.floor((w * h) / 13500)));
      const stars: Star[] = [];

      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        let tier: 1 | 2 | 3 = 1;
        let radius = 0.5 + Math.random() * 0.35; // Tier 1: 0.5 - 0.85px
        let baseAlpha = 0.14 + Math.random() * 0.16; // 0.14 - 0.30
        let speedX = -0.012 - Math.random() * 0.015;
        let speedY = -0.022 - Math.random() * 0.020;

        if (rand > 0.90) {
          // Tier 3 (10%): Occasional slightly brighter star
          tier = 3;
          radius = 1.5 + Math.random() * 0.5; // 1.5 - 2.0px
          baseAlpha = 0.65 + Math.random() * 0.25; // 0.65 - 0.90
          speedX = -0.035 - Math.random() * 0.03;
          speedY = -0.055 - Math.random() * 0.04;
        } else if (rand > 0.55) {
          // Tier 2 (35%): Mid-depth space-time stream
          tier = 2;
          radius = 0.9 + Math.random() * 0.35; // 0.9 - 1.25px
          baseAlpha = 0.30 + Math.random() * 0.22; // 0.30 - 0.52
          speedX = -0.022 - Math.random() * 0.025;
          speedY = -0.035 - Math.random() * 0.03;
        }

        if (prefersReducedMotion) {
          speedX = 0;
          speedY = 0;
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

    // Smooth subtle mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      const { width: w, height: h } = dimensionsRef.current;
      if (w <= 0 || h <= 0) return;
      // Map mouse position to -1 ... +1
      const nx = (e.clientX / w - 0.5) * 2;
      const ny = (e.clientY / h - 0.5) * 2;
      mouseTargetRef.current = { x: nx, y: ny };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Render loop
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastTimeRef.current = performance.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (time: number) => {
      if (!isTabVisible) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min(time - lastTimeRef.current, 64); // Cap delta to avoid jumps
      lastTimeRef.current = time;

      const { width: w, height: h, dpr } = dimensionsRef.current;
      if (w === 0 || h === 0) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Smooth mouse interpolation (lerp)
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.035;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.035;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const stars = starsRef.current;
      const speedMultiplier = (delta / 16.666); // Normalize to 60fps

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Organic slow twinkle
        star.twinklePhase += star.twinkleSpeed * speedMultiplier;
        const twinkle = Math.sin(star.twinklePhase);
        const alphaScale = star.tier === 3 ? (0.70 + 0.30 * twinkle) : (0.80 + 0.20 * twinkle);
        star.currentAlpha = Math.max(0.04, Math.min(1, star.baseAlpha * alphaScale));

        // Time travel drift (slow, imperceptible)
        star.x += star.speedX * speedMultiplier;
        star.y += star.speedY * speedMultiplier;

        // Wrap around margins
        const pad = 24;
        if (star.x < -pad) star.x = w + pad;
        if (star.x > w + pad) star.x = -pad;
        if (star.y < -pad) star.y = h + pad;
        if (star.y > h + pad) star.y = -pad;

        // Subtle parallax offset per depth tier
        let px = 0;
        let py = 0;
        if (star.tier === 1) {
          px = mouseCurrentRef.current.x * 5;
          py = mouseCurrentRef.current.y * 5;
        } else if (star.tier === 2) {
          px = mouseCurrentRef.current.x * 11;
          py = mouseCurrentRef.current.y * 11;
        } else {
          px = mouseCurrentRef.current.x * 19;
          py = mouseCurrentRef.current.y * 19;
        }

        const drawX = star.x + px;
        const drawY = star.y + py;

        // Draw Tier 3 brighter star halo
        if (star.tier === 3) {
          const haloRadius = star.radius * 3.2;
          const halo = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, haloRadius);
          halo.addColorStop(0, `rgba(${star.color}, ${star.currentAlpha * 0.38})`);
          halo.addColorStop(0.5, `rgba(${star.color}, ${star.currentAlpha * 0.12})`);
          halo.addColorStop(1, `rgba(${star.color}, 0)`);

          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(drawX, drawY, haloRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw starlight core
        ctx.fillStyle = `rgba(${star.color}, ${star.currentAlpha})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hasMounted]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full select-none overflow-hidden bg-[#04060a]"
      style={{ isolation: "isolate" }}
    >
      {/* ── 1. Base Cosmic Navy / Charcoal Foundation ─────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 18%, #070c18 0%, #050811 40%, #030509 85%, #020306 100%)",
        }}
      />

      {/* ── 2. Subtle Volumetric Blue / Purple Nebula Clouds ─────────────── */}
      {/* Upper-right celestial blue nebula wash */}
      <motion.div
        className="absolute -top-[25%] -right-[15%] h-[75vw] w-[75vw] max-w-[1200px] max-h-[1200px] rounded-full opacity-[0.08]"
        animate={{
          x: [0, 24, -12, 0],
          y: [0, -18, 16, 0],
          scale: [1, 1.05, 0.97, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.45) 45%, rgba(29, 78, 216, 0) 72%)",
          filter: "blur(90px)",
        }}
      />

      {/* Center-left cosmic purple/indigo nebula */}
      <motion.div
        className="absolute top-[20%] -left-[20%] h-[80vw] w-[80vw] max-w-[1300px] max-h-[1300px] rounded-full opacity-[0.07]"
        animate={{
          x: [0, -20, 15, 0],
          y: [0, 25, -15, 0],
          scale: [1, 0.96, 1.06, 1],
        }}
        transition={{
          duration: 38,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.75) 0%, rgba(91, 33, 182, 0.4) 45%, rgba(67, 56, 202, 0) 72%)",
          filter: "blur(100px)",
        }}
      />

      {/* Low-center subtle midnight sapphire dust */}
      <motion.div
        className="absolute -bottom-[20%] left-[20%] h-[65vw] w-[65vw] max-w-[1000px] max-h-[1000px] rounded-full opacity-[0.05]"
        animate={{
          scale: [1, 1.08, 0.95, 1],
          opacity: [0.05, 0.07, 0.04, 0.05],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(30, 58, 138, 0.7) 0%, rgba(30, 27, 75, 0.35) 50%, transparent 75%)",
          filter: "blur(80px)",
        }}
      />

      {/* ── 3. High-Performance Particle Canvas (Stars & Time Drift) ─────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />

      {/* ── 4. Analog 35mm Film Grain Texture ────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.032] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── 5. Deep Space Vignette (Preserves Text Focus & High Contrast) ──── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isFinal ? 0.85 : 1 }}
        transition={{ duration: 2.5 }}
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 32%, rgba(4, 6, 11, 0.55) 70%, rgba(2, 3, 6, 0.92) 88%, rgba(1, 2, 4, 0.99) 100%)",
        }}
      />
    </div>
  );
});

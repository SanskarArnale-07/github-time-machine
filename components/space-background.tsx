"use client";

import React, { useEffect, useRef, useState, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

// ── Theme Color Configurations ───────────────────────────────────────────────
const THEME_CONFIGS: Record<
  SpaceTheme,
  {
    nebulaPrimary: string;
    nebulaSecondary: string;
    nebulaDust: string;
    starMultiplier: number;
    haloBrightness: number;
  }
> = {
  default: {
    nebulaPrimary: "radial-gradient(circle, rgba(59, 130, 246, 0.55) 0%, rgba(37, 99, 235, 0.28) 45%, transparent 72%)",
    nebulaSecondary: "radial-gradient(circle, rgba(124, 58, 237, 0.50) 0%, rgba(91, 33, 182, 0.25) 45%, transparent 72%)",
    nebulaDust: "radial-gradient(circle, rgba(30, 58, 138, 0.45) 0%, rgba(30, 27, 75, 0.22) 50%, transparent 75%)",
    starMultiplier: 1.0,
    haloBrightness: 0.38,
  },
  architecture: {
    // Deeper blue / royal violet atmosphere
    nebulaPrimary: "radial-gradient(circle, rgba(37, 99, 235, 0.60) 0%, rgba(29, 78, 216, 0.32) 45%, transparent 72%)",
    nebulaSecondary: "radial-gradient(circle, rgba(109, 40, 217, 0.55) 0%, rgba(76, 29, 149, 0.28) 45%, transparent 72%)",
    nebulaDust: "radial-gradient(circle, rgba(30, 27, 75, 0.55) 0%, rgba(17, 24, 39, 0.3) 50%, transparent 75%)",
    starMultiplier: 1.0,
    haloBrightness: 0.35,
  },
  performance: {
    // Cooler cyan-blue glow
    nebulaPrimary: "radial-gradient(circle, rgba(6, 182, 212, 0.55) 0%, rgba(14, 116, 144, 0.28) 45%, transparent 72%)",
    nebulaSecondary: "radial-gradient(circle, rgba(30, 64, 175, 0.50) 0%, rgba(30, 58, 138, 0.25) 45%, transparent 72%)",
    nebulaDust: "radial-gradient(circle, rgba(15, 23, 42, 0.6) 0%, rgba(8, 47, 73, 0.3) 50%, transparent 75%)",
    starMultiplier: 1.05,
    haloBrightness: 0.42,
  },
  beginning: {
    // Slightly brighter cosmic dawn glow
    nebulaPrimary: "radial-gradient(circle, rgba(129, 140, 248, 0.65) 0%, rgba(99, 102, 241, 0.35) 45%, transparent 72%)",
    nebulaSecondary: "radial-gradient(circle, rgba(168, 85, 247, 0.55) 0%, rgba(139, 92, 246, 0.28) 45%, transparent 72%)",
    nebulaDust: "radial-gradient(circle, rgba(49, 46, 129, 0.5) 0%, rgba(67, 56, 202, 0.25) 50%, transparent 75%)",
    starMultiplier: 1.1,
    haloBrightness: 0.45,
  },
  refactor: {
    // Muted violet atmosphere
    nebulaPrimary: "radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(109, 40, 217, 0.22) 45%, transparent 72%)",
    nebulaSecondary: "radial-gradient(circle, rgba(76, 29, 149, 0.42) 0%, rgba(55, 48, 163, 0.20) 45%, transparent 72%)",
    nebulaDust: "radial-gradient(circle, rgba(24, 24, 27, 0.55) 0%, rgba(39, 39, 42, 0.25) 50%, transparent 75%)",
    starMultiplier: 0.95,
    haloBrightness: 0.32,
  },
  milestone: {
    // Slightly stronger radial celestial glow
    nebulaPrimary: "radial-gradient(circle, rgba(147, 51, 234, 0.65) 0%, rgba(126, 34, 206, 0.35) 45%, transparent 72%)",
    nebulaSecondary: "radial-gradient(circle, rgba(59, 130, 246, 0.60) 0%, rgba(37, 99, 235, 0.32) 45%, transparent 72%)",
    nebulaDust: "radial-gradient(circle, rgba(79, 70, 229, 0.55) 0%, rgba(55, 48, 163, 0.3) 50%, transparent 75%)",
    starMultiplier: 1.15,
    haloBrightness: 0.48,
  },
  streak: {
    // Subtle star-density & starlight increase
    nebulaPrimary: "radial-gradient(circle, rgba(56, 189, 248, 0.55) 0%, rgba(37, 99, 235, 0.3) 45%, transparent 72%)",
    nebulaSecondary: "radial-gradient(circle, rgba(99, 102, 241, 0.50) 0%, rgba(79, 70, 229, 0.25) 45%, transparent 72%)",
    nebulaDust: "radial-gradient(circle, rgba(30, 58, 138, 0.5) 0%, rgba(15, 23, 42, 0.25) 50%, transparent 75%)",
    starMultiplier: 1.25,
    haloBrightness: 0.46,
  },
};

/**
 * Reusable Global Cinematic Deep-Space Background.
 * 
 * Used across the landing page, documentary replay, CTA bands, and legal routes.
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
}: SpaceBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const dimensionsRef = useRef<{ width: number; height: number; dpr: number }>({
    width: 0,
    height: 0,
    dpr: 1,
  });

  const [hasMounted, setHasMounted] = useState(false);
  const config = useMemo(() => THEME_CONFIGS[theme] || THEME_CONFIGS.default, [theme]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Canvas starfield initialization & render loop
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

    const initStars = (w: number, h: number) => {
      const baseCount = Math.floor((w * h) / 13500);
      const targetCount = Math.min(
        130,
        Math.max(65, Math.floor(baseCount * config.starMultiplier))
      );

      const stars: Star[] = [];
      for (let i = 0; i < targetCount; i++) {
        const rand = Math.random();
        let tier: 1 | 2 | 3 = 1;
        let radius = 0.5 + Math.random() * 0.35;
        let baseAlpha = 0.14 + Math.random() * 0.16;
        let speedX = -0.012 - Math.random() * 0.015;
        let speedY = -0.022 - Math.random() * 0.020;

        if (rand > 0.90) {
          tier = 3;
          radius = 1.5 + Math.random() * 0.5;
          baseAlpha = 0.65 + Math.random() * 0.25;
          speedX = -0.035 - Math.random() * 0.03;
          speedY = -0.055 - Math.random() * 0.04;
        } else if (rand > 0.55) {
          tier = 2;
          radius = 0.9 + Math.random() * 0.35;
          baseAlpha = 0.30 + Math.random() * 0.22;
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

    const handleMouseMove = (e: MouseEvent) => {
      const { width: w, height: h } = dimensionsRef.current;
      if (w <= 0 || h <= 0) return;
      mouseTargetRef.current = {
        x: (e.clientX / w - 0.5) * 2,
        y: (e.clientY / h - 0.5) * 2,
      };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

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
      const delta = Math.min(time - lastTimeRef.current, 64);
      lastTimeRef.current = time;

      const { width: w, height: h, dpr } = dimensionsRef.current;
      if (w === 0 || h === 0) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.035;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.035;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const stars = starsRef.current;
      const speedMultiplier = delta / 16.666;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

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

        if (star.tier === 3) {
          const haloRadius = star.radius * 3.2;
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
  }, [hasMounted, showStars, config]);

  const positionClass = variant === "fixed" ? "fixed inset-0" : "absolute inset-0";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none ${positionClass} -z-10 h-full w-full select-none overflow-hidden bg-[#071426] ${className}`}
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

      {/* ── 2. Subtle Volumetric Blue / Purple Nebula Clouds ─────────────── */}
      {showNebula && (
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Upper-right celestial nebula wash */}
            <motion.div
              className="absolute -top-[25%] -right-[15%] h-[75vw] w-[75vw] max-w-[1200px] max-h-[1200px] rounded-full opacity-[0.14]"
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
                background: config.nebulaPrimary,
                filter: "blur(90px)",
              }}
            />

            {/* Center-left cosmic purple/indigo nebula */}
            <motion.div
              className="absolute top-[20%] -left-[20%] h-[80vw] w-[80vw] max-w-[1300px] max-h-[1300px] rounded-full opacity-[0.13]"
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
                background: config.nebulaSecondary,
                filter: "blur(100px)",
              }}
            />

            {/* Low-center subtle sapphire/space dust */}
            <motion.div
              className="absolute -bottom-[20%] left-[20%] h-[65vw] w-[65vw] max-w-[1000px] max-h-[1000px] rounded-full opacity-[0.10]"
              animate={{
                scale: [1, 1.08, 0.95, 1],
                opacity: [0.10, 0.14, 0.08, 0.10],
              }}
              transition={{
                duration: 26,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: config.nebulaDust,
                filter: "blur(80px)",
              }}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── 3. High-Performance Particle Canvas (Stars & Time Drift) ─────── */}
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

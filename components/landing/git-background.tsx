"use client";

import { useEffect, useRef, useState } from "react";

/**
 * GitBackground
 * 
 * Optimized Architecture:
 * - If SpaceBackground is already active on the page, skips running a duplicate
 *   canvas RAF loop to ensure two full-screen canvases never run simultaneously.
 * - When running standalone:
 *   - Precomputes gradients and eliminates in-loop garbage allocation.
 *   - Uses IntersectionObserver to pause the animation when off-screen.
 *   - Respects prefers-reduced-motion with a single static paint.
 */
export function GitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasGlobalSpaceBg, setHasGlobalSpaceBg] = useState(false);

  useEffect(() => {
    // Check if global SpaceBackground is already handling background visuals
    if (typeof document !== "undefined" && document.querySelector("[data-space-background]")) {
      setHasGlobalSpaceBg(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number | null = null;
    let width = 0;
    let height = 0;
    let isVisible = true;

    // Mouse tracking for subtle parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isActive: false };

    // Floating Light Dust
    interface Dust {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      z: number;
    }
    const dustParticles: Dust[] = [];
    
    // Git Commits and Branches
    interface CommitNode {
      id: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      isMain: boolean;
      connections: number[];
      z: number;
    }
    let commitNodes: CommitNode[] = [];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      dustParticles.length = 0;
      const dustCount = Math.min(Math.floor((width * height) / 18000), 40);
      for (let i = 0; i < dustCount; i++) {
        dustParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.04,
          vy: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.03 - 0.015,
          radius: Math.random() * 0.8 + 0.3,
          alpha: Math.random() * 0.20 + 0.04,
          z: Math.random() * 2 + 1,
        });
      }

      commitNodes = [];
      const nodeCount = Math.min(Math.floor(width / 75), 18);
      for (let i = 0; i < nodeCount; i++) {
        const isMain = Math.random() > 0.6;
        commitNodes.push({
          id: `node-${i}`,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.035,
          vy: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.035 - 0.008,
          radius: isMain ? 3.5 : 2,
          isMain,
          connections: [],
          z: isMain ? 1 : 1.2,
        });
      }

      for (let i = 0; i < commitNodes.length; i++) {
        const node = commitNodes[i];
        const distances = commitNodes
          .map((n, idx) => ({ idx, dist: Math.hypot(n.x - node.x, n.y - node.y) }))
          .filter(d => d.idx !== i && d.dist < 320)
          .sort((a, b) => a.dist - b.dist);
        
        const connectionCount = Math.floor(Math.random() * 2) + 1;
        for (let j = 0; j < Math.min(connectionCount, distances.length); j++) {
          const targetIdx = distances[j].idx;
          if (!node.connections.includes(targetIdx) && !commitNodes[targetIdx].connections.includes(i)) {
            node.connections.push(targetIdx);
          }
        }
      }
    };

    window.addEventListener("resize", init);
    init();

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      if (!mouse.isActive) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.isActive = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.isActive = false;
    };

    if (!prefersReducedMotion) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    }

    // IntersectionObserver: Pause when hero is out of viewport
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (entry.isIntersecting && !animationFrameId && !prefersReducedMotion) {
            animationFrameId = requestAnimationFrame(draw);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    const draw = () => {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      if (mouse.isActive && !prefersReducedMotion) {
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
      }

      const mouseOffsetX = mouse.isActive ? (mouse.x - width / 2) : 0;
      const mouseOffsetY = mouse.isActive ? (mouse.y - height / 2) : 0;

      ctx.clearRect(0, 0, width, height);

      // Draw dust
      ctx.fillStyle = "#ffffff";
      dustParticles.forEach(dust => {
        if (!prefersReducedMotion) {
          dust.x += dust.vx;
          dust.y += dust.vy;
          if (dust.x < 0) dust.x = width;
          if (dust.x > width) dust.x = 0;
          if (dust.y < 0) dust.y = height;
          if (dust.y > height) dust.y = 0;
        }

        const px = dust.x + (mouseOffsetX * -0.015 / dust.z);
        const py = dust.y + (mouseOffsetY * -0.015 / dust.z);

        ctx.globalAlpha = dust.alpha;
        ctx.beginPath();
        ctx.arc(px, py, dust.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Draw Git Branch Lines — zero per-frame gradient allocations
      ctx.lineWidth = 1;
      commitNodes.forEach((node) => {
        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }

        const nx = node.x + (mouseOffsetX * -0.03 / node.z);
        const ny = node.y + (mouseOffsetY * -0.03 / node.z);

        node.connections.forEach(targetIdx => {
          const target = commitNodes[targetIdx];
          if (!target) return;
          const tx = target.x + (mouseOffsetX * -0.03 / target.z);
          const ty = target.y + (mouseOffsetY * -0.03 / target.z);

          ctx.beginPath();
          ctx.moveTo(nx, ny);
          const midY = ny + (ty - ny) / 2;
          ctx.bezierCurveTo(nx, midY, tx, midY, tx, ty);
          
          // Use pre-set solid color instead of creating new linear gradient per line per frame
          ctx.strokeStyle = node.isMain && target.isMain 
            ? "rgba(212, 168, 83, 0.22)" 
            : "rgba(88, 166, 255, 0.10)";
          ctx.stroke();
        });

        // Draw commit node
        ctx.fillStyle = node.isMain ? "rgba(212, 168, 83, 0.85)" : "rgba(88, 166, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    if (prefersReducedMotion) {
      draw();
    } else {
      animationFrameId = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (observer) observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // When global SpaceBackground is handling the canvas, GitBackground does not mount a duplicate canvas loop
  if (hasGlobalSpaceBg) {
    return (
      <div 
        ref={containerRef}
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Static soft ambient atmospheric glows (Zero GPU canvas cost) */}
        <div 
          className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(212, 168, 83, 0.15) 0%, transparent 70%)",
          }}
        />
        <div 
          className="absolute top-[30%] right-[10%] h-[600px] w-[600px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)",
          }}
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      aria-hidden="true" 
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />
    </div>
  );
}

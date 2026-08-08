"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseX: number;
  baseY: number;
  isCommit: boolean;
  hash: string;
}

export function GitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isActive: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const generateHash = () => Math.random().toString(16).substring(2, 9);

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(window.innerWidth / 20, 60); // slightly fewer for cinematic

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.1, // slower drift
          vy: (Math.random() - 0.5) * 0.1,
          radius: Math.random() > 0.85 ? 3 : 1.5,
          isCommit: Math.random() > 0.85,
          hash: generateHash(),
        });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.isActive = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      // Smooth mouse interpolation
      if (mouseRef.current.isActive) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
      }

      // Clear canvas with deep charcoal background
      ctx.fillStyle = "#050507";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint grid with very slow parallax
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 50;
      
      const pX = mouseRef.current.isActive ? (mouseRef.current.x - canvas.width / 2) * 0.015 : 0;
      const pY = mouseRef.current.isActive ? (mouseRef.current.y - canvas.height / 2) * 0.015 : 0;

      ctx.beginPath();
      for (let x = (pX % gridSize) - gridSize; x < canvas.width + gridSize; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = (pY % gridSize) - gridSize; y < canvas.height + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Update and draw particles
      particles.forEach((p, i) => {
        // Drift
        p.baseX += p.vx;
        p.baseY += p.vy;

        // Wrap around edges
        if (p.baseX < 0) p.baseX = canvas.width;
        if (p.baseX > canvas.width) p.baseX = 0;
        if (p.baseY < 0) p.baseY = canvas.height;
        if (p.baseY > canvas.height) p.baseY = 0;

        // Parallax cursor reactivity (gentle push)
        let targetX = p.baseX;
        let targetY = p.baseY;

        if (mouseRef.current.isActive) {
          const dx = mouseRef.current.x - p.baseX;
          const dy = mouseRef.current.y - p.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 300) {
            const force = (300 - dist) / 300;
            targetX -= dx * force * 0.05;
            targetY -= dy * force * 0.05;
          }
        }

        // Smooth interpolation
        p.x += (targetX - p.x) * 0.05;
        p.y += (targetY - p.y) * 0.05;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            
            let mouseOpacityMultiplier = 1;
            if (mouseRef.current.isActive) {
              const midX = (p.x + p2.x) / 2;
              const midY = (p.y + p2.y) / 2;
              const mDx = midX - mouseRef.current.x;
              const mDy = midY - mouseRef.current.y;
              const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
              if (mDist < 250) {
                mouseOpacityMultiplier = 1 + (1 - mDist / 250) * 2.5;
              }
            }
            
            // Dynamic opacity based on distance and mouse proximity
            const opacity = Math.min(1, (1 - dist / 150) * 0.15 * mouseOpacityMultiplier);
            ctx.strokeStyle = `rgba(161, 161, 170, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        if (p.isCommit) {
          ctx.fillStyle = "#D4A853"; // Warm Gold accent
          ctx.shadowColor = "rgba(212, 168, 83, 0.8)";
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = "rgba(245, 242, 234, 0.3)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();

        // Draw hash text for commit nodes
        if (p.isCommit) {
          ctx.font = "10px var(--font-mono, monospace)";
          ctx.fillStyle = "rgba(245, 242, 234, 0.4)";
          ctx.fillText(p.hash, p.x + 10, p.y + 4);
        }
      });

      // (Removed atmospheric gradient to eliminate AI-generated look)

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 h-full w-full opacity-60"
      style={{ background: "#050507" }}
    />
  );
}

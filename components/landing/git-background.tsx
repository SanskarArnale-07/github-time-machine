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
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });

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
      const particleCount = Math.min(window.innerWidth / 15, 80); // Responsive count

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: Math.random() > 0.8 ? 3 : 1.5,
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
      mouseRef.current = { x: e.clientX, y: e.clientY, isActive: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      // Clear canvas with very dark charcoal background
      ctx.fillStyle = "#09090B";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint grid
      ctx.strokeStyle = "rgba(63, 63, 70, 0.15)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      
      // We apply subtle parallax to the grid based on mouse
      const pX = mouseRef.current.isActive ? (mouseRef.current.x - canvas.width / 2) * 0.02 : 0;
      const pY = mouseRef.current.isActive ? (mouseRef.current.y - canvas.height / 2) * 0.02 : 0;

      ctx.beginPath();
      for (let x = (pX % gridSize); x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = (pY % gridSize); y < canvas.height; y += gridSize) {
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

        // Parallax cursor reactivity
        let targetX = p.baseX;
        let targetY = p.baseY;

        if (mouseRef.current.isActive) {
          const dx = mouseRef.current.x - p.baseX;
          const dy = mouseRef.current.y - p.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            // Push away slightly
            const force = (200 - dist) / 200;
            targetX -= dx * force * 0.1;
            targetY -= dy * force * 0.1;
          }
        }

        // Smooth interpolation for mouse effect
        p.x += (targetX - p.x) * 0.1;
        p.y += (targetY - p.y) * 0.1;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Dynamic opacity based on distance
            const opacity = (1 - dist / 120) * 0.25;
            ctx.strokeStyle = `rgba(63, 63, 70, ${opacity})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        if (p.isCommit) {
          ctx.fillStyle = "#D4A853"; // Warm Gold accent
          ctx.shadowColor = "#D4A853";
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = "rgba(250, 250, 250, 0.22)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();

        // Draw hash text for commit nodes
        if (p.isCommit) {
          ctx.font = "9px monospace";
          ctx.fillStyle = "rgba(161, 161, 170, 0.4)";
          ctx.fillText(p.hash, p.x + 8, p.y + 3);
        }
      });

      // Draw atmospheric light gradients
      const bgGrad1 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.8, 0,
        canvas.width * 0.2, canvas.height * 0.8, canvas.width * 0.6
      );
      bgGrad1.addColorStop(0, 'rgba(212, 168, 83, 0.04)'); // Warm amber
      bgGrad1.addColorStop(1, 'rgba(9, 9, 11, 0)');
      
      const bgGrad2 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.2, 0,
        canvas.width * 0.8, canvas.height * 0.2, canvas.width * 0.6
      );
      bgGrad2.addColorStop(0, 'rgba(99, 102, 241, 0.03)'); // Indigo hue
      bgGrad2.addColorStop(1, 'rgba(9, 9, 11, 0)');

      ctx.fillStyle = bgGrad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = bgGrad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
      className="absolute inset-0 -z-10 h-full w-full"
      style={{ background: "#09090B" }}
    />
  );
}

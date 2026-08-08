"use client";

import { useEffect, useRef } from "react";

export function GitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // alpha: false optimizes rendering since we draw an opaque background
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Mouse tracking for subtle parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isActive: false };

    // --- ENTITIES ---
    // 1. Light Blooms (Background atmospheric lights)
    const blooms = [
      { x: 0.25, y: 0.4, radius: 600, color: "rgba(245, 158, 11, 0.04)", vx: 0.015, vy: 0.01 }, // Amber behind hero
      { x: 0.75, y: 0.6, radius: 600, color: "rgba(59, 130, 246, 0.04)", vx: -0.015, vy: -0.01 }, // Cool blue behind content
    ];

    // 2. Floating Light Dust
    interface Dust {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      z: number; // depth for parallax
    }
    const dustParticles: Dust[] = [];
    
    // 3. Git Commits and Branches
    interface CommitNode {
      id: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      isMain: boolean;
      hash: string;
      connections: number[]; // indices of other nodes to connect to
      z: number; // For parallax
    }
    let commitNodes: CommitNode[] = [];

    const generateHash = () => Math.random().toString(16).substring(2, 9);

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Init dust (depth fog)
      dustParticles.length = 0;
      const dustCount = Math.floor(width * height / 12000); // Responsive count
      for (let i = 0; i < dustCount; i++) {
        dustParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1 - 0.05, // Slight upward drift
          radius: Math.random() * 1.2 + 0.3,
          alpha: Math.random() * 0.3 + 0.05,
          z: Math.random() * 2 + 1, // Depth 1 to 3
        });
      }

      // Init Commits
      commitNodes = [];
      const nodeCount = Math.min(Math.floor(width / 60), 25); // Keeps graph readable
      
      for (let i = 0; i < nodeCount; i++) {
        const isMain = Math.random() > 0.6;
        commitNodes.push({
          id: `node-${i}`,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.04,
          vy: (Math.random() - 0.5) * 0.04 - 0.01,
          radius: isMain ? 3.5 : 2,
          isMain,
          hash: generateHash(),
          connections: [],
          z: isMain ? 1 : 1.2, // Main branch nodes are slightly closer
        });
      }

      // Create branch connections (structured like a git graph)
      for (let i = 0; i < commitNodes.length; i++) {
        const node = commitNodes[i];
        // Connect nodes that are relatively close, favoring vertical/diagonal connections
        const distances = commitNodes
          .map((n, idx) => ({ idx, dist: Math.hypot(n.x - node.x, n.y - node.y) }))
          .filter(d => d.idx !== i && d.dist < 350)
          .sort((a, b) => a.dist - b.dist);
        
        // Connect to nearest 1-2 nodes to form branches
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

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      // Smooth mouse interpolation for parallax
      if (mouse.isActive) {
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
      }

      const mouseOffsetX = mouse.isActive ? (mouse.x - width / 2) : 0;
      const mouseOffsetY = mouse.isActive ? (mouse.y - height / 2) : 0;

      // 1. Draw Background (Deep navy radial gradient)
      const bgGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      bgGradient.addColorStop(0, "#0b1a2e");
      bgGradient.addColorStop(1, "#07111f");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Gentle Light Blooms (Atmospheric)
      blooms.forEach(bloom => {
        // Very slow drifting
        bloom.x += bloom.vx / width;
        bloom.y += bloom.vy / height;
        if (bloom.x < -0.2 || bloom.x > 1.2) bloom.vx *= -1;
        if (bloom.y < -0.2 || bloom.y > 1.2) bloom.vy *= -1;

        // Subtle parallax on blooms
        const bx = bloom.x * width + (mouseOffsetX * -0.01);
        const by = bloom.y * height + (mouseOffsetY * -0.01);

        const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, bloom.radius);
        gradient.addColorStop(0, bloom.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(bx - bloom.radius, by - bloom.radius, bloom.radius * 2, bloom.radius * 2);
      });

      // 3. Draw Depth Fog / Dust
      ctx.fillStyle = "#ffffff";
      dustParticles.forEach(dust => {
        dust.x += dust.vx;
        dust.y += dust.vy;

        // Wrap around edges
        if (dust.x < 0) dust.x = width;
        if (dust.x > width) dust.x = 0;
        if (dust.y < 0) dust.y = height;
        if (dust.y > height) dust.y = 0;

        // Parallax offset based on dust depth
        const px = dust.x + (mouseOffsetX * -0.015 / dust.z);
        const py = dust.y + (mouseOffsetY * -0.015 / dust.z);

        ctx.globalAlpha = dust.alpha;
        ctx.beginPath();
        ctx.arc(px, py, dust.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset alpha for lines and nodes
      ctx.globalAlpha = 1;

      // 4. Draw Git Branch Lines
      ctx.lineWidth = 1;
      commitNodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Soft bounce off edges for nodes to maintain relative graph structure
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        const nx = node.x + (mouseOffsetX * -0.03 / node.z);
        const ny = node.y + (mouseOffsetY * -0.03 / node.z);

        node.connections.forEach(targetIdx => {
          const target = commitNodes[targetIdx];
          const tx = target.x + (mouseOffsetX * -0.03 / target.z);
          const ty = target.y + (mouseOffsetY * -0.03 / target.z);

          // S-Curve to simulate git branch graphs
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          
          const cp1x = nx;
          const cp1y = ny + (ty - ny) / 2;
          const cp2x = tx;
          const cp2y = ny + (ty - ny) / 2;
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx, ty);
          
          // Faint, fading lines
          const lineGradient = ctx.createLinearGradient(nx, ny, tx, ty);
          if (node.isMain && target.isMain) {
            lineGradient.addColorStop(0, "rgba(212, 168, 83, 0.2)");
            lineGradient.addColorStop(1, "rgba(212, 168, 83, 0.2)");
          } else {
            lineGradient.addColorStop(0, "rgba(212, 168, 83, 0.15)");
            lineGradient.addColorStop(1, "rgba(161, 161, 170, 0.05)");
          }
          
          ctx.strokeStyle = lineGradient;
          ctx.stroke();
        });
      });

      // 5. Draw Commit Nodes
      commitNodes.forEach(node => {
        const nx = node.x + (mouseOffsetX * -0.03 / node.z);
        const ny = node.y + (mouseOffsetY * -0.03 / node.z);

        if (node.isMain) {
          // Glow effect (performed efficiently without shadowBlur)
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = "#D4A853";
          ctx.beginPath();
          ctx.arc(nx, ny, node.radius * 3.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Core node
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#D4A853";
          ctx.beginPath();
          ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
          ctx.fill();

          // Hash Text
          ctx.globalAlpha = 0.5;
          ctx.font = "11px var(--font-mono, monospace)";
          ctx.fillStyle = "rgba(245, 242, 234, 0.7)";
          ctx.fillText(node.hash, nx + 8, ny + 3);
          ctx.globalAlpha = 1;
        } else {
          // Feature branch node
          ctx.fillStyle = "rgba(212, 168, 83, 0.5)";
          ctx.beginPath();
          ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-[#07111f]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />
      {/* Film Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      {/* Deep Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#07111f_120%)] opacity-90 pointer-events-none" />
    </div>
  );
}

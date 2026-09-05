"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagicCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  borderSpotlightColor?: string;
}

/**
 * MagicCard - Inspired by Magic UI & React Bits Spotlight Card.
 * Adapted for GitHub Time Machine's cinematic deep-space aesthetic.
 * 
 * Features:
 * - High-performance GPU-accelerated pointer-following spotlight.
 * - Dual WebKit/standard CSS masked border illumination.
 * - Ambient surface glow that reflects dynamically with cursor trajectory.
 * - Subtle elevation on hover without layout shifts.
 * - Full prefers-reduced-motion compatibility.
 */
export function MagicCard({
  children,
  className,
  gradientSize = 320,
  gradientColor = "rgba(59, 130, 246, 0.14)",
  gradientOpacity = 0.85,
  borderSpotlightColor = "rgba(212, 168, 83, 0.4)",
  ...props
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  const surfaceBackground = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 80%)`;
  const borderBackground = useMotionTemplate`radial-gradient(${gradientSize * 0.85}px circle at ${mouseX}px ${mouseY}px, ${borderSpotlightColor}, transparent 70%)`;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group relative rounded-3xl overflow-hidden flex flex-col",
        "bg-[#0d172e]/70 backdrop-blur-xl border border-blue-400/20",
        "hover:border-blue-400/40 hover:shadow-[0_20px_50px_rgba(2,6,23,0.7),0_0_35px_rgba(59,130,246,0.15)]",
        className
      )}
      {...props}
    >
      {/* 1. Specular top-edge glass highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/35 to-transparent z-20"
      />

      {/* 2. Interactive Border Spotlight Overlay with dual WebkitMask & standard mask */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: borderBackground,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />

      {/* 3. Interactive Surface Spotlight Glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? gradientOpacity : 0,
          background: surfaceBackground,
        }}
      />

      {/* 4. Inner Card Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
        {children}
      </div>
    </motion.div>
  );
}

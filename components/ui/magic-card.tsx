"use client";

import React, { useRef } from "react";
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
 * - Gentle specular border illumination.
 * - Subtle elevation on hover without disruptive tilt or layout shifts.
 * - Supports prefers-reduced-motion for accessibility.
 */
export function MagicCard({
  children,
  className,
  gradientSize = 280,
  gradientColor = "rgba(59, 130, 246, 0.12)",
  gradientOpacity = 0.8,
  borderSpotlightColor = "rgba(212, 168, 83, 0.25)",
  ...props
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const isHovered = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    isHovered.set(1);
  };

  const handleMouseLeave = () => {
    isHovered.set(0);
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  const surfaceBackground = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 80%)`;
  const borderBackground = useMotionTemplate`radial-gradient(${gradientSize * 0.75}px circle at ${mouseX}px ${mouseY}px, ${borderSpotlightColor}, transparent 70%)`;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group relative rounded-3xl overflow-hidden transition-all duration-300 flex flex-col",
        "bg-[#0d172e]/75 backdrop-blur-xl border border-blue-400/20",
        "hover:border-blue-400/40 hover:shadow-[0_20px_50px_rgba(2,6,23,0.65),0_0_35px_rgba(59,130,246,0.12)]",
        className
      )}
      {...props}
    >
      {/* Specular top-edge glass highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent z-20"
      />

      {/* Interactive Border Spotlight Overlay */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered,
          background: borderBackground,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />

      {/* Interactive Surface Spotlight Glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered,
          background: surfaceBackground,
        }}
      />

      {/* Inner Card Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
        {children}
      </div>
    </motion.div>
  );
}

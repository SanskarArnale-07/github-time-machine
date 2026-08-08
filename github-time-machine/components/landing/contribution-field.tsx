"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * ContributionField
 *
 * The hero's signature element. A field of squares modeled on GitHub's
 * contribution graph, but instead of showing a static year, it plays like
 * a filmstrip: columns light up in a slow wave from past to present, and a
 * brass "scan line" sweeps down through the grid — the time machine reading
 * the timeline. Reduced-motion users get a static, softly-lit grid.
 */

const COLUMNS = 26;
const ROWS = 7;

// GitHub's real four-level intensity scale, deepest to brightest.
const LEVELS = ["#0E4429", "#006D32", "#26A641", "#39D353"];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function ContributionField() {
  const grid = useMemo(() => {
    const cells: { level: number; delay: number; col: number }[] = [];
    for (let col = 0; col < COLUMNS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const r = seededRandom(col * 31 + row * 7 + 1);
        // Bias toward empty/low cells, like a real contribution graph
        const level =
          r > 0.86 ? 3 : r > 0.68 ? 2 : r > 0.45 ? 1 : 0;
        cells.push({ level, delay: col * 0.045 + row * 0.02, col });
      }
    }
    return cells;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Base grid */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.55]">
        <div
          className="grid gap-[6px]"
          style={{
            gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((cell, i) => (
            <motion.div
              key={i}
              className="h-[10px] w-[10px] rounded-[2px] sm:h-[13px] sm:w-[13px]"
              style={{
                backgroundColor:
                  cell.level === 0 ? "#161A1E" : LEVELS[cell.level],
              }}
              initial={{ opacity: cell.level === 0 ? 0.4 : 0.25 }}
              animate={
                cell.level === 0
                  ? {}
                  : {
                      opacity: [0.25, 1, 0.25],
                    }
              }
              transition={
                cell.level === 0
                  ? {}
                  : {
                      duration: 3.5,
                      repeat: Infinity,
                      delay: cell.delay,
                      ease: "easeInOut",
                    }
              }
            />
          ))}
        </div>
      </div>

      {/* Brass scan line sweeping top to bottom, like a time machine reading the log */}
      <motion.div
        className="absolute inset-x-0 h-40"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(217,142,57,0.16), transparent)",
        }}
        animate={{ y: ["-20%", "120%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette so the grid recedes into the page rather than competing with copy */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/70 to-ink" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-transparent to-ink" />
    </div>
  );
}

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base ink — a deep, slightly-blue black, like a terminal at 2am
        ink: {
          DEFAULT: "#0B0D0F",
          soft: "#101317",
          surface: "#14171A",
          border: "#20242A",
        },
        // GitHub's own contribution-square green — the data
        commit: {
          50: "#0E4429",
          100: "#006D32",
          200: "#26A641",
          300: "#39D353",
          glow: "#5CFF7D",
        },
        // Brass / amber — the time machine mechanism
        brass: {
          DEFAULT: "#D98E39",
          light: "#E3A857",
          dim: "#8A5C24",
        },
        ivory: "#F2F4F5",
        muted: "#8B949E",
      },
      fontFamily: {
        display: ["var(--font-instrument-serif)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        "scan-line": {
          "0%": { transform: "translateY(-10%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(110%)", opacity: "0" },
        },
        "square-pulse": {
          "0%, 100%": { opacity: "var(--min-o, 0.15)" },
          "50%": { opacity: "var(--max-o, 0.9)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "scan-line": "scan-line 8s ease-in-out infinite",
        "square-pulse": "square-pulse 4s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(217,142,57,0.10), transparent 70%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

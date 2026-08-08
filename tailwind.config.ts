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
        ink: {
          DEFAULT: "#0B1020", // Deep Navy background per Stage 1.5
          deep: "#070A14",
          soft: "#0F172A",
          surface: "#131C31",
          border: "#1E293B",
          card: "rgba(19, 28, 49, 0.75)",
        },
        navy: {
          DEFAULT: "#0B1020",
          deep: "#070A14",
          soft: "#0F172A",
          surface: "#131C31",
          border: "#1E293B",
          glow: "rgba(59, 130, 246, 0.15)",
        },
        cosmic: {
          blue: "#1D4ED8",
          cyan: "#38BDF8",
          indigo: "#6366F1",
          amber: "#F59E0B",
          gold: "#D4A853",
        },
        commit: {
          50: "#0E4429",
          100: "#006D32",
          200: "#26A641",
          300: "#39D353",
          glow: "#5CFF7D",
        },
        brass: {
          DEFAULT: "#D4A853",
          light: "#E3BC6E",
          dim: "#8A6D2F",
          glow: "rgba(212, 168, 83, 0.25)",
        },
        ivory: "#F2F0EB",
        muted: "#8B949E",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
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
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "particle-drift": {
          "0%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-20px) translateX(10px)" },
          "100%": { transform: "translateY(0px) translateX(0px)" },
        },
      },
      animation: {
        "scan-line": "scan-line 8s ease-in-out infinite",
        "square-pulse": "square-pulse 4s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "particle-drift": "particle-drift 12s ease-in-out infinite",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,168,83,0.12), transparent 70%)",
        "cosmic-radial":
          "radial-gradient(circle at 50% 30%, rgba(29, 78, 216, 0.18), rgba(212, 168, 83, 0.08) 45%, transparent 70%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

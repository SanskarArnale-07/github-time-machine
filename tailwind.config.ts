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
          DEFAULT: "#0B0D0F",
          soft: "#101317",
          surface: "#14171A",
          border: "#20242A",
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
      },
      animation: {
        "scan-line": "scan-line 8s ease-in-out infinite",
        "square-pulse": "square-pulse 4s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,168,83,0.10), transparent 70%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

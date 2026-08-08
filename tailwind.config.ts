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
          DEFAULT: '#0B0A09',  // charcoal black
          deep: '#060504',     // near-black
          soft: '#141210',     // deep graphite
          surface: '#1A1714',  // warm dark surface
          border: '#2A2520',   // warm border
          card: 'rgba(20, 18, 16, 0.85)',  // warm card
        },
        cosmic: {
          graphite: '#3F3F46',
          warm: '#C8C1B6',
          amber: '#F59E0B',
          gold: '#C9A86A',
        },
        commit: {
          50: '#18181B',
          100: '#27272A',
          200: '#C9A86A',
          300: '#D8B56C',
          glow: 'rgba(201, 168, 106, 0.4)',
        },
        brass: {
          DEFAULT: '#C9A86A',  // aged brass
          light: '#D8B56C',    // muted gold
          dim: '#7A6530',      // deep brass
          glow: 'rgba(201, 168, 106, 0.2)',
        },
        ivory: '#F5F1EA',
        muted: '#C8C1B6', // warm gray
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
        "pulse-glow": "pulse-glow 8s ease-in-out infinite",
        "particle-drift": "particle-drift 12s ease-in-out infinite",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,106,0.08), transparent 70%)",
        "cosmic-radial":
          "radial-gradient(circle at 50% 30%, rgba(201, 168, 106, 0.04), rgba(201, 168, 106, 0.02) 45%, transparent 70%)",
      },
      transitionDuration: {
        "150": "150ms", // hover
        "500": "500ms", // section
        "1000": "1000ms", // fade
        "2000": "2000ms", // bloom
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f6f7fb",
          900: "#0b0f1a",
        },
        earth: {
          50: "#faf7f2",
          100: "#f0e8d8",
          200: "#e0d0b0",
          300: "#c9b07a",
          400: "#b69550",
          500: "#a17d3a",
          600: "#8a6730",
          700: "#6e5028",
          800: "#5c4224",
          900: "#4e3822",
        },
        agri: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, 0.35)",
        "glass-lg": "0 12px 48px rgba(15, 23, 42, 0.45)",
        glow: "0 0 24px rgba(34, 197, 94, 0.3)",
      },
      backgroundImage: {
        aurora:
          "radial-gradient(60% 60% at 20% 0%, rgba(34, 197, 94, 0.2), transparent 60%), radial-gradient(50% 50% at 80% 10%, rgba(21, 128, 61, 0.2), transparent 60%), radial-gradient(40% 40% at 50% 80%, rgba(161, 125, 58, 0.15), transparent 60%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "gauge-fill": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "gauge-fill": "gauge-fill 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;

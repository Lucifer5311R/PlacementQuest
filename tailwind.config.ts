import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0A0A0A",
          lighter: "#1A1A1A",
          lightest: "#2A2A2A",
        },
        gold: {
          DEFAULT: "#D4AF37",
          bright: "#FFD700",
          dark: "#B8860B",
        },
        glass: "rgba(255, 255, 255, 0.05)",
        "zinc-850": "#222226",
        "zinc-650": "#4f4f56",
        "zinc-550": "#6b6b72",
      },
      animation: {
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

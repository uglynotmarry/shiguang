import type { Config } from "tailwindcss"

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d18",
        neonBlue: "#00D9FF",
        neonPurple: "#6A5CFF",
        neonPink: "#FF0080",
        mint: "#a6e7f0",
        blush: "#f7c6d6"
      },
      boxShadow: {
        glow: "0 0 20px rgba(0,217,255,.25), 0 0 40px rgba(106,92,255,.2)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config
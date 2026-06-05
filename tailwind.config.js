/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0d0d0f",
        s1: "#15151a",
        s2: "#1c1c23",
        s3: "#232330",
        bdr: "#2e2e3e",
        bdr2: "#3a3a50",
        gold: "#d4a843",
        goldd: "#b8912e",
        goldl: "#efc96a",
        amber: "#e07a3a",
        cream: "#ede0c8",
        muted: "#7a7a9a",
        ink: "#ddd8f0",
        grn: "#4caf7a",
        err: "#e05555",
        blue: "#4a8fff",
        purp: "#a06ee0",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #d4a843, #e07a3a)",
        "card-gradient":
          "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
      },
      animation: {
        pulse_slow: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(212,168,67,0.4), 0 4px 24px rgba(212,168,67,0.12)",
        "gold-lg":
          "0 0 0 1px rgba(212,168,67,0.5), 0 8px 40px rgba(212,168,67,0.2)",
        card: "0 2px 12px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

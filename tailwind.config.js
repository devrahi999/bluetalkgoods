/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ebeeff",
          100: "#d6ddff",
          200: "#b0bcff",
          300: "#8095ff",
          400: "#4d69ff",
          500: "#1A35FF", // New Theme Color
          600: "#0018e6",
          700: "#0010b3",
          800: "#000b80",
          900: "#00064d",
          950: "#000326",
        },
        accent: {
          50: "#fff8ed",
          100: "#ffefd4",
          200: "#ffdaa8",
          300: "#ffbe71",
          400: "#ff9838",
          500: "#ff7a10",
          600: "#f05f06",
          700: "#c74507",
          800: "#9e380e",
          900: "#7f300f",
        },
        dark: {
          900: "#0a0a0a",
          800: "#141414",
          700: "#1e1e1e",
          600: "#2a2a2a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 6px -1px rgba(0,0,0,0.04)",
        glow: "0 0 20px rgba(255,45,85,0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

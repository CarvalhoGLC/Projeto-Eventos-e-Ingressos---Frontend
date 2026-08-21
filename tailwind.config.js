/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12161F",
        ink2: "#1B212C",
        ink3: "#232B39",
        inkline: "#232B39",
        kraft: "#F1E7D0",
        kraftdark: "#E4D5B0",
        brass: "#C98A3E",
        brassdark: "#A66F2E",
        stampgreen: "#3E7A4F",
        stampred: "#B0413E",
        muted: "#8B93A3",
        mutedlight: "#C7CCD6",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      keyframes: {
        stampPop: {
          "0%": { transform: "scale(0.4) rotate(-8deg)", opacity: 0 },
          "60%": { transform: "scale(1.08) rotate(-8deg)", opacity: 1 },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: 1 },
        },
      },
      animation: {
        stampPop: "stampPop 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
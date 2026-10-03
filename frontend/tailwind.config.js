/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial studio palette approved for Vydea -- dark neutral
        // surfaces with a single warm amber accent, no neon.
        vydea: {
          bg: "#151517",
          panel: "#1c1c1e",
          panelLight: "#232326",
          border: "#2e2e31",
          text: "#f2f1ee",
          muted: "#9a9a9e",
          accent: "#d97a3f",
          accentHover: "#c96a30",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

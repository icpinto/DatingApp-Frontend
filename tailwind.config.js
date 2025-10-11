/**
 * Tailwind CSS configuration used for shared design tokens.
 * These tokens align with the MUI theme palette so future
 * utility classes stay visually consistent across the app.
 */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ec4899",
          50: "#fff1f8",
          100: "#ffe4f1",
          200: "#fecddf",
          300: "#fba4c6",
          400: "#f871b0",
          500: "#ec4899",
          600: "#db267d",
          700: "#be1a68",
          800: "#9b1555",
          900: "#7f1448",
        },
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5f5",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        accent: {
          DEFAULT: "#38bdf8",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
      },
      boxShadow: {
        elevated: "0 18px 38px -24px rgba(15, 23, 42, 0.45)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
};

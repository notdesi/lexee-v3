import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const uiEase = "cubic-bezier(0.32, 0.72, 0, 1)";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        violet: {
          50: "var(--violet-50)",
          100: "var(--violet-100)",
          200: "var(--violet-200)",
          300: "var(--violet-300)",
          400: "var(--violet-400)",
          500: "var(--violet-500)",
          600: "var(--violet-600)",
          700: "var(--violet-700)",
          800: "var(--violet-800)",
          900: "var(--violet-900)",
          950: "var(--violet-950)",
        },
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
          950: "var(--neutral-950)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-spectral)", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        spectral: ["var(--font-spectral)", "Georgia", "serif"],
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".ui-t-colors": {
          transitionProperty:
            "color, background-color, border-color, text-decoration-color, fill, stroke",
          transitionDuration: "150ms",
          transitionTimingFunction: uiEase,
        },
        ".ui-t-opacity": {
          transitionProperty: "opacity",
          transitionDuration: "200ms",
          transitionTimingFunction: uiEase,
        },
        ".ui-t-transform": {
          transitionProperty: "transform",
          transitionDuration: "200ms",
          transitionTimingFunction: uiEase,
        },
        ".ui-t-layout": {
          transitionProperty:
            "color, background-color, border-color, opacity, transform, box-shadow, border-radius, padding",
          transitionDuration: "200ms",
          transitionTimingFunction: uiEase,
        },
      });
    }),
  ],
};

export default config;

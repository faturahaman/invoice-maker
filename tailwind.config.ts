import type { Config } from "tailwindcss";

// Design tokens: "Swiss Modernism 2.0" — strict grid, high contrast
// black/white, single vivid accent, mathematical 8px spacing. Chosen for a
// sharp, editorial, no-decoration invoicing tool (deliberately not another
// soft-shadow SaaS dashboard).
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          900: "#0A0A0A",
          700: "#27272A",
        },
        accent: {
          DEFAULT: "#FF4405",
          50: "#FFF1EC",
          100: "#FFDCCC",
          600: "#FF4405",
          700: "#D93700",
        },
        background: "#FFFFFF",
        foreground: "#0A0A0A",
        muted: {
          DEFAULT: "#F4F4F5",
          foreground: "#52525B",
        },
        border: "#E4E4E7",
        destructive: {
          DEFAULT: "#DC2626",
          50: "#FEF2F2",
          600: "#DC2626",
          700: "#B91C1C",
        },
        success: {
          DEFAULT: "#16A34A",
          50: "#F0FDF4",
          600: "#16A34A",
        },
        ring: "#0A0A0A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Helvetica", "Arial", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "2px",
        md: "3px",
        lg: "4px",
        xl: "4px",
      },
      boxShadow: {
        none: "none",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;

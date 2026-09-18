import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        risk: {
          standard: {
            DEFAULT: "#10B981",
            bg: "#ECFDF5",
            border: "#A7F3D0",
            text: "#065F46",
          },
          worthlook: {
            DEFAULT: "#F59E0B",
            bg: "#FFFBEB",
            border: "#FDE68A",
            text: "#92400E",
          },
          negotiate: {
            DEFAULT: "#F97316",
            bg: "#FFEDD5",
            border: "#FDBA74",
            text: "#9A3412",
          },
          getadvice: {
            DEFAULT: "#EF4444",
            bg: "#FEF2F2",
            border: "#FCA5A5",
            text: "#991B1B",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;

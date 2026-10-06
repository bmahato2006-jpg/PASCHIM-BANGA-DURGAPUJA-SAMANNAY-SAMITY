import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFDF9",
        foreground: "#2B1A12",
        sindoor: {
          50: "#FFF1F1",
          100: "#FFE1E2",
          200: "#FFC7C9",
          300: "#FFA0A4",
          400: "#F8656B",
          500: "#D9222A", // Sindoor vermillion primary
          600: "#BC141B",
          700: "#9A0E14",
          800: "#7C1014",
          900: "#5D1013",
          DEFAULT: "#D9222A",
        },
        marigold: {
          50: "#FFF8ED",
          100: "#FFEECE",
          200: "#FFDA9B",
          300: "#FFC260",
          400: "#FFA32B",
          500: "#F58220", // Marigold orange primary
          600: "#D6610A",
          700: "#AA450A",
          800: "#86360F",
          900: "#6F2D10",
          DEFAULT: "#F58220",
        },
        gold: {
          50: "#FCF9EE",
          100: "#F8F1D2",
          200: "#F0DF9E",
          300: "#E7CA6A",
          400: "#DFB23D",
          500: "#D49B24",
          600: "#B87A1A",
          DEFAULT: "#DFB23D",
        },
        festive: {
          cream: "#FFFDF9",
          pearl: "#FBF7F0",
          sand: "#F4EDE2",
          card: "#FFFFFF",
          border: "rgba(229, 215, 195, 0.6)",
        },
      },
      fontFamily: {
        serif: ["var(--font-cinzel)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(217, 34, 42, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(245, 130, 32, 0.16)',
        'festive': '0 10px 30px -5px rgba(217, 34, 42, 0.25)',
        'gold-glow': '0 0 25px rgba(245, 130, 32, 0.35)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-diya': 'floatDiya 8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatDiya: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(10px, -15px) scale(1.05)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 4px rgba(245,130,32,0.4))' },
          '100%': { filter: 'drop-shadow(0 0 16px rgba(217,34,42,0.7))' },
        },
        slideUp: {
          '0%': { transform: 'translateY(60px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    // data/ files don't contain Tailwind classes — kept for completeness
    './src/data/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand accent: intelligence cyan ──────────────────────
        accent: {
          DEFAULT: '#22D3EE',
          dim: '#0891B2',
        },
        // ── Semantic status ───────────────────────────────────────
        safe:     '#10B981',
        warning:  '#F59E0B',
        critical: '#EF4444',
        info:     '#3B82F6',
        // ── Background surface hierarchy ─────────────────────────
        surface: {
          base:     '#080C18',
          card:     '#0E1422',
          elevated: '#141B2D',
          overlay:  '#1A2236',
        },
      },
      fontFamily: {
        // Applied via next/font CSS variable in root layout
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          50: '#eef2f7',
          100: '#d2dae6',
          200: '#a8b6cc',
          300: '#7890b0',
          400: '#4a6491',
          500: '#2d4a73',
          600: '#1e3559',
          700: '#152844',
          800: '#0f1e34',
          900: '#0a1626',
          950: '#060f1c',
        },
        accent: {
          50: '#e0f0ff',
          100: '#b3d9ff',
          200: '#80c0ff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0073eb',
          600: '#005bc4',
          700: '#00449d',
          800: '#002e76',
          900: '#00174f',
        },
        tealx: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        amberx: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        redx: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 4s linear infinite',
        'blink': 'blink 1.5s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};

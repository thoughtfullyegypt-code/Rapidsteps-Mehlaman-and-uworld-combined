/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'navy-DEFAULT': '#16236E',
        'orange-DEFAULT': '#FF8C1A',
        navy: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          400: '#4F6EF7',
          500: '#2A3FB5',
          DEFAULT: '#16236E',
          dark: '#0F1854',
          700: '#0F1854',
          800: '#111B33',
          900: '#0B1120',
          950: '#050814',
        },
        orange: {
          light: '#FFF4E5',
          border: '#FFD29D',
          DEFAULT: '#FF8C1A',
          hover:  '#FFA23F',
          rust:   '#C2550A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      boxShadow: {
        'glow-orange': '0 0 40px rgba(255,140,26,0.35)',
        'glow-navy':   '0 0 40px rgba(30,42,138,0.4)',
        'card':        '0 10px 30px -5px rgba(15,23,42,0.05), 0 0 0 1px rgba(226,232,240,0.8)',
        'card-hover':  '0 20px 50px -10px rgba(15,23,42,0.12), 0 0 0 1px rgba(30,42,138,0.2)',
      },
      animation: {
        'pulse-led':   'pulseLed 2s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'draw-path':   'drawPath 1.2s ease forwards',
        'bloom-node':  'bloomNode 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-up':     'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in':    'slideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-out':   'slideOut 0.2s cubic-bezier(0.4,0,1,1) forwards',
        'correct':     'correctPulse 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'incorrect':   'incorrectShake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) forwards',
        'count-up':    'countUp 0.1s ease forwards',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        pulseLed: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.3', transform: 'scale(0.75)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drawPath: {
          from: { strokeDashoffset: '1' },
          to:   { strokeDashoffset: '0' },
        },
        bloomNode: {
          from: { transform: 'scale(0.6)', opacity: '0' },
          to:   { transform: 'scale(1)',   opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideOut: {
          from: { opacity: '1', transform: 'translateY(0)' },
          to:   { opacity: '0', transform: 'translateY(100%)' },
        },
        correctPulse: {
          '0%':   { transform: 'scale(1)',    backgroundColor: 'transparent' },
          '50%':  { transform: 'scale(1.02)', backgroundColor: 'rgba(16,185,129,0.15)' },
          '100%': { transform: 'scale(1)',    backgroundColor: 'rgba(16,185,129,0.1)' },
        },
        incorrectShake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-6px)' },
          '40%':     { transform: 'translateX(6px)' },
          '60%':     { transform: 'translateX(-4px)' },
          '80%':     { transform: 'translateX(4px)' },
        },
      },
      transitionTimingFunction: {
        'spring':     'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'standard':   'cubic-bezier(0.22, 1, 0.36, 1)',
        'emphasized': 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
        'exit':       'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },
    },
  },
  plugins: [],
}

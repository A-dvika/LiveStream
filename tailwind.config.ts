import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        dark: {
          1: '#1C1F2E',
          2: '#161925',
          3: '#252A41',
          4: '#1E2757',
        },
        blue: {
          1: '#0E78F9',
        },
        sky: {
          1: '#C9DDFF',
          2: '#ECF0FF',
          3: '#F5FCFF',
        },
        orange: {
          1: '#FF742E',
        },
        purple: {
          1: '#830EF9',
        },
        yellow: {
          1: '#F9A90E', // Existing yellow
          2: '#FFD700', // Brighter yellow for active states
        },
        lavender: {
          50: '#F4F1F8', // Light lavender
          100: '#E6E0F0', // Slightly darker lavender
          200: '#D5CEE8', // Medium lavender
          300: '#C1B8E0', // Darker lavender
        },
        white: '#FFFFFF', // Pure white
      },
      backgroundImage: {
        hero: "url('/images/hero-background.png')",
        'gradient-lavender-yellow': 'linear-gradient(135deg, #E6E6FA 0%, #FFD700 100%)',
        'gradient-yellow-white': 'linear-gradient(90deg, #FFD700 0%, #FFFFFF 100%)',
        'gradient-lavender-white': 'linear-gradient(180deg, #E6E6FA 0%, #FFFFFF 100%)',
        'gradient-radial-lavender': 'radial-gradient(circle, #E6E6FA 30%, #FFFFFF 100%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;

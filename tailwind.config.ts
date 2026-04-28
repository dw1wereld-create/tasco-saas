import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e4e4ff',
          200: '#cccbff',
          300: '#aaa8ff',
          400: '#8580ff',
          500: '#6C63FF',
          600: '#5a4fe8',
          700: '#4b3fd0',
          800: '#3e35aa',
          900: '#342d87',
          950: '#1f1a52',
        },
        teal: {
          50:  '#f0fdf9',
          400: '#2dd4bf',
          500: '#00D9A6',
          600: '#0d9488',
        },
        surface: {
          50:  '#f8f9ff',
          100: '#f0f0ff',
          800: '#141428',
          900: '#0D0D1A',
          950: '#080810',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
        'gradient-success': 'linear-gradient(135deg, #00D9A6 0%, #10B981 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(59,130,246,0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config

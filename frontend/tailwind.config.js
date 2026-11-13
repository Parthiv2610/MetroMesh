/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0B1120',
          900: '#0F172A',
          850: '#131E35',
          800: '#1E293B',
          700: '#334155',
        },
        blueberry: {
          DEFAULT: '#6A00F4',
          light: '#892BFE',
          dark: '#5200BD',
          glow: 'rgba(106, 0, 244, 0.45)',
        },
        creamsoda: {
          DEFAULT: '#FFD6A5',
          light: '#FFE4C4',
          dark: '#E6B980',
          glow: 'rgba(255, 214, 165, 0.4)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'blueberry-glow': '0 0 20px -2px rgba(106, 0, 244, 0.55)',
        'creamsoda-glow': '0 0 20px -2px rgba(255, 214, 165, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

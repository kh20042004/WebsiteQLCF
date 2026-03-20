/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pop': 'popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'slide-out-right': 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.6, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bounce-subtle': 'bounceSubtle 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        popIn: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(245, 158, 11, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#ffffff',
        'dark-card': '#f8fafc',
        'neon-blue': '#0ea5e9',
        'neon-purple': '#9333ea',
        'neon-pink': '#ec4899',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(183, 68, 217, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(0, 240, 255, 0.5)' },
          '50%': { textShadow: '0 0 20px rgba(0, 240, 255, 1)' },
        },
      },
    },
  },
  plugins: [],
}

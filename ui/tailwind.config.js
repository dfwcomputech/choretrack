/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f0ff',
          100: '#ede0ff',
          200: '#dcc5ff',
          300: '#c89bff',
          400: '#b068ff',
          500: '#9b3dfa',
          600: '#8520ed',
          700: '#7216d1',
          800: '#5f15aa',
          900: '#4e1288',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


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
          50: '#f0f0ff',
          100: '#e5e7ff',
          200: '#cdcfff',
          300: '#a5a9ff',
          400: '#7479ff',
          500: '#434cff',
          600: '#2d25f7',
          700: '#231ae3',
          800: '#1c16c0',
          900: '#040337',
          950: '#020119',
        },
        brass: {
          50: '#fefdf4',
          100: '#fef9e7',
          200: '#fcf0ca',
          300: '#f9e3a8',
          400: '#f5d07a',
          500: '#f0ba56',
          600: '#e6a441',
          700: '#d18b36',
          800: '#b26f31',
          900: '#945a2d',
        },
      },
      fontFamily: {
        'serif': ['Arvo', 'serif'],
        'sans': ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
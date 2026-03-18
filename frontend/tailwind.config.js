/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f9f4',
          100: '#dcf1e5',
          200: '#bbe3cc',
          300: '#8acead',
          400: '#52b287',
          500: '#2e9668',
          600: '#1e7a53',
          700: '#196244',
          800: '#174e38',
          900: '#14402f',
        },
        sage: {
          50:  '#f6f8f7',
          100: '#e2eae5',
          200: '#c4d5cb',
          300: '#9ab8a8',
          400: '#6d9681',
          500: '#4d7a63',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

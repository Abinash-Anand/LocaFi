/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        sparkasse: '#FF0000'
      },
      boxShadow: {
        neo: '0 24px 50px -24px rgba(15, 23, 42, 0.75)'
      }
    },
  },
  plugins: [],
}


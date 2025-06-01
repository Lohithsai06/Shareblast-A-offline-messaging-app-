/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.purple.500"), 0 0 20px theme("colors.purple.600")',
        'neon-light': '0 0 5px theme("colors.indigo.300"), 0 0 20px theme("colors.indigo.400")',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
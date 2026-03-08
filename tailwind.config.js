/** @type {import('tailwindcss').Config} */
module.exports = {
  // diz para o tailwind olhar dentro da pasta renderer do electron
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
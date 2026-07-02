/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        vert:        '#1D9E75',
        'vert-dark': '#085041',
        'vert-lite': '#5DCAA5',
        'vert-hover':'#17886a',
        fond:        '#ffffff',
        'fond-gris': '#f5f5f3',
        texte:       '#1a1a1a',
        muted:       '#666666',
        bordure:     '#e5e5e5',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      letterSpacing: {
        tight2: '-0.125rem',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#3f87f5', dark: '#2563d6', soft: '#eaf2ff' },
        ink: '#0b0d17',
      },
      keyframes: { marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } } },
      animation: { marquee: 'marquee 32s linear infinite' },
      boxShadow: {
        glow: '0 30px 50px -20px rgba(63,135,245,.45)',
        dock: '0 10px 40px -8px rgba(15,23,42,.28), 0 2px 6px rgba(15,23,42,.08)',
      },
    },
  },
  plugins: [],
}

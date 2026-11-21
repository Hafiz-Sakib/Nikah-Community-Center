const v = (name) => `rgb(var(--${name}) / <alpha-value>)`
const slate = Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => [n, v(`s${n}`)]))

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
      colors: {
        // every neutral flips with the theme (see index.css), so existing classes work in day and night
        slate,
        page: v('page'),
        surface: v('surface'),
        fg: v('fg'),
        brand: { DEFAULT: '#3f87f5', dark: '#2563d6', soft: v('brand-soft'), ink: v('brand-ink') },
        logo: v('logo'),
        ink: '#0b0d17',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        drift: { '0%,100%': { transform: 'translate3d(-8%,-6%,0) scale(1)' }, '50%': { transform: 'translate3d(8%,6%,0) scale(1.15)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        'ping-soft': { '0%': { transform: 'scale(1)', opacity: '.5' }, '100%': { transform: 'scale(2.2)', opacity: '0' } },
      },
      animation: { marquee: 'marquee 32s linear infinite', drift: 'drift 9s ease-in-out infinite', 'spin-slow': 'spin-slow 8s linear infinite', float: 'float 3.6s ease-in-out infinite' },
      boxShadow: { glow: '0 30px 50px -20px rgba(63,135,245,.45)', dock: 'var(--shadow-dock)', card: 'var(--shadow-card)' },
    },
  },
  plugins: [],
}

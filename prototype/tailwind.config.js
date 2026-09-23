export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        ink: '#2B070E',
        maroon: {
          deep: '#3D0A12',
          DEFAULT: '#6B0F1A',
          light: '#8E1C2B',
          soft: '#A8404C',
        },
        gold: {
          deep: '#9C7A18',
          DEFAULT: '#C9A227',
          light: '#E4C55F',
          pale: '#F4E5B6',
        },
        cream: {
          DEFAULT: '#FCF7EE',
          200: '#F4EADA',
          300: '#E7D8BF',
          400: '#CFBB9C',
        },
        pinoy: {
          red: '#CE1126',
          blue: '#0038A8',
          yellow: '#FCD116',
        },
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '18px',
        '2xl': '20px',
        '3xl': '26px',
        '4xl': '32px',
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(43, 7, 14, 0.35)',
        lift: '0 18px 40px -16px rgba(43, 7, 14, 0.5)',
        nav: '0 -8px 30px -14px rgba(43, 7, 14, 0.4)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
}

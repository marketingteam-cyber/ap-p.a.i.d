module.exports = {
  content: ['./src/**/*.{js,jsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:        '#1A4FBA',
          'blue-dark': '#0D3080',
          'blue-light':'#3B6ED4',
          'blue-wash': '#EBF0FB',
          red:         '#CC2020',
          'red-dark':  '#9E1818',
          'red-light': '#E04040',
          'red-wash':  '#FBEAEA',
          black:       '#0A0C12',
          dark:        '#131722',
          'gray-900':  '#1E2230',
          'gray-700':  '#3A3F52',
          'gray-500':  '#6B7291',
          'gray-300':  '#B8BCCF',
          'gray-100':  '#E8EAF2',
          'gray-50':   '#F4F5F9',
        },
        winning: '#2A9E52',
        failing: '#CC2020',
        fatigue: '#D4880A',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        tag:  '4px',
        btn:  '8px',
        card: '12px',
        pill: '20px',
      },
    },
  },
  plugins: [],
};

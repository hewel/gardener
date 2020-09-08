const { spacing } = require('tailwindcss/defaultTheme')

const getRem = (value) => `${value / 4}rem`

module.exports = {
  purge: ['./src/**/*.js', './src/**/*.svelte'],
  theme: {
    extend: {
      inset: {
        ...spacing,
        '9': getRem(9),
        '1/2': '50%',
      },
      zIndex: {
        '150': 150,
        '1000': 1000,
      },
      spacing: {
        '9': getRem(9),
        '14': getRem(14),
      },
    },
  },
  variants: {},
  plugins: [],
  prefix: '_ba-',
}

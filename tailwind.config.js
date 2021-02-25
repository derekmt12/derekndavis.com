module.exports = {
  purge: ['./pages/**/*.js', './components/**/*.js'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      zIndex: {
        '-10': '-10',
      },
    },
  },
};

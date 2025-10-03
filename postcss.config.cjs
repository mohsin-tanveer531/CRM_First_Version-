module.exports = {
  plugins: {
    // ⬅ required, it registers Tailwind with PostCSS again
    '@tailwindcss/postcss': {},
    autoprefixer: {},        // keep anything else you already had
  },
};

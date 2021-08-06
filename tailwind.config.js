const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["src/**/*.html", "src/**/*.vue", "src/**/*.js", "**/*.html"],
  darkMode: false, // or 'media' or 'class'
  mode: "jit",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        army: "#4b5320",
        army2: "#a5b646",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

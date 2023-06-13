const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: [
    "src/**/*.html",
    "src/**/*.vue",
    "src/**/*.js",
    "**/*.html",
    "./docs/**/*.{md,html,js,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        army: "#4b5320",
        army2: "#a5b646",
      },
      screens: {
        "hover-none": { raw: "(hover: none)" },
        "hover-hover": { raw: "(hover: hover)" },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

const forms = require("@tailwindcss/forms");

const utils = plugin(({ addUtilities }) => {
  addUtilities({
    ".clickable": {
      "touch-action": "manipulation",
      "-webkit-tap-highlight-color": "transparent",
      "user-select": "none",
      cursor: "pointer"
    },
    ".placeholder-select-none::placeholder": {
      "user-select": "none"
    },
    ".no-arrow::-webkit-calendar-picker-indicator": {
      display: "none"
    },
    ".no-arrow::-webkit-list-button": {
      display: "none"
    }
  });
});

const forcedColors = plugin(({ addVariant }) => {
  addVariant("forced-colors", "@media (forced-colors: active)");
});

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      borderRadius: {
        "4xl": "2rem"
      },
      boxShadow: {
        smooth: "0px 4px 32px rgba(0, 0, 0, 0.07);"
      },
      colors: {
        primary: colors.indigo,
        secondary: colors.slate,
        danger: colors.rose
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: [forms, utils, forcedColors]
};

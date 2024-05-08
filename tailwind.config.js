/** @type {import('tailwindcss').Config} */
import {
  blueDark,
  grassDark,
  gray,
  grayDark,
  indigo,
  indigoDark,
  mauveDark,
  skyDark,
  slateDark,
  tomato,
  tomatoDark,
} from "@radix-ui/colors";
import containerQueries from "@tailwindcss/container-queries";
import defaultTheme from "tailwindcss/defaultTheme";
/**
 * @type Config
 */
export default {
  darkMode: ["class", ".chakra-ui-dark"],

  important: true,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "475px",
        "2xs": "375px",
      },
      colors: {
        dark: {
          ...blueDark,
          ...indigoDark,
          ...tomatoDark,
          ...grayDark,
          ...slateDark,
          ...mauveDark,
          ...grassDark,
          ...skyDark,
        },
        ...indigo,
        ...tomato,
        ...gray,
      },
      fontFamily: {
        sans: ["Asap", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [containerQueries],
};

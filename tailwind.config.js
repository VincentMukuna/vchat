/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

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
  plugins: [],
};

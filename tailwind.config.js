/** @type {import('tailwindcss').Config} */

import { Config } from "tailwindcss";
import {
  blueDark,
  indigo,
  indigoDark,
  gray,
  grayDark,
  tomato,
  tomatoDark,
  grassDark,
  slateDark,
  mauveDark,
} from "@radix-ui/colors";
/**
 * @type Config
 */
export default {
  darkMode: ["class", ".chakra-ui-dark"],

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        lato: ["Lato"],
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
        },
        ...indigo,
        ...tomato,
        ...gray,
      },
    },
  },
  plugins: [],
};

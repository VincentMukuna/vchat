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
  skyDark,
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
    },
  },
  plugins: [],
};

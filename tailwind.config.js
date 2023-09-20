/** @type {import('tailwindcss').Config} */
import {
  blueDark,
  indigo,
  indigoDark,
  gray,
  grayDark,
  tomato,
  tomatoDark,
  brownDark,
  slateDark,
  mauveDark,
} from "@radix-ui/colors";
export default {
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
        },
        ...indigo,
        ...tomato,
        ...gray,
      },
    },
  },
  plugins: [],
};

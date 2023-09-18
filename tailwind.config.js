/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        lato: ["Lato"],
      },

      colors: {
        primary: {
          main: "#0D0B22",
          shaded: "#151328",
          light: "#1F1C3D",
        },
        secondary: {
          main: "#8C5959",
          alt: "#67856C",
        },
        light: {
          light: "#212529bf",
          dark: "#aaa",
        },
        bgmain: {
          dark: "",
        },
      },
    },
  },
  plugins: [],
};

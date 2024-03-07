import { modalAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { blueDark, gray } from "@radix-ui/colors";
const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(modalAnatomy.keys);

const baseStyle = definePartsStyle((props) => ({
  overlay: {
    bg: "none",
    backdropFilter: "auto",
    backdropInvert: "10%",
    backdropBlur: "1px",
  },
  dialog: {
    bgColor: gray.gray2,
    shadow: "none",
    _dark: {
      bgColor: blueDark.blue1,
    },
  },
}));

export const modalTheme = defineMultiStyleConfig({
  baseStyle,
});

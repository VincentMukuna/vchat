import { modalAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { gray, slateDark } from "@radix-ui/colors";
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
      bgColor: slateDark.slate1,
    },
  },
}));

export const modalTheme = defineMultiStyleConfig({
  baseStyle,
});

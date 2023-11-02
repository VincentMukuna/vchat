import { defineStyle, defineStyleConfig, theme } from "@chakra-ui/react";
import { blueDark, gray } from "@radix-ui/colors";

const solid = defineStyle((theme) => ({
  bgColor: blueDark.blue5,
  _hover:
    theme.colorMode === "light"
      ? { bg: blueDark.blue7, color: gray.gray1 }
      : { bg: blueDark.blue7 },
}));

export const butttonTheme = defineStyleConfig({
  variants: { solid },
});

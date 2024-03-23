import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
import { indigoDark, tomato } from "@radix-ui/colors";

const solid = defineStyle((theme) => ({
  bgColor: theme.colorScheme === "red" ? tomato.tomato10 : indigoDark.indigo7,
  rounded: "full",
  _hover:
    theme.colorMode === "light"
      ? {
          bg:
            theme.colorScheme === "red" ? tomato.tomato10 : indigoDark.indigo8,
        }
      : {
          bg:
            theme.colorScheme === "red" ? tomato.tomato10 : indigoDark.indigo4,
        },
  color: theme.colorMode === "light" ? "black" : "gray.200",
}));

export const butttonTheme = defineStyleConfig({
  variants: { solid },
});

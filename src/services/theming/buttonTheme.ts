import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
import { gray, indigoDark, tomato } from "@radix-ui/colors";

const solid = defineStyle((theme) => ({
  bgColor: theme.colorScheme === "red" ? tomato.tomato10 : indigoDark.indigo8,
  rounded: "full",
  _hover:
    theme.colorMode === "light"
      ? {
          bg:
            theme.colorScheme === "red" ? tomato.tomato10 : indigoDark.indigo6,
          color: gray.gray1,
        }
      : {
          bg:
            theme.colorScheme === "red" ? tomato.tomato10 : indigoDark.indigo4,
        },
  color: theme.colorMode === "dark" && gray.gray2,
}));

export const butttonTheme = defineStyleConfig({
  variants: { solid },
});

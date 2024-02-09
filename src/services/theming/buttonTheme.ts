import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
import { blueDark, gray, tomato } from "@radix-ui/colors";

const solid = defineStyle((theme) => ({
  bgColor: theme.colorScheme === "red" ? tomato.tomato10 : blueDark.blue5,
  _hover:
    theme.colorMode === "light"
      ? {
          bg: theme.colorScheme === "red" ? tomato.tomato10 : blueDark.blue7,
          color: gray.gray1,
        }
      : { bg: theme.colorScheme === "red" ? tomato.tomato10 : blueDark.blue7 },
  color: theme.colorMode === "dark" && gray.gray2,
}));

export const butttonTheme = defineStyleConfig({
  variants: { solid },
});

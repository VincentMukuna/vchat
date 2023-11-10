import { avatarAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react";
import { grayDark } from "@radix-ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(avatarAnatomy.keys);

const baseStyle = definePartsStyle((theme) => ({
  container: {
    bg: theme.colorMode === "dark" ? grayDark.gray7 : grayDark.gray10,
  },
}));

export const avatarTheme = defineMultiStyleConfig({ baseStyle });

import { IconButton, Tooltip, useColorMode } from "@chakra-ui/react";
import { SunIcon } from "@heroicons/react/24/outline";
import { MoonIcon } from "@heroicons/react/24/solid";
import { indigo, indigoDark } from "@radix-ui/colors";
import { motion } from "framer-motion";

function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Tooltip
      label={colorMode === "dark" ? "Light mode" : "Dark mode"}
      hasArrow
      placement="right"
      py={2}
      fontSize={"sm"}
      rounded={"md"}
      fontWeight={"normal"}
      bg={colorMode === "light" ? indigoDark.indigo1 : indigo.indigo8}
      textColor={colorMode === "light" ? indigo.indigo3 : "black"}
    >
      <IconButton
        as={motion.button}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={toggleColorMode}
        variant={"ghost"}
        aria-label="toggle color mode"
        size={"sm"}
        icon={
          colorMode === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )
        }
      />
    </Tooltip>
  );
}

export default ColorModeToggle;

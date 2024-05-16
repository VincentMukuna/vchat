import { StackDivider, VStack, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

import { VARIANTS_MANAGER } from "@/services/variants";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

const SettingsList = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logOut } = useAuth();
  return (
    <motion.div
      key="settings"
      variants={VARIANTS_MANAGER}
      initial="slide-from-left"
      animate="slide-in"
      exit="slide-from-right"
    >
      <VStack
        divider={<StackDivider />}
        className="flex flex-col p-4 transition-opacity"
      >
        <button
          onClick={toggleColorMode}
          className="flex h-full w-full  items-center justify-between p-3"
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold">Toggle color mode</span>
            <span className="text-sm italic dark:text-slate-300">
              Switch the apps theme
            </span>
          </div>

          {colorMode === "dark" ? (
            <SunIcon className="size-6" />
          ) : (
            <MoonIcon className="size-6" />
          )}
        </button>
        <button
          onClick={() => {
            logOut();
          }}
          className="flex h-full w-full justify-between p-3"
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold">Log out</span>
            <span className="text-sm italic dark:text-slate-300">
              Delete this session
            </span>
          </div>

          <ArrowRightStartOnRectangleIcon className="size-6 " />
        </button>
      </VStack>
    </motion.div>
  );
};

export default SettingsList;

import { StackDivider, VStack, useColorMode } from "@chakra-ui/react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

import { VARIANTS_MANAGER } from "@/services/variants";
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
          className="flex h-full w-full max-w-sm items-center p-3"
        >
          <div className="flex flex-col items-start">
            <span className="">Toggle dark mode</span>
            <span className="text-sm italic dark:text-slate-300">
              Switch the apps theme
            </span>
          </div>

          {colorMode === "dark" ? (
            <SunIcon className="me-12 ms-auto h-6 w-6" />
          ) : (
            <MoonIcon className="me-12 ms-auto h-6 w-6" />
          )}
        </button>
        <button
          onClick={() => {
            logOut();
          }}
          className="flex h-full w-full max-w-sm items-center p-3"
        >
          <div className="flex flex-col items-start">
            <span className="">Log out</span>
            <span className="text-sm italic dark:text-slate-300">
              Delete this session
            </span>
          </div>

          <ArrowRightOnRectangleIcon className="me-12 ms-auto h-6 w-6 " />
        </button>
      </VStack>
    </motion.div>
  );
};

export default SettingsList;

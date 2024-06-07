import { StackDivider, VStack, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

import { VARIANTS_MANAGER } from "@/services/variants";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import AlertSetting from "./AlertSetting";
import Setting from "./Setting";

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
        <Setting
          onClick={toggleColorMode}
          className="cursor-pointer items-center"
        >
          <Setting.Details>
            <Setting.Title>Toggle color mode</Setting.Title>
            <Setting.Description>Switch the apps theme</Setting.Description>
          </Setting.Details>
          <Setting.Action>
            {colorMode === "dark" ? (
              <SunIcon className="size-6" />
            ) : (
              <MoonIcon className="size-6" />
            )}
          </Setting.Action>
        </Setting>
        <Setting
          onClick={() => {
            logOut();
          }}
          className="cursor-pointer"
        >
          <Setting.Details>
            <Setting.Title>Log out</Setting.Title>
            <Setting.Description>Delete this session</Setting.Description>
          </Setting.Details>
          <Setting.Action>
            <ArrowRightStartOnRectangleIcon className="size-6 " />
          </Setting.Action>
        </Setting>
        <AlertSetting />
        <Setting>
          <Setting.Details>
            <Setting.Title>Version</Setting.Title>
            <Setting.Description>1.0.0</Setting.Description>
          </Setting.Details>
        </Setting>
      </VStack>
    </motion.div>
  );
};

export default SettingsList;

import { StackDivider, VStack, useColorMode } from "@chakra-ui/react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import { logUserOut } from "../../services/sessionServices";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { VARIANTS_MANAGER } from "../../services/variants";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const {
    currentUser,
    currentUserDetails,
    setCurrentUserDetails,
    setCurrentUser,
  } = useAuth();
  const navigate = useNavigate();
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
          className="flex items-center w-full h-full max-w-sm p-3"
        >
          <div className="flex flex-col items-start">
            <span className="">Toggle dark mode</span>
            <span className="text-sm italic dark:text-slate-300">
              Switch the apps theme
            </span>
          </div>

          {colorMode === "dark" ? (
            <SunIcon className="w-6 h-6 ms-auto me-12" />
          ) : (
            <MoonIcon className="w-6 h-6 ms-auto me-12" />
          )}
        </button>
        <button
          onClick={() => {
            setCurrentUser(null);
            setCurrentUserDetails(null);
            logUserOut();
            navigate("../../login");
          }}
          className="flex items-center w-full h-full max-w-sm p-3"
        >
          <div className="flex flex-col items-start">
            <span className="">Log out</span>
            <span className="text-sm italic dark:text-slate-300">
              Delete this session
            </span>
          </div>

          <ArrowRightOnRectangleIcon className="w-6 h-6 ms-auto me-12 " />
        </button>
      </VStack>
    </motion.div>
  );
};

export default Settings;

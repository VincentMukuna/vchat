import {
  Card,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  StackDivider,
  Switch,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import { logUserOut } from "../../services/sessionServices";
import { redirect, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { slateDark } from "@radix-ui/colors";

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
  );
};

export default Settings;

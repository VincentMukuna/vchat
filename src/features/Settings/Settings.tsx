import {
  Card,
  FormControl,
  FormLabel,
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
      <div className="flex items-center w-full h-full max-w-sm p-3">
        <div className="flex flex-col ">
          <span className="">Toggle dark mode</span>
          <span className="text-sm italic dark:text-slate-300">
            Switch the apps theme
          </span>
        </div>

        <Switch
          className="ms-auto me-12"
          colorScheme={colorMode === "dark" ? "facebook" : "blackAlpha"}
          id="dark-mode"
          onChange={toggleColorMode}
          isChecked={colorMode === "dark"}
        />
      </div>
      <div className="flex items-center w-full h-full max-w-sm p-3">
        <div className="flex flex-col ">
          <span className="">Log out</span>
          <span className="text-sm italic dark:text-slate-300">
            Delete this session
          </span>
        </div>

        <IconButton
          className="ms-auto me-12"
          onClick={() => {
            setCurrentUser(null);
            setCurrentUserDetails(null);
            logUserOut();
            navigate("../../login");
          }}
          aria-label="log out"
          icon={<ArrowRightOnRectangleIcon className="w-4 h-4 " />}
        />
      </div>
    </VStack>
  );
};

export default Settings;

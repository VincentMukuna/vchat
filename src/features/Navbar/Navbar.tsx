import { IconButton, Tooltip, useColorMode } from "@chakra-ui/react";
import { UserIcon as UserIconOutline } from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { indigo, indigoDark, slateDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChatIcon, LogOutIcon, WheelIcon } from "../../components/Icons";
import { useAuth } from "../../context/AuthContext";
import { logUserOut } from "../../services/sessionServices";
import { MyProfile } from "./MyProfile";

const tabs = [
  {
    value: "/chats",
    icon: <ChatIcon className="w-6 h-6" />,
    title: "Chats",
  },
  {
    value: "/users",
    icon: <UserIconOutline className="w-6 h-6" />,
    title: "Users",
  },
  {
    value: "/settings",
    icon: <WheelIcon className="w-6 h-6" />,
    title: "Settings",
  },
];

const Navbar = () => {
  const {
    currentUser,
    currentUserDetails,
    setCurrentUserDetails,
    setCurrentUser,
  } = useAuth();
  if (!currentUser || !currentUserDetails) return null;

  const { colorMode, toggleColorMode } = useColorMode();

  const { pathname } = useLocation();

  return (
    <nav className="grow-0 md:flex  md:flex-col md:gap-8 h-16   items-center  md:min-w-[4rem] pt-2 bg-gray3  dark:bg-dark-blue2 md:h-full gap-3">
      <div className="hidden md:flex">
        <MyProfile />
      </div>
      <div className="flex items-center justify-around w-full md:flex-col md:gap-2 ">
        {tabs.map((tab, i) => {
          return (
            <Tooltip
              key={i}
              openDelay={300}
              label={tab.title}
              hasArrow
              placement="right"
              py={2}
              rounded={"md"}
              fontSize={"sm"}
              fontWeight={"normal"}
              bg={colorMode === "light" ? indigoDark.indigo1 : indigo.indigo8}
              textColor={colorMode === "light" ? indigo.indigo3 : "black"}
            >
              <Link to={tab.value} className="relative mb-3">
                <div
                  className={` md:w-1 md:h-full w-full h-1 bg-dark-indigo10 rounded-full absolute  -bottom-2 md:bottom-0 left-[2px]  md:-left-1 transition-opacity ${
                    pathname.split("/").includes(tab.value.substring(1))
                      ? "visible"
                      : "invisible"
                  }`}
                />
                <IconButton
                  as={motion.button}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={tab.title}
                  icon={tab.icon}
                  bgColor={"transparent"}
                  _hover={{
                    bg:
                      colorMode === "dark"
                        ? slateDark.slate6
                        : slateDark.slate11,
                  }}
                  ml={1}
                />
              </Link>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex-col hidden gap-2 mt-auto mb-8 md:flex">
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
            bgColor={"transparent"}
            _hover={{
              bg: colorMode === "dark" ? slateDark.slate6 : slateDark.slate11,
            }}
            aria-label="toggle color mode"
            icon={
              colorMode === "dark" ? (
                <SunIcon className="w-6 h-6" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )
            }
          />
        </Tooltip>
        <Tooltip
          label="Log out"
          hasArrow
          placement="right"
          py={2}
          rounded={"md"}
          fontSize={"sm"}
          fontWeight={"normal"}
          bg={colorMode === "light" ? indigoDark.indigo1 : indigo.indigo8}
          textColor={colorMode === "light" ? indigo.indigo3 : "black"}
        >
          <Link
            to={"/login"}
            onClick={() => {
              setCurrentUserDetails(null);
              setCurrentUser(null);
              logUserOut();
            }}
            className="flex items-center justify-center transition-all w-11"
          >
            <IconButton
              as={motion.button}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              bgColor={"transparent"}
              _hover={{
                bg: colorMode === "dark" ? slateDark.slate6 : slateDark.slate11,
              }}
              aria-label="log out"
              icon={<LogOutIcon className="w-6 h-6 " />}
            />
          </Link>
        </Tooltip>
      </div>
    </nav>
  );
};

export default Navbar;

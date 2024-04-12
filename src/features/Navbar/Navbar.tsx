import { IconButton, Tooltip, useColorMode } from "@chakra-ui/react";
import { UserIcon as UserIconOutline } from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { indigo, indigoDark, slateDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChatIcon, LogOutIcon, WheelIcon } from "../../components/Icons";
import { useAuth } from "../../context/AuthContext";
import { MyProfile } from "./MyProfile";

const tabs = [
  {
    value: "/chats",
    icon: <ChatIcon className="h-6 w-6" />,
    title: "Chats",
  },
  {
    value: "/users",
    icon: <UserIconOutline className="h-6 w-6" />,
    title: "Users",
  },
  {
    value: "/settings",
    icon: <WheelIcon className="h-6 w-6" />,
    title: "Settings",
  },
];

const Navbar = () => {
  const { currentUser, currentUserDetails, logOut } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const { pathname } = useLocation();
  if (!currentUser || !currentUserDetails) return null;

  return (
    <nav className="h-16 grow-0  items-center gap-3 bg-gray3   pt-2  dark:bg-dark-blue2 md:flex md:h-full  md:min-w-[4rem] md:flex-col md:gap-8">
      <div className="hidden md:flex">
        <MyProfile />
      </div>
      <div className="flex w-full items-center justify-around md:flex-col md:gap-2 ">
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
                  className={` absolute -bottom-2 left-[2px] h-1 w-full rounded-full bg-dark-indigo10  transition-opacity md:-left-1 md:bottom-0  md:h-full md:w-1 ${
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

      <div className="mb-8 mt-auto hidden flex-col gap-2 md:flex">
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
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
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
              logOut();
            }}
            className="flex w-11 items-center justify-center transition-all"
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
              icon={<LogOutIcon className="h-6 w-6 " />}
            />
          </Link>
        </Tooltip>
      </div>
    </nav>
  );
};

export default Navbar;

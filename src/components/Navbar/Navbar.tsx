import { IconButton, Tooltip, useColorMode } from "@chakra-ui/react";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { indigo, indigoDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ColorModeToggle from "../ColorModeToggle";
import { MyProfile } from "./MyProfile";
import { navLinks } from "./links";

const Navbar = () => {
  const { currentUser, currentUserDetails, logOut } = useAuth();
  const { colorMode } = useColorMode();
  const { pathname } = useLocation();
  if (!currentUser || !currentUserDetails) return null;

  return (
    <nav className="hidden h-full  min-w-[3.2rem]  grow-0 flex-col  items-center gap-10 bg-gray3  pt-2 dark:bg-dark-blue2 md:flex">
      <MyProfile />
      <div className="flex w-full flex-col items-center justify-around gap-2 ">
        {navLinks.map((tab, i) => {
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
              <Link to={tab.value} className="relative mb-2">
                <div
                  className={` absolute -left-1 bottom-0  h-full w-1 rounded-full  bg-dark-indigo10 transition-opacity ${
                    pathname.split("/").includes(tab.value.substring(1))
                      ? "visible"
                      : "invisible"
                  }`}
                />
                <IconButton
                  variant={"ghost"}
                  as={motion.button}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={tab.title}
                  icon={tab.icon}
                  size={"sm"}
                  ml={1}
                />
              </Link>
            </Tooltip>
          );
        })}
      </div>

      <div className="mb-8 mt-auto hidden flex-col gap-2 md:flex">
        <ColorModeToggle />
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
              variant={"ghost"}
              size={"sm"}
              aria-label="log out"
              icon={<ArrowLeftStartOnRectangleIcon className="h-5 w-5 " />}
            />
          </Link>
        </Tooltip>
      </div>
    </nav>
  );
};

export default Navbar;

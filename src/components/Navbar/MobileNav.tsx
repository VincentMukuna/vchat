import { useAuth } from "@/context/AuthContext";
import {
  Avatar,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  Bars4Icon,
} from "@heroicons/react/24/outline";
import { blueDark, gray } from "@radix-ui/colors";
import React, { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { navLinks } from "./links";

function MobileNav() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const { colorMode } = useColorMode();
  const { pathname } = useLocation();
  const { currentUserDetails, logOut } = useAuth();
  if (!currentUserDetails) return null;

  return (
    <>
      <IconButton
        aria-label="open menu"
        ref={btnRef}
        variant={"ghost"}
        icon={<Bars4Icon className="size-5" />}
        onClick={onOpen}
      >
        Open
      </IconButton>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
        size={"xs"}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader
            bg={colorMode === "dark" ? blueDark.blue2 : gray.gray2}
          ></DrawerHeader>
          <DrawerBody
            bg={colorMode === "dark" ? blueDark.blue2 : gray.gray2}
            className="flex flex-col items-center text-center"
          >
            <div className="space-y-2">
              <Link to={"/profile"} className="select-none">
                <Avatar
                  size={"xl"}
                  src={currentUserDetails.avatarURL}
                  name={currentUserDetails.name}
                />
              </Link>
              <div className="relative flex flex-col ">
                <div className="text-lg font-semibold">
                  {currentUserDetails.name}
                </div>
                <div className=" text-sm italic text-dark-gray5 dark:text-gray6">
                  {currentUserDetails.about}
                </div>
              </div>
            </div>

            <nav className="my-auto flex flex-col items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  to={link.value}
                  key={link.value}
                  className={`
                  flex items-center gap-3 rounded-lg transition-colors hover:text-indigo-600 dark:hover:text-indigo-500 
                  ${
                    pathname.split("/").includes(link.value.substring(1))
                      ? "text-indigo-500"
                      : ""
                  }`}
                >
                  {link.icon}
                  <span className="text-lg font-semibold ">{link.title}</span>
                </Link>
              ))}
            </nav>
            <Link
              to={"/login"}
              onClick={() => {
                logOut();
              }}
              className="mt-auto flex transition-all"
            >
              <Button
                variant={"ghost"}
                aria-label="log out"
                size={"lg"}
                leftIcon={<ArrowLeftStartOnRectangleIcon className="size-6 " />}
                className=""
              >
                Log out
              </Button>
            </Link>
          </DrawerBody>
          <DrawerFooter
            bg={colorMode === "dark" ? blueDark.blue2 : gray.gray2}
            className="items-center justify-center"
          >
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Vincent Mukuna ©{new Date().getFullYear()}
            </span>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default memo(MobileNav);

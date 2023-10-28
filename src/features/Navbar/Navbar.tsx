import { useAuth } from "../../context/AuthContext";
import { useAppSelector } from "../../context/AppContext";
import {
  ChatIcon,
  LogOutIcon,
  UserIcon,
  WheelIcon,
} from "../../components/Icons";
import { getCurrentUserDetails } from "../../services/userDetailsServices";
import { logUserOut } from "../../services/sessionServices";
import { Link, redirect } from "react-router-dom";
import {
  Avatar,
  IconButton,
  Indicator,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import {
  blue,
  grayDark,
  indigo,
  indigoDark,
  slateDark,
} from "@radix-ui/colors";

const tabs = [
  { value: "chats", icon: <ChatIcon className="w-6 h-6" />, title: "Chats" },
  { value: "users", icon: <UserIcon className="w-6 h-6" />, title: "Users" },
  {
    value: "settings",
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
  const { activePage, setActivePage } = useAppSelector();
  if (!currentUser || !currentUserDetails) return null;

  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <nav className="flex  md:flex-col md:gap-8  items-center  md:min-w-[4rem] pt-2 bg-gray3  dark:bg-dark-slate1 md:h-full gap-3">
      <div className="hidden md:flex">
        <Tooltip
          label="My Profile"
          hasArrow
          placement="right"
          py={2}
          fontSize={"sm"}
          fontWeight={"normal"}
          bg={colorMode === "dark" ? indigoDark.indigo1 : indigo.indigo8}
          textColor={colorMode === "dark" ? indigo.indigo3 : "black"}
        >
          <Link
            to={"profile"}
            className="mt-4 "
            onClick={() => {
              redirect("profile");
              getCurrentUserDetails(currentUser).then((deets) => {
                setCurrentUserDetails(deets);
              });
              setActivePage("Profile");
            }}
          >
            <Avatar
              size={"md"}
              name={currentUserDetails.name}
              src={currentUserDetails.avatarURL}
            />
          </Link>
        </Tooltip>
      </div>
      <div className="flex items-center justify-around w-full md:flex-col md:gap-2 ">
        {tabs.map((tab, i) => {
          return (
            <Tooltip
              key={i}
              label={tab.title}
              hasArrow
              placement="right"
              py={2}
              fontSize={"sm"}
              fontWeight={"normal"}
              bg={colorMode === "dark" ? indigoDark.indigo1 : indigo.indigo8}
              textColor={colorMode === "dark" ? indigo.indigo3 : "black"}
            >
              <Link
                to={tab.value}
                onClick={() => {
                  setActivePage(tab.title);
                }}
                className="relative items-center gap-2 "
              >
                <div
                  className={` md:w-1 md:h-full w-full h-1 bg-dark-blue7 rounded-full absolute  bottom-0 md:-left-1 transition-opacity ${
                    activePage === tab.title ? "visible" : "invisible"
                  }`}
                />

                <div
                  className="flex flex-col gap-[2px] items-center justify-center md:ml-1 px-2  py-2 md:py-2 text-xs tracking-wider rounded
                    hover:bg-dark-slate11
                    dark:hover:bg-dark-slate6
                    dark:text-gray7 text-dark-blue1 cursor-pointer
                    data-[state=active]:bg-dark-slate9 data-[state=active]:dark:bg-dark-blue3 
                    data-[state=active]:text-gray1
                    data-[state=active]:shadow-t-[0_0_0_2px_inset]
                    data-[state=active]:shadow-white                   
                   "
                >
                  {tab.icon}
                </div>
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
          fontWeight={"normal"}
          bg={colorMode === "dark" ? indigoDark.indigo1 : indigo.indigo8}
          textColor={colorMode === "dark" ? indigo.indigo3 : "black"}
        >
          <IconButton
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
                <MoonIcon className="w-6 h-6" />
              )
            }
            className="flex items-center justify-center w-11 "
          />
        </Tooltip>
        <Tooltip
          label="Log out"
          hasArrow
          placement="right"
          py={2}
          fontSize={"sm"}
          fontWeight={"normal"}
          bg={colorMode === "dark" ? indigoDark.indigo1 : indigo.indigo8}
          textColor={colorMode === "dark" ? indigo.indigo3 : "black"}
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

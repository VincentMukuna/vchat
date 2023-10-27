import { useAuth } from "../../context/AuthContext";
import { useAppSelector } from "../../context/AppContext";
import {
  ChatIcon,
  LogOutIcon,
  SunIcon,
  UserIcon,
  WheelIcon,
} from "../../components/Icons";
import { getCurrentUserDetails } from "../../services/userDetailsServices";
import { logUserOut } from "../../services/sessionServices";
import { Link, redirect } from "react-router-dom";
import { Avatar, IconButton, useColorMode } from "@chakra-ui/react";

const tabs = [
  { value: "chats", icon: <ChatIcon className="w-8 h-8" /> },
  { value: "users", icon: <UserIcon className="w-8 h-8" /> },
  { value: "settings", icon: <WheelIcon className="w-8 h-8" /> },
];

const Navbar = () => {
  const {
    currentUser,
    currentUserDetails,
    setCurrentUserDetails,
    setCurrentUser,
  } = useAuth();
  const { setActivePage } = useAppSelector();
  if (!currentUser || !currentUserDetails) return null;

  const { toggleColorMode } = useColorMode();

  return (
    <nav className="flex  md:flex-col md:gap-8 md:w-[80px]   items-center  md:min-w-[4rem] pt-2 bg-gray3  dark:bg-dark-slate1 md:h-full gap-3">
      <div className="hidden md:flex">
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
      </div>
      <div className="flex items-center justify-around w-full md:flex-col md:gap-2 ">
        {tabs.map((tab, i) => {
          return (
            <Link
              key={i}
              to={tab.value}
              onClick={() => {
                setActivePage(tab.value[0]?.toUpperCase() + tab.value.slice(1));
              }}
            >
              <div
                className="flex flex-col gap-[2px] items-center justify-center px-2  py-1 md:py-3 w-16 text-xs tracking-wider rounded
                hover:bg-dark-slate9
                dark:text-gray7 text-dark-blue1 cursor-pointer
                data-[state=active]:bg-dark-slate9 data-[state=active]:dark:bg-dark-blue3 
                data-[state=active]:text-gray1
                data-[state=active]:shadow-t-[0_0_0_2px_inset]
                data-[state=active]:shadow-white


               
               "
              >
                {tab.icon}
                <span className="md:hidden">{tab.value}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex-col hidden md:flex">
        <IconButton
          onClick={toggleColorMode}
          bgColor={"transparent"}
          aria-label="toggle color mode"
          className="flex items-center justify-center transition-all w-11 hover:bg-slate-600 hover:text-black"
        >
          <SunIcon className="w-8 h-8" />
        </IconButton>

        <Link
          to={"/login"}
          onClick={() => {
            setCurrentUserDetails(null);
            setCurrentUser(null);
            logUserOut();
          }}
          className="flex items-center justify-center transition-all w-11 hover:bg-slate-600 hover:text-black"
        >
          <LogOutIcon className="w-8 h-8 " />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

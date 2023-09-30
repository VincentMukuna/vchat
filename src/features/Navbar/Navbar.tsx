import { useAuth } from "../../context/AuthContext";
import { useAppSelector } from "../../context/AppContext";
import {
  ChatIcon,
  LogOutIcon,
  SunIcon,
  UserIcon,
  WheelIcon,
} from "../../components/Icons";
import * as Tabs from "@radix-ui/react-tabs";
import { getCurrentUserDetails } from "../../services/userDetailsServices";
import { logUserOut } from "../../services/sessionServices";
import { useNavigate } from "react-router-dom";
import { Avatar, IconButton, useColorMode } from "@chakra-ui/react";

const tabs = [
  { value: "Chats", icon: <ChatIcon className="w-8 h-8" /> },
  { value: "Users", icon: <UserIcon className="w-8 h-8" /> },
  { value: "Settings", icon: <WheelIcon className="w-8 h-8" /> },
];

const Navbar = () => {
  const { currentUser, currentUserDetails, setCurrentUserDetails } = useAuth();
  if (!currentUser || !currentUserDetails) return null;

  const { toggleColorMode } = useColorMode();

  const navigate = useNavigate();

  return (
    <nav className="flex  md:flex-col md:gap-8 md:w-[80px]   items-center  md:min-w-[4rem] pt-2 bg-gray3  dark:bg-dark-slate1 md:h-full gap-3">
      <div className="hidden md:flex">
        <Tabs.Trigger
          value="Profile"
          className="mt-4 "
          onClick={() => {
            getCurrentUserDetails(currentUser).then((deets) => {
              setCurrentUserDetails(deets);
            });
          }}
        >
          <Avatar
            size={"md"}
            name={currentUserDetails.name}
            src={currentUserDetails.avatarURL}
          />
        </Tabs.Trigger>
      </div>
      <div className="flex items-center justify-around w-full md:flex-col md:gap-2 ">
        {tabs.map((tab, i) => {
          return (
            <Tabs.Trigger key={i} asChild value={tab.value}>
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
            </Tabs.Trigger>
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

        <div
          onClick={() =>
            logUserOut().then(() => {
              navigate("/login");
            })
          }
          className="flex items-center justify-center transition-all w-11 hover:bg-slate-600 hover:text-black"
        >
          <LogOutIcon className="w-8 h-8 " />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

//@ts-ignore
import avatarFallback from "../../assets/avatarFallback.png";
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
import { getCurrentUserDetails } from "../../services/userServices";
import { logUserOut } from "../../services/sessionServices";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { currentUser, currentUserDetails, setCurrentUserDetails } = useAuth();
  if (!currentUser) return null;
  const { activePage, setActivePage } = useAppSelector();

  const navigate = useNavigate();

  return (
    <nav className="relative flex items-center justify-center w-full h-full gap-16 py-2 md:flex-col md:w-16 shrink-0 bg-primary-main">
      <div className="hidden md:flex">
        <Tabs.Trigger value="Profile" className="my-1 ">
          <img
            onClick={() => {
              getCurrentUserDetails(currentUser).then((deets) => {
                setCurrentUserDetails(deets);
              });
            }}
            src={currentUserDetails?.avatarURL || avatarFallback}
            className="mt-2 rounded-full w-[52px] h-[52px]"
          />
        </Tabs.Trigger>
      </div>
      <div className="flex gap-4 md:flex-col">
        <Tabs.Trigger
          value="Chats"
          className="flex items-center justify-center h-10 transition-all rounded-md w-11 hover:bg-slate-600 text-secondary-main hover:text-black"
        >
          <ChatIcon className="w-8 h-8" />
        </Tabs.Trigger>
        <Tabs.Trigger
          value="Users"
          className="flex items-center justify-center h-10 transition-all rounded-md w-11 hover:bg-slate-600 text-secondary-main hover:text-black"
        >
          <UserIcon className="w-8 h-8 " />
        </Tabs.Trigger>

        <Tabs.Trigger
          value="Settings"
          className="flex items-center justify-center h-10 transition-all rounded-md w-11 hover:bg-slate-600 text-secondary-main hover:text-black"
        >
          <WheelIcon className="w-8 h-8" />
        </Tabs.Trigger>
      </div>

      <div className="flex-col hidden gap-6 mt-auto mb-4 md:flex">
        <div className="flex items-center justify-center h-10 transition-all rounded-md w-11 hover:bg-slate-600 text-secondary-main hover:text-black">
          <SunIcon className="w-8 h-8" />
        </div>

        <div
          onClick={() =>
            logUserOut().then(() => {
              navigate("/login");
            })
          }
          className="flex items-center justify-center h-10 transition-all rounded-md w-11 hover:bg-slate-600 text-secondary-main hover:text-black"
        >
          <LogOutIcon className="w-8 h-8 " />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

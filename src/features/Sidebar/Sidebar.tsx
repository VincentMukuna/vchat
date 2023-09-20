import { useAppSelector } from "../../context/AppContext";
import Chats from "../Chats/Chats";
import Users from "../UsersList/Users";
import * as Tabs from "@radix-ui/react-tabs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { ChatIcon, GroupIcon, PlusIcon } from "../../components/Icons";
import Profile from "../Profile/Profile";
import { useAuth } from "../../context/AuthContext";
import Settings from "../Settings/Settings";
import { addUserToGlobalChat } from "../../services/registerUserService";
import { useMemo } from "react";

const Sidebar = () => {
  const { activePage, setActivePage } = useAppSelector();
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;

  return (
    <aside className="bg-gray2 dark:bg-dark-blue2/[0.998] dark:text-gray2 grow grid grid-rows-[80px_1fr] shrink-0 basis-96 px-2 w-full h-full  md:max-w-[25rem]">
      <div className="flex items-center justify-between gap-4 px-8 py-4 text-lg font-bold tracking-wider ">
        <span className="flex justify-center w-full ">{activePage}</span>
        <div></div>
      </div>
      <section className="flex flex-col overflow-x-hidden overflow-y-auto">
        <Tabs.Content value="Chats" className="">
          <Chats />
        </Tabs.Content>
        <Tabs.Content
          value="Users"
          forceMount={activePage === "Users" ? true : undefined}
        >
          <Users />
        </Tabs.Content>

        <Tabs.Content value="Profile">
          <Profile user={currentUserDetails} />
        </Tabs.Content>
        <Tabs.Content value="Settings">
          <Settings />
        </Tabs.Content>
        <Tabs.Content value="New Group">
          Coming soon! Add Group feature
        </Tabs.Content>
      </section>
    </aside>
  );
};

export default Sidebar;

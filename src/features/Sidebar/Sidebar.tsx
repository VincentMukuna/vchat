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
    <aside className=" realtive grow grid grid-rows-[80px_1fr] text-white bg-primary-shaded shrink-0 basis-96 px-2 w-full h-full  md:max-w-[22rem]">
      <div className="flex items-center justify-between gap-4 px-8 py-4 text-lg font-bold tracking-wider text-gray-300 ">
        <span className="flex justify-center w-full ">{activePage}</span>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <PlusIcon className="w-6 h-6" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="px-1 py-2 text-sm bg-white">
              <DropdownMenu.Item>
                <button
                  onClick={() => setActivePage("Users")}
                  className="flex items-center w-full gap-2 p-2 rounded hover:bg-slate-500 hover:text-slate-300"
                >
                  <ChatIcon mini={false} className="w-5" />
                  New Contact
                </button>
              </DropdownMenu.Item>

              <DropdownMenu.Item>
                <button className="flex gap-2 p-2 rounded cursor-pointer hover:bg-slate-500 hover:text-slate-300">
                  <div className="relative flex ">
                    <GroupIcon mini={false} className="w-5 h-5" />
                    <PlusIcon className="absolute w-3 h-3 -right-2 -top-1" />
                  </div>
                  New Group
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
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

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
import * as Dialog from "@radix-ui/react-dialog";
import NewGroupForm from "../Groups/NewGroup/NewGroupForm";
import { useState } from "react";
const Sidebar = () => {
  const { activePage, setActivePage } = useAppSelector();
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;

  return (
    <aside className="bg-gray2 dark:bg-dark-blue2/[0.998] dark:text-gray2 grow grid grid-rows-[80px_1fr] shrink-0 basis-96 px-2 w-full h-full  md:max-w-[25rem]">
      <div className="flex items-center justify-between gap-4 px-8 py-4 text-lg font-bold tracking-wider ">
        <span className="flex justify-center w-full ">{activePage}</span>
        <div>
          <Dialog.Root
            open={showCreateGroupModal}
            onOpenChange={setShowCreateGroupModal}
          >
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="p-2 text-sm font-normal rounded bg-dark-tomato9 whitespace-nowrap"
              >
                Add group
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
              <Dialog.Content className="z-50 fixed overflow-x-hidden overflow-y-autoflex flex-col  py-3 px-3 md:px-8 rounded-md text-white top-[50%] -translate-x-1/2 -translate-y-1/2 w-[94vw] left-[50%] max-w-[25rem] md:max-w-[500px] max-h-[85vh] bg-dark-blue2 md:min-w-min">
                <Dialog.Title className="flex w-full m-0 text-xl font-bold leading-10 text-white">
                  New Group
                </Dialog.Title>
                <Dialog.Description className="mt-1 mb-6 text-[14px] text-gray6 leading-4">
                  Create a new group chat.
                </Dialog.Description>
                <NewGroupForm
                  setShowCreateGroupModal={setShowCreateGroupModal}
                />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
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

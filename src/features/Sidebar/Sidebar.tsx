import { useAppSelector } from "../../context/AppContext";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorMode,
  Tooltip,
} from "@chakra-ui/react";

import { PlusIcon } from "../../components/Icons";
import { useAuth } from "../../context/AuthContext";
import NewGroupForm from "../Groups/NewGroup/NewGroupForm";
import { UserGroupIcon } from "@heroicons/react/24/solid";
import { indigo, indigoDark, slateDark } from "@radix-ui/colors";
import { Outlet } from "react-router-dom";
import { MyProfile } from "../Navbar/Navbar";
import { AnimatePresence } from "framer-motion";
const Sidebar = () => {
  const { activePage } = useAppSelector();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;
  return (
    <aside className="bg-gray2 dark:bg-dark-slate1 border-r dark:border-dark-slate4 dark:text-gray2  grid grid-rows-[80px_1fr] shrink basis-96 grow md:max-w-[25rem] overflow-auto">
      <div className="flex items-center w-full h-full px-4 font-semibold tracking-widest ">
        <span className="relative flex items-center justify-between w-full h-full ">
          <div className="visible mt-2 md:invisible">
            <MyProfile />
          </div>

          {activePage}
          <Tooltip
            label={"New Group"}
            hasArrow
            placement="bottom"
            py={2}
            rounded={"md"}
            fontSize={"sm"}
            fontWeight={"normal"}
            bg={colorMode === "light" ? indigoDark.indigo1 : indigo.indigo8}
            textColor={colorMode === "light" ? indigo.indigo3 : "black"}
          >
            <button
              onClick={onOpen}
              aria-label="Create new group"
              className="relative flex p-2 text-sm font-normal rounded dark:text-gray8 "
              title="New group"
            >
              <UserGroupIcon className="w-5 h-5" />
              <PlusIcon className="relative w-4 h-4 dark:text-white right-1" />
            </button>
          </Tooltip>
        </span>

        <Modal
          isOpen={isOpen}
          onClose={onClose}
          isCentered
          scrollBehavior="outside"
          size={["xs", "sm"]}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader className="flex flex-col w-full gap-1 text-xl font-bold dark:text-white text-dark-gray3">
              New Group
              <div className="font-md text-[14px] tracking-wide dark:text-gray6 text-dark-gray6 ">
                Create a new group chat.
              </div>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <NewGroupForm onClose={onClose} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
      <section className="px-3 overflow-y-auto">
        <AnimatePresence>
          <Outlet />
        </AnimatePresence>
      </section>
    </aside>
  );
};

export default Sidebar;

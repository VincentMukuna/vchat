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
} from "@chakra-ui/react";

import { PlusIcon } from "../../components/Icons";
import { useAuth } from "../../context/AuthContext";
import NewGroupForm from "../Groups/NewGroup/NewGroupForm";
import { UserGroupIcon } from "@heroicons/react/24/solid";
import { Box } from "@chakra-ui/react";
import { gray, slateDark } from "@radix-ui/colors";
import { Outlet } from "react-router-dom";
const Sidebar = () => {
  const { activePage } = useAppSelector();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;
  return (
    <Box
      as={"aside"}
      gap={0}
      px={0}
      className="bg-gray2 dark:bg-dark-slate1 dark:text-gray2  grid grid-rows-[80px_1fr] shrink basis-96 px-2 grow  md:max-w-[25rem]"
    >
      <div className="w-full font-semibold tracking-widest">
        <span className="relative flex items-center justify-center w-full h-full ">
          {activePage}
          <button
            onClick={onOpen}
            aria-label="Create new group"
            className="absolute flex p-2 text-sm font-normal rounded dark:text-gray8 right-3"
            title="New group"
          >
            <UserGroupIcon className="w-5 h-5" />
            <PlusIcon className="relative w-4 h-4 dark:text-white right-1" />
          </button>
        </span>

        <Modal
          isOpen={isOpen}
          onClose={onClose}
          isCentered
          scrollBehavior="outside"
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
      <section className="flex flex-col overflow-x-hidden overflow-y-auto">
        <Outlet />
      </section>
    </Box>
  );
};

export default Sidebar;

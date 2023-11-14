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
import { MyProfile } from "../Navbar/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { VARIANTS_MANAGER } from "../../services/variants";
const Sidebar = () => {
  const { activePage } = useAppSelector();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;
  return (
    <aside className="bg-gray2 dark:bg-dark-slate1 dark:text-gray2  grid grid-rows-[80px_1fr] shrink basis-96 grow  md:max-w-[25rem]">
      <div className="flex items-center w-full font-semibold tracking-widests">
        <span className="relative flex items-center justify-between w-full h-full ">
          <div className="visible mt-2 md:invisible">
            <MyProfile />
          </div>

          {activePage}
          <button
            onClick={onOpen}
            aria-label="Create new group"
            className="relative flex p-2 text-sm font-normal rounded dark:text-gray8 "
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
          size={["xs", "lg"]}
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
      <section className="px-2 overflow-y-auto">
        <AnimatePresence>
          <motion.div
            variants={VARIANTS_MANAGER}
            initial="slide-from-left"
            animate="slide-in"
            exit="slide-from-right"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </section>
    </aside>
  );
};

export default Sidebar;

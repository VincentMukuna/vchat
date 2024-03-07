import {
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";

import { UserGroupIcon } from "@heroicons/react/24/solid";
import { indigo, indigoDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { PlusIcon } from "../../components/Icons";
import { useAuth } from "../../context/AuthContext";
import NewGroupForm from "../Groups/NewGroup/NewGroupForm";
import { MyProfile } from "../Navbar/MyProfile";
interface SidebarProps {
  children: React.ReactNode;
}
const Sidebar = ({ children }: SidebarProps) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;
  return (
    <aside className="bg-gray2 px-1 dark:bg-dark-blue1 border-r dark:border-dark-slate3 dark:text-gray2   shrink basis-[25rem] grow md:max-w-[25rem]">
      {children}
    </aside>
  );
};

export default Sidebar;

interface SideBarHeaderProps {
  title: string;
  className: string;
}

export function SideBarHeader({ title, className }: SideBarHeaderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  return (
    <div
      className={
        "flex items-center w-full h-24 px-4 font-semibold tracking-widest " +
        className
      }
    >
      <span className="relative flex items-center justify-between w-full h-full ">
        <div className="visible mt-2 md:invisible">
          <MyProfile />
        </div>

        <span>{title}</span>
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
          <IconButton
            bg={"transparent"}
            as={motion.button}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpen}
            aria-label="Create new group"
            title="New group"
            icon={
              <div className="relative flex p-2 text-sm font-normal rounded dark:text-gray8 ">
                <UserGroupIcon className="w-5 h-5" />
                <PlusIcon className="relative w-4 h-4 dark:text-white right-1" />
              </div>
            }
          ></IconButton>
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
  );
}

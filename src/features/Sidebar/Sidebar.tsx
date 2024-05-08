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
    <aside className="relative max-h-full shrink grow basis-[24rem] overflow-auto border-r bg-gray2  dark:border-dark-slate3 dark:bg-dark-blue1 dark:text-gray2 md:max-w-[25rem]">
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
        "sticky left-0 right-0 top-0 z-10 flex h-16  items-center bg-gray2 px-4 font-semibold tracking-widest dark:bg-dark-blue1" +
        className
      }
    >
      <span className="relative flex h-full w-full items-center justify-between ">
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
              <div className="relative flex rounded p-2 text-sm font-normal dark:text-gray8 ">
                <UserGroupIcon className="h-5 w-5" />
                <PlusIcon className="relative right-1 h-4 w-4 dark:text-white" />
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
          <ModalHeader className="flex w-full flex-col gap-1 text-xl font-bold text-dark-gray3 dark:text-white">
            New Group
            <div className="font-md text-[14px] tracking-wide text-dark-gray6 dark:text-gray6 ">
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

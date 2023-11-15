import { mutate, useSWRConfig } from "swr";
import { IUserDetails } from "../../interfaces";
import { addContact } from "../../services/userDetailsServices";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  Avatar,
  Button,
  Card,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import api from "../../services/api";
import { SERVER } from "../../utils/config";
import { MapPinIcon, UserIcon } from "@heroicons/react/20/solid";
import { blueDark, gray, slateDark, slateDarkA } from "@radix-ui/colors";
import { useChatsContext } from "../../context/ChatsContext";
import { ReactNode, createContext, useContext, useState } from "react";
import UserProfileModal from "../Profile/UserProfileModal";
import { openModal } from "../../components/Modal";
import { motion } from "framer-motion";

interface UserContextValue {
  user: IUserDetails;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

function User({
  user,
  onCloseModal,
  onClick,
  children,
}: {
  user: IUserDetails;
  onClick?: () => void;
  onCloseModal?: () => void;
  children: ReactNode;
}) {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;

  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
      <Card
        as={"article"}
        bg={"inherit"}
        shadow={"none"}
        direction={"row"}
        py={3}
        ps={3}
        rounded={"md"}
        onClick={
          onClick
            ? onClick
            : () => {
                openModal(
                  <UserProfileModal
                    onClose={() => {
                      onCloseModal && onCloseModal();
                    }}
                    user={user}
                  />,
                );
              }
        }
        className={`transition-all gap-1 flex items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-slate6 w-full`}
      >
        <UserContext.Provider value={{ user: user }}>
          {children}
        </UserContext.Provider>
      </Card>
    </motion.div>
  );
}

export default User;

export const UserAvatar = ({ size }: { size?: string }) => {
  const { user } = useContext(UserContext)!;
  return (
    <Avatar
      size={size}
      icon={<UserIcon className="w-[26px] h-[26px]" />}
      src={
        user.avatarID
          ? api
              .getFile(SERVER.BUCKET_ID_USER_AVATARS, user?.avatarID)
              .toString()
          : undefined
      }
    />
  );
};

export const UserDescription = ({ children }: { children?: ReactNode }) => {
  const { user } = useContext(UserContext)!;
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const isPersonal = user.$id === currentUserDetails.$id;
  return (
    <div className="flex flex-col justify-center ms-2">
      <span className="max-w-full overflow-hidden text-base font-semibold tracking-wider whitespace-nowrap text-ellipsis dark:text-gray1">
        {isPersonal ? "You" : user.name}
      </span>
      {children}
    </div>
  );
};

export const UserAbout = () => {
  const { user } = useContext(UserContext)!;
  return (
    <span className="overflow-hidden font-sans text-sm italic tracking-wide whitespace-nowrap text-ellipsis dark:text-gray6">
      {user.about}
    </span>
  );
};

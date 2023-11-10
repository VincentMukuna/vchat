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
import { useState } from "react";
import UserProfileModal from "../Profile/UserProfileModal";

function User({ user }: { user: IUserDetails }) {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const isPersonal = user.$id === currentUserDetails.$id;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(false);

  return (
    <Card
      as={"article"}
      bg={"inherit"}
      shadow={"none"}
      direction={"row"}
      py={3}
      ps={3}
      rounded={"sm"}
      onClick={onOpen}
      className={`transition-all gap-2 flex items-start cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-slate6 `}
    >
      <Avatar
        icon={<UserIcon className="w-[26px] h-[26px]" />}
        src={
          user.avatarID
            ? api
                .getFile(SERVER.BUCKET_ID_USER_AVATARS, user?.avatarID)
                .toString()
            : undefined
        }
      />
      <div className="flex flex-col justify-center ms-2">
        <span className="max-w-full overflow-hidden text-base font-semibold tracking-wider whitespace-nowrap text-ellipsis dark:text-gray1">
          {isPersonal ? "You" : user.name}
        </span>
        <span className="overflow-hidden font-sans text-sm italic tracking-wide whitespace-nowrap text-ellipsis dark:text-gray6">
          {user.about}
        </span>
      </div>
      <UserProfileModal isOpen={isOpen} onClose={onClose} user={user} />
    </Card>
  );
}

export default User;

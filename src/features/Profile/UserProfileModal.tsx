import {
  Avatar,
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useModalContext,
} from "@chakra-ui/react";
import { MapPinIcon, UserIcon } from "@heroicons/react/20/solid";
import { blueDark, gray, slateDark } from "@radix-ui/colors";
import { useState } from "react";
import { addContact } from "../../services/userDetailsServices";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { mutate, useSWRConfig } from "swr";
import toast from "react-hot-toast";
import { DirectChatDetails, GroupChatDetails, IUserDetails } from "../../interfaces";
import { motion } from "framer-motion";

interface UserProfileProps {
  onClose: () => void;
  user: IUserDetails;
}

const UserProfileModal = ({ onClose, user }: UserProfileProps) => {
  const { onClose: onModalClose } = useModalContext();
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const { setSelectedChat, setRecepient } = useChatsContext();
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(false);
  const { cache } = useSWRConfig();
  const isPersonal = user.$id === currentUserDetails.$id;

  function getConversations() {
    if (cache.get("conversations")?.data) {
      return cache.get("conversations")?.data as (GroupChatDetails | DirectChatDetails)[];
    } else return [] as (GroupChatDetails | DirectChatDetails)[];
  }
  const handleClick = async () => {
    setLoading(true);
    let chats = getConversations().filter(
      (convo) => convo.$collectionId === "chats",
    ) as DirectChatDetails[];
    let chatWithUser: DirectChatDetails | undefined;

    if (isPersonal) {
      chatWithUser = chats.find((chat) =>
        chat.participants.every((participant) => participant.$id === user.$id),
      );
    } else {
      chatWithUser = chats.find((chat) =>
        chat.participants.some((participant) => participant.$id === user.$id),
      );
    }
    if (chatWithUser) {
      setLoading(false);
      onClose();
      onModalClose();
      setSelectedChat(chatWithUser);
      setRecepient(user);
    } else {
      let addContactStatus = addContact(currentUserDetails.$id, user.$id);
      addContactStatus
        .then((result) => {
          setSelectedChat(result.chat);
          setRecepient(user);
          if (!result.existed) {
            mutate("conversations", [result.chat, ...getConversations()], {
              revalidate: false,
            });
          }
        })
        .finally(() => {
          setLoading(false);
          onClose();
          onModalClose();
        })
        .catch((error: any) => {
          toast.error("Something went wrong");
        });
    }
  };
  return (
    <>
      <ModalHeader alignSelf={"center"}>{`${
        user.name.split(" ")[0]
      }'s Profile`}</ModalHeader>
      <ModalCloseButton />
      <ModalBody className="flex flex-col items-center justify-center gap-2">
        <Avatar
          size={"2xl"}
          icon={<UserIcon className="w-16 h-16" />}
          src={user.avatarURL}
        />

        <span className="text-lg leading-6 tracking-wide">{user.name}</span>
        <span className="text-sm text-gray11 dark:text-gray-400">
          {user?.about || "Hi there! I'm using VChat"}
        </span>
        <span className="inline-flex items-center gap-1 text-slate-900 dark:text-gray-400">
          <Icon as={MapPinIcon} className="w-3 h-3" />
          {user?.location}
        </span>
      </ModalBody>

      <ModalFooter justifyContent={"center"}>
        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          isDisabled={loading}
          onClick={() => {
            handleClick();
          }}
          width={"48"}
          rounded={"md"}
          bg={blueDark.blue5}
          color={colorMode === "dark" ? gray.gray2 : gray.gray1}
          _hover={
            colorMode === "light"
              ? { bg: blueDark.blue7, color: gray.gray1 }
              : {}
          }
        >
          Chat
        </Button>
      </ModalFooter>
    </>
  );
};

export default UserProfileModal;

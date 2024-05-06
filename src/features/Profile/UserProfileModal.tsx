import useConversations from "@/features/Conversations/hooks/useConversations";
import {
  Avatar,
  Button,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  useColorMode,
  useModalContext,
} from "@chakra-ui/react";
import { MapPinIcon, UserIcon } from "@heroicons/react/20/solid";
import { blueDark, gray } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { DirectChatDetails, IUserDetails } from "../../interfaces/interfaces";
import {
  addContact,
  createPersonalChat,
} from "../../services/userDetailsService";

interface UserProfileProps {
  onClose: () => void;
  user: IUserDetails;
}

const UserProfileModal = ({ onClose, user }: UserProfileProps) => {
  const { onClose: onModalClose } = useModalContext();
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const { setRecepient, setSelectedChat, addConversation, selectConversation } =
    useChatsContext();
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(false);
  const isPersonal = user.$id === currentUserDetails.$id;

  const { data: conversations } = useConversations();
  const handleClick = async () => {
    setLoading(true);
    let chats =
      (conversations?.filter(
        (convo) => convo.$collectionId === "chats",
      ) as DirectChatDetails[]) || [];
    let chatWithUser: DirectChatDetails | undefined;

    if (isPersonal) {
      //find personal chat
      chatWithUser = chats.find(
        (chat) =>
          chat.participants.length === 1 &&
          chat.participants.every(
            (participant) => participant.$id === currentUserDetails.$id,
          ),
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
      selectConversation(chatWithUser.$id, user.$id);
    } else {
      const addContactStatus = isPersonal
        ? createPersonalChat(currentUserDetails.$id)
        : addContact(currentUserDetails.$id, user.$id);

      toast.promise(addContactStatus, {
        loading: "Creating chat...",
        success: "Chat created",
        error: "Failed to create chat",
      });

      addContactStatus
        .then((result) => {
          addConversation(result);
          setSelectedChat(result);
          setRecepient(user);
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
      <ModalHeader alignSelf={"center"}>
        {`${user.name.split(" ")[0]}'s Profile`}
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody className="flex flex-col items-center justify-center gap-2">
        <Avatar
          size={"2xl"}
          name={user.name}
          icon={<UserIcon className="h-16 w-16" />}
          src={user.avatarURL}
        />

        <span className="text-lg leading-6 tracking-wide">{user.name}</span>
        <span className="text-sm text-gray11 dark:text-gray-400">
          {user?.about || "Hi there! I'm using VChat"}
        </span>
        <span className="inline-flex items-center gap-1 text-slate-900 dark:text-gray-400">
          <Icon as={MapPinIcon} className="h-3 w-3" />
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

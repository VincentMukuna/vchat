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
} from "@chakra-ui/react";
import { MapPinIcon } from "@heroicons/react/20/solid";
import { blueDark, gray, slateDark } from "@radix-ui/colors";
import React, { useState } from "react";
import { addContact } from "../../services/userDetailsServices";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { mutate, useSWRConfig } from "swr";
import toast from "react-hot-toast";
import { IUserDetails } from "../../interfaces";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUserDetails;
}

const UserProfileModal = ({ isOpen, onClose, user }: UserProfileProps) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const { setSelectedChat, setRecepient } = useChatsContext();
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(false);
  const { cache } = useSWRConfig();

  function getConversations() {
    if (cache.get("conversations")?.data) {
      return cache.get("conversations")?.data;
    } else return [];
  }
  const handleClick = async () => {
    setLoading(true);
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
      })
      .catch((error: any) => {
        toast.error("Something went wrong");
      });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"xs"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader alignSelf={"center"}>{`${
          user.name.split(" ")[0]
        }'s Profile`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="flex flex-col items-center justify-center gap-2">
          <Avatar size={"2xl"} name={user?.name} src={user.avatarURL} />

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
      </ModalContent>
    </Modal>
  );
};

export default UserProfileModal;

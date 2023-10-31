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
import { MapPinIcon } from "@heroicons/react/20/solid";
import { blueDark, gray, slateDark, slateDarkA } from "@radix-ui/colors";
import { useChatsContext } from "../../context/ChatsContext";
import { useState } from "react";

function User({ user }: { user: IUserDetails }) {
  const { currentUserDetails } = useAuth();
  const { setSelectedChat, setRecepient } = useChatsContext();
  if (!currentUserDetails) return null;
  const isPersonal = user.$id === currentUserDetails.$id;
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    <Card
      as={"article"}
      bg={"inherit"}
      shadow={"none"}
      direction={"row"}
      py={3}
      ps={3}
      rounded={"none"}
      onClick={onOpen}
      className={`transition-all gap-2 flex items-start cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-slate6 `}
    >
      <Avatar
        src={
          user.avatarID
            ? api
                .getFile(SERVER.BUCKET_ID_USER_AVATARS, user?.avatarID)
                .toString()
            : undefined
        }
        name={user.name}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      />
      <div className="flex flex-col justify-center ms-2">
        <span className="max-w-full overflow-hidden text-base font-semibold tracking-wider whitespace-nowrap text-ellipsis dark:text-gray1">
          {isPersonal ? "You" : user.name}
        </span>
        <span className="overflow-hidden font-sans text-sm italic tracking-wide whitespace-nowrap text-ellipsis dark:text-gray6">
          {user.about}
        </span>
      </div>
      <Modal isOpen={isOpen} onClose={onClose} size={"xs"}>
        <ModalOverlay
          bg="none"
          backdropFilter="auto"
          backdropInvert="10%"
          backdropBlur="1px"
        />
        <ModalContent bg={slateDark.slate2} shadow={"none"}>
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
    </Card>
  );
}

export default User;

import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
//@ts-ignore
import {
  Avatar,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Menu,
  MenuButton,
  Tooltip,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  EllipsisVerticalIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { slateDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useRef } from "react";
import toast from "react-hot-toast";
import useSWR, { mutate, useSWRConfig } from "swr";
import { confirmAlert } from "../../components/Alert/alertStore";
import { DeleteIcon } from "../../components/Icons";
import { useRoomContext } from "../../context/RoomContext";
import {
  ChatMessage,
  DirectMessageDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../../interfaces";
import { deleteSelectedDirectChatMessages } from "../../services/chatMessageServices";
import {
  deleteSelectedGroupMessages,
  getGroupDetails,
} from "../../services/groupMessageServices";
import RoomActions from "./RoomActions";
import RoomDetails, { RoomDetailsHeader } from "./RoomDetails/RoomDetails";
import { RoomDetailsFooter } from "./RoomDetails/RoomDetailsFooter";

function ChatHeader() {
  const { currentUserDetails } = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { cache } = useSWRConfig();
  const breakpoint = useBreakpointValue({ base: "sm", md: "md", lg: "lg" });
  const btnRef = useRef(null);
  const {
    recepient,
    setSelectedChat,
    setRecepient,
    selectedChat,
    setMsgsCount,
  } = useChatsContext();
  const {
    selectedMessages,
    setSelectedMessages,
    isGroup,
    isPersonal,
    roomMessagesKey,
  } = useRoomContext();

  if (!selectedChat || !currentUserDetails) return null;

  const isAdmin =
    isGroup && selectedChat.admins.includes(currentUserDetails.$id);

  const { data: group } = useSWR(
    () => {
      if (!isGroup) return undefined;
      return `details ${selectedChat.$id}`;
    },
    () => getGroupDetails(selectedChat.$id),
  );
  const isGroupMember = group?.members.some(
    (member) => (member as IUserDetails).$id === currentUserDetails.$id,
  );

  function canDeleteBasedOnPermissions(messages: ChatMessage[]) {
    if (isGroup) {
      if (isAdmin) {
        return true;
      }
    }
    return messages.every((msg) => msg.senderID === currentUserDetails?.$id);
  }

  async function handleDeleteSelectedMessages() {
    if (!currentUserDetails || !selectedChat || !roomMessagesKey) return;
    const currentMessages = cache.get(roomMessagesKey)?.data as ChatMessage[];
    const selectedMessageIds = selectedMessages.map((msg) => msg.$id);
    if (canDeleteBasedOnPermissions(selectedMessages)) {
      //optimistic update
      mutate(
        roomMessagesKey,
        currentMessages.filter((msg) => !selectedMessageIds.includes(msg.$id)),
        { revalidate: false },
      );

      //actual update
      let promise: Promise<void>;
      if (isGroup) {
        promise = deleteSelectedGroupMessages({
          deleter: currentUserDetails.$id,
          groupID: selectedChat.$id,
          messages: selectedMessages as GroupMessageDetails[],
        });
      } else {
        promise = deleteSelectedDirectChatMessages({
          deleter: currentUserDetails.$id,
          groupID: selectedChat.$id,
          messages: selectedMessages as DirectMessageDetails[],
        });
      }

      promise
        .then(() => {
          toast.success("Messages deleted");
          setSelectedMessages([]);
        })
        .catch((e) => {
          toast.error("Something went wrong");
          mutate(roomMessagesKey);
        });
    }
  }
  return (
    <section className="relative flex items-center w-full h-full gap-3 px-2 dark:text-gray1 dark:bg-dark-slate1 bg-gray2 text-dark-gray2">
      <IconButton
        bg={"transparent"}
        as={motion.button}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        title="Close chat"
        icon={<ArrowLeftIcon className="w-5 h-5 " />}
        aria-label="Close Chat"
        onClick={(e) => {
          setSelectedChat(undefined);
          setRecepient(undefined);
          setMsgsCount(0);
        }}
      ></IconButton>
      <Avatar
        src={selectedChat.avatarURL || recepient?.avatarURL}
        icon={
          isGroup ? (
            <UsersIcon className="w-[26px] h-[26px]" />
          ) : (
            <UserIcon className="w-[26px] h-[26px]" />
          )
        }
        size={"md"}
      />
      <button
        onClick={() => {
          if (breakpoint !== "lg") {
            onOpen();
          }
        }}
        className="relative flex flex-col grow"
      >
        <span className="max-w-[8rem] transition-all overflow-hidden text-base font-semibold tracking-wide sm:text-lg text-ellipsis whitespace-nowrap md:max-w-none">
          {isGroup ? selectedChat.name : isPersonal ? "You" : recepient?.name}
        </span>
        <span className="relative max-w-[9rem] overflow-hidden text-xs tracking-wide whitespace-nowrap text-dark-gray5 dark:text-gray6 text-ellipsis">
          {isGroup ? selectedChat.description : recepient?.about || "about"}
        </span>
      </button>
      <div className="absolute ml-auto right-1 top-4 ">
        <Tooltip
          hidden={
            selectedMessages.length === 0 ||
            !canDeleteBasedOnPermissions(selectedMessages)
          }
          label="Delete selected messages"
          placement="left"
        >
          <IconButton
            hidden={
              selectedMessages.length === 0 ||
              !canDeleteBasedOnPermissions(selectedMessages)
            }
            variant={"ghost"}
            aria-label="delete selected messages"
            icon={<DeleteIcon className="w-6 h-6" />}
            onClick={() => {
              confirmAlert({
                message: "Delete these messages? This action is irreversible",
                title: "Delete message",
                confirmText: "Delete",
                onConfirm: () => handleDeleteSelectedMessages(),
              });
            }}
          />
        </Tooltip>
        {(!isGroup || isGroupMember) && (
          <Menu placement="left-start">
            <MenuButton
              bg={"transparent"}
              as={IconButton}
              icon={<EllipsisVerticalIcon className="w-5 h-5" />}
            ></MenuButton>
            <RoomActions />
          </Menu>
        )}
      </div>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size={["md"]}
      >
        <DrawerOverlay />
        <DrawerContent bg={slateDark.slate1}>
          <DrawerCloseButton />
          <DrawerHeader>
            <RoomDetailsHeader />
          </DrawerHeader>

          <DrawerBody>
            <RoomDetails />
          </DrawerBody>

          <DrawerFooter justifyContent={"center"}>
            <RoomDetailsFooter />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </section>
  );
}

export default ChatHeader;

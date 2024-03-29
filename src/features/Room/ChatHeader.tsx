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
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  EllipsisVerticalIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { blueDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { useRoomContext } from "../../context/Room/RoomContext";
import {
  ChatMessage,
  DirectChatDetails,
  GroupChatDetails,
  IUserDetails,
} from "../../interfaces/interfaces";
import { getGroupDetails } from "../../services/groupMessageServices";
import RoomActions from "./RoomActions";
import RoomDetails, { RoomDetailsHeader } from "./RoomDetails/RoomDetails";
import { RoomDetailsFooter } from "./RoomDetails/RoomDetailsFooter";
import SelectedChatOptions from "./SelectedChatOptions";

function ChatHeader() {
  const { currentUserDetails } = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const breakpoint = useBreakpointValue({
    base: "base",
    sm: "sm",
    md: "md",
    lg: "lg",
  });
  const btnRef = useRef(null);
  const { recepient, setSelectedChat, setRecepient, selectedChat } =
    useChatsContext();
  let { isGroup, isPersonal } = useRoomContext();

  const navigate = useNavigate();

  const selectedChatDetails = selectedChat as
    | GroupChatDetails
    | DirectChatDetails;

  if (!currentUserDetails) return null;

  const isAdmin =
    isGroup && selectedChatDetails.admins.includes(currentUserDetails.$id);

  const { data: group } = useSWR(
    () => {
      if (!isGroup) return undefined;
      return `details ${selectedChatDetails.$id}`;
    },
    () => getGroupDetails(selectedChatDetails.$id),
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

  return (
    <section className="relative flex items-center w-full h-full gap-3 p-4 px-2 dark:text-gray1 dark:bg-dark-blue1 bg-gray2 text-dark-gray2">
      <IconButton
        bg={"transparent"}
        as={motion.button}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        title="Close chat"
        icon={<ArrowLeftIcon className="w-5 h-5 " />}
        aria-label="Close Chat"
        onClick={(e) => {
          navigate("/chats");
          setSelectedChat(undefined);
          setRecepient(undefined);
        }}
      ></IconButton>
      <Avatar
        src={selectedChatDetails?.avatarURL || recepient?.avatarURL}
        name={
          isGroup
            ? selectedChatDetails.name
            : isPersonal
            ? "You"
            : recepient?.name
        }
        icon={
          isGroup ? (
            <UsersIcon className="w-[26px] h-[26px]" />
          ) : (
            <UserIcon className="w-[26px] h-[26px]" />
          )
        }
        size={"md"}
        hidden={breakpoint === "base"}
      />
      <button
        onClick={() => {
          if (breakpoint !== "lg") {
            onOpen();
          }
        }}
        className="relative flex flex-col grow shrink"
      >
        <span className="max-w-[8rem] transition-all overflow-hidden text-base font-semibold tracking-wide sm:text-lg text-ellipsis whitespace-nowrap md:max-w-none">
          {isGroup
            ? selectedChatDetails.name
            : isPersonal
            ? "You"
            : recepient?.name}
        </span>
        <span className="relative max-w-[9rem] overflow-hidden text-xs tracking-wide whitespace-nowrap text-dark-gray5 dark:text-gray6 text-ellipsis">
          {isGroup
            ? selectedChatDetails.description
            : recepient?.about || "about"}
        </span>
      </button>
      <div className="flex ml-auto ">
        <SelectedChatOptions />
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
        <DrawerContent bg={blueDark.blue1}>
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

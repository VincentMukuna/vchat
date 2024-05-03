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
import { flushSync } from "react-dom";
import useSWR from "swr";
import { useRoomContext } from "../../context/Room/RoomContext";
import {
  DirectChatDetails,
  GroupChatDetails,
  IUserDetails,
} from "../../interfaces/interfaces";
import { getGroupDetails } from "../../services/groupMessageServices";
import RoomActions from "./RoomActions";
import RoomDetails, { RoomDetailsHeader } from "./RoomDetails/RoomDetails";
import { RoomDetailsFooter } from "./RoomDetails/RoomDetailsFooter";
import SelectedChatOptions from "./SelectedChatMessagesOptions";

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
  const { recepient, selectedChat, selectConversation } = useChatsContext();
  let { isGroup, isPersonal } = useRoomContext();

  const selectedChatDetails = selectedChat as
    | GroupChatDetails
    | DirectChatDetails;

  if (!currentUserDetails) return null;

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

  return (
    <section className="relative flex h-full w-full items-center gap-3 bg-gray2 p-4 px-2 text-dark-gray2 dark:bg-dark-blue1 dark:text-gray1">
      <IconButton
        bg={"transparent"}
        as={motion.button}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        title="Close chat"
        icon={<ArrowLeftIcon className="h-5 w-5 " />}
        aria-label="Close Chat"
        onClick={(e) => {
          flushSync(() => {
            selectConversation();
          });
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
            <UsersIcon className="h-[26px] w-[26px]" />
          ) : (
            <UserIcon className="h-[26px] w-[26px]" />
          )
        }
        size={"md"}
        hidden={breakpoint === "base"}
      />
      <div className="relative flex shrink grow flex-col">
        <span className="max-w-[8rem] overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold tracking-wide transition-all  sm:text-lg md:max-w-none">
          {isGroup
            ? selectedChatDetails.name
            : isPersonal
            ? "You"
            : recepient?.name}
        </span>
        <span className="relative max-w-[9rem] overflow-hidden text-ellipsis whitespace-nowrap text-xs tracking-wide text-dark-gray5 dark:text-gray6 md:max-w-none">
          {isGroup
            ? selectedChatDetails.description
            : recepient?.about || "about"}
        </span>
        <button
          onClick={() => {
            onOpen();
          }}
          className="absolute -inset-2 xl:hidden"
        ></button>
      </div>

      <div className="ml-auto flex ">
        <SelectedChatOptions />
        {(!isGroup || isGroupMember) && (
          <Menu placement="left-start">
            <MenuButton
              bg={"transparent"}
              as={IconButton}
              icon={<EllipsisVerticalIcon className="h-5 w-5" />}
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

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
  useDisclosure,
} from "@chakra-ui/react";
import {
  EllipsisVerticalIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { blueDark } from "@radix-ui/colors";
import { differenceInMinutes, formatDistanceToNow } from "date-fns";
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
import MessageSearchBox from "./Messages/MessageSearchBox";
import RoomActions from "./RoomActions";
import RoomDetails, { RoomDetailsHeader } from "./RoomDetails/RoomDetails";
import { RoomDetailsFooter } from "./RoomDetails/RoomDetailsFooter";
import SelectedChatOptions from "./SelectedChatMessagesOptions";

function formatLastSeen(lastSeenTimestamp: string) {
  const lastSeenDate = new Date(lastSeenTimestamp);
  return formatDistanceToNow(lastSeenDate, { addSuffix: true });
}

function ChatHeader() {
  const { currentUserDetails } = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const minutesSinceLastOnline = recepient
    ? differenceInMinutes(
        new Date(),
        new Date(recepient?.lastOnlineAt || recepient?.$updatedAt),
      )
    : undefined;

  return (
    <section className="relative flex h-full items-center gap-2 bg-gray2 p-2 text-dark-gray2 dark:bg-dark-blue1 dark:text-gray1">
      <IconButton
        variant={"ghost"}
        size={"md"}
        as={motion.button}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        title="Close chat"
        icon={<ArrowLeftIcon className="h-4 w-4 " />}
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
        className="shrink"
      />
      <div className="relative flex shrink grow flex-col">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold tracking-wide transition-all  sm:text-lg md:max-w-none">
          {isGroup
            ? selectedChatDetails.name
            : isPersonal
            ? "You"
            : recepient?.name}
        </span>

        <span className="relative h-4 max-w-[9rem] overflow-hidden text-ellipsis whitespace-nowrap text-xs tracking-wide text-dark-gray5 dark:text-gray6 md:max-w-none">
          {isGroup ? (
            selectedChatDetails.description
          ) : (
            <>
              {minutesSinceLastOnline! < 2 ? (
                <span className="text-green-500">Online</span>
              ) : recepient && recepient.lastOnlineAt ? (
                <span>Last seen {formatLastSeen(recepient.lastOnlineAt)}</span>
              ) : (
                recepient?.about
              )}
            </>
          )}
        </span>

        <button
          onClick={() => {
            onOpen();
          }}
          className="absolute -inset-2 xl:hidden"
        ></button>
      </div>

      <div className="ml-auto flex items-center">
        <SelectedChatOptions />
        <MessageSearchBox />
        {(!isGroup || isGroupMember) && (
          <Menu placement="left-start">
            <MenuButton
              variant={"ghost"}
              size={"sm"}
              as={IconButton}
              icon={<EllipsisVerticalIcon className="h-4 w-4" />}
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
        <DrawerOverlay
          bg={"none"}
          backdropFilter={"auto"}
          backdropInvert={"10%"}
          backdropBlur={"1px"}
        />
        <DrawerContent bg={blueDark.blue2} shadow={"none"}>
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

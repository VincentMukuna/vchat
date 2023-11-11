import { useChatsContext } from "../../context/ChatsContext";
import { useAuth } from "../../context/AuthContext";
//@ts-ignore
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { IChat, IGroup, IUserDetails } from "../../interfaces";
import {
  Avatar,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useBreakpoint,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ArrowRightOnRectangleIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import RoomActions from "./RoomActions";
import { useRef } from "react";
import RoomDetails, {
  RoomDetailsFooter,
  RoomDetailsHeader,
} from "./RoomDetails";
import { slateDark } from "@radix-ui/colors";
import { confirmAlert } from "../../components/Alert/alertStore";
import { mutate, useSWRConfig } from "swr";
import { deleteGroup, leaveGroup } from "../../services/groupMessageServices";
import { deleteContact } from "../../services/userDetailsServices";
import toast from "react-hot-toast";

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
  if (selectedChat === undefined) return null;

  const isGroup = !!(selectedChat?.$collectionId === "groups");
  const isPersonal =
    !isGroup &&
    selectedChat.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  return (
    <section className="relative flex items-center w-full h-full gap-3 px-2 dark:text-gray1 dark:bg-dark-slate1 bg-gray2 text-dark-gray2">
      <IconButton
        bg={"transparent"}
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
        display={["none", "block"]}
        src={selectedChat.avatarURL || recepient?.avatarURL}
        name={
          isGroup
            ? selectedChat.name
            : isPersonal
            ? "You"
            : recepient?.name || " "
        }
        size={"md"}
      />
      <button
        onClick={() => {
          if (breakpoint !== "lg") {
            console.log(breakpoint);
            onOpen();
          }
        }}
        className="relative flex flex-col "
      >
        <span className="text-lg font-semibold tracking-wide">
          {isGroup ? selectedChat.name : isPersonal ? "You" : recepient?.name}
        </span>
        <span className="relative max-w-[9rem] overflow-hidden text-xs tracking-wide whitespace-nowrap text-dark-gray5 dark:text-gray6 text-ellipsis">
          {isGroup ? selectedChat.description : recepient?.about || "about"}
        </span>
      </button>
      <div className="absolute ml-auto right-1 top-4 ">
        <Menu>
          <MenuButton
            bg={"transparent"}
            as={IconButton}
            icon={<EllipsisVerticalIcon className="w-5 h-5" />}
          ></MenuButton>
          <RoomActions id={selectedChat.$id} isGroup={isGroup} />
        </Menu>
      </div>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size={["full", "full", "md"]}
      >
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

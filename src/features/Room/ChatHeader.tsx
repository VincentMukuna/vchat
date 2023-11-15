import { useChatsContext } from "../../context/ChatsContext";
import { useAuth } from "../../context/AuthContext";
//@ts-ignore
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { IUserDetails } from "../../interfaces";
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
  ArrowRightOnRectangleIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import RoomActions from "./RoomActions";
import { useRef } from "react";
import RoomDetails, { RoomDetailsHeader } from "./RoomDetails/RoomDetails";
import { RoomDetailsFooter } from "./RoomDetails/RoomDetailsFooter";
import { slateDark } from "@radix-ui/colors";
import { confirmAlert } from "../../components/Alert/alertStore";
import useSWR, { mutate, useSWRConfig } from "swr";
import {
  deleteGroup,
  getGroupDetails,
  leaveGroup,
} from "../../services/groupMessageServices";
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
  if (selectedChat === undefined || !currentUserDetails) return null;

  const isGroup = !!(selectedChat?.$collectionId === "groups");
  const isPersonal =
    !isGroup &&
    selectedChat.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  const { data: group } = useSWR(
    () => {
      if (!isGroup) return undefined;
      return `details ${selectedChat!.$id}`;
    },
    () => getGroupDetails(selectedChat!.$id),
  );
  const isGroupMember = group?.members.some(
    (member) => (member as IUserDetails).$id === currentUserDetails.$id,
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

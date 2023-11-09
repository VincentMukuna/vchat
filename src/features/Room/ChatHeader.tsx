import { useChatsContext } from "../../context/ChatsContext";
import { useAuth } from "../../context/AuthContext";
//@ts-ignore
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { IUserDetails } from "../../interfaces";
import {
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import RoomActions from "./RoomActions";

function ChatHeader() {
  const {
    recepient,
    setSelectedChat,
    setRecepient,
    selectedChat,
    setMsgsCount,
  } = useChatsContext();
  if (selectedChat === undefined) return null;
  const { currentUserDetails } = useAuth();

  const isGroup = !!selectedChat?.groupMessages;
  const isPersonal =
    !isGroup &&
    selectedChat.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  return (
    <section className="flex items-center w-full h-full gap-3 px-2 dark:text-gray1 dark:bg-dark-slate1 bg-gray2 text-dark-gray2">
      <IconButton
        bg={"transparent"}
        title="Close chat"
        icon={<ArrowLeftIcon className="w-5 h-5 " />}
        aria-label="Close Chat"
        onClick={() => {
          setSelectedChat(undefined);
          setRecepient(undefined);
          setMsgsCount(0);
        }}
      ></IconButton>
      <Avatar
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
      <div className="relative flex flex-col ">
        <span className="text-lg font-semibold tracking-wide">
          {isGroup ? selectedChat.name : isPersonal ? "You" : recepient?.name}
        </span>
        <span className="relative text-xs tracking-wide text-dark-gray5 dark:text-gray6">
          {isGroup ? selectedChat.description : recepient?.about || "about"}
        </span>
      </div>
      <div className="ml-auto">
        <Menu>
          <MenuButton
            bg={"transparent"}
            as={IconButton}
            icon={<EllipsisVerticalIcon className="w-5 h-5" />}
          ></MenuButton>
          <RoomActions id={selectedChat.$id} isGroup={isGroup} />
        </Menu>
      </div>
    </section>
  );
}

export default ChatHeader;

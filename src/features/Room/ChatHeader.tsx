import { useChatsContext } from "../../context/ChatsContext";
import { useAuth } from "../../context/AuthContext";
//@ts-ignore
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { IUserDetails } from "../../interfaces";
import { Avatar } from "@chakra-ui/react";

function ChatHeader() {
  const { recepient, setSelectedChat, setRecepient, selectedChat } =
    useChatsContext();
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
      <button
        aria-label="closeChat"
        onClick={() => {
          setSelectedChat(undefined);
          setRecepient(undefined);
        }}
        className=" flex text-center items-center justify-center w-10 h-10 mr-2  rounded-full cursor-pointer hover:scale-[0.95] text-xl"
      >
        <ArrowLeftIcon className="w-6 h-6 " />
      </button>
      <Avatar
        src={selectedChat.avatarURL}
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
    </section>
  );
}

export default ChatHeader;

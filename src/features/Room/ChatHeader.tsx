import { ArrowLeftIcon } from "@radix-ui/react-icons";

import { useChatsContext } from "../../context/ChatsContext";
import { useAuth } from "../../context/AuthContext";

function ChatHeader() {
  const { recepient, setSelectedChat, setRecepient, selectedChat } =
    useChatsContext();
  if (!selectedChat) return;
  const { currentUserDetails } = useAuth();

  const isGroup = !!selectedChat?.groupName;
  const isPersonal =
    !isGroup &&
    selectedChat.participants.every(
      (id: string) => id === currentUserDetails?.$id,
    );

  return (
    <section className="flex items-center w-full px-2 py-10 text-white h-14 bg-primary-main">
      <button aria-label="closeChat">
        <ArrowLeftIcon
          onClick={() => {
            setSelectedChat(undefined);
            setRecepient(undefined);
          }}
          className="flex w-10 h-10 p-2 mr-2 text-gray-400 rounded-full cursor-pointer hover:scale-[0.8] "
        />
      </button>
      <img
        src={
          isGroup
            ? selectedChat.groupAvtarURL
            : isPersonal
            ? currentUserDetails?.avatarURL
            : recepient?.avatarURL
        }
        alt={`${
          isGroup
            ? selectedChat.groupName
            : isPersonal
            ? "Your"
            : recepient?.name
        }'s profile photo`}
        className="mr-2 rounded-full w-11 h-11"
      />
      <div className="relative flex flex-col ">
        <span className="text-lg font-semibold tracking-wide">
          {isGroup
            ? selectedChat.groupName
            : isPersonal
            ? "You"
            : recepient?.name}
        </span>
        <span className="relative text-xs text-gray-400 left-2">
          {isGroup ? selectedChat.description : recepient?.about || "about"}
        </span>
      </div>
    </section>
  );
}

export default ChatHeader;

import { useChatsContext } from "../../context/ChatsContext";
import { useAuth } from "../../context/AuthContext";
//@ts-ignore
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Avatar from "../../components/Avatar";
import { IUserDetails } from "../../interfaces";

function ChatHeader() {
  const { recepient, setSelectedChat, setRecepient, selectedChat } =
    useChatsContext();
  if (!selectedChat) return;
  const { currentUserDetails } = useAuth();

  const isGroup = !!selectedChat?.groupMessages;
  const isPersonal =
    !isGroup &&
    selectedChat.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  return (
    <section className="flex items-center w-full gap-3 px-2 py-10 dark:text-gray1 h-14 dark:bg-dark-blue2 bg-gray2 text-dark-gray2">
      <button
        aria-label="closeChat"
        onClick={() => {
          setSelectedChat(undefined);
          setRecepient(undefined);
        }}
        className="md:hidden flex text-center items-center justify-center w-10 h-10 mr-2  rounded-full cursor-pointer hover:scale-[0.8] text-xl"
      >
        <ArrowLeftIcon className="w-6 h-6 text" />
      </button>
      <Avatar
        name={
          isGroup
            ? selectedChat.name
            : isPersonal
            ? "You"
            : recepient?.name || " "
        }
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

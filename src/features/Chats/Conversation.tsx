import { useEffect, useState } from "react";

import {
  IUserDetails,
  IChat,
  IGroup,
  IChatMessage,
  IGroupMessage,
} from "../../interfaces";
import { getFormatedDate } from "../../services/dateServices";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import useSWR from "swr";
import api from "../../services/api";
import { Avatar, Card } from "@chakra-ui/react";
import Blueticks from "../../components/Blueticks";
import { UserIcon } from "@heroicons/react/20/solid";

interface IChatProps {
  conversation: IChat | IGroup;
}

const Chat = ({ conversation }: IChatProps) => {
  const { currentUserDetails, currentUser } = useAuth();
  if (!currentUserDetails) return null;
  const { setSelectedChat, selectedChat, setRecepient } = useChatsContext();
  const [showHoverCard, setShowHoverCard] = useState(false);
  const [contactDetails, setContactDetails] = useState<
    IUserDetails | undefined
  >();

  const isGroup = !!conversation?.groupMessages;
  const isPersonal =
    !isGroup &&
    conversation.participants?.every(
      (participant: IUserDetails) => participant.$id === currentUserDetails.$id,
    );

  async function getLastMessage() {
    try {
      let doc = (await api.getDocument(
        conversation.$databaseId,
        conversation.$collectionId,
        conversation.$id,
      )) as IChat | IGroup;
      let msgDoc = isGroup ? doc.groupMessages.at(-1) : doc.chatMessages.at(-1);
      return msgDoc as IChatMessage | IGroupMessage;
    } catch (error) {}
  }

  //only fetch data only if conversation is not a group chat or a personal chat

  const { data: lastMessage } = useSWR(
    `lastMessage ${conversation.$id}`,
    getLastMessage,
  );

  useEffect(() => {
    if (isPersonal) {
      setContactDetails(currentUserDetails);
    } else if (!isGroup && !isPersonal) {
      setContactDetails(
        conversation.participants?.filter(
          (participant: IUserDetails) =>
            participant.$id != currentUserDetails.$id,
        )[0],
      );
    }
  });

  const isActive = selectedChat?.$id === conversation.$id;

  return (
    <Card
      bg={"inherit"}
      shadow={"none"}
      direction={"row"}
      onMouseOver={() => setShowHoverCard(true)}
      onMouseLeave={() => setShowHoverCard(false)}
      py={3}
      ps={3}
      rounded={"none"}
      onClick={() => {
        setRecepient(contactDetails);
        setSelectedChat(conversation);
      }}
      className={`transition-all gap-2 flex items-start cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-slate6 ${
        isActive ? "bg-dark-slate5 dark:bg-dark-slate3" : ""
      }`}
    >
      <Avatar
        name={
          isGroup
            ? conversation.name
            : isPersonal
            ? "You"
            : contactDetails?.name
        }
        src={isGroup ? conversation.avatarURL : contactDetails?.avatarURL}
      />
      <div className="grid gap-[2px] ml-2 overflow-hidden shrink text-ellipsis">
        <span className="max-w-full overflow-hidden text-base font-semibold tracking-wide whitespace-nowrap text-ellipsis dark:text-gray1">
          {isGroup
            ? conversation.name
            : isPersonal
            ? "You"
            : contactDetails?.name}
        </span>
        <span className="flex overflow-hidden font-sans text-[13px] italic tracking-wide whitespace-nowrap text-ellipsis dark:text-gray6">
          {lastMessage?.body
            ? lastMessage.senderID === currentUserDetails.$id
              ? "Me: " + lastMessage.body
              : lastMessage.body
            : "Click to start messaging "}

          {lastMessage?.senderID === currentUserDetails.$id && (
            <div className="absolute right-4 bottom-4">
              <Blueticks read={lastMessage?.read} />
            </div>
          )}
        </span>
      </div>
      <div className="flex flex-col gap-4 mx-3 mt-1 ml-auto mr-3 text-gray10 ">
        <span className="flex text-[10px] tracking-wide ">
          {getFormatedDate(conversation.$updatedAt)}
        </span>
      </div>
    </Card>
  );
};

export default Chat;

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
import useSWR, { useSWRConfig } from "swr";
import api from "../../services/api";
import { Avatar, AvatarBadge, Card } from "@chakra-ui/react";
import Blueticks from "../../components/Blueticks";
import { Query } from "appwrite";
import { SERVER } from "../../utils/config";
import { UserIcon, UsersIcon } from "@heroicons/react/20/solid";
import { grayDark, greenDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { getGroupUnreadMessagesCount } from "../../services/groupMessageServices";
import { getChatUnreadMessagesCount } from "../../services/chatMessageServices";

interface IChatProps {
  conversation: IChat | IGroup;
}

const Chat = ({ conversation }: IChatProps) => {
  const { cache, mutate: globalMutate } = useSWRConfig();
  const { currentUserDetails, currentUser } = useAuth();
  if (!currentUserDetails) return null;
  const { setSelectedChat, selectedChat, setRecepient } = useChatsContext();
  const [contactDetails, setContactDetails] = useState<
    IUserDetails | undefined
  >();

  const isGroup = !!(conversation?.$collectionId === "groups");
  const isPersonal =
    !isGroup &&
    conversation.participants?.every(
      (participant: IUserDetails) => participant.$id === currentUserDetails.$id,
    );

  async function getLastMessage() {
    try {
      let { documents, total } = await api.listDocuments(
        conversation.$databaseId,
        isGroup
          ? SERVER.COLLECTION_ID_GROUP_MESSAGES
          : SERVER.COLLECTION_ID_CHAT_MESSAGES,
        [
          Query.equal(isGroup ? "group" : "chat", conversation?.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ],
      );

      return documents[0] as IChatMessage | IGroupMessage;
    } catch (error) {}
  }

  //only fetch data only if conversation is not a group chat or a personal chat

  const { data: lastMessage } = useSWR(
    `lastMessage ${conversation.$id}`,
    getLastMessage,
    { revalidateIfStale: false, revalidateOnFocus: false },
  );

  const { data: unreadCount } = useSWR(
    `unread-${conversation.$id}`,
    () => {
      if (isGroup) {
        return getGroupUnreadMessagesCount(
          conversation.$id,
          currentUserDetails.$id,
        );
      }
      return getChatUnreadMessagesCount(
        conversation.$id,
        currentUserDetails.$id,
      );
    },
    { refreshInterval: 2000 },
  );

  useEffect(() => {
    if (unreadCount && unreadCount > 0) {
      let chats = cache.get(`converstions`)!.data as (IChat | IGroup)[];
      chats.sort(
        (a, b) =>
          (cache.get(`unread-${a.$id}`)?.data || 0) -
          (cache.get(`unread-${b.$id}`)?.data || 0),
      );
      globalMutate<(IChat | IGroup)[]>(`conversations`, chats, {
        revalidate: false,
      });
    }
  }, [unreadCount]);
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
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
      <Card
        as={"article"}
        bg={"inherit"}
        shadow={"none"}
        direction={"row"}
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
          src={isGroup ? conversation.avatarURL : contactDetails?.avatarURL}
          icon={
            isGroup ? (
              <UsersIcon className="w-[26px] h-[26px]" />
            ) : (
              <UserIcon className="w-[26px] h-[26px]" />
            )
          }
        >
          <AvatarBadge
            hidden={unreadCount ? unreadCount < 1 : true}
            bottom={"unset"}
            top={0}
            bgColor={greenDark.green10}
            boxSize={"2em"}
            fontSize={"2xs"}
          >
            {unreadCount}
          </AvatarBadge>
        </Avatar>
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
    </motion.div>
  );
};

export default Chat;

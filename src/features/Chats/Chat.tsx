import { useEffect, useState } from "react";

import { Avatar, AvatarBadge, Card } from "@chakra-ui/react";
import { UserIcon, UsersIcon } from "@heroicons/react/20/solid";
import { greenDark } from "@radix-ui/colors";
import { Query } from "appwrite";
import { motion } from "framer-motion";
import useSWR, { useSWRConfig } from "swr";
import Blueticks from "../../components/Blueticks";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import {
  DirectChatDetails,
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../../interfaces";
import api from "../../services/api";
import { getChatUnreadMessagesCount } from "../../services/chatMessageServices";
import { getFormatedDate } from "../../services/dateServices";
import { getGroupUnreadMessagesCount } from "../../services/groupMessageServices";
import { compareCreatedAt } from "../../utils";
import { SERVER } from "../../utils/config";

interface IChatProps {
  conversation: DirectChatDetails | GroupChatDetails;
}

const Chat = ({ conversation }: IChatProps) => {
  const { cache, mutate: globalMutate } = useSWRConfig();
  const { currentUserDetails, currentUser } = useAuth();
  if (!currentUserDetails) return null;
  const { setSelectedChat, selectedChat, setRecepient } = useChatsContext();
  const [contactDetails, setContactDetails] = useState<
    IUserDetails | undefined
  >();

  const isGroup = !!(
    conversation?.$collectionId === SERVER.COLLECTION_ID_GROUPS
  );
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
          Query.equal(isGroup ? "groupDoc" : "chatDoc", conversation?.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ],
      );

      return documents[0] as DirectMessageDetails | GroupMessageDetails;
    } catch (error) {}
  }

  function getLastMessageFallback() {
    if (isGroup) {
      let messages = conversation.groupMessages as GroupMessageDetails[];
      return messages.sort(compareCreatedAt).at(0);
    }
    let messages = conversation.chatMessages as DirectMessageDetails[];
    return messages.sort(compareCreatedAt).at(0);
  }

  const { data: lastMessage } = useSWR(
    `lastMessage ${conversation.$id}`,
    getLastMessage,
    {
      fallbackData: getLastMessageFallback(),
      revalidateOnMount: false,
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );
  function getMyUnreadCountFallback() {
    if (!currentUserDetails) return undefined;
    if (isGroup) {
      let messages = conversation.groupMessages as GroupMessageDetails[];
      let unreadCount = messages
        .filter((msg) => msg.senderID !== currentUserDetails.$id)
        .filter((msg) => !msg.read).length;
      return unreadCount;
    }
    let messages = conversation.chatMessages as DirectMessageDetails[];
    let unreadCount = messages
      .filter((msg) => msg.senderID !== currentUserDetails.$id)
      .filter((msg) => !msg.read).length;

    return unreadCount;
  }
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
    {
      fallbackData: getMyUnreadCountFallback(),
      refreshInterval: 60000,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      revalidateOnMount: false,
    },
  );

  useEffect(() => {
    if (unreadCount && unreadCount > 0) {
      let chats = cache.get("conversations")?.data as (
        | DirectChatDetails
        | GroupChatDetails
      )[];
      if (!chats) return;
      chats.sort((a, b) => {
        const unreadCountA =
          (cache.get(`unread-${a.$id}`)?.data as number) || 1;
        const unreadCountB =
          (cache.get(`unread-${b.$id}`)?.data as number) || 1;
        if (unreadCountA && unreadCountB) {
          return unreadCountB - unreadCountA;
        }
        if (unreadCountB) {
          return -1;
        }
        if (unreadCountA) {
          return 1;
        }

        return 0;
      });

      globalMutate<(DirectChatDetails | GroupChatDetails)[]>(
        "conversations",
        chats,
        {
          revalidate: false,
        },
      );
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
        id={conversation.$id}
        as={"article"}
        bg={"inherit"}
        shadow={"none"}
        direction={"row"}
        py={3}
        ps={3}
        rounded={"md"}
        onClick={(e) => {
          setRecepient(contactDetails);
          setSelectedChat(conversation);
        }}
        className={`transition-all gap-2 flex items-start cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-blue2 ${
          isActive ? "bg-dark-slate5 dark:bg-dark-blue3" : ""
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
        <div className="grid gap-[2px] ml-1 overflow-hidden shrink text-ellipsis">
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
            {getFormatedDate(
              lastMessage?.$createdAt || conversation.$updatedAt,
            )}
          </span>
        </div>
      </Card>
    </motion.div>
  );
};

export default Chat;

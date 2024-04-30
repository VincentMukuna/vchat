import { memo, useEffect, useState } from "react";

import { modal } from "@/components/VModal";
import {
  Avatar,
  AvatarBadge,
  Button,
  Image,
  useColorMode,
  useStyleConfig,
} from "@chakra-ui/react";
import { UserIcon, UsersIcon } from "@heroicons/react/20/solid";
import { greenDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import useSWR, { useSWRConfig } from "swr";
import Blueticks from "../../components/Blueticks";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import {
  ChatMessage,
  DirectChatDetails,
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../../interfaces/interfaces";
import { getFormatedDate } from "../../services/dateServices";
import { SERVER } from "../../utils/config";
import { sortDocumentsByCreationDateDesc } from "../../utils/utils";

interface IChatProps {
  conversation: DirectChatDetails | GroupChatDetails;
}

const Conversation = memo(
  ({ conversation }: IChatProps) => {
    const { currentUserDetails } = useAuth();
    if (!currentUserDetails) return null;
    const { selectedChat, selectConversation } = useChatsContext();
    const [contactDetails, setContactDetails] = useState<
      IUserDetails | undefined
    >();

    const cardStyles = useStyleConfig("Card", { variant: "default" });

    const { cache } = useSWRConfig();

    const { colorMode } = useColorMode();

    const isGroup = !!(
      conversation?.$collectionId === SERVER.COLLECTION_ID_GROUPS
    );
    const isPersonal =
      !isGroup &&
      conversation.participants?.every(
        (participant: IUserDetails) =>
          participant.$id === currentUserDetails.$id,
      );

    function getLastMessage() {
      const cachedMessages = cache.get(
        `conversations/${conversation.$id}/messages`,
      )?.data as ChatMessage[];
      if (cachedMessages) {
        return cachedMessages.toSorted(sortDocumentsByCreationDateDesc).at(0);
      }
      if (isGroup) {
        let messages = conversation.groupMessages as GroupMessageDetails[];
        return messages.toSorted(sortDocumentsByCreationDateDesc).at(0);
      }
      let messages = conversation.chatMessages as DirectMessageDetails[];
      return messages.toSorted(sortDocumentsByCreationDateDesc).at(0);
    }

    const { data: lastMessage } = useSWR(
      `conversations/${conversation.$id}/last-message`,
      getLastMessage,
      {
        revalidateIfStale: false,
      },
    );

    const getUnreadCount = () => {
      const cachedMessages = cache.get(
        `conversations/${conversation.$id}/messages`,
      )?.data as ChatMessage[];
      if (cachedMessages) {
        return cachedMessages.filter(
          (message) =>
            message.senderID !== currentUserDetails.$id && !message.read,
        ).length;
      }

      if (isGroup) {
        return conversation.groupMessages.filter(
          (m: GroupMessageDetails) =>
            m.senderID !== currentUserDetails.$id && m.read === false,
        ).length;
      } else {
        return conversation.chatMessages.filter(
          (m: DirectMessageDetails) =>
            m.senderID !== currentUserDetails.$id && m.read === false,
        ).length;
      }
    };

    const { data: unreadCount } = useSWR(
      `conversations/${conversation.$id}/unread`,
      () => getUnreadCount(),
      {},
    );
    useEffect(() => {
      if (isPersonal) {
        setContactDetails(currentUserDetails);
      } else if (!isGroup && !isPersonal) {
        setContactDetails(
          conversation.participants?.filter(
            (participant: IUserDetails) =>
              participant.$id !== currentUserDetails.$id,
          )[0],
        );
      }
    });

    const isActive = selectedChat?.$id === conversation.$id;
    const avatarURL = isGroup
      ? conversation.avatarURL
      : contactDetails?.avatarURL;

    return (
      <Button
        styleConfig={cardStyles}
        as={motion.button}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        id={conversation.$id}
        bg={"inherit"}
        shadow={"none"}
        py={3}
        ps={3}
        rounded={"md"}
        onClick={(e) => {
          selectConversation(conversation.$id, contactDetails?.$id);
          // flushSync(() => {
          //   selectConversation(conversation.$id);
          // });
        }}
        className={`flex cursor-pointer items-start gap-2 transition-all hover:bg-slate-100 dark:hover:bg-dark-blue2 ${
          isActive ? "bg-dark-slate5 dark:bg-dark-blue2" : ""
        }`}
      >
        <Avatar
          src={avatarURL}
          name={isGroup ? conversation.name : contactDetails?.name || "User"}
          icon={
            isGroup ? (
              <UsersIcon className="h-[26px] w-[26px]" />
            ) : (
              <UserIcon className="h-[26px] w-[26px]" />
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            if (avatarURL) {
              modal(
                <Image
                  src={avatarURL}
                  alt={
                    isGroup
                      ? conversation.name + " group image"
                      : contactDetails?.name || "User" + " image"
                  }
                  objectFit="scale-down"
                  borderRadius={"md"}
                  sizes="150px"
                  maxH={"80vh"}
                />,
                { isCentered: true, size: ["xs", "lg"] },
              );
            }
          }}
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
        <div className="ml-1 flex shrink basis-2/3 flex-col gap-1 overflow-hidden text-ellipsis">
          <span className="max-w-full self-start overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold tracking-wide dark:text-gray1">
            {isGroup
              ? conversation.name
              : isPersonal
              ? "You"
              : contactDetails?.name}
          </span>
          <span className="flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[13px] italic tracking-wide dark:text-gray6">
            {lastMessage?.body
              ? lastMessage.senderID === currentUserDetails.$id
                ? "Me: " + lastMessage.body
                : lastMessage.body
              : "Click to start messaging "}

            {lastMessage?.senderID === currentUserDetails.$id && (
              <div className="">
                <Blueticks read={lastMessage?.read} />
              </div>
            )}
          </span>
        </div>
        <div className="mx-3 ml-auto mr-3 mt-1 flex flex-col gap-1 text-gray-300/90 ">
          <span className="flex whitespace-nowrap text-[.6rem] tracking-wide">
            {getFormatedDate(
              lastMessage?.$createdAt || conversation.$updatedAt,
            )}
          </span>
        </div>
      </Button>
    );
  },
  (prevProps, nextProps) =>
    prevProps.conversation.$id === nextProps.conversation.$id,
);

export default Conversation;

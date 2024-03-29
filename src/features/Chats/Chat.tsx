import { memo, useEffect, useState } from "react";

import { modal } from "@/components/VModal";
import {
  Avatar,
  AvatarBadge,
  Card,
  Image,
  useColorMode,
} from "@chakra-ui/react";
import { UserIcon, UsersIcon } from "@heroicons/react/20/solid";
import { greenDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import useSWR from "swr";
import Blueticks from "../../components/Blueticks";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import {
  DirectChatDetails,
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../../interfaces/interfaces";
import { getFormatedDate } from "../../services/dateServices";
import { SERVER } from "../../utils/config";
import {
  getUnreadCount,
  sortDocumentsByCreationDateDesc,
} from "../../utils/utils";

interface IChatProps {
  conversation: DirectChatDetails | GroupChatDetails;
}

const Chat = memo(
  ({ conversation }: IChatProps) => {
    const { currentUserDetails } = useAuth();
    if (!currentUserDetails) return null;
    const { setSelectedChat, selectedChat, setRecepient } = useChatsContext();
    const [contactDetails, setContactDetails] = useState<
      IUserDetails | undefined
    >();

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
    );

    const { data: unreadCount } = useSWR(
      `conversations/${conversation.$id}/unread`,
      () => getUnreadCount(conversation, currentUserDetails.$id),
      {},
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
    const avatarURL = isGroup
      ? conversation.avatarURL
      : contactDetails?.avatarURL;

    return (
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Card
          id={conversation.$id}
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
          className={`transition-all gap-2 flex items-start cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-blue2/25 ${
            isActive ? "bg-dark-slate5 dark:bg-dark-blue2" : ""
          }`}
        >
          <Avatar
            src={avatarURL}
            icon={
              isGroup ? (
                <UsersIcon className="w-[26px] h-[26px]" />
              ) : (
                <UserIcon className="w-[26px] h-[26px]" />
              )
            }
            bg={colorMode === "dark" ? "gray.600" : "gray.400"}
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
          <div className="grid gap-[2px] ml-1 overflow-hidden shrink text-ellipsis">
            <span className="max-w-full overflow-hidden text-base font-semibold tracking-wide whitespace-nowrap text-ellipsis dark:text-gray1">
              {isGroup
                ? conversation.name
                : isPersonal
                ? "You"
                : contactDetails?.name}
            </span>
            <span className="flex items-center gap-1 overflow-hidden font-sans text-[13px] italic tracking-wide whitespace-nowrap text-ellipsis dark:text-gray6">
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
  },
  (prevProps, nextProps) =>
    prevProps.conversation.$id === nextProps.conversation.$id,
);

export default Chat;

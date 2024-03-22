import { useEffect, useState } from "react";
//@ts-ignore
import NoSelectedChat from "@/components/NoSelectedChat";
import { useMessages } from "@/context/MessagesContext";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import { Box } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import {
  RoomActionTypes,
  useRoomContext,
} from "../../context/Room/RoomContext";
import {
  CHAT_MESSAGES_CHANGE_LOG_REGEXES,
  DirectChatDetails,
  DirectMessageDetails,
  GroupChatDetails,
} from "../../interfaces";
import api from "../../services/api";
import { matchAndExecute } from "../../utils";
import { SERVER } from "../../utils/config";
import useCommand from "../../utils/hooks/useCommand";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import Messages from "./Messages/MessagesList";
import RoomDetails from "./RoomDetails/RoomDetails";
import { RoomDetailsFooter } from "./RoomDetails/RoomDetailsFooter";

function Room() {
  const { currentUserDetails } = useAuth();
  const { selectedChat, setSelectedChat } = useChatsContext();
  const { isGroup, isPersonal, dispatch, roomState, roomMessagesKey } =
    useRoomContext();
  const [showDetails] = useState(false);
  const { update: updateRoomMessages } = useSWROptimistic(roomMessagesKey);
  const { update: updateLastMessage } = useSWROptimistic(
    `lastMessage ${selectedChat?.$id}`,
  );

  const { update: updateRoomDetails } = useSWROptimistic(
    `details ${selectedChat?.$id}`,
  );

  if (!currentUserDetails) return null;

  const { addMessage, messages, deleteMessage } = useMessages();

  useCommand("Escape", () => {
    dispatch({
      type: RoomActionTypes.EXIT_SELECTING_MESSAGES,
      payload: null,
    });
  });

  useEffect(() => {
    if (selectedChat && !isPersonal) {
      //subscribe to changes in chat room
      const unsubscribe = api.subscribe<DirectChatDetails | GroupChatDetails>(
        `databases.${SERVER.DATABASE_ID}.collections.${selectedChat.$collectionId}.documents.${selectedChat.$id}`,
        (response) => {
          if (
            response.payload.changerID === currentUserDetails.$id ||
            !response.payload.changeLog
          )
            return;

          const changeLog = response.payload.changeLog;

          const handleNewMessage = (newTextId: string) => {
            updateRoomMessages(
              isGroup
                ? [
                    response.payload.groupMessages.find(
                      (msg: any) => msg.$id === newTextId,
                    ),
                    ...(messages || []),
                  ]
                : [
                    response.payload.chatMessages.find(
                      (msg: any) => msg.$id === newTextId,
                    ),
                    ...(messages || []),
                  ],
              { revalidate: false },
            ).then((value: any) => {
              updateLastMessage((value as DirectMessageDetails[]).at(0));
            });
          };

          const handleDeleteMessage = (deletedTextId: string) => {
            updateRoomMessages(
              messages?.filter((msg) => msg.$id !== deletedTextId),
            );
          };

          const handleEditMessage = (editedTextId: string) => {
            const newMessage = isGroup
              ? response.payload.groupMessages.find(
                  (msg: any) => msg.$id === editedTextId,
                )
              : response.payload.chatMessages.find(
                  (msg: any) => msg.$id === editedTextId,
                );
            updateRoomMessages(
              messages?.map((msg) => {
                if (msg.$id === editedTextId) {
                  return {
                    ...msg,
                    body: newMessage.body,
                    $id: newMessage.$id + "-edited",
                  };
                }
                return msg;
              }),
            ).then((value: any) => {
              //remove edited suffix
              updateRoomMessages(
                value.map((msg: any) => {
                  if (msg.$id === newMessage.$id + "-edited") {
                    return { ...msg, $id: newMessage.$id };
                  }
                  return msg;
                }),
              );
            });
          };

          const handleReadText = (readTextId: string) => {
            updateRoomMessages(
              messages.map((msg) => {
                if (msg.$id === readTextId) {
                  return { ...msg, read: true, $id: msg.$id + "-read" };
                }
                return msg;
              }),
              { revalidate: false },
            );
          };

          const handleClearMessages = () => {
            updateRoomMessages([], { revalidate: false });
            updateLastMessage(undefined);
          };

          const handleOtherChanges = () => {
            setSelectedChat(response.payload);
            updateRoomDetails(response.payload);
          };

          const matchers = new Map();

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.newMessage,
            (matches: string[]) => {
              handleNewMessage(matches.at(1)!);
            },
          );

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.deleteMessage,
            (matches: string[]) => {
              handleDeleteMessage(matches.at(1)!);
            },
          );

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.editMessage,
            (matches: string[]) => {
              handleEditMessage(matches.at(1)!);
            },
          );

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.readMessage,
            (matches: string[]) => {
              handleReadText(matches.at(1)!);
            },
          );

          matchers.set(CHAT_MESSAGES_CHANGE_LOG_REGEXES.clearMessages, () => {
            handleClearMessages();
          });

          //match any other change
          matchers.set(/.*/, () => {
            handleOtherChanges();
          });

          matchAndExecute(changeLog, matchers);
        },
      );

      return () => {
        unsubscribe();
      };
    }
  }, [
    currentUserDetails,
    dispatch,
    isGroup,
    isPersonal,
    messages,
    selectedChat,
    updateLastMessage,
    updateRoomMessages,
    updateRoomDetails,
  ]);

  if (!selectedChat) return <NoSelectedChat />;
  return (
    <>
      <Box
        className={`grid h-full grid-rows-[1fr_6fr_0.2fr] bg-gray2 dark:bg-dark-blue1 grow`}
      >
        <ChatHeader key={`header-${selectedChat.$id}`} />
        <Messages key={`messagesList-${selectedChat.$id}`}></Messages>
        <MessageInput key={`input-${selectedChat.$id}`} />
      </Box>
      <aside
        className={`hidden ${
          showDetails && "absolute inset-0"
        } md:static  md:max-w-[20rem] grow basis-40 border-l dark:border-dark-slate4 transition-all xl:flex  flex flex-col items-center pt-6 pb-4`}
      >
        <RoomDetails />
        <RoomDetailsFooter />
      </aside>
    </>
  );
}

export default Room;

export const Component = Room;

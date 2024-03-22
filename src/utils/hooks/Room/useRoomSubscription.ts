import { useAuth } from "@/context/AuthContext";
import { useChatsContext } from "@/context/ChatsContext";
import { useMessages } from "@/context/MessagesContext";
import { useRoomContext } from "@/context/Room/RoomContext";
import {
  CHAT_MESSAGES_CHANGE_LOG_REGEXES,
  DirectChatDetails,
  DirectMessageDetails,
  GroupChatDetails,
} from "@/interfaces";
import api from "@/services/api";
import { matchAndExecute } from "@/utils";
import { SERVER } from "@/utils/config";
import { useEffect } from "react";
import useSWROptimistic from "../useSWROptimistic";

const useRoomSubscription = () => {
  const { currentUserDetails } = useAuth();
  const { selectedChat, setSelectedChat } = useChatsContext();
  const { isGroup, isPersonal, dispatch, roomMessagesKey } = useRoomContext();
  const { update: updateRoomMessages } = useSWROptimistic(roomMessagesKey);
  const { update: updateLastMessage } = useSWROptimistic(
    `lastMessage ${selectedChat?.$id}`,
  );
  const { update: updateRoomDetails } = useSWROptimistic(
    `details ${selectedChat?.$id}`,
  );
  const { messages } = useMessages();

  useEffect(() => {
    if (selectedChat && !isPersonal && currentUserDetails) {
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
};

export default useRoomSubscription;

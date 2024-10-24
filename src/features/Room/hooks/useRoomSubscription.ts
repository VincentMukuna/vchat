import { useAuth } from "@/context/AuthContext";
import { useChatsContext } from "@/context/ChatsContext";
import { useMessagesContext } from "@/context/MessagesContext";
import { useRoomContext } from "@/context/Room/RoomContext";
import { SERVER } from "@/lib/config";
import { fromJson, matchAndExecute, toJson } from "@/lib/utils";
import api from "@/services/api";
import { getChatMessage } from "@/services/chatMessageServices";
import { getGroupMessage } from "@/services/groupMessageServices";
import {
  CHAT_MESSAGES_CHANGE_LOG_REGEXES,
  DirectChatDetails,
  DirectMessageDetails,
  GroupChatDetails,
  IUserDetails,
  USER_DETAILS_CHANGE_LOG_REGEXES,
} from "@/types/interfaces";
import { useEffect } from "react";
import useSWROptimistic from "../../../lib/hooks/useSWROptimistic";

const useRoomSubscription = () => {
  const { currentUserDetails } = useAuth();
  const { selectedChat, setSelectedChat, setRecepient, recepient } =
    useChatsContext();
  const { isGroup, isPersonal, dispatch, roomMessagesKey } = useRoomContext();
  const { update: updateRoomMessages } = useSWROptimistic(roomMessagesKey);
  const { update: updateLastMessage } = useSWROptimistic(
    `conversations/${selectedChat?.$id}/last-message`,
  );
  const { update: updateRoomDetails } = useSWROptimistic(
    `details ${selectedChat?.$id}`,
  );
  const { messages } = useMessagesContext();

  if (!currentUserDetails) return null;

  useEffect(() => {
    if (isGroup) {
      return;
    } else {
      if (!recepient) return;
      if (recepient.$id === currentUserDetails?.$id) return;

      const recepientDetailsChannel = `databases.${SERVER.DATABASE_ID}.collections.${SERVER.COLLECTION_ID_USERS}.documents.${recepient?.$id}`;

      //subscribe to recepient details changes
      const unsubscribe = api.subscribe<IUserDetails>(
        recepientDetailsChannel,
        (response) => {
          if (
            response.payload.changerID === currentUserDetails.$id ||
            !response.payload.changeLog
          )
            return;

          const changeLog = response.payload.changeLog;

          const handleUpdateLastSeen = () => {
            setRecepient(response.payload);
          };

          const matchers = new Map();

          matchers.set(USER_DETAILS_CHANGE_LOG_REGEXES.updateLastSeen, () => {
            handleUpdateLastSeen();
          });

          matchAndExecute(changeLog, matchers);
        },
      );

      return () => {
        unsubscribe();
      };
    }
  }, [recepient]);

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

          console.log("response", response);

          const handleNewMessage = async (newTextId: string) => {
            const newMessage = isGroup
              ? await getGroupMessage(newTextId)
              : await getChatMessage(newTextId);
            console.log("newMessage", newMessage);
            updateRoomMessages(
              isGroup
                ? [newMessage, ...(messages || [])]
                : [newMessage, ...(messages || [])],
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
                    $updatedAt: newMessage.$updatedAt,
                  };
                }
                return msg;
              }),
            );
          };

          const handleReadText = (readTextId: string) => {
            const readText = messages.find((msg) => msg.$id === readTextId);
            if (!readText) return;
            updateRoomMessages(
              messages.map((msg) => {
                if (msg.$id === readTextId) {
                  return {
                    ...msg,
                    read: true,
                    $updatedAt: readText.$updatedAt,
                  };
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

          const handleLike = (messageId: string) => {
            const newLiker = response.payload.changerID;
            updateRoomMessages(
              messages.map((msg) => {
                if (msg.$id === messageId) {
                  return {
                    ...msg,
                    $id: msg.$id + "-liked",
                    reactions: toJson({
                      likes: msg.reactions
                        ? [...fromJson(msg.reactions).likes, newLiker]
                        : [newLiker],
                    }),
                  };
                }
                return msg;
              }),
              { revalidate: false },
            ).then((value: any) => {
              //remove liked suffix
              updateRoomMessages(
                value.map((msg: any) => {
                  if (msg.$id === messageId + "-liked") {
                    return { ...msg, $id: messageId };
                  }
                  return msg;
                }),
              );
            });
          };

          const handleUnlike = (messageId: string) => {
            const newUnliker = response.payload.changerID;
            updateRoomMessages(
              messages.map((msg) => {
                if (msg.$id === messageId) {
                  return {
                    ...msg,
                    $id: msg.$id + "-unliked",
                    reactions: toJson({
                      likes: fromJson(
                        msg.reactions || `{"likes":[]}`,
                      ).likes.filter((id: string) => id !== newUnliker),
                    }),
                  };
                }
                return msg;
              }),
              { revalidate: false },
            ).then((value: any) => {
              //remove unliked suffix
              updateRoomMessages(
                value.map((msg: any) => {
                  if (msg.$id === messageId + "-unliked") {
                    return { ...msg, $id: messageId };
                  }
                  return msg;
                }),
              );
            });
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

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.likeMessage,
            (matches: string[]) => {
              handleLike(matches.at(1)!);
            },
          );

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.unlikeMessage,
            (matches: string[]) => {
              handleUnlike(matches.at(1)!);
            },
          );

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

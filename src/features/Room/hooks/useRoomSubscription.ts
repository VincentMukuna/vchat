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
import { useEffect, useRef } from "react";
import useSWROptimistic from "../../../lib/hooks/useSWROptimistic";

const useRoomSubscription = () => {
  const { currentUserDetails } = useAuth();
  const { selectedChat, setSelectedChat, setRecepient, recepient } =
    useChatsContext();
  const { isGroup, isPersonal, roomMessagesKey } = useRoomContext();
  const { update: updateRoomMessages } = useSWROptimistic(roomMessagesKey);
  const { update: updateLastMessage } = useSWROptimistic(
    `conversations/${selectedChat?.$id}/last-message`,
  );
  const { update: updateRoomDetails } = useSWROptimistic(
    `details ${selectedChat?.$id}`,
  );
  const { messages } = useMessagesContext();
  const messagesRef = useRef(messages);
  const updateRoomMessagesRef = useRef(updateRoomMessages);
  const updateLastMessageRef = useRef(updateLastMessage);
  const updateRoomDetailsRef = useRef(updateRoomDetails);
  const currentUserDetailsIdRef = useRef(currentUserDetails?.$id);

  useEffect(() => {
    messagesRef.current = messages;
    updateRoomMessagesRef.current = updateRoomMessages;
    updateLastMessageRef.current = updateLastMessage;
    updateRoomDetailsRef.current = updateRoomDetails;
    currentUserDetailsIdRef.current = currentUserDetails?.$id;
  });

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
  }, [currentUserDetails?.$id, isGroup, recepient?.$id]);

  useEffect(() => {
    if (selectedChat && !isPersonal && currentUserDetails) {
      //subscribe to changes in chat room
      const unsubscribe = api.subscribe<DirectChatDetails | GroupChatDetails>(
        `databases.${SERVER.DATABASE_ID}.collections.${selectedChat.$collectionId}.documents.${selectedChat.$id}`,
        (response) => {
          if (
            response.payload.changerID === currentUserDetailsIdRef.current ||
            !response.payload.changeLog
          )
            return;

          const changeLog = response.payload.changeLog;

          const handleNewMessage = async (newTextId: string) => {
            const newMessage = isGroup
              ? await getGroupMessage(newTextId)
              : await getChatMessage(newTextId);
            updateRoomMessagesRef.current(
              isGroup
                ? [newMessage, ...(messagesRef.current || [])]
                : [newMessage, ...(messagesRef.current || [])],
              { revalidate: false },
            ).then((value: any) => {
              updateLastMessageRef.current(
                (value as DirectMessageDetails[]).at(0),
              );
            });
          };

          const handleDeleteMessage = (deletedTextId: string) => {
            updateRoomMessagesRef.current(
              messagesRef.current?.filter((msg) => msg.$id !== deletedTextId),
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
            updateRoomMessagesRef.current(
              messagesRef.current?.map((msg) => {
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
            const readText = messagesRef.current.find(
              (msg) => msg.$id === readTextId,
            );
            if (!readText) return;
            updateRoomMessagesRef.current(
              messagesRef.current.map((msg) => {
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
            updateRoomMessagesRef.current([], { revalidate: false });
            updateLastMessageRef.current(undefined);
          };

          const handleLike = (messageId: string) => {
            const newLiker = response.payload.changerID;
            updateRoomMessagesRef.current(
              messagesRef.current.map((msg) => {
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
              updateRoomMessagesRef.current(
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
            updateRoomMessagesRef.current(
              messagesRef.current.map((msg) => {
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
              updateRoomMessagesRef.current(
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
            updateRoomDetailsRef.current(response.payload);
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
    currentUserDetails?.$id,
    isGroup,
    isPersonal,
    selectedChat?.$collectionId,
    selectedChat?.$id,
  ]);
};

export default useRoomSubscription;

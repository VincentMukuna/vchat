import { useEffect, useState } from "react";
//@ts-ignore
import NoSelectedChat from "@/components/NoSelectedChat";
import { Box, Center } from "@chakra-ui/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
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
  GroupMessageDetails,
} from "../../interfaces";
import api from "../../services/api";
import { deleteChatMessage } from "../../services/chatMessageServices";
import { deleteGroupMessage } from "../../services/groupMessageServices";
import { VARIANTS_MANAGER } from "../../services/variants";
import { compareCreatedAt, matchAndExecute } from "../../utils";
import { SERVER } from "../../utils/config";
import useRoomMessages from "../../utils/hooks/Room/useRoomMessages";
import useCommand from "../../utils/hooks/useCommand";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import Messages from "./Messages/MessagesList";
import RoomDetails from "./RoomDetails/RoomDetails";
import { RoomDetailsFooter } from "./RoomDetails/RoomDetailsFooter";

function Room() {
  const { currentUserDetails } = useAuth();
  const { mutate: globalMutate } = useSWRConfig();
  const { selectedChat, setSelectedChat } = useChatsContext();
  const { isGroup, isPersonal, dispatch, roomState } = useRoomContext();
  const [showDetails] = useState(false);

  if (!currentUserDetails) return null;

  const { data, isLoading, error, mutate, isValidating } = useRoomMessages();

  const handleDeleteMessage = async (
    message: DirectMessageDetails | GroupMessageDetails,
  ) => {
    if (!selectedChat) return;
    let newMessages = data?.filter((msg) => msg.$id !== message.$id);
    mutate(newMessages, {
      revalidate: false,
      rollbackOnError: true,
    });
    globalMutate(
      `lastMessage ${selectedChat.$id}`,
      newMessages && newMessages.sort(compareCreatedAt).at(0),
      { revalidate: false },
    );

    try {
      if (isGroup) {
        await deleteGroupMessage(
          currentUserDetails.$id,
          selectedChat.$id,
          message as GroupMessageDetails,
        );
      } else {
        await deleteChatMessage(
          currentUserDetails.$id,
          selectedChat.$id,
          message as DirectMessageDetails,
        );
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

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
            mutate(
              isGroup
                ? [
                    response.payload.groupMessages.find(
                      (msg: any) => msg.$id === newTextId,
                    ),
                    ...(data || []),
                  ]
                : [
                    response.payload.chatMessages.find(
                      (msg: any) => msg.$id === newTextId,
                    ),
                    ...(data || []),
                  ],
              { revalidate: false },
            ).then((value: any) => {
              globalMutate(
                `lastMessage ${selectedChat.$id}`,
                (value as DirectMessageDetails[]).at(0),
                { revalidate: false },
              );
            });
          };

          const handleDeleteMessage = (deletedTextId: string) => {
            mutate(data?.filter((msg) => msg.$id !== deletedTextId), {
              revalidate: false,
            });
          };

          const handleEditMessage = (editedTextId: string) => {
            const newMessage = isGroup
              ? response.payload.groupMessages.find(
                  (msg: any) => msg.$id === editedTextId,
                )
              : response.payload.chatMessages.find(
                  (msg: any) => msg.$id === editedTextId,
                );
            mutate(
              data?.map((msg) => {
                if (msg.$id === editedTextId) {
                  return {
                    ...msg,
                    body: newMessage.body,
                    $id: newMessage.$id + "-edited",
                  };
                }
                return msg;
              }),
              { revalidate: false },
            ).then((value: any) => {
              //remove edited suffix
              mutate(
                value.map((msg: any) => {
                  if (msg.$id === newMessage.$id + "-edited") {
                    return { ...msg, $id: newMessage.$id };
                  }
                  return msg;
                }),
                { revalidate: false },
              );
            });
          };

          const handleReadText = (readTextId: string) => {
            mutate(
              data?.map((msg) => {
                if (msg.$id === readTextId) {
                  return { ...msg, read: true, $id: msg.$id + "-read" };
                }
                return msg;
              }),
              { revalidate: false },
            );
          };

          const handleClearMessages = () => {
            mutate([], { revalidate: false });
            globalMutate(`lastMessage ${selectedChat.$id}`, undefined, {
              revalidate: false,
            });
          };

          const handleOtherChanges = () => {
            setSelectedChat(response.payload);
            globalMutate(`details ${selectedChat!.$id}`, response.payload, {
              revalidate: false,
            });
          };

          const matchers = new Map();

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.newmessage,
            (matches: string[]) => {
              handleNewMessage(matches.at(1)!);
            },
          );

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.deletemessage,
            (matches: string[]) => {
              handleDeleteMessage(matches.at(1)!);
            },
          );

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.editmessage,
            (matches: string[]) => {
              handleEditMessage(matches.at(1)!);
            },
          );

          matchers.set(
            CHAT_MESSAGES_CHANGE_LOG_REGEXES.readmessage,
            (matches: string[]) => {
              handleReadText(matches.at(1)!);
            },
          );

          matchers.set(CHAT_MESSAGES_CHANGE_LOG_REGEXES.clearmessages, () => {
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
  }, [selectedChat, data, isGroup, currentUserDetails, mutate, globalMutate]);

  if (!selectedChat) return <NoSelectedChat />;
  return (
    <>
      <Box
        as={motion.main}
        key="chatbox"
        variants={VARIANTS_MANAGER}
        initial="slide-from-right"
        animate="slide-in"
        exit="slide-from-right"
        className={`grid h-full grid-rows-[1fr_6fr_0.2fr] bg-gray2 dark:bg-dark-blue1 grow`}
      >
        <ChatHeader key={`header-${selectedChat.$id}`} />
        {error ? (
          <Center className="flex-col w-full h-full">
            Whoops!
            <p className="text-sm"> Can't get messages at the moment! </p>
          </Center>
        ) : (
          data && (
            <Messages
              key={`messagesList-${selectedChat.$id}`}
              messages={data}
              onDelete={handleDeleteMessage}
              isLoading={isLoading}
            ></Messages>
          )
        )}

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

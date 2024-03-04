import { useEffect, useState } from "react";
//@ts-ignore
import { Box, Center } from "@chakra-ui/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import chatSVG from "../../assets/groupChat.svg";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { useRoomContext } from "../../context/RoomContext";
import {
  DirectChatDetails,
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
} from "../../interfaces";
import api from "../../services/api";
import { deleteChatMessage } from "../../services/chatMessageServices";
import { deleteGroupMessage } from "../../services/groupMessageServices";
import { VARIANTS_MANAGER } from "../../services/variants";
import { compareCreatedAt } from "../../utils";
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
  const {
    selectedMessages,
    setSelectedMessages,
    isGroup,
    isPersonal,
    setIsSelectingMessages,
  } = useRoomContext();
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

  useEffect(() => {
    setSelectedMessages([]);
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      globalMutate(`unread-${selectedChat.$id}`, 0, { revalidate: false });
    }
  }, [selectedChat]);

  useCommand("Escape", () => {
    setIsSelectingMessages(false);
    setSelectedMessages([]);
  });

  useEffect(() => {
    if (selectedChat && !isPersonal) {
      //subscribe to changes in chat room
      const unsubscribe = api.subscribe<DirectChatDetails | GroupChatDetails>(
        `databases.${SERVER.DATABASE_ID}.collections.${selectedChat.$collectionId}.documents.${selectedChat.$id}`,
        (response) => {
          if (
            response.payload.changerID !== currentUserDetails.$id &&
            (response.payload.changeLog === "addadmin" ||
              response.payload.changeLog === "removeadmin" ||
              response.payload.changeLog === "changedetails" ||
              response.payload.changeLog === "editmembers")
          ) {
            setSelectedChat(response.payload);
            globalMutate(`details ${selectedChat!.$id}`, response.payload, {
              revalidate: false,
            });
          } else if (
            response.payload.changerID !== currentUserDetails.$id &&
            (response.payload.changeLog === "newtext" ||
              response.payload.changeLog === "deletetext" ||
              response.payload.changeLog === "readtext")
          ) {
            mutate(
              isGroup
                ? response.payload.groupMessages.sort(compareCreatedAt)
                : response.payload.chatMessages.sort(compareCreatedAt),
              { revalidate: false },
            ).then((value) => {
              globalMutate(
                `lastMessage ${selectedChat.$id}`,
                (value as (DirectMessageDetails | GroupMessageDetails)[]).at(0),

                { revalidate: false },
              );
            });
          } else if (
            (response.payload.changerID !== currentUserDetails.$id &&
              response.payload.changeLog === "clearmessages") ||
            response.payload.changeLog === "cleared"
          ) {
            mutate([], { revalidate: false });
            globalMutate(`lastMessage ${selectedChat.$id}`, undefined, {
              revalidate: false,
            });
          }
        },
      );

      return () => {
        unsubscribe();
      };
    }
  }, [selectedChat]);

  if (!selectedChat) {
    return (
      <motion.div className="flex flex-col items-center w-full h-full ">
        <motion.img
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          src={chatSVG}
          alt=""
          className="w-[4\6] h-4/6 p-4 max-w-md"
        />
        <p>Vchat</p>
        <p>Click on Chat to start messaging</p>
      </motion.div>
    );
  }
  return (
    <>
      <Box
        as={motion.main}
        key="chatbox"
        variants={VARIANTS_MANAGER}
        initial="slide-from-right"
        animate="slide-in"
        exit="slide-from-right"
        className="grid h-full grid-flow-row grid-rows-[85px_auto_60px] dark:bg-dark-gray4 grow "
      >
        <ChatHeader />
        {error ? (
          <Center className="flex-col w-full h-full">
            Whoops!
            <p className="text-sm"> Can't get messages at the moment! </p>
          </Center>
        ) : (
          data && (
            <Messages
              messages={data}
              onDelete={handleDeleteMessage}
              isLoading={isLoading}
            ></Messages>
          )
        )}

        <MessageInput />
      </Box>
      <aside
        className={`hidden ${
          showDetails && "absolute inset-0"
        } md:static  md:max-w-[20rem] grow basis-40 border-l transition-all xl:flex  flex flex-col items-center pt-6 pb-4`}
      >
        <RoomDetails />
        <RoomDetailsFooter />
      </aside>
    </>
  );
}

export default Room;

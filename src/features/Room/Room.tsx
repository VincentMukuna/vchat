import { useEffect, useState } from "react";
//@ts-ignore
import chatSVG from "../../assets/groupChat.svg";
import ChatHeader from "./ChatHeader";
import MessageInput, { Message } from "./MessageInput";
import Messages from "./Messages/MessagesList";
import api from "../../services/api";
import { SERVER } from "../../utils/config";
import { useChatsContext } from "../../context/ChatsContext";
import {
  IChat,
  IChatMessage,
  IGroup,
  IGroupMessage,
  IUserDetails,
} from "../../interfaces";
import {
  deleteChatMessage,
  getChatMessages,
} from "../../services/chatMessageServices";
import {
  deleteGroupMessage,
  getGroupDetails,
  getGroupMessages,
} from "../../services/groupMessageServices";
import useSWR, { KeyedMutator, useSWRConfig } from "swr";
import RoomDetails, { RoomDetailsHeader } from "./RoomDetails/RoomDetails";
import { RoomDetailsFooter } from "./RoomDetails/RoomDetailsFooter";
import { Box, Center, useColorMode } from "@chakra-ui/react";
import { ClipLoader } from "react-spinners";
import { blue, blueDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useSWRInfinite, { unstable_serialize } from "swr/infinite";
import toast from "react-hot-toast";
import { useInfinite } from "../../hooks/useInfinite";
import { VARIANTS_MANAGER } from "../../services/variants";
import { compareCreatedAt } from "../../utils";

function Room() {
  const { currentUserDetails } = useAuth();
  const { mutate: globalMutate } = useSWRConfig();
  const { colorMode } = useColorMode();
  const { selectedChat, recepient, setMsgsCount, msgsCount, setSelectedChat } =
    useChatsContext();

  const [showDetails, setShowDetails] = useState(false);

  if (!currentUserDetails) return null;

  const isGroup = !!(
    selectedChat?.$collectionId === SERVER.COLLECTION_ID_GROUPS
  );

  const isPersonal =
    selectedChat &&
    !isGroup &&
    selectedChat?.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  async function getRoomMessages() {
    if (!selectedChat) return undefined;
    if (isGroup) {
      const [messages, total] = await getGroupMessages(selectedChat.$id);
      return messages;
    }
    const [messages, total] = await getChatMessages(selectedChat.$id);
    return messages;
  }

  function getFallbackMessages() {
    if (!selectedChat) return undefined;
    if (isGroup) {
      return selectedChat.groupMessages.sort(
        compareCreatedAt,
      ) as IGroupMessage[];
    } else {
      return selectedChat.chatMessages.sort(compareCreatedAt) as IChatMessage[];
    }
  }
  const { data, isLoading, error, mutate, isValidating } = useSWR(
    () => (selectedChat ? `${selectedChat.$id}-messages` : null),
    getRoomMessages,
    { fallbackData: getFallbackMessages() },
  );

  const handleDeleteMessage = async (message: IChatMessage | IGroupMessage) => {
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
          message.$id,
          message.attachments,
        );
      } else {
        await deleteChatMessage(
          currentUserDetails.$id,
          selectedChat.$id,
          message as IChatMessage,
        );
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  useEffect(() => {
    if (selectedChat) {
      globalMutate(`unread-${selectedChat.$id}`, 0, { revalidate: false });
    }
  }, [selectedChat]);
  useEffect(() => {
    if (selectedChat && !isPersonal) {
      //subscribe to changes in chat room
      const unsubscribe = api.subscribe<IChat | IGroup>(
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
                (value as (IChatMessage | IGroupMessage)[]).at(0),

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
          <Messages
            messages={data!}
            onDelete={handleDeleteMessage}
            isLoading={isLoading}
          ></Messages>
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

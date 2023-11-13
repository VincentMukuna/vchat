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
  getGroupMessages,
} from "../../services/groupMessageServices";
import useSWR, { KeyedMutator, useSWRConfig } from "swr";
import RoomDetails, {
  RoomDetailsFooter,
  RoomDetailsHeader,
} from "./RoomDetails/RoomDetails";
import { Box, Center, useColorMode, Button } from "@chakra-ui/react";
import { ClipLoader } from "react-spinners";
import { blue, blueDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useSWRInfinite, { unstable_serialize } from "swr/infinite";
import toast from "react-hot-toast";
import { useInfinite } from "../../hooks/useInfinite";

export function compareCreatedAt(a: any, b: any) {
  const dateA = new Date(a.$createdAt);
  const dateB = new Date(b.$createdAt);

  if (dateA < dateB) {
    return 1;
  } else if (dateA > dateB) {
    return -1;
  } else {
    return 0;
  }
}

function Room() {
  const { currentUserDetails } = useAuth();
  const { mutate: globalMutate } = useSWRConfig();
  const { colorMode } = useColorMode();
  const { selectedChat, recepient, setMsgsCount, msgsCount } =
    useChatsContext();

  const [showDetails, setShowDetails] = useState(false);

  if (!currentUserDetails) return null;

  const isGroup = !!(selectedChat?.$collectionId === "groups");
  const isPersonal =
    selectedChat &&
    !isGroup &&
    selectedChat?.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );
  let re = new RegExp(`${selectedChat?.$id}-messages-(\\w+)`);
  const {
    data,
    isLoading,
    error,
    mutate,
    size,
    setSize,
    isValidating,
    totalRef,
  } = useInfinite<IChatMessage | IGroupMessage>(
    isGroup ? getGroupMessages : getChatMessages,
    selectedChat && selectedChat?.$id + "-messages",
    re,
    [selectedChat?.$id],
  );
  const messages = ([] as (IChatMessage | IGroupMessage)[]).concat(
    ...(data || []),
  );
  useEffect(() => {
    if (totalRef.current) {
      setMsgsCount(totalRef.current);
    }
  }, [totalRef.current]);

  const handleDeleteMessage = async (message: IChatMessage | IGroupMessage) => {
    if (!selectedChat) return;
    let newMessages = data?.map(
      (msgArray) => msgArray?.filter((msg) => msg.$id !== message.$id),
    );
    mutate(newMessages, {
      revalidate: false,
      rollbackOnError: true,
    });
    globalMutate(
      `lastMessage ${selectedChat.$id}`,
      newMessages && newMessages.at(0)?.at(0),
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
    if (selectedChat && !isPersonal) {
      //subscribe to changes in chat room
      const unsubscribe = api.subscribe<IChat | IGroup>(
        `databases.${SERVER.DATABASE_ID}.collections.${selectedChat.$collectionId}.documents.${selectedChat.$id}`,
        (response) => {
          if (
            (response.payload.changerID !== currentUserDetails.$id &&
              response.payload.changeLog === "newtext") ||
            response.payload.changeLog === "deletetext" ||
            response.payload.changeLog === "readtext"
          ) {
            mutate().then((value) => {
              globalMutate(
                `lastMessage ${selectedChat.$id}`,
                (value as (IChatMessage | IGroupMessage)[][]).at(0)?.at(0),

                { revalidate: false },
              );
            });
          } else if (response.payload.changeLog === "cleared") {
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
          className="w-[400px] h-4/6"
        />
        <p>Vchat</p>
        <p>Click on Chat to start messaging</p>
      </motion.div>
    );
  }
  return (
    <>
      <Box
        as="main"
        className="grid h-full grid-flow-row grid-rows-[85px_auto_70px] dark:bg-dark-gray4 transition-all grow "
      >
        <ChatHeader />
        {error ? (
          <Center className="flex-col w-full h-full">
            Whoops!
            <p className="text-sm"> Can't get messages at the moment! </p>
          </Center>
        ) : (
          <Messages
            messages={messages.filter((message) => !!message)}
            onDelete={handleDeleteMessage}
            isLoading={isLoading}
          >
            {totalRef.current > messages.length && msgsCount > 20 && (
              <Button
                variant={"ghost"}
                onClick={() => setSize(size + 1)}
                isLoading={isValidating}
                // hidden={messages.at(-1)?.length === 0 ? true : false}
                flexShrink={0}
              >
                {isValidating ? "Fetching" : "See previous"}
              </Button>
            )}
          </Messages>
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

import { useEffect } from "react";
//@ts-ignore
import chatSVG from "../../assets/groupChat.svg";
import ChatHeader from "./ChatHeader";
import Input, { Message } from "./Input";
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
import RoomDetails from "./RoomDetails";
import { Box, Center, useColorMode, Button } from "@chakra-ui/react";
import { ClipLoader } from "react-spinners";
import { blue, blueDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useSWRInfinite from "swr/infinite";

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

  if (!currentUserDetails) return null;

  const isGroup = !!(selectedChat?.$collectionId === "groups");
  const isPersonal =
    selectedChat &&
    !isGroup &&
    selectedChat?.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  function getKey(pageIndex: number, previousPageData: any) {
    if (previousPageData && !previousPageData.length) return null;
    if (!selectedChat) return undefined;
    if (pageIndex === 0) {
      return `${selectedChat!.$id}-messages-`;
    }
    return `${selectedChat.$id}-messages-${previousPageData.at(-1).$id}`;
  }

  async function fetcher(key: string) {
    if (!selectedChat) return undefined;
    let messages: (IGroupMessage | IChatMessage)[] = [];
    let re = new RegExp(`${selectedChat.$id}-messages-(\\w+)`);
    let match = key.match(re);
    if (match) {
      let { messages: docs, total } = isGroup
        ? await getGroupMessages(selectedChat.$id, match[1])
        : await getChatMessages(selectedChat.$id, match[1]);
      setMsgsCount(total);
      messages = docs;
    } else {
      let { messages: docs, total } = isGroup
        ? await getGroupMessages(selectedChat.$id)
        : await getChatMessages(selectedChat.$id);
      messages = docs;
      setMsgsCount(total);
    }
    return messages.sort(compareCreatedAt);
  }

  const {
    data: messages,
    isLoading,
    error,
    mutate,
    size,
    setSize,
    isValidating,
  } = useSWRInfinite(getKey, fetcher);

  const handleDeleteMessage = async (message: IChatMessage | IGroupMessage) => {
    if (!selectedChat) return;
    let newMessages = messages?.map(
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
    if (isGroup) {
      try {
        await deleteGroupMessage(
          currentUserDetails.$id,
          selectedChat.$id,
          message.$id,
          message.attachments,
        );
      } catch (error: any) {
        console.log("Error deleting message! ", error.message);
      }

      return;
    } else {
      await deleteChatMessage(
        currentUserDetails.$id,
        selectedChat.$id,
        message as IChatMessage,
      );
    }
  };
  useEffect(() => {
    if (selectedChat && !isPersonal) {
      //subscribe to changes in chat room
      const unsubscribe = api.subscribe<IChat | IGroup>(
        `databases.${SERVER.DATABASE_ID}.collections.${selectedChat.$collectionId}.documents.${selectedChat.$id}`,
        (response) => {
          if (response.payload.changerID !== currentUserDetails.$id) {
            console.log("Mine change! ");
          }

          if (
            (response.payload.changerID !== currentUserDetails.$id &&
              response.payload.changeLog === "newtext") ||
            response.payload.changeLog === "deletetext" ||
            response.payload.changeLog === "readtext"
          ) {
            console.log("Not mine");
            mutate();
            globalMutate(`lastMessage ${selectedChat.$id}`);
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
  if (isLoading || messages === undefined) {
    return (
      <Center className="w-full h-full dark:text-white">
        <ClipLoader
          color={colorMode === "dark" ? blue.blue1 : blueDark.blue1}
        />
      </Center>
    );
  } else
    return (
      <>
        <Box
          as="main"
          className="grid h-full grid-flow-row grid-rows-[85px_auto_70px] dark:bg-dark-gray4 transition-all grow shrink-0"
        >
          <ChatHeader />
          {error ? (
            <Center className="flex-col w-full h-full">
              Whoops!
              <p className="text-sm"> Can't get messages at the moment! </p>
            </Center>
          ) : (
            <Messages
              messages={([] as IGroupMessage[]).concat(
                ...(messages as IGroupMessage[][]),
              )}
              onDelete={handleDeleteMessage}
            >
              {msgsCount >
                ([] as IGroupMessage[]).concat(
                  ...(messages as IGroupMessage[][]),
                ).length &&
                msgsCount > 5 && (
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

          <Input />
        </Box>
        <aside
          className={`hidden max-w-[20rem] grow basis-40 transition-all xl:flex border-l-[1px]`}
        >
          <RoomDetails />
        </aside>
      </>
    );
}

export default Room;

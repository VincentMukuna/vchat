import { useEffect } from "react";
//@ts-ignore
import chatSVG from "../../assets/groupChat.svg";
import ChatHeader from "./ChatHeader";
import Input from "./Input";
import Messages from "./Messages";
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
import useSWR, { useSWRConfig } from "swr";
import RoomDetails from "./RoomDetails";
import { Box, Center, useColorMode } from "@chakra-ui/react";
import { ClipLoader } from "react-spinners";
import { blue, blueDark } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

function Room() {
  const { currentUserDetails } = useAuth();
  const { mutate: globalMutate } = useSWRConfig();
  const { colorMode } = useColorMode();
  const { selectedChat, recepient } = useChatsContext();

  if (!currentUserDetails) return null;

  const isGroup = !!(selectedChat?.$collectionId === "groups");
  const isPersonal =
    selectedChat &&
    !isGroup &&
    selectedChat?.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  const getRoomMessages = async () => {
    if (isGroup) {
      let messages = await getGroupMessages(selectedChat.$id);
      return messages;
    }
    if (!selectedChat || !recepient) return undefined;
    let messages = await getChatMessages(selectedChat.$id);
    return messages;
  };

  const {
    data: messages,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(selectedChat?.$id, getRoomMessages, {});

  const handleDeleteMessage = async (message: IChatMessage | IGroupMessage) => {
    if (!selectedChat) return;
    if (isGroup) {
      mutate(messages?.filter((msg) => msg.$id !== message.$id), {
        revalidate: false,
        rollbackOnError: true,
      });
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
      mutate(messages?.filter((msg) => msg.$id !== message.$id), {
        revalidate: false,
        rollbackOnError: true,
      });
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
          if (
            response.payload.changeLog === "newtext" ||
            response.payload.changeLog === "deletetext"
          ) {
            mutate();
            globalMutate(`lastMessage ${selectedChat.$id}`);
          } else if (response.payload.changeLog === "cleared") {
            mutate([], { revalidate: false });
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
  if (isLoading || messages == undefined) {
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
            <Messages messages={messages} onDelete={handleDeleteMessage} />
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

import { useEffect, useState } from "react";
//@ts-ignore
import chatSVG from "../../assets/groupChat.svg";
import ChatHeader from "./ChatHeader";
import Input from "./Input";
import Messages from "./Messages";
import api from "../../services/api";
import { Server } from "../../utils/config";
import { useChatsContext } from "../../context/ChatsContext";
import { IChat, IChatMessage, IGroupMessage } from "../../interfaces";
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
import { BeatLoader, ClipLoader } from "react-spinners";
import { blue, blueDark } from "@radix-ui/colors";

function Room() {
  const { mutate: globalMutate } = useSWRConfig();
  const { colorMode } = useColorMode();
  const { selectedChat, recepient } = useChatsContext();
  const [showDetails, setShowDetails] = useState(false);

  const isGroup = !!(selectedChat?.$collectionId === "groups");

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
        await deleteGroupMessage(selectedChat.$id, message.$id);
      } catch (error: any) {
        console.log("Error deleting message! ", error.message);
      }

      return;
    } else {
      mutate(messages?.filter((msg) => msg.$id !== message.$id), {
        revalidate: false,
        rollbackOnError: true,
      });
      await deleteChatMessage(selectedChat.$id, message as IChatMessage);
    }
  };
  useEffect(() => {
    if (selectedChat) {
      //subscribe to changes in chat room
      const unsubscribe = api.subscribe<IChat>(
        `databases.${Server.databaseID}.collections.${selectedChat.$collectionId}.documents.${selectedChat.$id}`,
        (response) => {
          if (response.payload.changeLog === "newtext") {
            console.log(response.payload);
            if (messages) {
              mutate([...messages, response.payload]);
            } else {
              mutate();
            }
            globalMutate(`lastMessage ${selectedChat.$id}`);
          } else if (response.payload.changeLog === "deletetext") {
            mutate(
              messages?.filter((msg) => msg.$id !== response.payload.$id),
              {
                revalidate: false,
                rollbackOnError: true,
              },
            );
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
      <div className="flex flex-col items-center w-full h-full ">
        <img src={chatSVG} alt="" className="w-[400px] h-4/6" />
        <p>Vchat</p>
        <p>Click on Chat to start messaging</p>
      </div>
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
          className="flex flex-col h-full transition-all grow shrink-0"
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
          className={`hidden max-w-[20rem] grow basis-40 transition-all xl:flex `}
        >
          <RoomDetails />
        </aside>
      </>
    );
}

export default Room;

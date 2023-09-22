import { useEffect } from "react";
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
import useSWR from "swr";

function Room() {
  const { selectedChat, recepient } = useChatsContext();
  console.log(selectedChat);

  const isGroup = !!selectedChat?.groupMessages;

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
          if (
            response.payload.changeLog === "newtext" ||
            response.payload.changeLog === "deletetext"
          ) {
            mutate();
          }
        },
      );

      return () => {
        unsubscribe();
      };
    }
  }, [selectedChat]);

  if (error) {
    return (
      <div className="self-center text-lg ">
        Whoops!
        <p className="text-sm"> Can't get messages at the moment! </p>
      </div>
    );
  }
  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-lg text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-24 h-24 text-secondary-main/50"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>

        <p>Vchat</p>
        <p>Click on Chat to start messaging</p>
      </div>
    );
  }
  if (isLoading || messages == undefined) {
    return <p>Loading...</p>;
  } else
    return (
      <>
        <main className="flex flex-col h-full transition-all grow shrink-0">
          <ChatHeader />
          <Messages messages={messages} onDelete={handleDeleteMessage} />
          <Input />
        </main>
        <aside
          className={`hidden max-w-[20rem] grow basis-40 transition-all xl:flex`}
        >
          profile
        </aside>
      </>
    );
}

export default Room;

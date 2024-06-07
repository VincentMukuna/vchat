import {
  DirectMessageSendDto,
  GroupMessageSendDto,
  Message,
} from "@/features/Room/Messages/MessageInput/MessageInput";
import useRoomMessages from "@/features/Room/hooks/useRoomMessages";
import useSWROptimistic from "@/lib/hooks/useSWROptimistic";
import {
  deleteChatMessage,
  sendChatMessage,
} from "@/services/chatMessageServices";
import {
  deleteGroupMessage,
  sendGroupMessage,
} from "@/services/groupMessageServices";
import {
  DirectMessageDetails,
  GroupMessageDetails,
  IUserDetails,
} from "@/types/interfaces";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useChatsContext } from "./ChatsContext";
import { useRoomContext } from "./Room/RoomContext";

const MessagesContext = createContext<MessageContext | undefined>(undefined);

type MessageContext = {
  messages: Message[];
  search: string;
  createMessage: (message: any) => Promise<any>;
  deleteMessage: (id: string) => Promise<any>;
  handleSearch: (search: string) => void;
};

export default function MessagesProvider({
  children,
}: {
  children: React.ReactNode[] | React.ReactNode;
}) {
  const { currentUserDetails } = useAuth();
  const { isGroup, isPersonal, roomMessagesKey } = useRoomContext();
  const { data: messages } = useRoomMessages();
  const { selectedChat, recepient } = useChatsContext();

  const { update: updateRoomMessages } = useSWROptimistic(roomMessagesKey);
  const { update: updateLastMessage } = useSWROptimistic(
    `conversations/${selectedChat?.$id}/last-message`,
  );

  const createMessage = async (
    message: GroupMessageSendDto | DirectMessageSendDto,
  ) => {
    // add message to messages
    if (!messages || !currentUserDetails) return;
    const newMessages = [message, ...messages];

    let sMessage: Message;

    //optimistically add message
    updateRoomMessages(newMessages);
    updateLastMessage(message);

    try {
      //add message to server
      if (isGroup) {
        //add group message
        sMessage = await sendGroupMessage(selectedChat!.$id, {
          body: message.body,
          senderID: message.senderID,
          attachments: message.attachments,
          replying: message.replying,
        });
      } else {
        sMessage = await sendChatMessage(selectedChat!.$id, {
          body: message.body,
          recepientID: (recepient as IUserDetails).$id,
          senderID: currentUserDetails.$id,
          attachments: message.attachments,
          replying: message.replying,
          read: isPersonal ? true : false,
        });
      }
      updateRoomMessages(
        newMessages.map((m) => {
          if (m.$id === message.$id) {
            return sMessage;
          } else return m;
        }),
      );
    } catch (error) {
      //rollback
      updateRoomMessages(messages);
      updateLastMessage(newMessages[1]);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!messages || !currentUserDetails) return;
    //get message by id and remove it
    const message = messages.find((message) => message.$id === id);
    if (!message) return;

    //optimistically remove message
    const newMessages = messages.filter((msg) => msg.$id !== id);
    updateRoomMessages(newMessages);

    //remove message from server
    try {
      if (isGroup) {
        await deleteGroupMessage(
          currentUserDetails.$id,
          selectedChat!.$id,
          message as GroupMessageDetails,
        );
      } else {
        await deleteChatMessage(
          currentUserDetails.$id,
          selectedChat!.$id,
          message as DirectMessageDetails,
        );
      }
    } catch (error) {
      //rollback
      updateRoomMessages(messages);
    }
  };

  const [search, setSearch] = useState("");
  const handleSearch = (search: string) => {
    setSearch(search);
  };

  useEffect(() => {
    return () => {
      setSearch("");
    };
  }, [selectedChat]);

  return (
    <MessagesContext.Provider
      value={{
        search,
        messages: messages || [],
        createMessage,
        deleteMessage,
        handleSearch,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessagesContext() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}

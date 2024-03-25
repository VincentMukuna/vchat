import {
  DirectMessageSendDto,
  GroupMessageSendDto,
  Message,
} from "@/features/Room/MessageInput";
import {
  DirectMessageDetails,
  GroupMessageDetails,
  IUserDetails,
} from "@/interfaces";
import {
  deleteChatMessage,
  sendChatMessage,
} from "@/services/chatMessageServices";
import {
  deleteGroupMessage,
  sendGroupMessage,
} from "@/services/groupMessageServices";
import useRoomMessages from "@/utils/hooks/Room/useRoomMessages";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useChatsContext } from "./ChatsContext";
import { useRoomContext } from "./Room/RoomContext";

const MessagesContext = createContext<MessageContext | undefined>(undefined);

type MessageContext = {
  messages: Message[];
  createMessage: (message: any) => Promise<any>;
  deleteMessage: (id: string) => Promise<any>;
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
      updateLastMessage(messages[messages.length - 1]);
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

  return (
    <MessagesContext.Provider
      value={{
        messages: messages || [],
        createMessage,
        deleteMessage,
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

import { useState } from "react";
import toast from "react-hot-toast";
import { mutate, useSWRConfig } from "swr";
import { useAuth } from "../../../context/AuthContext";
import { useChatsContext } from "../../../context/ChatsContext";
import { useRoomContext } from "../../../context/RoomContext";
import {
  DirectMessageSendDto,
  GroupMessageSendDto,
} from "../../../features/Room/MessageInput";
import {
  DirectMessageDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../../../interfaces";
import { sendChatMessage } from "../../../services/chatMessageServices";
import { sendGroupMessage } from "../../../services/groupMessageServices";

export default function useSendMessage() {
  const [sending, setSending] = useState(false);
  const { currentUserDetails } = useAuth();
  const { selectedChat, recepient } = useChatsContext();
  const { roomMessagesKey, isGroup, isPersonal } = useRoomContext();
  const { cache } = useSWRConfig();

  async function sendMessage(
    message: GroupMessageSendDto | DirectMessageSendDto,
  ) {
    if (!currentUserDetails || !selectedChat || !roomMessagesKey) return;
    setSending(true);

    const roomMessages = cache.get(roomMessagesKey)?.data as (
      | DirectMessageDetails
      | GroupMessageDetails
    )[];

    if (!roomMessages) {
      return;
    }

    const newMessages = [message, ...roomMessages];

    await mutate(roomMessagesKey, newMessages, {
      revalidate: false,
    });

    let container = document.getElementById(
      "messages-container",
    ) as HTMLDivElement;
    container.scrollTo({ top: 0, behavior: "smooth" });
    mutate(`lastMessage ${selectedChat.$id}`, message, {
      revalidate: false,
    });
    let msgSentPromise = isGroup
      ? sendGroupMessage(selectedChat.$id, {
          body: message.body,
          senderID: message.senderID,
          attachments: message.attachments,
        })
      : sendChatMessage(selectedChat.$id, {
          body: message.body,
          recepientID: (recepient as IUserDetails).$id,
          senderID: currentUserDetails.$id,
          attachments: message.attachments,
          read: isPersonal ? true : false,
        });

    let messages = cache.get(roomMessagesKey)?.data as (
      | DirectMessageDetails
      | GroupMessageDetails
    )[];
    setSending(false);

    msgSentPromise.then((msg) => {
      mutate(
        roomMessagesKey,
        messages?.map((ucMessage) => {
          if (ucMessage.$id === message.$id) {
            return { revalidated: true, ...msg };
          }
          return ucMessage;
        }),
        { revalidate: false },
      );
    });

    msgSentPromise.catch((e) => {
      mutate(
        roomMessagesKey,
        messages?.filter((ucMessage) => ucMessage.$id !== message.$id),
        { revalidate: false },
      );

      let lastMessage = cache.get(`lastMessage ${selectedChat.$id}`)?.data as
        | DirectMessageDetails
        | GroupMessageDetails;
      if (lastMessage?.$id === message.$id) {
        mutate(`lastMessage ${selectedChat.$id}`, messages.at(0), {
          revalidate: false,
        });
      }

      toast.error("Error sending message");
    });
  }

  return {
    sendMessage,
    sending,
  };
}

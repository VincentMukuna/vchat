import { useAuth } from "@/context/AuthContext";
import { useChatsContext } from "@/context/ChatsContext";
import { Message } from "@/features/Room/MessageInput";
import api from "@/services/api";
import { useRef, useState } from "react";
import useSWR from "swr";
import useIntersectionObserver from "../useIntersectionObserver";

function useReadMessage(
  message: Message,
  messagesListRef: React.RefObject<HTMLElement>,
) {
  const { currentUserDetails } = useAuth();
  const { selectedChat } = useChatsContext();
  const { data: unreadCount, mutate: updateUnreadCount } = useSWR(
    `conversations/${selectedChat!.$id}/unread`,
  );
  const messageRef = useRef<HTMLDivElement>(null);
  const isMine = message.senderID === currentUserDetails?.$id;

  const isOptimistic = !!message?.optimistic;
  const [read, setRead] = useState(message.read);

  const markMessageasRead = async () => {
    if (message.optimistic || message.read || isMine) {
      return;
    }
    if (!selectedChat) return;
    setRead(true);
    updateUnreadCount(unreadCount - 1, { revalidate: false });
    try {
      await api.updateDocument(
        message.$databaseId,
        message.$collectionId,
        message.$id,
        { read: true },
      );
      await api.updateDocument(
        selectedChat.$databaseId,
        selectedChat.$collectionId,
        selectedChat.$id,
        {
          changeLog: `message/read/${message.$id}`,
          changerID: currentUserDetails?.$id,
        },
      );
    } catch (error) {
      updateUnreadCount(unreadCount + 1, { revalidate: false });
    }
  };

  useIntersectionObserver({
    root: messagesListRef,
    target: messageRef,
    onInView() {
      console.log(`marking ${message.body} as read`);
      markMessageasRead();
    },
    time: 2000,
    observe: !read && !isMine && !isOptimistic,
  });

  return {
    messageRef,
  };
}

export default useReadMessage;

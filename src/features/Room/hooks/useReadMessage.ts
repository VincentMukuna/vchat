import { useAuth } from "@/context/AuthContext";
import { useChatsContext } from "@/context/ChatsContext";
import { Message } from "@/features/Room/Messages/MessageInput/MessageInput";
import api from "@/services/api";
import { useRef, useState } from "react";
import useSWR from "swr";
import useIntersectionObserver from "../../../lib/hooks/useIntersectionObserver";

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
      markMessageasRead();
    },
    time: 500,
    observe: !read && !isMine && !isOptimistic,
    threshold: 0.5,
  });

  return {
    messageRef,
  };
}

export default useReadMessage;

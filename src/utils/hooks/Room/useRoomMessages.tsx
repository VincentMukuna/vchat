import useSWR, { useSWRConfig } from "swr";
import { compareCreatedAt } from "../..";
import { useChatsContext } from "../../../context/ChatsContext";
import { useRoomContext } from "../../../context/RoomContext";
import { DirectMessageDetails, GroupMessageDetails } from "../../../interfaces";
import { getChatMessages } from "../../../services/chatMessageServices";
import { getGroupMessages } from "../../../services/groupMessageServices";

export default function useRoomMessages() {
  const { selectedChat } = useChatsContext();
  const { isGroup, roomMessagesKey } = useRoomContext();
  const { cache } = useSWRConfig();

  const isFirstRender = cache.get(roomMessagesKey!) === undefined;

  async function getRoomMessages() {
    if (!selectedChat) return undefined;
    if (isFirstRender) {
      return getFallbackMessages();
    }
    if (isGroup) {
      const messages = await getGroupMessages(selectedChat.$id);
      return messages;
    }
    const messages = await getChatMessages(selectedChat.$id);
    return messages;
  }

  function getFallbackMessages() {
    if (!selectedChat) return undefined;
    if (isGroup) {
      return selectedChat.groupMessages.sort(
        compareCreatedAt,
      ) as GroupMessageDetails[];
    } else {
      return selectedChat.chatMessages.sort(
        compareCreatedAt,
      ) as DirectMessageDetails[];
    }
  }
  return useSWR(
    () => (selectedChat ? `${selectedChat.$id}-messages` : null),
    getRoomMessages,
    {},
  );
}

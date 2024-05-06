import useSWR, { useSWRConfig } from "swr";
import { useChatsContext } from "../../../context/ChatsContext";
import { useRoomContext } from "../../../context/Room/RoomContext";
import {
  DirectMessageDetails,
  GroupMessageDetails,
} from "../../../interfaces/interfaces";
import { getChatMessages } from "../../../services/chatMessageServices";
import { getGroupMessages } from "../../../services/groupMessageServices";
import { sortByCreatedAtDesc } from "../../../utils/utils";

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
    return messages.toSorted(sortByCreatedAtDesc);
  }

  function getFallbackMessages() {
    if (!selectedChat) return undefined;
    if (isGroup) {
      return selectedChat.groupMessages.toSorted(
        sortByCreatedAtDesc,
      ) as GroupMessageDetails[];
    } else {
      return selectedChat.chatMessages.toSorted(
        sortByCreatedAtDesc,
      ) as DirectMessageDetails[];
    }
  }
  return useSWR(
    () => (selectedChat ? `conversations/${selectedChat.$id}/messages` : null),
    getRoomMessages,
    { fallbackData: getFallbackMessages() },
  );
}

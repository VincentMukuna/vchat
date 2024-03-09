import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { useAuth } from "../../../context/AuthContext";
import { useChatsContext } from "../../../context/ChatsContext";
import { useRoomContext } from "../../../context/RoomContext";
import {
  ChatMessage,
  DirectMessageDetails,
  GroupMessageDetails,
} from "../../../interfaces";
import { deleteSelectedDirectChatMessages } from "../../../services/chatMessageServices";
import { deleteSelectedGroupMessages } from "../../../services/groupMessageServices";

export default function useDeleteSelectedMessages() {
  const { currentUserDetails } = useAuth();

  const { cache, mutate } = useSWRConfig();
  const { selectedChat } = useChatsContext();
  const {
    selectedMessages,
    setSelectedMessages,
    isGroup,
    isPersonal,
    roomMessagesKey,
  } = useRoomContext();

  if (!selectedChat || !currentUserDetails)
    throw new Error("No user details found");

  const isAdmin =
    isGroup && selectedChat.admins.includes(currentUserDetails.$id);

  function canDeleteBasedOnPermissions(messages: ChatMessage[]) {
    if (isGroup) {
      if (isAdmin) {
        return true;
      }
    }
    return messages.every((msg) => msg.senderID === currentUserDetails?.$id);
  }

  async function deleteSelectedMessages() {
    if (!currentUserDetails || !selectedChat || !roomMessagesKey) return;
    const currentMessages = cache.get(roomMessagesKey)?.data as ChatMessage[];
    const selectedMessageIds = selectedMessages.map((msg) => msg.$id);
    if (canDeleteBasedOnPermissions(selectedMessages)) {
      //optimistic update
      mutate(
        roomMessagesKey,
        currentMessages.filter((msg) => !selectedMessageIds.includes(msg.$id)),
        { revalidate: false },
      );

      //actual update
      let promise: Promise<void>;
      if (isGroup) {
        promise = deleteSelectedGroupMessages({
          deleter: currentUserDetails.$id,
          groupID: selectedChat.$id,
          messages: selectedMessages as GroupMessageDetails[],
        });
      } else {
        promise = deleteSelectedDirectChatMessages({
          deleter: currentUserDetails.$id,
          groupID: selectedChat.$id,
          messages: selectedMessages as DirectMessageDetails[],
        });
      }

      promise
        .then(() => {
          toast.success("Messages deleted");
          setSelectedMessages([]);
        })
        .catch((e) => {
          toast.error("Something went wrong");
          mutate(roomMessagesKey);
        });
    }
  }

  return {
    deleteSelectedMessages,
    canDeleteBasedOnPermissions,
  };
}

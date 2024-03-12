import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { useAuth } from "../../../context/AuthContext";
import { useChatsContext } from "../../../context/ChatsContext";
import {
  RoomActionTypes,
  useRoomContext,
} from "../../../context/Room/RoomContext";
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
  const { isGroup, roomMessagesKey, roomState, dispatch } = useRoomContext();

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
    const selectedMessageIds = roomState.selectedMessages.map((msg) => msg.$id);
    if (canDeleteBasedOnPermissions(roomState.selectedMessages)) {
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
          messages: roomState.selectedMessages as GroupMessageDetails[],
        });
      } else {
        promise = deleteSelectedDirectChatMessages({
          deleter: currentUserDetails.$id,
          groupID: selectedChat.$id,
          messages: roomState.selectedMessages as DirectMessageDetails[],
        });
      }

      promise
        .then(() => {
          toast.success("Messages deleted");
          dispatch({
            type: RoomActionTypes.TOGGLE_IS_SELECTING_MESSAGES,
            payload: null,
          });
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

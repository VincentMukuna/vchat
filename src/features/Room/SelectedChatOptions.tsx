import { IconButton, Tooltip } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { mutate, useSWRConfig } from "swr";
import { confirmAlert } from "../../components/Alert/alertStore";
import { DeleteIcon } from "../../components/Icons";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { useRoomContext } from "../../context/RoomContext";
import {
  ChatMessage,
  DirectMessageDetails,
  GroupMessageDetails,
} from "../../interfaces";
import { deleteSelectedDirectChatMessages } from "../../services/chatMessageServices";
import { deleteSelectedGroupMessages } from "../../services/groupMessageServices";

export default function SelectedChatOptions() {
  const { currentUserDetails } = useAuth();

  const { cache } = useSWRConfig();
  const { selectedChat } = useChatsContext();
  const {
    selectedMessages,
    setSelectedMessages,
    isGroup,
    isPersonal,
    roomMessagesKey,
  } = useRoomContext();

  if (!selectedChat || !currentUserDetails) return null;
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

  async function handleDeleteSelectedMessages() {
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
  return (
    <Tooltip
      hidden={
        selectedMessages.length === 0 ||
        !canDeleteBasedOnPermissions(selectedMessages)
      }
      label="Delete selected messages"
      placement="left"
    >
      <IconButton
        hidden={
          selectedMessages.length === 0 ||
          !canDeleteBasedOnPermissions(selectedMessages)
        }
        variant={"ghost"}
        aria-label="delete selected messages"
        icon={<DeleteIcon className="w-6 h-6" />}
        onClick={() => {
          confirmAlert({
            message: "Delete these messages? This action is irreversible",
            title: "Delete message",
            confirmText: "Delete",
            onConfirm: () => handleDeleteSelectedMessages(),
          });
        }}
      />
    </Tooltip>
  );
}

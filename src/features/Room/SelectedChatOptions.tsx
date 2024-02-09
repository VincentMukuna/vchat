import { HStack, IconButton, Tooltip } from "@chakra-ui/react";
import { ArrowUturnRightIcon } from "@heroicons/react/20/solid";
import { confirmAlert } from "../../components/Alert/alertStore";
import { DeleteIcon } from "../../components/Icons";
import { openModal } from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { useRoomContext } from "../../context/RoomContext";
import useDeleteSelectedMessages from "../../utils/hooks/Room/useDeleteSelectedMessages";
import ForwardMessagesModal from "./ForwardMessagesModal";

export default function SelectedChatOptions() {
  const { currentUserDetails } = useAuth();
  const { selectedChat } = useChatsContext();
  const { selectedMessages } = useRoomContext();

  if (!selectedChat || !currentUserDetails) return null;
  const { canDeleteBasedOnPermissions, deleteSelectedMessages } =
    useDeleteSelectedMessages();

  return (
    <HStack>
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
          icon={<DeleteIcon className="w-4 h-4" />}
          onClick={() => {
            confirmAlert({
              message: "Delete these messages? This action is irreversible",
              title: "Delete message",
              confirmText: "Delete",
              onConfirm: () => deleteSelectedMessages(),
            });
          }}
        />
      </Tooltip>
      <IconButton
        aria-label="forward messages"
        variant={"ghost"}
        icon={<ArrowUturnRightIcon className="w-4 h-4" />}
        onClick={() => {
          openModal(
            <ForwardMessagesModal selectedMessages={selectedMessages} />,
          );
        }}
      />
    </HStack>
  );
}

import { HStack, IconButton, Tooltip } from "@chakra-ui/react";
import { ArrowUturnRightIcon } from "@heroicons/react/20/solid";
import { Square2StackIcon } from "@heroicons/react/24/outline";
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
  const { selectedMessages, isSelectingMessages, toggleIsSelectingMessages } =
    useRoomContext();

  if (!selectedChat || !currentUserDetails) return null;
  const { canDeleteBasedOnPermissions, deleteSelectedMessages } =
    useDeleteSelectedMessages();

  return (
    <HStack>
      {isSelectingMessages ? (
        <Tooltip label="select" placement="left">
          <IconButton
            aria-label="forward messages"
            variant={"ghost"}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M22 16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2h12a2 2 0 0 1 2 2zm-6 4v2H4a2 2 0 0 1-2-2V7h2v13zm-3-6l7-7l-1.41-1.41L13 11.17L9.91 8.09L8.5 9.5z"
                ></path>
              </svg>
            }
            onClick={() => {
              toggleIsSelectingMessages();
            }}
          />
        </Tooltip>
      ) : (
        <Tooltip label="select" placement="left">
          <IconButton
            aria-label="forward messages"
            variant={"ghost"}
            icon={<Square2StackIcon className="w-4 h-4" />}
            onClick={() => {
              toggleIsSelectingMessages();
            }}
          />
        </Tooltip>
      )}
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
          aria-label="Delete"
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
      <Tooltip label="Forward" placement="left">
        <IconButton
          aria-label="forward messages"
          hidden={selectedMessages.length === 0}
          variant={"ghost"}
          icon={<ArrowUturnRightIcon className="w-4 h-4" />}
          onClick={() => {
            openModal(
              <ForwardMessagesModal selectedMessages={selectedMessages} />,
            );
          }}
        />
      </Tooltip>
    </HStack>
  );
}

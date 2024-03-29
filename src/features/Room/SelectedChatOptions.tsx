import { HStack, IconButton, Tooltip } from "@chakra-ui/react";
import { ArrowUturnRightIcon } from "@heroicons/react/20/solid";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { confirmAlert } from "../../components/Alert/alertStore";
import { DeleteIcon } from "../../components/Icons";
import { modal } from "../../components/VModal";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import {
  RoomActionTypes,
  useRoomContext,
} from "../../context/Room/RoomContext";
import useDeleteSelectedMessages from "../../utils/hooks/Room/useDeleteSelectedMessages";
import ForwardMessagesModal from "./ForwardMessagesModal";

export default function SelectedChatOptions() {
  const { currentUserDetails } = useAuth();
  const { selectedChat } = useChatsContext();
  const { roomState, dispatch } = useRoomContext();

  const { canDeleteBasedOnPermissions, deleteSelectedMessages } =
    useDeleteSelectedMessages();
  if (!selectedChat || !currentUserDetails) return null;

  return (
    <HStack spacing={1}>
      <Tooltip label="select" placement="left">
        <IconButton
          aria-label="forward messages"
          variant={"ghost"}
          icon={
            roomState.isSelectingMessages ? (
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
            ) : (
              <Square2StackIcon className="w-4 h-4" />
            )
          }
          onClick={() => {
            dispatch({
              type: RoomActionTypes.TOGGLE_IS_SELECTING_MESSAGES,
              payload: null,
            });
          }}
        />
      </Tooltip>
      <Tooltip
        hidden={
          roomState.selectedMessages.length === 0 ||
          !canDeleteBasedOnPermissions(roomState.selectedMessages)
        }
        label="Delete selected messages"
        placement="left"
      >
        <IconButton
          hidden={
            roomState.selectedMessages.length === 0 ||
            !canDeleteBasedOnPermissions(roomState.selectedMessages)
          }
          variant={"ghost"}
          aria-label="Delete"
          icon={<DeleteIcon className="w-4 h-4" />}
          onClick={() => {
            dispatch({
              type: RoomActionTypes.TOGGLE_IS_SELECTING_MESSAGES,
              payload: null,
            });
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
          hidden={roomState.selectedMessages.length === 0}
          variant={"ghost"}
          icon={<ArrowUturnRightIcon className="w-4 h-4" />}
          onClick={() => {
            dispatch({
              type: RoomActionTypes.TOGGLE_IS_SELECTING_MESSAGES,
              payload: null,
            });
            modal(
              <ForwardMessagesModal
                selectedMessages={roomState.selectedMessages}
              />,
            );
          }}
        />
      </Tooltip>
    </HStack>
  );
}

import { useMessagesContext } from "@/context/MessagesContext";
import { useRoomContext } from "@/context/Room/RoomContext";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import { MenuDivider, MenuItem, MenuList } from "@chakra-ui/react";
import {
  PencilIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import { slateDark } from "@radix-ui/colors";
import toast from "react-hot-toast";
import { confirmAlert } from "../../components/Alert/alertStore";
import { modal } from "../../components/VModal";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { GroupChatDetails } from "../../interfaces/interfaces";
import { clearChatMessages } from "../../services/chatMessageServices";
import { clearGroupMessages } from "../../services/groupMessageServices";
import { SERVER } from "../../utils/config";
import AddMembers from "../Groups/Actions/AddMembers";
import EditGroupAdmins from "../Groups/Actions/EditGroupAdmins";
import EditMembers from "../Groups/Actions/EditMembers";

const RoomActions = () => {
  const { selectedChat } = useChatsContext();
  const { roomMessagesKey } = useRoomContext();
  const { update: updateRoomMessages } = useSWROptimistic(roomMessagesKey);
  const { update: updateLastMessage } = useSWROptimistic(
    `conversations/${selectedChat?.$id}/last-message`,
  );

  const { messages } = useMessagesContext();

  const { currentUserDetails } = useAuth();

  if (!currentUserDetails) return null;
  if (!selectedChat || !roomMessagesKey) return null;

  const isGroup = !!(
    selectedChat?.$collectionId === SERVER.COLLECTION_ID_GROUPS
  );
  const isAdmin =
    isGroup &&
    (selectedChat as GroupChatDetails).admins.includes(currentUserDetails.$id);

  async function handleClearRoomMessages() {
    (isGroup
      ? clearGroupMessages(selectedChat.$id, currentUserDetails!)
      : clearChatMessages(selectedChat!.$id, currentUserDetails!)
    )
      .then(() => {
        updateRoomMessages(messages.filter((msg: any) => msg.$id !== "system"));
        updateLastMessage(undefined);
      })
      .catch((e) => {
        toast.error("Something went wrong");
        updateRoomMessages(messages);
        updateLastMessage(messages.at(0));
      });
  }

  return (
    <MenuList _dark={{ bg: slateDark.slate1 }}>
      {(!isGroup || isAdmin) && (
        <>
          <MenuItem
            icon={<TrashIcon className="w-4 h-4" />}
            py={"1"}
            bg={"transparent"}
            onClick={() => {
              confirmAlert({
                title: "Delete chat messages",
                message: `Are you sure you want to delete all messages in this conversation? This action is irreversible`,
                confirmText: "Yes, delete all messages",
                cancelText: "Keep messages",
                onConfirm: () => {
                  handleClearRoomMessages();
                },
              });
            }}
          >
            Clear Messages
          </MenuItem>
          <MenuDivider />
        </>
      )}
      {isGroup && isAdmin && (
        <>
          <MenuItem
            py={"1"}
            onClick={() =>
              modal(<AddMembers group={selectedChat as GroupChatDetails} />)
            }
            bg={"transparent"}
            icon={<UserPlusIcon className="w-4 h-4" />}
          >
            Add Members
          </MenuItem>
          <MenuDivider />
          <MenuItem
            py={"1"}
            onClick={() =>
              modal(<EditMembers group={selectedChat as GroupChatDetails} />)
            }
            bg={"transparent"}
            icon={<UserMinusIcon className="w-4 h-4" />}
          >
            Remove Members
          </MenuItem>

          <MenuDivider />
          <MenuItem
            py={"1"}
            bg={"transparent"}
            onClick={() =>
              modal(
                <EditGroupAdmins
                  selectedGroup={selectedChat as GroupChatDetails}
                />,
              )
            }
            icon={<PencilIcon className="w-4 h-4" />}
          >
            Edit Admins
          </MenuItem>
        </>
      )}
    </MenuList>
  );
};

export default RoomActions;

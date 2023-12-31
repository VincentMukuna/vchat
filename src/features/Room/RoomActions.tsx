import { Button, MenuDivider, MenuItem, MenuList } from "@chakra-ui/react";
import { Alert, confirmAlert } from "../../components/Alert/alertStore";
import { useChatsContext } from "../../context/ChatsContext";
import { clearChatMessages } from "../../services/chatMessageServices";
import toast from "react-hot-toast";
import { openModal } from "../../components/Modal";
import EditMembers from "../Groups/Actions/EditMembers";
import { IGroup } from "../../interfaces";
import AddMembers from "../Groups/Actions/AddMembers";
import { mutate, useSWRConfig } from "swr";
import { useAuth } from "../../context/AuthContext";
import { slateDark } from "@radix-ui/colors";
import EditGroupAdmins from "../Groups/Actions/EditGroupAdmins";
import {
  PencilIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import { clearGroupMessages } from "../../services/groupMessageServices";
import { SERVER } from "../../utils/config";

const RoomActions = () => {
  const { selectedChat } = useChatsContext();
  const { cache } = useSWRConfig();

  const { currentUserDetails } = useAuth();

  if (!currentUserDetails) return null;
  if (!selectedChat) return null;

  const isGroup = !!(
    selectedChat?.$collectionId === SERVER.COLLECTION_ID_GROUPS
  );
  const isAdmin =
    isGroup && (selectedChat as IGroup).admins.includes(currentUserDetails.$id);

  async function handleClearRoomMessages() {
    const chatMessagesKey = selectedChat!.$id + "-messages";
    const messages = cache.get(chatMessagesKey)?.data;

    (isGroup
      ? clearGroupMessages(selectedChat.$id)
      : clearChatMessages(selectedChat!.$id)
    )
      .then(() => {
        mutate(chatMessagesKey, [], { revalidate: false });
        mutate(`lastMessage ${selectedChat!.$id}`, undefined, {
          revalidate: false,
        });
      })
      .catch((e) => {
        toast.error("Something went wrong");
        mutate(chatMessagesKey, messages, { revalidate: false });
        mutate(`lastMessage ${selectedChat!.$id}`, messages.at(0), {
          revalidate: false,
        });
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
              openModal(<AddMembers group={selectedChat as IGroup} />)
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
              openModal(<EditMembers group={selectedChat as IGroup} />)
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
              openModal(
                <EditGroupAdmins selectedGroup={selectedChat as IGroup} />,
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

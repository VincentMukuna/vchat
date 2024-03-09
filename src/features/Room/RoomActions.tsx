import { MenuDivider, MenuItem, MenuList } from "@chakra-ui/react";
import {
  PencilIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import { slateDark } from "@radix-ui/colors";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { confirmAlert } from "../../components/Alert/alertStore";
import { openModal } from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { GroupChatDetails } from "../../interfaces";
import { clearChatMessages } from "../../services/chatMessageServices";
import { clearGroupMessages } from "../../services/groupMessageServices";
import { SERVER } from "../../utils/config";
import AddMembers from "../Groups/Actions/AddMembers";
import EditGroupAdmins from "../Groups/Actions/EditGroupAdmins";
import EditMembers from "../Groups/Actions/EditMembers";

const RoomActions = () => {
  const { selectedChat } = useChatsContext();
  const { cache, mutate } = useSWRConfig();

  const { currentUserDetails } = useAuth();

  if (!currentUserDetails) return null;
  if (!selectedChat) return null;

  const isGroup = !!(
    selectedChat?.$collectionId === SERVER.COLLECTION_ID_GROUPS
  );
  const isAdmin =
    isGroup &&
    (selectedChat as GroupChatDetails).admins.includes(currentUserDetails.$id);

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
              openModal(<AddMembers group={selectedChat as GroupChatDetails} />)
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
              openModal(
                <EditMembers group={selectedChat as GroupChatDetails} />,
              )
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

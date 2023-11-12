import { MenuItem, MenuList } from "@chakra-ui/react";
import { Alert, confirmAlert } from "../../components/Alert/alertStore";
import { useChatsContext } from "../../context/ChatsContext";
import { clearChatMessages } from "../../services/chatMessageServices";
import toast from "react-hot-toast";
import { openModal } from "../../components/Modal";
import EditMembers from "../Groups/EditMembers";
import { IGroup } from "../../interfaces";
import AddMembers from "../Groups/AddMembers";
import { mutate } from "swr";
import { unstable_serialize } from "swr/infinite";

const RoomActions = ({ id, isGroup }: { id: string; isGroup: boolean }) => {
  const { selectedChat } = useChatsContext();
  if (!selectedChat) return null;
  const chatMessagesKey = unstable_serialize(
    () => selectedChat.$id + "-messages",
  );
  return (
    <MenuList className="px-2">
      {!isGroup && (
        <>
          <MenuItem
            py={"2.5"}
            onClick={() => {
              confirmAlert({
                title: "Delete chat messages",
                message: `Are you sure you want to delete all messages in this Chat? This action is irreversible`,
                confirmText: "Yes, delete all messages",
                cancelText: "Keep messages",
                onConfirm: () => {
                  mutate(chatMessagesKey, [[]], { revalidate: false });
                  mutate(`lastMessage ${selectedChat.$id}`, undefined, {
                    revalidate: false,
                  });
                  let ps = clearChatMessages(id);
                  ps.catch(() => {
                    toast.error("Something went wrong");
                  });
                },
              });
            }}
          >
            Clear Messages
          </MenuItem>
        </>
      )}
      {isGroup && (
        <>
          <MenuItem
            py={"2.5"}
            onClick={() =>
              openModal(<EditMembers group={selectedChat as IGroup} />)
            }
          >
            Edit Members
          </MenuItem>
          <MenuItem
            py={"2.5"}
            onClick={() =>
              openModal(<AddMembers group={selectedChat as IGroup} />)
            }
          >
            Add Members
          </MenuItem>
        </>
      )}
    </MenuList>
  );
};

export default RoomActions;

import { useChatsContext } from "@/context/ChatsContext";
import { useMessages } from "@/context/MessagesContext";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import { Button, Input } from "@chakra-ui/react";
import toast from "react-hot-toast";
import {
  RoomActionTypes,
  useRoomContext,
} from "../../../context/Room/RoomContext";
import { ChatMessage } from "../../../interfaces";
import api from "../../../services/api";

type EditMessageFormProps = {
  message: ChatMessage;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
};

export default function EditMessageForm({
  message,
  newMessage,
  setNewMessage,
}: EditMessageFormProps) {
  const { roomMessagesKey, roomState, dispatch, isGroup } = useRoomContext();
  const { selectedChat } = useChatsContext();
  const { messages } = useMessages();
  const { update: updateRoomMessages } = useSWROptimistic(roomMessagesKey);

  if (!selectedChat) return null;
  const handleEditMessage = async () => {
    dispatch({ type: RoomActionTypes.SET_EDITING, payload: null });
    if (newMessage !== message.body) {
      const roomMessages = messages;
      updateRoomMessages(
        roomMessages.map((msg) => {
          if (msg.$id === message.$id) {
            return { ...msg, body: newMessage };
          }
          return msg;
        }),
      );

      let editPs = api
        .updateDocument(
          message.$databaseId,
          message.$collectionId,
          message.$id,
          { body: newMessage },
        )
        .then((msg) => {
          api.updateDocument(
            selectedChat.$databaseId,
            selectedChat.$collectionId,
            selectedChat.$id,
            {
              changeLog: `message/edit/${message.$id}`,
              changerID: msg.senderID,
            },
          );
        })
        .catch((err: any) => {
          toast.error("Something went wrong! ");
          updateRoomMessages(
            roomMessages.map((msg) => {
              if (msg.$id === message.$id) {
                return { ...msg, body: message.body };
              }
              return msg;
            }),
          );
        });
    }
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleEditMessage();
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="flex flex-col gap-3 p-2"
    >
      <Input
        autoFocus
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value.slice(0, 1499));
        }}
      />

      <Button type="submit" className="self-end">
        Save
      </Button>
    </form>
  );
}

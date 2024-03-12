import { Button, Input } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
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
  const { roomMessagesKey, roomState, dispatch } = useRoomContext();

  const { cache, mutate } = useSWRConfig();
  const handleEditMessage = async () => {
    dispatch({ type: RoomActionTypes.SET_EDITING, payload: null });
    if (newMessage !== message.body) {
      const roomMessages = cache.get(roomMessagesKey)?.data as ChatMessage[];
      mutate(roomMessagesKey);

      let editPs = api
        .updateDocument(
          message.$databaseId,
          message.$collectionId,
          message.$id,
          { body: newMessage },
        )
        .catch((err: any) => {
          toast.error("Something went wrong! ");
        });
    }
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleEditMessage();
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

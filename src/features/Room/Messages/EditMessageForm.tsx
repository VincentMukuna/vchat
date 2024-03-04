import { Button, Input } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { mutate, useSWRConfig } from "swr";
import { useRoomContext } from "../../../context/RoomContext";
import { ChatMessage } from "../../../interfaces";
import api from "../../../services/api";

type EditMessageFormProps = {
  message: ChatMessage;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
};

export default function EditMessageForm({
  message,
  setIsEditing,
  newMessage,
  setNewMessage,
}: EditMessageFormProps) {
  const { roomMessagesKey } = useRoomContext();
  const { cache } = useSWRConfig();
  const handleEditMessage = async () => {
    if (newMessage !== message.body) {
      setIsEditing(false);
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
        onBlur={() => {
          setIsEditing(false);
        }}
        onChange={(e) => {
          setNewMessage(e.target.value.slice(0, 1499));
        }}
      />

      <Button className="self-end">Save</Button>
    </form>
  );
}

import { useChatsContext } from "@/context/ChatsContext";
import { ChatMessage } from "@/interfaces";
import api from "@/services/api";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import {
  Button,
  FormLabel,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Textarea,
  useModalContext,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

interface EditMessageProps {
  message: ChatMessage;
}

const EditMessageForm = ({ message }: EditMessageProps) => {
  const { selectedChat } = useChatsContext();
  const { onClose } = useModalContext();

  const roomMessagesKey = selectedChat ? `${selectedChat.$id}-messages` : null;

  const { update: updateRoomMessages } = useSWROptimistic(roomMessagesKey!);
  const { data: messages } = useSWR<ChatMessage>(() =>
    selectedChat ? `${selectedChat.$id}-messages` : null,
  );

  const [newMessage, setNewMessage] = useState(message.body);
  const editRef = useRef<HTMLTextAreaElement>(null);

  if (!selectedChat || !messages) return null;

  const handleEditMessage = async () => {
    // handle edit message
    //return early if new message is empty or same as old message
    if (!newMessage || newMessage === message.body) {
      return;
    }

    const roomMessages = messages;
    updateRoomMessages(
      roomMessages.map((msg: ChatMessage) => {
        if (msg.$id === message.$id) {
          return { ...msg, body: newMessage };
        }
        return msg;
      }),
    );

    onClose();

    try {
      let msg = await api.updateDocument(
        message.$databaseId,
        message.$collectionId,
        message.$id,
        { body: newMessage },
      );
      api.updateDocument(
        selectedChat.$databaseId,
        selectedChat.$collectionId,
        selectedChat.$id,
        {
          changeLog: `message/edit/${message.$id}`,
          changerID: msg.senderID,
        },
      );
    } catch (err) {
      toast.error("Something went wrong! ");
      updateRoomMessages(
        roomMessages.map((msg: ChatMessage) => {
          if (msg.$id === message.$id) {
            return { ...msg, body: message.body };
          }
          return msg;
        }),
      );
    }
  };
  useEffect(() => {
    if (editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(newMessage.length, newMessage.length);
    }
  }, []);
  return (
    <>
      <ModalHeader>Edit Message</ModalHeader>
      <ModalCloseButton />
      <ModalBody className="flex flex-col ">
        <FormLabel htmlFor="edit-message">New Message:</FormLabel>
        <Textarea
          ref={editRef}
          id="edit-message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Edit message"
          autoFocus
        />

        <Button
          isDisabled={!newMessage || newMessage === message.body}
          onClick={() => handleEditMessage()}
          colorScheme="blue"
          mt={4}
          rounded={"md"}
          className="self-end rounded-none"
        >
          Edit
        </Button>
      </ModalBody>
    </>
  );
};

export default EditMessageForm;

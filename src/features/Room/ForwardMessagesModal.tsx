import {
  Avatar,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  useModalContext,
} from "@chakra-ui/react";
import { UserIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { useAuth } from "../../context/AuthContext";
import {
  ChatMessage,
  DirectChatDetails,
  GroupChatDetails,
  IUserDetails,
} from "../../interfaces";
import { forwardDirectMessages } from "../../services/chatMessageServices";
import { forwardGroupMessages } from "../../services/groupMessageServices";
import { SERVER } from "../../utils/config";

export default function ForwardMessagesModal({
  selectedMessages,
}: {
  selectedMessages: ChatMessage[];
}) {
  const { currentUserDetails } = useAuth();
  const { onClose } = useModalContext();
  const [selectedChat, setSelectedChat] = useState<string>("");
  const { cache, mutate } = useSWRConfig();
  const conversations = cache.get("conversations")?.data as (
    | GroupChatDetails
    | DirectChatDetails
  )[];
  if (!conversations || !currentUserDetails) return null;
  async function handleForwardMessages() {
    try {
      if (!selectedChat) return;
      if (!currentUserDetails) return;

      const selectedChatDetails = conversations.find(
        (convo) => convo.$id === selectedChat,
      )!;
      const isGroup =
        selectedChatDetails.$collectionId === SERVER.COLLECTION_ID_GROUPS;
      const isPersonal =
        !isGroup &&
        selectedChatDetails.participants.every(
          (participant: any) => participant.$id === currentUserDetails.$id,
        );

      let otherParticipant: IUserDetails;
      if (!isGroup) {
        otherParticipant = isPersonal
          ? currentUserDetails
          : selectedChatDetails.participants.find(
              (participant: any) => participant.$id !== currentUserDetails.$id,
            );
      }

      if (isGroup) {
        let messages = selectedMessages.map((msg) => ({
          groupDoc: selectedChat,
          senderID: currentUserDetails!.$id,
          body: msg.body,
        }));
        await forwardGroupMessages(
          selectedChat,
          currentUserDetails.$id,
          messages,
        );
      } else {
        let messages = selectedMessages.map((msg) => ({
          chatDoc: selectedChat,
          senderID: currentUserDetails!.$id,
          recepientID: otherParticipant!.$id,
          body: msg.body,
          read: isPersonal ? true : false,
        }));
        await forwardDirectMessages(
          selectedChat,
          currentUserDetails.$id,
          messages,
        );
      }
      mutate(`${selectedChat}-messages`);
      toast.success("Messages forwarded successfully");
    } catch (error) {
      toast.error("Failed to forward messages");
    }
  }

  return (
    <>
      <ModalHeader>Forward Messages</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <h2>Select chat to forward to: </h2>
        <ul className="flex flex-col gap-1 mt-2 max-h-[14rem] overflow-y-auto">
          {conversations.map((conversation) => {
            const isGroup =
              conversation.$collectionId === SERVER.COLLECTION_ID_GROUPS;
            const isPersonal =
              !isGroup &&
              conversation.participants.every(
                (participant: any) =>
                  participant.$id === currentUserDetails.$id,
              );

            let otherParticipant: IUserDetails;
            if (!isGroup) {
              otherParticipant = isPersonal
                ? currentUserDetails
                : conversation.participants.find(
                    (participant: any) =>
                      participant.$id !== currentUserDetails.$id,
                  );
            }

            return (
              <li
                key={conversation.$id}
                className={`flex items-center gap-2 ${
                  selectedChat === conversation.$id ? "bg-slate-800" : ""
                } p-2 rounded-md`}
                onClick={() => {
                  if (selectedChat === conversation.$id) {
                    setSelectedChat("");
                    return;
                  }
                  setSelectedChat(conversation.$id);
                }}
              >
                <Avatar
                  size={"md"}
                  icon={<UserIcon className="w-5 h-5" />}
                  src={
                    isGroup
                      ? conversation.avatarURL
                      : otherParticipant!.avatarURL
                  }
                />
                <div className="flex flex-col ">
                  <span>
                    {isGroup
                      ? conversation.name
                      : isPersonal
                      ? "You"
                      : otherParticipant!.name}
                  </span>
                  <span className="text-xs italic line-clamp-1">
                    {isGroup
                      ? conversation.description
                      : otherParticipant!.about || "about"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" mr={3}>
          Cancel
        </Button>
        <Button
          colorScheme="blue"
          color={"gray.100"}
          onClick={() => {
            handleForwardMessages();
            onClose();
          }}
        >
          Forward
        </Button>
      </ModalFooter>
    </>
  );
}

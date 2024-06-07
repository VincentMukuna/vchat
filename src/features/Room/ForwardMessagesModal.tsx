import { useChatsContext } from "@/context/ChatsContext";
import useSWROptimistic from "@/lib/hooks/useSWROptimistic";
import {
  Avatar,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  useModalContext,
} from "@chakra-ui/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { SERVER } from "../../lib/config";
import { forwardDirectMessages } from "../../services/chatMessageServices";
import { forwardGroupMessages } from "../../services/groupMessageServices";
import { ChatMessage, IUserDetails } from "../../types/interfaces";

export default function ForwardMessagesModal({
  selectedMessages,
}: {
  selectedMessages: ChatMessage[];
}) {
  const { currentUserDetails } = useAuth();
  const { onClose } = useModalContext();
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const { update: updateRoomMessages } = useSWROptimistic(
    `conversations/${selectedChatId}/messages`,
  );
  const {
    conversationsData: { conversations },
    selectedChat,
  } = useChatsContext();
  if (!conversations || !currentUserDetails) return null;
  async function handleForwardMessages() {
    try {
      if (!selectedChatId) return;
      if (!currentUserDetails) return;

      updateRoomMessages([], {
        revalidate: true,
        optimisticData: (data) => [...selectedMessages, ...(data || [])],
      });
      const selectedChatDetails = conversations.find(
        (convo) => convo.$id === selectedChatId,
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
          groupDoc: selectedChatId,
          senderID: currentUserDetails!.$id,
          body: msg.body,
        }));
        await forwardGroupMessages(
          selectedChatId,
          currentUserDetails.$id,
          messages,
        );
      } else {
        let messages = selectedMessages.map((msg) => ({
          chatDoc: selectedChatId,
          senderID: currentUserDetails!.$id,
          recepientID: otherParticipant!.$id,
          body: msg.body,
          read: isPersonal ? true : false,
        }));
        await forwardDirectMessages(
          selectedChatId,
          currentUserDetails.$id,
          messages,
        );
      }

      toast.success("Messages forwarded successfully");
    } catch (error) {
      updateRoomMessages(
        (data: ChatMessage[]) => {
          if (!data) return [];
          return data.filter(
            (message) =>
              !selectedMessages.some(
                (selectedMessage) => selectedMessage.$id === message.$id,
              ),
          );
        },
        { revalidate: true },
      );
      toast.error("Failed to forward messages");
    }
  }

  return (
    <>
      <ModalHeader>{`Forward ${selectedMessages.length} Message(s) `}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <h2>Select chat to forward to:</h2>
        <ul className="mt-2 flex max-h-[50dvh] flex-col gap-1 overflow-y-auto p-1">
          {conversations
            .filter((c) => c.$id !== selectedChat?.$id)
            .map((conversation) => {
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
                    selectedChatId === conversation.$id
                      ? "bg-slate-200 ring-1 dark:bg-slate-800"
                      : ""
                  } cursor-pointer rounded-md p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800`}
                  onClick={() => {
                    if (selectedChatId === conversation.$id) {
                      setSelectedChatId("");
                      return;
                    }
                    setSelectedChatId(conversation.$id);
                  }}
                >
                  <Avatar
                    size={"md"}
                    name={isGroup ? conversation.name : otherParticipant!.name}
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
                    <span className="line-clamp-1 text-xs italic">
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
        <Button variant="ghost" mr={3} onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          isDisabled={selectedChatId.length === 0}
          title={selectedChatId.length === 0 ? "Select chat to forward to" : ""}
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

import { useAuth } from "@/context/AuthContext";
import { useChatsContext } from "@/context/ChatsContext";
import { Message } from "@/features/Room/MessageInput";
import {
  CHAT_MESSAGES_CHANGE_LOG_REGEXES,
  Conversation,
  IUserDetails,
} from "@/interfaces/interfaces";
import api from "@/services/api";
import { SERVER } from "@/utils/config";
import { getUnreadCount, matchAndExecute } from "@/utils/utils";
import { Button, CloseButton } from "@chakra-ui/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import useConversations from "./useConversations";

const useChatsListSubscription = () => {
  const { data: conversations } = useConversations();
  const { currentUserDetails } = useAuth();
  const { selectedChat, selectConversation, updateConversation } =
    useChatsContext();
  const { mutate, cache } = useSWRConfig();
  const conversationChannels = conversations.map(
    (c) =>
      `databases.${c.$databaseId}.collections.${c.$collectionId}.documents.${c.$id}`,
  );

  //subscribe to all conversations
  useEffect(() => {
    return api.subscribe<Conversation>(conversationChannels, (response) => {
      if (
        response.payload.changerID === currentUserDetails?.$id ||
        !response.payload.changeLog
      )
        return;

      //return early if payload is selected chat
      if (selectedChat?.$id === response.payload.$id) return;

      const isGroup =
        response.payload.$collectionId === SERVER.COLLECTION_ID_GROUPS;
      const messages = isGroup
        ? response.payload.groupMessages
        : response.payload.chatMessages;

      const changeLog = response.payload.changeLog;
      const conversation = response.payload;

      const handleNewMessage = (newMessageId: string) => {
        const newMessage = messages.find(
          (msg: any) => msg.$id === newMessageId,
        ) as Message;

        const sender: IUserDetails = isGroup
          ? conversation.members.find(
              (m: IUserDetails) => m.$id === newMessage.senderID,
            )
          : conversation.participants.find(
              (m: IUserDetails) => m.$id === newMessage.senderID,
            );

        //update unreadCount
        const unreadCountKey = `conversations/${conversation.$id}/unread`;
        const unreadCount = getUnreadCount(
          conversation,
          currentUserDetails?.$id!,
        );
        mutate(unreadCountKey, unreadCount, { revalidate: false });

        //update last message
        mutate(`lastMessage ${conversation.$id}`, newMessage, {
          revalidate: false,
        });

        //update conversation details in cache
        updateConversation(conversation);

        //notify user
        toast(
          (t) => (
            <div className="flex flex-col gap-2 text-sm ps-2 ">
              <CloseButton
                className="absolute top-1 right-1"
                rounded={"full"}
                onClick={() => {
                  toast.dismiss(t.id);
                }}
              />
              <div className="flex flex-col gap-1 ps-2 pe-6 ">
                {isGroup ? (
                  <>
                    <span>
                      New message in <span> {conversation.name}</span>
                    </span>
                    <span>
                      <span className="text-sm italic">
                        {sender?.name || ""}
                      </span>
                      : {newMessage.body}
                    </span>
                  </>
                ) : (
                  <>
                    <span>New message from {sender.name}</span>
                    <span className="text-sm italic">{newMessage.body}</span>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant={"ghost"}
                  w={"full"}
                  size={"sm"}
                  rounded={"md"}
                  onClick={() => toast.dismiss(t.id)}
                >
                  Mark as read
                </Button>
                <Button
                  size={"sm"}
                  w={"full"}
                  rounded={"md"}
                  onClick={() => {
                    selectConversation(
                      conversation.$id,
                      isGroup ? undefined : sender,
                    );
                    toast.dismiss(t.id);
                  }}
                >
                  View
                </Button>
              </div>
            </div>
          ),
          {
            icon: "🚀",
            duration: 4000,
            position: "top-right",
          },
        );
      };

      const matchers = new Map().set(
        CHAT_MESSAGES_CHANGE_LOG_REGEXES.newMessage,
        (matches: string[]) => handleNewMessage(matches.at(1)!),
      );

      matchAndExecute(changeLog, matchers);
    });
  }, [conversationChannels]);
};

export default useChatsListSubscription;

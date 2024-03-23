import {
  Conversation,
  DirectChatDetails,
  GroupChatDetails,
  IUserDetails,
} from "@/interfaces";
import { sortConversations } from "@/services/userDetailsServices";
import { SERVER } from "@/utils/config";
import useConversations from "@/utils/hooks/Chats/useConversations";
import { isGroup, sortDocumentsByCreationDateDesc } from "@/utils/utils";
import { createContext, useContext, useState } from "react";
import { mutate } from "swr";

type ChatsProviderProps = {
  children: React.JSX.Element[] | React.JSX.Element;
};

interface IChatsContextData {
  selectedChat: DirectChatDetails | GroupChatDetails | undefined;
  setSelectedChat: React.Dispatch<
    React.SetStateAction<GroupChatDetails | DirectChatDetails | undefined>
  >;
  recepient: IUserDetails | undefined;
  conversationsData: {
    conversations: Conversation[];
    chatsError: any;
    chatsLoading: boolean;
  };
  setRecepient: React.Dispatch<React.SetStateAction<IUserDetails | undefined>>;
  addConversation: (conversation: Conversation) => void;
  deleteConversation: (conversationId: string) => void;
  selectConversation: (
    conversationId: string,
    recepient?: IUserDetails,
  ) => void;
  updateConversation: (conversation: Conversation) => void;
}
const ChatsContext = createContext<IChatsContextData | null>(null);

export const ChatsProvider = ({ children }: ChatsProviderProps) => {
  const [selectedChat, setSelectedChat] = useState<
    DirectChatDetails | GroupChatDetails
  >();
  const [recepient, setRecepient] = useState<IUserDetails>();
  const {
    data: conversations,
    error: chatsError,
    isLoading: chatsLoading,
    mutate: updateConversations,
  } = useConversations();

  const selectConversation = (
    conversationId: string,
    recepient?: IUserDetails,
  ) => {
    const conversation = conversations.find((c) => c.$id === conversationId);

    setSelectedChat(conversation);
    if (conversation?.$collectionId === SERVER.COLLECTION_ID_CHATS) {
      setRecepient(recepient);
    }
  };

  const addConversation = (conversation: Conversation) => {
    updateConversations([conversation, ...conversations], {
      revalidate: false,
    });
  };

  const deleteConversation = (conversationId: string) => {
    updateConversations(
      conversations.filter((convo) => convo.$id !== conversationId),
      { revalidate: false },
    );
  };

  const updateConversation = (conversation: Conversation) => {
    const newConversations = conversations.map((c) => {
      if (c.$id === conversation.$id) {
        return conversation;
      } else {
        return c;
      }
    });

    updateConversations(sortConversations(newConversations), {
      revalidate: false,
    });

    mutate(
      `${conversation.$id}-messages`,
      isGroup(conversation)
        ? conversation.groupMessages.sort(sortDocumentsByCreationDateDesc)
        : conversation.chatMessages.sort(sortDocumentsByCreationDateDesc),
      { revalidate: false },
    );
  };

  const contextData = {
    selectedChat,
    setSelectedChat,
    recepient,
    setRecepient,
    conversationsData: { conversations, chatsError, chatsLoading },
    addConversation,
    deleteConversation,
    selectConversation,
    updateConversation,
  };

  return (
    <ChatsContext.Provider value={contextData}>
      {children}
    </ChatsContext.Provider>
  );
};

export const useChatsContext = () => {
  let chatContext = useContext(ChatsContext);

  if (chatContext === null) {
    throw new Error("chats context not initia;ised");
  }
  return chatContext as IChatsContextData;
};

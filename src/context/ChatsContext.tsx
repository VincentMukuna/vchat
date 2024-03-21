import {
  Conversation,
  DirectChatDetails,
  GroupChatDetails,
  IUserDetails,
} from "@/interfaces";
import useConversations from "@/utils/hooks/Chats/useConversations";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import { createContext, useContext, useState } from "react";

type ChatsProviderProps = {
  children: React.JSX.Element[] | React.JSX.Element;
};

interface IChatsContextData {
  selectedChat: DirectChatDetails | GroupChatDetails | undefined;
  setSelectedChat: React.Dispatch<
    React.SetStateAction<GroupChatDetails | DirectChatDetails | undefined>
  >;
  recepient: IUserDetails | undefined;
  conversations: {
    conversations: Conversation[];
    chatsError: any;
    chatsLoading: boolean;
  };
  setRecepient: React.Dispatch<React.SetStateAction<IUserDetails | undefined>>;
  addConversation: (conversation: Conversation) => void;
  deleteConversation: (conversationId: string) => void;
}
const ChatsContext = createContext<IChatsContextData | null>(null);

export const ChatsProvider = ({ children }: ChatsProviderProps) => {
  const [selectedChat, setSelectedChat] = useState<
    DirectChatDetails | GroupChatDetails
  >();
  const [recepient, setRecepient] = useState<IUserDetails>();

  //get app users' details

  const {
    data: conversations,
    error: chatsError,
    isLoading: chatsLoading,
  } = useConversations();
  const { update: updateConversations } = useSWROptimistic("conversations");

  const addConversation = (conversation: Conversation) => {
    updateConversations([conversation, ...conversations]);
  };

  const deleteConversation = (conversationId: string) => {
    updateConversations(
      conversations.filter((convo) => convo.$id !== conversationId),
    );
  };

  const contextData = {
    selectedChat,
    setSelectedChat,
    recepient,
    setRecepient,
    conversations: { conversations, chatsError, chatsLoading },
    addConversation,
    deleteConversation,
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

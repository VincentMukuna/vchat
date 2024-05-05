import useConversations from "@/features/Conversations/hooks/useConversations";
import {
  DirectChatDetails,
  GroupChatDetails,
  IConversation,
  IUserDetails,
} from "@/interfaces/interfaces";
import { sortConversations } from "@/services/userDetailsService";
import { isGroup, sortDocumentsByCreationDateDesc } from "@/utils/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
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
    conversations: IConversation[];
    chatsError: any;
    chatsLoading: boolean;
  };
  setRecepient: React.Dispatch<React.SetStateAction<IUserDetails | undefined>>;
  addConversation: (conversation: IConversation) => void;
  deleteConversation: (conversationId: string) => void;
  selectConversation: (conversationId?: string, recepientId?: string) => void;
  updateConversation: (conversation: IConversation) => void;
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

  let syncChatsToastId: string | undefined = undefined;
  useEffect(() => {
    if (chatsLoading) {
      syncChatsToastId = toast.loading("Syncing chats", { duration: 2000 });
    } else if (!chatsLoading) {
      toast.dismiss(syncChatsToastId);
    }
  }, [chatsLoading]);

  const selectConversation = useCallback(
    (conversationId?: string, recepientID?: string) => {
      if (!conversationId) {
        setSelectedChat(undefined);
        setRecepient(undefined);
        return;
      }
      const conversation = conversations.find((c) => c.$id === conversationId);

      setSelectedChat(conversation);
      if (!isGroup(conversation!)) {
        if (!recepientID) return;
        let recepient: IUserDetails = conversation!.participants.find(
          (p) => p.$id === recepientID,
        ) as IUserDetails;
        setRecepient(recepient);
      } else {
        setRecepient(undefined);
      }
    },
    [conversations],
  );

  const addConversation = useCallback(
    (conversation: IConversation) => {
      updateConversations([conversation, ...conversations], {
        revalidate: false,
      });
    },
    [conversations, updateConversations],
  );

  const deleteConversation = useCallback(
    (conversationId: string) => {
      updateConversations(
        conversations.filter((convo) => convo.$id !== conversationId),
        { revalidate: false },
      );
    },
    [conversations, updateConversations],
  );

  const updateConversation = useCallback(
    (conversation: IConversation) => {
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
        `conversations/${conversation.$id}/messages`,
        isGroup(conversation)
          ? conversation.groupMessages.toSorted(sortDocumentsByCreationDateDesc)
          : conversation.chatMessages.toSorted(sortDocumentsByCreationDateDesc),
        { revalidate: false },
      );
    },
    [conversations, updateConversations, mutate],
  );

  const contextData = {
    selectedChat,
    setSelectedChat,
    recepient,
    setRecepient,
    conversationsData: {
      conversations: conversations,
      chatsError,
      chatsLoading,
    },
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
    throw new Error("chats context not initialised");
  }
  return chatContext as IChatsContextData;
};

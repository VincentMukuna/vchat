import { useContext, useState, createContext } from "react";
import { DirectChatDetails, GroupChatDetails, IUserDetails } from "../interfaces";

type ChatsProviderProps = {
  children: React.JSX.Element[] | React.JSX.Element;
};

interface IChatsContextData {
  selectedChat: DirectChatDetails | GroupChatDetails | undefined;
  setSelectedChat: React.Dispatch<
    React.SetStateAction<GroupChatDetails | DirectChatDetails | undefined>
  >;
  recepient: IUserDetails | undefined;
  setRecepient: React.Dispatch<React.SetStateAction<IUserDetails | undefined>>;
  msgsCount: number;
  setMsgsCount: React.Dispatch<React.SetStateAction<number>>;
}
const ChatsContext = createContext<IChatsContextData | null>(null);

export const ChatsProvider = ({ children }: ChatsProviderProps) => {
  const [selectedChat, setSelectedChat] = useState<DirectChatDetails | GroupChatDetails>();
  const [recepient, setRecepient] = useState<IUserDetails>();
  const [msgsCount, setMsgsCount] = useState(0);

  //get app users' details

  const contextData = {
    selectedChat,
    setSelectedChat,
    recepient,
    setRecepient,
    msgsCount,
    setMsgsCount,
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

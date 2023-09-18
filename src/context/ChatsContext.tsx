import React, { useContext } from "react";
import { IChat, IGroup, IUserDetails } from "../interfaces";

type ChatsProviderProps = {
  children: React.JSX.Element[] | React.JSX.Element;
};

interface IChatsContextData {
  selectedChat: IChat | IGroup | undefined;
  setSelectedChat: React.Dispatch<
    React.SetStateAction<IGroup | IChat | undefined>
  >;
  recepient: IUserDetails | undefined;
  setRecepient: React.Dispatch<React.SetStateAction<IUserDetails | undefined>>;
}
const ChatsContext = React.createContext<IChatsContextData | null>(null);

export const ChatsProvider = ({ children }: ChatsProviderProps) => {
  const [selectedChat, setSelectedChat] = React.useState<IChat | IGroup>();
  const [recepient, setRecepient] = React.useState<IUserDetails>();

  //get app users' details

  const contextData = {
    selectedChat,
    setSelectedChat,
    recepient,
    setRecepient,
  };

  React.useEffect(() => {});

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
  return chatContext;
};

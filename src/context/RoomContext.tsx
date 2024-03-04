import { createContext, useContext, useState } from "react";
import {
  DirectMessageDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../interfaces";
import { SERVER } from "../utils/config";
import { useAuth } from "./AuthContext";
import { useChatsContext } from "./ChatsContext";

type ChatMessage = DirectMessageDetails | GroupMessageDetails;

interface RoomContextData {
  selectedMessages: ChatMessage[];
  setSelectedMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  isGroup: boolean;
  isPersonal: boolean;
  roomMessagesKey: string;
  isSelectingMessages: boolean;
  setIsSelectingMessages: React.Dispatch<React.SetStateAction<boolean>>;
  toggleIsSelectingMessages: () => void;
}

export const RoomContext = createContext<RoomContextData | null>(null);

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMessages, setSelectedMessages] = useState<ChatMessage[]>([]);
  const { selectedChat } = useChatsContext();
  const { currentUserDetails } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [isSelectingMessages, setIsSelectingMessages] = useState(false);
  const isGroup = !!(
    selectedChat?.$collectionId === SERVER.COLLECTION_ID_GROUPS
  );

  const roomMessagesKey = `${selectedChat?.$id}-messages`;

  const isPersonal =
    selectedChat &&
    !isGroup &&
    selectedChat?.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  function toggleIsSelectingMessages() {
    if (isSelectingMessages) {
      setIsSelectingMessages(false);
      return;
    }
    setEditing(null);
    setSelectedMessages([]);
    setIsSelectingMessages(true);
  }

  const contextData = {
    selectedMessages: selectedMessages,
    setSelectedMessages,
    isGroup,
    isPersonal,
    roomMessagesKey,
    editing,
    setEditing,
    isSelectingMessages,
    toggleIsSelectingMessages,
    setIsSelectingMessages,
  };

  return (
    <RoomContext.Provider value={contextData}>{children}</RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const roomContext = useContext(RoomContext);

  if (roomContext === null) {
    throw new Error("room context not initialised");
  }
  return roomContext;
};

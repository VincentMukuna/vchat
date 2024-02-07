import { createContext, useContext, useState } from "react";
import {
  DirectMessageDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../interfaces";
import { SERVER } from "../utils/config";
import { useAuth } from "./AuthContext";
import { useChatsContext } from "./ChatsContext";

type ContextMessage = DirectMessageDetails | GroupMessageDetails;

interface RoomContextData {
  selectedMessages: ContextMessage[];
  setSelectedMessages: React.Dispatch<React.SetStateAction<ContextMessage[]>>;
  isGroup: boolean;
  isPersonal: boolean;
  roomMessagesKey?: string;
}

export const RoomContext = createContext<RoomContextData | null>(null);

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMessages, setSelectedMessages] = useState<ContextMessage[]>(
    [],
  );
  const { selectedChat } = useChatsContext();
  const { currentUserDetails } = useAuth();
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

  const contextData = {
    selectedMessages: selectedMessages,
    setSelectedMessages,
    isGroup,
    isPersonal,
    roomMessagesKey,
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

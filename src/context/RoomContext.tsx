import { createContext, useContext, useState } from "react";
import { DirectMessageDetails, GroupMessageDetails } from "../interfaces";

type ContextMessage = DirectMessageDetails | GroupMessageDetails;

interface RoomContextData {
  selectedMessages: ContextMessage[];
  setSelectedMessages: React.Dispatch<React.SetStateAction<ContextMessage[]>>;
}

export const RoomContext = createContext<RoomContextData | null>(null);

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMessages, setSelectedMessages] = useState<ContextMessage[]>(
    [],
  );

  const contextData = {
    selectedMessages: selectedMessages,
    setSelectedMessages,
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

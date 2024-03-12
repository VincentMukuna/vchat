import React, { createContext, useContext, useEffect, useReducer } from "react";
import {
  DirectMessageDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../../interfaces";
import { SERVER } from "../../utils/config";
import { useAuth } from "../AuthContext";
import { useChatsContext } from "../ChatsContext";
import { roomReducer } from "./roomReducer";

export type ChatMessage = DirectMessageDetails | GroupMessageDetails;

interface RoomContextData {
  isGroup: boolean;
  isPersonal: boolean;
  roomMessagesKey: string;
  roomState: RoomState;
  dispatch: React.Dispatch<RoomAction>;
}

export const RoomContext = createContext<RoomContextData | null>(null);

export enum RoomActionTypes {
  SELECT_MESSAGE = "SELECT_MESSAGE",
  DESELECT_MESSAGE = "DESELECT_MESSAGE",
  TOGGLE_MESSAGE_SELECT = "TOGGLE_MESSAGE_SELECT",
  SET_REPLYING_TO = "SET_REPLYING_TO",
  EXIT_REPLYING_TO = "EXIT_REPLYING_TO",
  CLEAR_SELECTED_MESSAGES = "CLEAR_SELECTED_MESSAGES",
  TOGGLE_IS_SELECTING_MESSAGES = "TOGGLE_IS_SELECTING_MESSAGES",
  EXIT_SELECTING_MESSAGES = "EXIT_SELECTING_MESSAGES",
  SET_EDITING = "SET_EDITING",
  SET_INPUT_REF = "SET_INPUT_REF",
}

export interface RoomAction {
  type: RoomActionTypes;
  payload: any;
}
export interface RoomState {
  selectedMessages: ChatMessage[];
  editing: string | null;
  isSelectingMessages: boolean;
  replyingTo: (ChatMessage & { sender: IUserDetails }) | null;
  inputRef: React.RefObject<HTMLTextAreaElement> | null;
}
const initialRoomState = {
  selectedMessages: [],
  editing: null,
  isSelectingMessages: false,
  replyingTo: null,
  inputRef: null,
};

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomState, dispatch] = useReducer(roomReducer, initialRoomState);
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
    isGroup,
    isPersonal,
    roomMessagesKey,
    roomState,
    dispatch,
  };
  useEffect(() => {
    dispatch({ type: RoomActionTypes.EXIT_REPLYING_TO, payload: null });
    dispatch({ type: RoomActionTypes.CLEAR_SELECTED_MESSAGES, payload: null });
  }, [selectedChat]);

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

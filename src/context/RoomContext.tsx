import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
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
  roomState: RoomState;
  dispatch: React.Dispatch<RoomAction>;
}

export const RoomContext = createContext<RoomContextData | null>(null);

export enum RoomActionTypes {
  SELECT_MESSAGE = "SELECT_MESSAGE",
  DESELECT_MESSAGE = "DESELECT_MESSAGE",
  SET_REPLYING_TO = "SET_REPLYING_TO",
  EXIT_REPLYING_TO = "EXIT_REPLYING_TO",
  CLEAR_SELECTED_MESSAGES = "CLEAR_SELECTED_MESSAGES",
  TOGGLE_SELECTING_MESSAGES = "TOGGLE_SELECTING_MESSAGES",
  SET_EDITING = "SET_EDITING",
  SET_INPUT_REF = "SET_INPUT_REF",
}

interface RoomAction {
  type: RoomActionTypes;
  payload: any;
}
interface RoomState {
  selectedMessages: ChatMessage[];
  editing: boolean;
  isSelectingMessages: boolean;
  replyingTo: (ChatMessage & { sender: IUserDetails }) | null;
  inputRef: React.RefObject<HTMLTextAreaElement> | null;
}
const initialRoomState = {
  selectedMessages: [],
  editing: false,
  isSelectingMessages: false,
  replyingTo: null,
  inputRef: null,
};

function roomReducer(state: RoomState, action: RoomAction) {
  switch (action.type) {
    case "SELECT_MESSAGE":
      return {
        ...state,
        selectedMessages: [...state.selectedMessages, action.payload],
      };
    case "DESELECT_MESSAGE":
      return {
        ...state,
        selectedMessages: state.selectedMessages.filter(
          (message: ChatMessage) => message.$id !== action.payload.$id,
        ),
      };
    case "SET_REPLYING_TO":
      if (state.inputRef?.current) {
        state.inputRef.current.focus();
      }
      return {
        ...state,
        replyingTo: action.payload,
      };

    case "EXIT_REPLYING_TO":
      return {
        ...state,
        replyingTo: null,
      };
    case "CLEAR_SELECTED_MESSAGES":
      return {
        ...state,
        selectedMessages: [],
      };
    case "TOGGLE_SELECTING_MESSAGES":
      return {
        ...state,
        isSelectingMessages: !state.isSelectingMessages,
      };
    case "SET_EDITING":
      return {
        ...state,
        editing: action.payload,
      };

    case "SET_INPUT_REF":
      return {
        ...state,
        inputRef: action.payload,
      };

    default:
      return state;
  }
}

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomState, dispatch] = useReducer(roomReducer, initialRoomState);
  const [selectedMessages, setSelectedMessages] = useState<ChatMessage[]>([]);
  const { selectedChat } = useChatsContext();
  const { currentUserDetails } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [isSelectingMessages, setIsSelectingMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
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
    roomState,
    dispatch,
  };
  useEffect(() => {
    setSelectedMessages([]);
    setIsSelectingMessages(false);
    dispatch({ type: RoomActionTypes.EXIT_REPLYING_TO, payload: null });
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

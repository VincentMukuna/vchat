import { ChatMessage, RoomAction, RoomState } from "./RoomContext";

export function roomReducer(state: RoomState, action: RoomAction) {
  switch (action.type) {
    case "TOGGLE_MESSAGE_SELECT":
      if (
        state.selectedMessages.some(
          (message) => message.$id === action.payload.$id,
        )
      ) {
        return {
          ...state,
          selectedMessages: state.selectedMessages.filter(
            (message: ChatMessage) => message.$id !== action.payload.$id,
          ),
        };
      }
      return {
        ...state,
        selectedMessages: [...state.selectedMessages, action.payload],
      };

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
    case "TOGGLE_IS_SELECTING_MESSAGES":
      return {
        ...state,
        selectedMessages: [],
        isSelectingMessages: !state.isSelectingMessages,
      };

    case "EXIT_SELECTING_MESSAGES":
      return {
        ...state,
        selectedMessages: [],
        isSelectingMessages: false,
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

import { useState } from "react";
//@ts-ignore
import NoSelectedChat from "@/components/NoSelectedChat";
import { useAuth } from "@/context/AuthContext";
import { useChatsContext } from "@/context/ChatsContext";
import { RoomActionTypes, useRoomContext } from "@/context/Room/RoomContext";
import useRoomSubscription from "@/features/Room/hooks/useRoomSubscription";
import { Box } from "@chakra-ui/react";
import useCommand from "../../lib/hooks/useCommand";
import ChatHeader from "./ChatHeader";
import MessageInput from "./Messages/MessageInput/MessageInput";
import MessagesList from "./Messages/MessageList";
import RoomDetails from "./RoomDetails/RoomDetails";
import { RoomDetailsFooter } from "./RoomDetails/RoomDetailsFooter";

function Room() {
  const { currentUserDetails } = useAuth();
  const { selectedChat } = useChatsContext();
  const { dispatch } = useRoomContext();
  const [showDetails] = useState(false);
  useCommand("Escape", () => {
    dispatch({
      type: RoomActionTypes.EXIT_SELECTING_MESSAGES,
      payload: null,
    });
  });

  //subscribe to realtime changes in the room
  useRoomSubscription();
  if (!currentUserDetails) return null;

  if (!selectedChat) return <NoSelectedChat />;
  return (
    <>
      <Box
        className={`grid h-full grow grid-rows-[1fr_6fr_0.5fr] bg-gray2 dark:bg-dark-blue1`}
      >
        <ChatHeader key={`header-${selectedChat.$id}`} />
        <MessagesList key={`messagesList-${selectedChat.$id}`}></MessagesList>
        <MessageInput key={`input-${selectedChat.$id}`} />
      </Box>
      <aside
        className={`hidden ${
          showDetails && "absolute inset-0"
        } flex  grow basis-40 flex-col items-center border-l pb-4 pt-6 transition-all dark:border-dark-slate4 md:static xl:flex`}
      >
        <RoomDetails />
        <RoomDetailsFooter />
      </aside>
    </>
  );
}

export default Room;

export const Component = Room;

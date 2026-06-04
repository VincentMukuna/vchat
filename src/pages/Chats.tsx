import { useChatsContext } from "@/context/ChatsContext";
import MessagesProvider from "@/context/MessagesContext";
import Room from "@/features/Room/Room";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { blueDark, gray } from "@radix-ui/colors";
import { RoomProvider } from "../context/Room/RoomContext";
import ConversationList from "../features/Conversations/ConversationList";
import Sidebar, { SideBarHeader } from "../features/Sidebar/Sidebar";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

function Chats() {
  const { selectedChat } = useChatsContext();
  const roomBackground = useColorModeValue(gray.gray2, blueDark.blue1);

  return (
    <AuthenticatedLayout>
      <div className={selectedChat ? "hidden md:contents" : "contents"}>
        <Sidebar>
          <SideBarHeader title={"Chats"} className="" />
          <ConversationList className="" />
        </Sidebar>
      </div>
      <Box
        bg={roomBackground}
        style={{ backgroundColor: roomBackground }}
        className={`absolute inset-0 isolate flex h-full min-w-0 flex-1 overflow-hidden bg-gray2 transition-opacity dark:bg-dark-blue1 md:relative ${
          selectedChat ? "z-40" : "invisible md:visible"
        }`}
      >
        <RoomProvider>
          <MessagesProvider>
            <Room key={selectedChat?.$id} />
          </MessagesProvider>
        </RoomProvider>
      </Box>
    </AuthenticatedLayout>
  );
}

export default Chats;

export const Component = Chats;

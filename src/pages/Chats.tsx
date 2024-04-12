import { useChatsContext } from "@/context/ChatsContext";
import MessagesProvider from "@/context/MessagesContext";
import Room from "@/features/Room/Room";
import { Box } from "@chakra-ui/react";
import { RoomProvider } from "../context/Room/RoomContext";
import ConversationList from "../features/Conversations/ConversationList";
import Sidebar, { SideBarHeader } from "../features/Sidebar/Sidebar";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

function Chats() {
  const { selectedChat } = useChatsContext();
  return (
    <AuthenticatedLayout>
      <Sidebar>
        <SideBarHeader title={"Chats"} className="" />
        <ConversationList className="" />
      </Sidebar>
      <Box
        className={`absolute inset-0 flex  h-full   grow transition-opacity lg:relative ${
          selectedChat ? "z-10" : "invisible lg:visible"
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

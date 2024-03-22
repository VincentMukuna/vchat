import { useChatsContext } from "@/context/ChatsContext";
import MessagesProvider from "@/context/MessagesContext";
import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { RoomProvider } from "../context/Room/RoomContext";
import ChatsList from "../features/Chats/ChatsList";
import Sidebar, { SideBarHeader } from "../features/Sidebar/Sidebar";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

function Chats() {
  const { selectedChat } = useChatsContext();
  return (
    <AuthenticatedLayout>
      <Sidebar>
        <SideBarHeader title={"Chats"} className="" />
        <ChatsList className="" />
      </Sidebar>
      <Box
        className={`absolute flex transition-opacity  h-full   inset-0 lg:relative grow ${
          selectedChat ? "z-10" : "invisible lg:visible"
        }`}
      >
        <RoomProvider>
          <MessagesProvider>
            <Outlet key={selectedChat?.$id} />
          </MessagesProvider>
        </RoomProvider>
      </Box>
    </AuthenticatedLayout>
  );
}

export default Chats;

export const Component = Chats;

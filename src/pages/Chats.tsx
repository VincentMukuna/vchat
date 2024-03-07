import { Box } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { RoomProvider } from "../context/RoomContext";
import ChatsList from "../features/Chats/ChatsList";
import Room from "../features/Room/Room";
import Sidebar, { SideBarHeader } from "../features/Sidebar/Sidebar";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

function Chats() {
  return (
    <AuthenticatedLayout>
      <Sidebar>
        <SideBarHeader title={"Chats"} className="" />
        <ChatsList className="px-3 mt-18" />
      </Sidebar>
      <Box
        className={`absolute flex transition-opacity  h-full   inset-0 md:relative grow ${
          false ? "z-10" : "invisible md:visible"
        }`}
      >
        <AnimatePresence>
          <RoomProvider>
            <Room />
          </RoomProvider>
        </AnimatePresence>
      </Box>
    </AuthenticatedLayout>
  );
}

export default Chats;

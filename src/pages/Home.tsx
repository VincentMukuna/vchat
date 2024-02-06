import { Box } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { useAppSelector } from "../context/AppContext";
import { useChatsContext } from "../context/ChatsContext";
import { RoomProvider } from "../context/RoomContext";
import Navbar from "../features/Navbar/Navbar";
import Room from "../features/Room/Room";
import Sidebar from "../features/Sidebar/Sidebar";

function Home() {
  const { activePage, setActivePage } = useAppSelector();
  const { selectedChat } = useChatsContext();
  return (
    <>
      <div className="fixed inset-0 flex flex-col-reverse md:flex-row">
        <Navbar />
        <Sidebar />

        <Box
          className={`absolute flex transition-opacity  h-full   bg-gray1
           dark:bg-dark-slate1 inset-0 md:relative grow ${
             selectedChat ? "z-10" : "invisible md:visible"
           }`}
        >
          <AnimatePresence>
            <RoomProvider>
              <Room />
            </RoomProvider>
          </AnimatePresence>
        </Box>
      </div>
    </>
  );
}

export default Home;

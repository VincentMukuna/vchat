import { useCallback, useEffect } from "react";
import Navbar from "../features/Navbar/Navbar";
import { useAppSelector } from "../context/AppContext";
import Sidebar from "../features/Sidebar/Sidebar";
import Room from "../features/Room/Room";
import { ChatsProvider, useChatsContext } from "../context/ChatsContext";
import { Box } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";

function Home() {
  const { activePage, setActivePage } = useAppSelector();
  const { selectedChat } = useChatsContext();

  const MemoizedRoom = useCallback(Room, [selectedChat]);

  useEffect(() => {}, []);
  return (
    <>
      <div className="fixed inset-0 flex flex-col-reverse md:flex-row ">
        <Navbar />
        <Sidebar />
        <AnimatePresence>
          <Box
            className={`absolute flex transition-opacity  h-full   bg-dark-slate12
           dark:bg-dark-slate1 inset-0 md:relative grow ${
             selectedChat ? "z-10" : "invisible md:visible"
           }`}
          >
            <MemoizedRoom />
          </Box>
        </AnimatePresence>
      </div>
    </>
  );
}

export default Home;

import { useEffect } from "react";
import Navbar from "../features/Navbar/Navbar";
import { useAppSelector } from "../context/AppContext";
import Sidebar from "../features/Sidebar/Sidebar";
import Room from "../features/Room/Room";
import { useChatsContext } from "../context/ChatsContext";
import * as Tabs from "@radix-ui/react-tabs";
import { Box } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";

function Home() {
  const { activePage, setActivePage } = useAppSelector();
  const { selectedChat } = useChatsContext();

  useEffect(() => {}, []);
  return (
    <Tabs.Root
      onValueChange={(value) => setActivePage(value)}
      value={activePage}
      orientation="vertical"
    >
      <div className="fixed inset-0 flex flex-col-reverse md:flex-row ">
        <Tabs.List aria-label="App navigation">
          <Navbar />
        </Tabs.List>

        <Sidebar />
        <AnimatePresence>
          <Box
            className={`absolute flex transition-opacity  h-full   bg-dark-slate12
           dark:bg-dark-slate1 inset-0 md:relative grow ${
             selectedChat ? "z-10" : "invisible md:visible"
           }`}
          >
            <Room />
          </Box>
        </AnimatePresence>
      </div>
    </Tabs.Root>
  );
}

export default Home;

import React, { useEffect } from "react";
import Navbar from "../features/Navbar/Navbar";
import AppContext, { AppProvider, useAppSelector } from "../context/AppContext";
import Sidebar from "../features/Sidebar/Sidebar";
import Room from "../features/Room/Room";
import { ChatsProvider, useChatsContext } from "../context/ChatsContext";
import * as Tabs from "@radix-ui/react-tabs";
import { Functions } from "appwrite";
import { Toaster } from "react-hot-toast";
import { Box, Container } from "@chakra-ui/react";

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
        <Box
          className={`absolute flex transition-opacity  h-full  bg-dark-mauve12
           dark:bg-dark-blue1 inset-0 md:relative grow ${
             selectedChat ? "z-10" : "invisible md:visible"
           }`}
        >
          <Room />
        </Box>
      </div>
    </Tabs.Root>
  );
}

export default Home;

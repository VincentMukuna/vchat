import React, { useEffect } from "react";
import Navbar from "../features/Navbar/Navbar";
import AppContext, { AppProvider, useAppSelector } from "../context/AppContext";
import Sidebar from "../features/Sidebar/Sidebar";
import Room from "../features/Room/Room";
import { ChatsProvider, useChatsContext } from "../context/ChatsContext";
import * as Tabs from "@radix-ui/react-tabs";
import { Functions } from "appwrite";
import { Toaster } from "react-hot-toast";

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
      <div className="absolute inset-0 flex flex-col-reverse w-screen h-screen overflow-hidden md:flex-row">
        <Tabs.List aria-label="App navigation">
          <Navbar />
        </Tabs.List>

        <Sidebar />
        <div
          className={`absolute flex transition-opacity w-screen h-screen  bg-dark-mauve12
           dark:bg-dark-blue1 inset-0 md:relative grow ${
             selectedChat ? "z-10" : "invisible md:visible"
           }`}
        >
          <Room />
        </div>
      </div>
    </Tabs.Root>
  );
}

export default Home;

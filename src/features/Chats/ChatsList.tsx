import { useEffect, useState } from "react";
import Chat from "./Chat";
import { IChat, IGroup, IUserDetails } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { SERVER } from "../../utils/config";
import { useAppSelector } from "../../context/AppContext";
import useSWR, { useSWRConfig } from "swr";
import { ClipLoader } from "react-spinners";
import {
  getChatMessages,
  getUserChats,
} from "../../services/chatMessageServices";
import { getUserGroups } from "../../services/groupMessageServices";
import { Button, Divider, Stack, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { blueDark, gray } from "@radix-ui/colors";
import { UserPlusIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Query } from "appwrite";
import { VARIANTS_MANAGER } from "../../services/variants";

export function compareUpdatedAt(a: any, b: any) {
  const dateA = new Date(a.$updatedAt);
  const dateB = new Date(b.$updatedAt);

  if (dateA < dateB) {
    return 1; // Sort b before a
  } else if (dateA > dateB) {
    return -1; // Sort a before b
  } else {
    return 0; // Dates are equal
  }
}

export async function getConversations(userDetailsID: string) {
  if (!userDetailsID) return [];
  let conversations: (IGroup | IChat)[] = [];

  const res = await Promise.allSettled([
    getUserChats(userDetailsID),
    getUserGroups(userDetailsID),
  ]);

  conversations = ([] as (IChat | IGroup)[]).concat(
    ...(res
      .map((resVal) =>
        resVal.status === "fulfilled" ? resVal.value : undefined,
      )
      .filter((x) => x !== undefined) as (IChat | IGroup)[][]),
  );

  conversations.sort(compareUpdatedAt);

  return conversations;
}

const ChatsList = () => {
  const { currentUser, currentUserDetails, refreshUserDetails } = useAuth();
  const { setActivePage } = useAppSelector();

  const navigate = useNavigate();

  const { colorMode } = useColorMode();

  const { cache } = useSWRConfig();
  if (!currentUser || !currentUserDetails) return null;

  // Local state to store chats data

  // Fetch chats data using useSWR
  let {
    data: conversations,
    error: chatsError,
    mutate,
    isLoading,
  } = useSWR(
    "conversations",
    () => getConversations(currentUserDetails.$id),
    {},
  );

  // Update local chats data when the data is refreshed

  useEffect(() => {
    // Subscribe to changes on the user's chatlist and contact list
    const unsubscribe = api.subscribe<IUserDetails>(
      `databases.${SERVER.DATABASE_ID}.collections.${SERVER.COLLECTION_ID_USERS}.documents.${currentUserDetails.$id}`,
      (response) => {
        // If the contact details have been updated, refresh the user details
        mutate();
      },
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserDetails]);
  if (chatsError) {
    return (
      <div className="flex flex-col items-center gap-2">
        Whoops! Error fetching chats
        <p>{chatsError?.message}</p>
        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          width={"44"}
          rounded={"md"}
          onClick={() => {
            mutate();
            toast("Reloading");
          }}
          bg={blueDark.blue5}
          color={colorMode === "dark" ? gray.gray2 : gray.gray1}
          _hover={
            colorMode === "light"
              ? { bg: blueDark.blue7, color: gray.gray1 }
              : { bg: blueDark.blue7 }
          }
        >
          Reload
        </Button>
      </div>
    );
  } else if (!isLoading && conversations && conversations.length < 1) {
    return (
      <div className="flex flex-col items-center gap-6 mt-4">
        <div className="flex flex-col items-center justify-center ">
          <p>No Chats!</p>
          Add contacts to start messaging
        </div>

        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          px={12}
          py={"6"}
          leftIcon={<UserPlusIcon className="w-5 h-5 " />}
          onClick={() => {
            navigate("users");
            setActivePage("Users");
          }}
        >
          Create Chat
        </Button>
      </div>
    );
  } else {
    return (
      <motion.div
        key="chats"
        variants={VARIANTS_MANAGER}
        initial="slide-from-left"
        animate="slide-in"
        exit="slide-from-right"
      >
        <Stack spacing={0} px={1}>
          {(conversations ? conversations : currentUserDetails.groups).map(
            (conversation) => (
              <Chat key={conversation.$id} conversation={conversation} />
            ),
          )}
        </Stack>
      </motion.div>
    );
  }
};

export default ChatsList;

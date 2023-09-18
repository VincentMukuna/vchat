import { useEffect, useState } from "react";
import Chat from "./Conversation";
import { IChat, IGroup, IUserDetails } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Server } from "../../utils/config";
import { useAppSelector } from "../../context/AppContext";
import { getChats } from "../../services/chatMessageServices";
import useSWR, { useSWRConfig } from "swr";
import {
  getCurrentGroups,
  getGroups,
} from "../../services/groupMessageServices";
import { ClipLoader } from "react-spinners";

function compareUpdatedAt(a: any, b: any) {
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

async function getConversations(userDetailsDocID: string) {
  let conversations: (IGroup | IChat)[];

  let chatDocs = await getChats(userDetailsDocID);
  let groupDocs = await getCurrentGroups(userDetailsDocID);
  console.log(`Now getting via search...`);
  console.time("search");
  let groups = await getGroups(userDetailsDocID);
  console.log(`search Done`, groups);
  console.timeEnd("search");

  conversations = [...chatDocs, ...groupDocs].sort(compareUpdatedAt);
  return conversations;
}

const Chats = () => {
  const { currentUser, currentUserDetails, refreshUserDetails } = useAuth();
  const { setActivePage } = useAppSelector();
  const { cache } = useSWRConfig();

  if (!currentUser || !currentUserDetails) return null;

  // Local state to store chats data
  const [localConversations, setLocalConversations] = useState<
    (IChat | IGroup)[]
  >([]);

  // Fetch chats data using useSWR
  let {
    data: conversations,
    error: chatsError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    () => {
      return currentUserDetails.$id;
    },
    getConversations,
    {},
  );

  // Update local chats data when the data is refreshed
  useEffect(() => {
    if (Array.isArray(conversations)) {
      setLocalConversations(conversations);
    }
  }, [conversations]);

  useEffect(() => {
    // Subscribe to changes on the user's chatlist and contact list
    const unsubscribe = api.subscribe<IUserDetails>(
      `databases.${Server.databaseID}.collections.${Server.collectionIDUsers}.documents.${currentUserDetails.$id}`,
      (response) => {
        // If the contact details have been updated, refresh the user details
        if (
          response.payload.changeLog === "addcontact" ||
          response.payload.changeLog === "deletecontact"
        ) {
          console.log("change in contacts");
          mutate(currentUserDetails.$id);
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserDetails]);

  if (chatsError) {
    return (
      <div className="flex flex-col">
        Whoops! Error fetching chats
        <p>{chatsError.message}</p>
      </div>
    );
  } else if (
    Array.isArray(conversations) &&
    conversations.length === 0 &&
    localConversations.length === 0
  ) {
    return (
      <div className="flex flex-col items-center gap-6 mt-4">
        <div className="flex flex-col items-center justify-center ">
          <p>No Contacts!</p>
          Add contacts to start messaging
        </div>

        <button
          onClick={() => setActivePage("Users")}
          className="flex gap-2 px-2 py-3 text-base transition-all bg-purple-800 rounded hover:bg-purple-900 active:scale-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
            />
          </svg>
          Add Contacts
        </button>
      </div>
    );
  } else if (isLoading && localConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <ClipLoader />
        Fetching chats...
      </div>
    );
  } else {
    return (
      <div className="h-full p-2 overflow-x-hidden overflow-y-auto">
        {localConversations?.map((conversation) => (
          <Chat key={conversation.$id} conversation={conversation} />
        ))}
      </div>
    );
  }
};

export default Chats;

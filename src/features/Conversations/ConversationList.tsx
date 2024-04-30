import { useChatsContext } from "@/context/ChatsContext";
import useChatsListSubscription from "@/features/Conversations/hooks/useChatsListSubscription";
import useUserChatsSubscription from "@/features/Conversations/hooks/useUserChatsSubscription";
import { IConversation } from "@/interfaces/interfaces";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import { isGroup } from "@/utils/utils";
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
} from "@chakra-ui/react";
import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/20/solid";
import { blueDark, gray } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { useAuth } from "../../context/AuthContext";
import { VARIANTS_MANAGER } from "../../services/variants";
import Conversation from "./Conversation";

const ConversationList = ({ className }: { className: string }) => {
  const { currentUser, currentUserDetails } = useAuth();
  const navigate = useNavigate();

  const { colorMode } = useColorMode();
  const {
    conversationsData: { conversations, chatsError, chatsLoading },
  } = useChatsContext();
  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] =
    useState<IConversation[]>(conversations);
  //synch chats with the server
  useEffect(() => {
    setSearchResults(conversations);
    handleChatsSearch(search);
  }, [conversations, chatsError, chatsLoading]);
  if (!currentUser || !currentUserDetails) return null;
  const { update: updateConversations } = useSWROptimistic("conversations");

  //subscribe to realtime user chats changes
  useUserChatsSubscription();

  useChatsListSubscription();

  const handleChatsSearch = useDebouncedCallback((search: string) => {
    setSearchResults(
      conversations?.filter((conversation) => {
        if (isGroup(conversation)) {
          return conversation.name.toLowerCase().includes(search.toLowerCase());
        } else {
          const contact = conversation.participants.find(
            (p) => p.$id !== currentUserDetails.$id,
          );
          if (!contact) return false;
          return contact.name.toLowerCase().includes(search.toLowerCase());
        }
      }),
    );
  }, 100);

  if (chatsError) {
    return (
      <div className={"flex flex-col items-center gap-2 " + className}>
        Whoops! Error fetching chats
        <p>{chatsError?.message}</p>
        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          width={"44"}
          rounded={"md"}
          onClick={() => {
            updateConversations(undefined, { revalidate: true });
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
  } else if (!chatsLoading && conversations && conversations.length < 1) {
    return (
      <div className="mt-4 flex flex-col items-center gap-6">
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
          leftIcon={<UserPlusIcon className="h-5 w-5 " />}
          onClick={() => {
            navigate("/users");
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
        <InputGroup className="my-2 px-2 ">
          <InputLeftElement pointerEvents={"none"} left={2}>
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </InputLeftElement>
          <Input
            value={search}
            rounded={"full"}
            variant={"filled"}
            placeholder="Search for chats"
            type="search"
            onChange={(e) => {
              setSearch(e.target.value);
              handleChatsSearch(e.target.value);
            }}
          />
        </InputGroup>
        <div
          id="chats-container"
          className={"flex flex-col space-y-1 overflow-y-clip " + className}
        >
          {searchResults.length > 0 ? (
            searchResults.map((conversation) => (
              <Conversation
                key={conversation.$id}
                conversation={conversation}
              />
            ))
          ) : (
            <div className="mx-auto mt-4 flex max-w-xs flex-col items-center gap-2 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 " />
              <p className="font-bold">No results found!</p>
              <p>No chats match the provided name. Try another name</p>
              <Button
                onClick={() => {
                  setSearch("");
                  handleChatsSearch("");
                }}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
};

export default ConversationList;

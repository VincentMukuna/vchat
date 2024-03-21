import { useChatsContext } from "@/context/ChatsContext";
import { getChatDoc } from "@/services/chatMessageServices";
import { matchAndExecute } from "@/utils";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import { Button, useColorMode } from "@chakra-ui/react";
import { UserPlusIcon } from "@heroicons/react/20/solid";
import { blueDark, gray } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  IUserDetails,
  USER_DETAILS_CHANGE_LOG_REGEXES,
} from "../../interfaces";
import api from "../../services/api";
import { VARIANTS_MANAGER } from "../../services/variants";
import { SERVER } from "../../utils/config";
import Chat from "./Chat";

const ChatsList = ({ className }: { className: string }) => {
  const { currentUser, currentUserDetails } = useAuth();
  const navigate = useNavigate();

  const { colorMode } = useColorMode();
  const {
    addConversation,
    conversations: { conversations, chatsError, chatsLoading },
    deleteConversation,
  } = useChatsContext();
  if (!currentUser || !currentUserDetails) return null;
  const { update: updateConversations } = useSWROptimistic("conversations");

  useEffect(() => {
    const unsubscribe = api.subscribe<IUserDetails>(
      `databases.${SERVER.DATABASE_ID}.collections.${SERVER.COLLECTION_ID_USERS}.documents.${currentUserDetails.$id}`,
      (response) => {
        const changeLog = response.payload.changeLog;
        console.log(changeLog);
        const conversations = [
          ...response.payload.groups,
          ...response.payload.chats,
        ];

        const matchers = new Map();

        const handleNewConversation = async (id: string) => {
          console.log("new convo: ", id);
          const newConversation = conversations.find(
            (convo) => convo.$id === id,
          );
          if (newConversation?.$collectionId === SERVER.COLLECTION_ID_CHATS) {
            let chatDoc = await getChatDoc(newConversation.$id);
            addConversation(chatDoc);
          } else {
            newConversation && addConversation(newConversation);
          }
        };

        const handleDeletedConversation = (id: string) => {
          deleteConversation(id);
        };

        matchers.set(
          USER_DETAILS_CHANGE_LOG_REGEXES.createConversation,
          (matches: string[]) => {
            handleNewConversation(matches.at(1)!);
          },
        );

        matchers.set(
          USER_DETAILS_CHANGE_LOG_REGEXES.deleteConversation,
          (matches: string[]) => {
            handleDeletedConversation(matches.at(1)!);
          },
        );

        matchAndExecute(changeLog, matchers);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserDetails]);

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
        <div
          id="chats-container"
          className={"flex flex-col space-y-1 overflow-y-clip " + className}
        >
          {(conversations ? conversations : []).map((conversation) => (
            <Chat key={conversation.$id} conversation={conversation} />
          ))}
        </div>
      </motion.div>
    );
  }
};

export default ChatsList;

import { getConversations } from "@/services/userDetailsServices";
import { Button, useColorMode } from "@chakra-ui/react";
import { UserPlusIcon } from "@heroicons/react/20/solid";
import { blueDark, gray } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import useSWR, { useSWRConfig } from "swr";
import { useAuth } from "../../context/AuthContext";
import {
  DirectChatDetails,
  GroupChatDetails,
  IUserDetails,
} from "../../interfaces";
import api from "../../services/api";
import { VARIANTS_MANAGER } from "../../services/variants";
import { compareUpdatedAt } from "../../utils";
import { SERVER } from "../../utils/config";
import Chat from "./Chat";

const ChatsList = ({ className }: { className: string }) => {
  const { currentUser, currentUserDetails } = useAuth();
  const { chatID } = useParams();
  const navigate = useNavigate();

  const { colorMode } = useColorMode();

  const { cache } = useSWRConfig();
  if (!currentUser || !currentUserDetails) return null;
  let {
    data: conversations,
    error: chatsError,
    mutate,
    isLoading,
  } = useSWR("conversations", () => getConversations(currentUserDetails.$id), {
    fallbackData: ([] as (GroupChatDetails | DirectChatDetails)[])
      .concat(currentUserDetails.groups)
      .sort(compareUpdatedAt),
  });

  useEffect(() => {
    const unsubscribe = api.subscribe<IUserDetails>(
      `databases.${SERVER.DATABASE_ID}.collections.${SERVER.COLLECTION_ID_USERS}.documents.${currentUserDetails.$id}`,
      (response) => {
        mutate();
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
        <div className={"flex flex-col space-y-1 overflow-y-clip " + className}>
          {(conversations ? conversations : currentUserDetails.groups).map(
            (conversation) => (
              <Chat key={conversation.$id} conversation={conversation} />
            ),
          )}
        </div>
      </motion.div>
    );
  }
};

export default ChatsList;

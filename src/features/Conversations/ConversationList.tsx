import { useChatsContext } from "@/context/ChatsContext";
import useChatsListSubscription from "@/features/Conversations/hooks/useChatsListSubscription";
import useUserChatsSubscription from "@/features/Conversations/hooks/useUserChatsSubscription";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import { Button, useColorMode } from "@chakra-ui/react";
import { UserPlusIcon } from "@heroicons/react/20/solid";
import { blueDark, gray } from "@radix-ui/colors";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
  if (!currentUser || !currentUserDetails) return null;
  const { update: updateConversations } = useSWROptimistic("conversations");

  //subscribe to realtime user chats changes
  useUserChatsSubscription();

  useChatsListSubscription();

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
        <div
          id="chats-container"
          className={"flex flex-col space-y-1 overflow-y-clip " + className}
        >
          {(conversations.length > 0
            ? conversations
            : currentUserDetails.groups
          ).map((conversation) => (
            <Conversation key={conversation.$id} conversation={conversation} />
          ))}
        </div>
      </motion.div>
    );
  }
};

export default ConversationList;

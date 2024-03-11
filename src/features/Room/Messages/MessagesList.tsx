import { AnimatePresence } from "framer-motion";
import { createContext, useContext, useRef } from "react";
import { SyncLoader } from "react-spinners";
import { DirectMessageDetails, GroupMessageDetails } from "../../../interfaces";
import Message from "./Message";

interface MessagesProps {
  messages: (DirectMessageDetails | GroupMessageDetails)[];
  onDelete: (
    message: DirectMessageDetails | GroupMessageDetails,
  ) => Promise<void>;
  isLoading: boolean;
}

type MessagesContextType = {
  messagesListRef: React.RefObject<HTMLDivElement> | null;
};

const MessagesContext = createContext<MessagesContextType>({
  messagesListRef: null,
});

function MessagesList({ messages, onDelete, isLoading }: MessagesProps) {
  const messageListRef = useRef<HTMLDivElement>(null);
  return (
    <MessagesContext.Provider value={{ messagesListRef: messageListRef }}>
      <div
        ref={messageListRef}
        className="relative self-stretch overflow-x-hidden overflow-y-auto grow"
      >
        <div
          id="messages-container"
          className="flex flex-col-reverse h-full p-2 pb-4 overflow-y-scroll gap-y-2"
        >
          {messages.length > 0 ? (
            <div id="messages-container">
              <AnimatePresence mode="popLayout">
                {messages.map((message, i) => (
                  <Message
                    message={message}
                    onDelete={onDelete}
                    key={message.$id}
                    i={i}
                    prev={messages[i + 1]}
                    next={messages[i - 1]}
                    replyingTo={messages.find(
                      (msg) => msg.$id === message.replying,
                    )}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : isLoading ? (
            <div className="flex items-center self-center h-full justify-self-center">
              <SyncLoader size={8} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full gap-2 dark:text-gray2">
              <div className="text-lg font-bold tracking-wider">
                No Messages
              </div>
              <div className="">
                Start the conversation by typing a message below
              </div>
            </div>
          )}
        </div>
      </div>
    </MessagesContext.Provider>
  );
}

export default MessagesList;

export const useMessages = () => {
  const { messagesListRef } = useContext(MessagesContext);
  return { messagesListRef };
};

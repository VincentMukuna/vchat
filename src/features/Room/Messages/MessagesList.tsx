import { useMessages } from "@/context/MessagesContext";
import { createContext, memo, useRef } from "react";
import Message from "./Message";

interface MessagesProps {}

type MessagesContextType = {
  messagesListRef: React.RefObject<HTMLDivElement> | null;
};

const MessagesContext = createContext<MessagesContextType>({
  messagesListRef: null,
});
function MessagesList({}: MessagesProps) {
  const messageListRef = useRef<HTMLDivElement>(null);
  const { messages } = useMessages();
  return (
    <div
      ref={messageListRef}
      className="relative self-stretch overflow-x-hidden overflow-y-auto grow"
    >
      <div
        id="messages-container"
        className="flex flex-col-reverse self-stretch h-full p-2 pb-4 overflow-y-scroll grow"
      >
        {messages.length > 0 ? (
          <MessagesContext.Provider value={{ messagesListRef: messageListRef }}>
            {messages.map((message, i) => (
              <Message
                i={i}
                initialRender={i < 12}
                messagesListRef={messageListRef}
                message={message}
                key={message.$id}
                prev={messages[i + 1]}
                next={messages[i - 1]}
              />
            ))}
          </MessagesContext.Provider>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-2 dark:text-gray2">
            <div className="text-lg font-bold tracking-wider">No Messages</div>
            <div className="">
              Start the conversation by typing a message below
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MessagesList);

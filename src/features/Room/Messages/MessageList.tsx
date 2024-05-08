import { useMessagesContext } from "@/context/MessagesContext";
import { ChatMessage } from "@/interfaces/interfaces";
import { groupDocumentsByDate, sortByCreatedAtAsc } from "@/utils/utils";
import { createContext, memo, useContext, useMemo, useRef } from "react";
import Message from "./Message/Message";

interface MessagesProps {}

type MessagesContextType = {
  messagesListRef: React.RefObject<HTMLDivElement> | null;
};

const MessageListContext = createContext<MessagesContextType>({
  messagesListRef: null,
});
function MessageList({}: MessagesProps) {
  const messageListRef = useRef<HTMLDivElement>(null);
  const { messages } = useMessagesContext();
  const groupedMessages = useMemo(() => {
    return Object.entries(groupDocumentsByDate(messages)).reduce(
      (acc, [date, messages]) => {
        acc.push([date, messages.sort(sortByCreatedAtAsc)]);
        return acc;
      },
      [] as [string, ChatMessage[]][],
    );
  }, [messages]);

  return (
    <div
      ref={messageListRef}
      className="relative grow self-stretch overflow-y-auto overflow-x-hidden"
    >
      <div
        id="messages-container"
        className="flex h-full grow flex-col-reverse self-stretch overflow-x-hidden overflow-y-scroll p-2 pb-4"
      >
        {messages.length > 0 ? (
          <MessageListContext.Provider
            value={{ messagesListRef: messageListRef }}
          >
            {groupedMessages.map(([date, messages], i) => (
              <div key={i}>
                <div className="mt-2 py-2 text-center text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400/90">
                  {date}
                </div>
                {messages.map((message, i) => (
                  <Message
                    i={i}
                    initialRender={i < 12}
                    message={message}
                    key={message.$id}
                    prev={messages[i - 1]}
                    next={messages[i + 1]}
                  />
                ))}
              </div>
            ))}
          </MessageListContext.Provider>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center dark:text-gray2">
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

export const useMessageListContext = () => {
  const context = useContext(MessageListContext);
  if (!context) {
    throw new Error(
      "useMessagesContext must be used within a MessagesProvider",
    );
  }
  return context;
};
export default memo(MessageList);

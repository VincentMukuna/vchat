import { useMessagesContext } from "@/context/MessagesContext";
import { ChatMessage } from "@/interfaces/interfaces";
import {
  groupDocumentsByDate,
  sortDocumentsByCreationDateAsc,
} from "@/utils/utils";
import { createContext, memo, useMemo, useRef } from "react";
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
  const { messages } = useMessagesContext();
  const groupedMessages = useMemo(() => {
    return Object.entries(groupDocumentsByDate(messages)).reduce(
      (acc, [date, messages]) => {
        acc.push([date, messages.sort(sortDocumentsByCreationDateAsc)]);
        return acc;
      },
      [] as [string, ChatMessage[]][],
    );
  }, [messages]);
  return (
    <div
      ref={messageListRef}
      className="relative self-stretch overflow-x-hidden overflow-y-auto grow"
    >
      <div
        id="messages-container"
        className="flex flex-col-reverse self-stretch h-full p-2 pb-4 overflow-x-hidden overflow-y-scroll grow"
      >
        {messages.length > 0 ? (
          <MessagesContext.Provider value={{ messagesListRef: messageListRef }}>
            {groupedMessages.map(([date, messages], i) => (
              <div key={i}>
                <div className="py-2 mt-2 text-xs font-semibold tracking-wide text-center text-gray-500 dark:text-gray-400/90">
                  {date}
                </div>
                {messages.map((message, i) => (
                  <Message
                    i={i}
                    initialRender={i < 12}
                    messagesListRef={messageListRef}
                    message={message}
                    key={message.$id}
                    prev={messages[i - 1]}
                    next={messages[i + 1]}
                  />
                ))}
              </div>
            ))}
            {/* {messages.map((message, i) => (
              <Message
                i={i}
                initialRender={i < 12}
                messagesListRef={messageListRef}
                message={message}
                key={message.$id}
                prev={messages[i + 1]}
                next={messages[i - 1]}
              />
            ))} */}
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

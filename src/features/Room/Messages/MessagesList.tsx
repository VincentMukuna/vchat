import { AnimatePresence } from "framer-motion";
import { IChatMessage, IGroupMessage } from "../../../interfaces";
import Message from "./Message";
import { SyncLoader } from "react-spinners";

interface MessagesProps {
  messages: (IChatMessage | IGroupMessage)[];
  onDelete: (message: IChatMessage | IGroupMessage) => Promise<void>;
  isLoading: boolean;
}

function MessagesList({ messages, onDelete, isLoading }: MessagesProps) {
  return (
    <div className="relative self-stretch overflow-x-hidden overflow-y-auto grow">
      <div
        id="messages-container"
        className="flex flex-col-reverse h-full p-2 pb-4 overflow-y-scroll"
      >
        {messages.length > 0 ? (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message, i) => (
                <Message
                  message={message}
                  onDelete={onDelete}
                  key={message.$id}
                  i={i}
                  prev={messages[i + 1]}
                  next={messages[i - 1]}
                />
              ))}
            </AnimatePresence>
          </>
        ) : isLoading ? (
          <div className="flex items-center self-center h-full justify-self-center">
            <SyncLoader size={8} />
          </div>
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

export default MessagesList;

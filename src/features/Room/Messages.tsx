import { IChatMessage, IGroupMessage } from "../../interfaces";
import Message from "./Message";

interface MessagesProps {
  messages: IGroupMessage[] | IChatMessage[];
  onDelete: (message: IChatMessage | IGroupMessage) => Promise<void>;
}

function Messages({ messages, onDelete }: MessagesProps) {
  return (
    <div className="relative self-stretch overflow-y-auto grow">
      <div className="flex flex-col-reverse h-full p-2 overflow-y-scroll bg-rose-900">
        {messages.length > 0 ? (
          messages.map((message, i) => (
            <Message
              key={message.$id || i}
              message={message}
              onDelete={onDelete}
            />
          ))
        ) : (
          <p>No messages</p>
        )}
      </div>
    </div>
  );
}

export default Messages;

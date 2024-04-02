import { ChatMessage } from "@/interfaces/interfaces";
import { useMemo } from "react";

const MessageReply = ({ message }: { message: ChatMessage }) => {
  const replying = useMemo(() => {
    return JSON.parse(message.replying!);
  }, [message.replying]);
  return (
    replying && (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const replyMessageElement = document.getElementById(
            JSON.parse(message.replying!).$id,
          );

          replyMessageElement?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });

          replyMessageElement?.focus();
        }}
        className="sm:max-w-[22rem] max-w-[80vw] border-indigo-500 text-gray-500 mt-2 dark:text-gray-400 py-1 overflow-hidden border-s-4 ps-2"
      >
        <span className="text-xs line-clamp-2">{replying?.body}</span>
      </div>
    )
  );
};

export default MessageReply;

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
        className="mt-2 max-w-[80vw] overflow-hidden border-s-4 border-indigo-500 py-1 ps-2 text-gray-500 dark:text-gray-400 sm:max-w-[22rem]"
      >
        <span className="line-clamp-2 text-xs">{replying?.body}</span>
      </div>
    )
  );
};

export default MessageReply;

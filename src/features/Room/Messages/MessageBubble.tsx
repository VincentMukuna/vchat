import { useAuth } from "@/context/AuthContext";
import { ChatMessage } from "@/interfaces/interfaces";
import { forwardRef } from "react";

type MessageBubbleProps = {
  message: ChatMessage;
  prev: ChatMessage | undefined;
  next: ChatMessage | undefined;
};
const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ message, prev, next }, messageRef) => {
    const { currentUserDetails } = useAuth();
    const isMine = message.senderID === currentUserDetails?.$id;
    const isSystem = message.senderID === "system";
    const prevSameSender = prev?.senderID === message.senderID;
    const nextSameSender = next?.senderID === message.senderID;
    return (
      <div
        ref={messageRef}
        className={`pointer-events-none relative z-10 flex min-w-[3rem]  max-w-[80vw] select-none 
                flex-col gap-1 rounded-3xl p-3 py-2 ps-3 sm:max-w-[22rem]
                ${
                  isMine
                    ? `me-4 self-end bg-indigo-200  dark:bg-indigo-900 dark:text-white`
                    : "text-gray-100s bg-gray7   dark:bg-dark-gray6/90"
                } 

                ${
                  prevSameSender
                    ? isMine
                      ? "rounded-tr-md"
                      : "rounded-tl-md"
                    : ""
                }

                ${
                  nextSameSender
                    ? isMine
                      ? "rounded-br-md"
                      : "rounded-bl-md"
                    : ""
                }
                
                `}
      >
        <div className="flex justify-between text-[0.9rem] leading-relaxed tracking-wide">
          <pre className=" whitespace-pre-wrap font-sans">{message.body}</pre>
          <small className="ms-2 inline-flex items-baseline gap-1 self-end text-[0.6rem] tracking-wider text-gray-500 dark:text-slate-300">
            {new Date(message.$createdAt)
              .toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
              })
              .replace(" ", "")}
            {message.editedAt && (
              <>
                <span className="text-lg font-semibold leading-3 tracking-tight">
                  .
                </span>
                <span>edited</span>
              </>
            )}
          </small>
        </div>
      </div>
    );
  },
);

export default MessageBubble;

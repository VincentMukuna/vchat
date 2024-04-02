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
        className={`flex flex-col relative min-w-[3rem] gap-1 rounded-3xl  sm:max-w-[22rem] max-w-[80vw] 
                p-3 ps-3 py-2 z-10
                ${
                  isMine
                    ? `bg-indigo-200 dark:bg-indigo-900 dark:text-white  self-end me-4`
                    : "bg-gray7 dark:bg-dark-gray6/90   text-gray-100s"
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
        <div className="text-[0.9rem] leading-relaxed tracking-wide flex justify-between">
          <pre className="font-sans whitespace-pre-wrap">{message.body}</pre>
          <small className="text-[0.6rem] tracking-wider text-gray-500 dark:text-slate-300 self-end ms-2 inline-flex gap-1 items-baseline">
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

import React, { useEffect, useState } from "react";
import { sendChatMessage } from "../../services/chatMessageServices";
import { useChatsContext } from "../../context/ChatsContext";
import { IChatMessage, IGroupMessage } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import { sendGroupMessage } from "../../services/groupMessageServices";
import { Server } from "../../utils/config";
import { ID } from "appwrite";
import { useSWRConfig } from "swr";
import toast from "react-hot-toast";

type InputProps = {};

const Input = ({}: InputProps) => {
  const { currentUser, currentUserDetails } = useAuth();
  if (!currentUserDetails) return;
  const [sending, setSending] = useState(false);
  const { selectedChat, recepient } = useChatsContext();
  const [messageBody, setMessageBody] = useState("");

  let { mutate, cache } = useSWRConfig();

  const isGroup = !!(selectedChat?.$collectionId === "groups");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
    setMessageBody(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMessageBody("");
    if (isGroup) {
      console.log("Sending group message");
      let message: IGroupMessage = {
        $collectionId: Server.collectionIDGroupMessages,
        $databaseId: Server.databaseID,
        $createdAt: new Date().toISOString(),
        $id: new Date().toISOString(),
        $permissions: [""],
        $updatedAt: new Date().toISOString(),
        attachments: [],
        senderID: currentUserDetails.$id,
        body: messageBody,
        group: selectedChat.$id,
      };
      await mutate(
        selectedChat.$id,
        [message, ...cache.get(selectedChat.$id)?.data],
        { revalidate: false },
      );
      let promise = sendGroupMessage(selectedChat.$id, {
        body: message.body,
        group: message.group as string,
        senderID: message.senderID,
        attachments: null,
      });
      promise.finally(() => {
        setSending(false);
      });

      return;
    }
    if (selectedChat === undefined || recepient === undefined) return;

    let message = {
      $collectionId: Server.collectionIDChatMessages,
      $databaseId: Server.databaseID,
      $createdAt: new Date().toISOString(),
      $id: new Date().toISOString(),
      $permissions: [""],
      $updatedAt: new Date().toISOString(),
      senderID: currentUserDetails.$id,
      recepientID: recepient.$id,
      body: messageBody,
      read: false,
      chat: selectedChat.$id,
    } as IChatMessage;
    await mutate(
      selectedChat.$id,
      [message, ...cache.get(selectedChat.$id)?.data],
      { revalidate: false, rollbackOnError: true },
    );

    let promise = sendChatMessage(selectedChat.$id, {
      messageBody: messageBody,
      recepientID: recepient.$id,
      senderID: currentUserDetails.$id,
    });

    promise.finally(() => {
      setSending(false);
      setMessageBody("");
    });
  };

  useEffect(() => {
    setMessageBody("");
  }, [selectedChat]);
  return (
    <footer className="bottom-0 m-4 overflow-hidden rounded-full dark:text-dark-blue12 bg-gray8 dark:bg-dark-blue3 end-0 start-0 shrink-0">
      <form onSubmit={handleSubmit} className="flex self-stretch w-full ">
        <div className="flex items-center w-full gap-3 p-3">
          <div className="flex gap-6 px-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 -rotate-45"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
              />
            </svg>
          </div>

          <input
            placeholder="Type a message"
            className="w-[80%] py-2  bg-transparent focus:outline-none caret-secondary-main
             placeholder:text-slate-800 placeholder:dark:text-indigo-50  rounded  resize-none max-h-[100px]
             dark:text-gray1
             invalid:border invalid:border-red-300"
            value={messageBody}
            spellCheck={true}
            onChange={handleChange}
            onBlur={handleChange}
            maxLength={1500}
          ></input>
          {messageBody && (
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-3 p-2 mr-3 text-base font-medium tracking-wider rounded bg-dark-indigo4 dark:text-white"
            >
              Send
            </button>
          )}
        </div>
      </form>
    </footer>
  );
};

export default Input;

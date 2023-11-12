import React, { useEffect, useState } from "react";
import { sendChatMessage } from "../../services/chatMessageServices";
import { useChatsContext } from "../../context/ChatsContext";
import { IChatMessage, IGroupMessage, IUserDetails } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import { sendGroupMessage } from "../../services/groupMessageServices";
import { SERVER } from "../../utils/config";
import { useSWRConfig } from "swr";
import { PaperClipIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Badge, IconButton, Image } from "@chakra-ui/react";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
  Validator,
} from "use-file-picker/validators";
import toast from "react-hot-toast";
import { FileTypeValidator } from "../../utils/fileValidators";
import { unstable_serialize } from "swr/infinite";

type InputProps = {};

export type Message = IChatMessage | IGroupMessage;

const Input = ({}: InputProps) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;
  const [sending, setSending] = useState(false);
  const { selectedChat, recepient } = useChatsContext();
  if (!selectedChat) return null;
  const [messageBody, setMessageBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  let { mutate, cache } = useSWRConfig();

  const chatMessagesKey = unstable_serialize(
    () => selectedChat.$id + "-messages",
  );

  const firstPageMsgs = cache.get(chatMessagesKey)?.data[0];
  const { openFilePicker, filesContent, clear } = useFilePicker({
    accept: [".jpg", ".png"],
    multiple: false,
    readAs: "DataURL",
    validators: [
      new FileTypeValidator(["image/png", "image/jpeg"]),
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 }),
    ],
    onFilesSuccessfullySelected(data) {
      setAttachments(data.plainFiles as File[]);
    },

    onFilesRejected: ({ errors }) => {
      toast.error(
        "Invalid file " + errors.map((error: any) => error.reason + " \n"),
      );
    },

    onClear: () => {
      setAttachments([]);
    },
  });

  const isGroup = !!(selectedChat?.$collectionId === "groups");
  const isPersonal: boolean =
    !isGroup &&
    selectedChat.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
    setMessageBody(e.target.value.slice(0, 1498));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageBody.trim() === "") {
      return;
    }
    setSending(true);
    setMessageBody("");
    setAttachments([]);

    let message = isGroup
      ? {
          $collectionId: SERVER.COLLECTION_ID_GROUP_MESSAGES,
          $databaseId: SERVER.DATABASE_ID,
          $createdAt: new Date().toISOString(),
          $id: new Date().toISOString(),
          $permissions: [""],
          $updatedAt: new Date().toISOString(),
          attachments: filesContent,
          senderID: currentUserDetails.$id,
          body: messageBody,
          group: selectedChat.$id,
          optimistic: true,
        }
      : {
          $collectionId: SERVER.COLLECTION_ID_CHAT_MESSAGES,
          $databaseId: SERVER.DATABASE_ID,
          $createdAt: new Date().toISOString(),
          $id: new Date().toISOString() + Math.random(),
          $permissions: [""],
          $updatedAt: new Date().toISOString(),
          senderID: currentUserDetails.$id,
          recepientID: recepient?.$id,
          body: messageBody,
          read: isPersonal ? true : false,
          chat: selectedChat.$id,
          attachments: filesContent,
          optimistic: true,
        };

    const newMessages = [
      [message, ...(cache.get(chatMessagesKey)?.data[0] as Message[])],
      ...(cache.get(chatMessagesKey)?.data as Message[][]).slice(1),
    ];

    await mutate(chatMessagesKey, newMessages, {
      revalidate: false,
    });

    let container = document.getElementById(
      "messages-container",
    ) as HTMLDivElement;
    container.scrollTo({ top: 0, behavior: "smooth" });
    mutate(`lastMessage ${selectedChat.$id}`, message, { revalidate: false });
    let msgSentPromise = isGroup
      ? sendGroupMessage(selectedChat.$id, {
          body: message.body,
          group: message.group as string,
          senderID: message.senderID,
          attachments: attachments,
        })
      : sendChatMessage(selectedChat.$id, {
          messageBody: messageBody,
          recepientID: (recepient as IUserDetails).$id,
          senderID: currentUserDetails.$id,
          attachments: attachments,
          read: isPersonal ? true : false,
        });
    const firstPageMsgs = cache.get(chatMessagesKey)?.data[0] as Message[];

    let messages = cache.get(chatMessagesKey)?.data as (
      | IChatMessage
      | IGroupMessage
    )[][];

    msgSentPromise.then((msg) => {
      mutate(
        chatMessagesKey,
        messages?.map((msgArray) => {
          msgArray.map((ucMessage) => {
            if (ucMessage.$id === message.$id) {
              return msg;
            }
            return ucMessage;
          });
        }),
      ).then(() => {
        let lastMessage = cache.get(`lastMessage ${selectedChat.$id}`)?.data as
          | IChatMessage
          | IGroupMessage;
        if (lastMessage.$id === message.$id) {
          mutate(`lastMessage ${selectedChat.$id}`, msg);
        }
      });
    });

    msgSentPromise.catch((e) => {
      mutate(
        chatMessagesKey,
        messages?.map((msgArray) => {
          msgArray.filter((ucMessage) => ucMessage.$id !== message.$id);
        }),
      ).then(() => {
        let lastMessage = cache.get(`lastMessage ${selectedChat.$id}`)?.data as
          | IChatMessage
          | IGroupMessage;
        if (lastMessage.$id === message.$id) {
          mutate(
            `lastMessage ${selectedChat.$id}`,
            ([] as Message[]).concat(...messages).at(0),
          );
        }
      });

      toast.error("Error sending message");
    });

    msgSentPromise.finally(() => {
      setSending(false);
      clear();
    });
  };

  useEffect(() => {
    setMessageBody("");
  }, [selectedChat]);
  return (
    <footer className="flex flex-col rounded-lg justify-center mx-2  relative dark:text-dark-blue12 bg-gray8 dark:bg-dark-slate1 h-[3rem]  overflow-hidden">
      <form onSubmit={handleSubmit} className="flex self-stretch w-full ">
        <div className="flex items-center w-full h-full gap-3 ps-5">
          <div className="relative flex h-full">
            <IconButton
              bg={"inherit"}
              aria-label="add attachment"
              title="add attachment"
              icon={<PaperClipIcon className="w-5 h-5 -rotate-45" />}
              onClick={() => {
                clear();
                openFilePicker();
              }}
            ></IconButton>
            {attachments.length > 0 && (
              <Badge
                colorScheme="green"
                className="absolute right-0 "
                rounded={"full"}
                size="2xl"
              >
                {attachments.length}
              </Badge>
            )}
          </div>

          <input
            placeholder="Type a message"
            className="focus:outline-none caret-secondary-main bg-transparent grow mr-20
             placeholder:text-slate-800 placeholder:dark:text-indigo-50 resize-none max-h-[100px]
             dark:text-gray1
             invalid:border invalid:border-red-300"
            value={messageBody}
            spellCheck={true}
            onChange={handleChange}
            onBlur={handleChange}
            maxLength={1500}
            autoFocus
          ></input>
          {messageBody.trim() && (
            <button
              type="submit"
              disabled={sending}
              className="absolute right-0 flex items-center h-full gap-3 px-4 text-base font-medium tracking-wider bg-dark-blue4 dark:text-white"
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

import React, { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../../services/chatMessageServices";
import { useChatsContext } from "../../context/ChatsContext";
import { IChatMessage, IGroupMessage, IUserDetails } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import { sendGroupMessage } from "../../services/groupMessageServices";
import { SERVER } from "../../utils/config";
import { useSWRConfig } from "swr";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { Badge, IconButton, Textarea, useColorMode } from "@chakra-ui/react";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import toast from "react-hot-toast";
import { FileTypeValidator } from "../../utils/fileValidators";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { slate } from "@radix-ui/colors";

type InputProps = {};

export type Message = IChatMessage | IGroupMessage;

function createOptimisticMessageProps() {
  return {
    $id: new Date().toISOString(),
    $permissions: [] as string[],
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    optimistic: true,
  };
}

const MessageInput = ({}: InputProps) => {
  const inputRef = useRef<null | HTMLTextAreaElement>(null);
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;
  const [sending, setSending] = useState(false);
  const { selectedChat, recepient } = useChatsContext();
  if (!selectedChat) return null;
  const [messageBody, setMessageBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const { colorMode } = useColorMode();
  let { mutate, cache } = useSWRConfig();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedChat]);

  const chatMessagesKey = selectedChat.$id + "-messages";
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

  const isGroup = !!(
    selectedChat?.$collectionId === SERVER.COLLECTION_ID_GROUPS
  );
  const isPersonal: boolean =
    !isGroup &&
    selectedChat.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 1498) {
      toast.error("Text too long");
      return;
    }
    setMessageBody(e.target.value.slice(0, 1498));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
          attachments: filesContent,
          senderID: currentUserDetails.$id,
          body: messageBody,
          groupDoc: selectedChat.$id,
          ...createOptimisticMessageProps(),
        }
      : {
          $collectionId: SERVER.COLLECTION_ID_CHAT_MESSAGES,
          $databaseId: SERVER.DATABASE_ID,
          senderID: currentUserDetails.$id,
          recepientID: recepient?.$id,
          body: messageBody,
          read: isPersonal ? true : false,
          chatDoc: selectedChat.$id,
          attachments: filesContent,
          ...createOptimisticMessageProps(),
        };

    const roomMessages = cache.get(chatMessagesKey)?.data as (
      | IChatMessage
      | IGroupMessage
    )[];

    const newMessages = [message, ...roomMessages];

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
          senderID: message.senderID,
          attachments: attachments,
        })
      : sendChatMessage(selectedChat.$id, {
          body: messageBody,
          recepientID: (recepient as IUserDetails).$id,
          senderID: currentUserDetails.$id,
          attachments: attachments,
          read: isPersonal ? true : false,
        });

    let messages = cache.get(chatMessagesKey)?.data as (
      | IChatMessage
      | IGroupMessage
    )[];

    msgSentPromise.then((msg) => {
      mutate(
        chatMessagesKey,
        messages?.map((ucMessage) => {
          if (ucMessage.$id === message.$id) {
            return { revalidated: true, ...msg };
          }
          return ucMessage;
        }),
        { revalidate: false },
      );
    });

    msgSentPromise.catch((e) => {
      mutate(
        chatMessagesKey,
        messages?.filter((ucMessage) => ucMessage.$id !== message.$id),
        { revalidate: false },
      );

      let lastMessage = cache.get(`lastMessage ${selectedChat.$id}`)?.data as
        | IChatMessage
        | IGroupMessage;
      if (lastMessage?.$id === message.$id) {
        mutate(`lastMessage ${selectedChat.$id}`, messages.at(0), {
          revalidate: false,
        });
      }

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
    <footer className="relative flex flex-col justify-start px-2 py-1 mx-2 mb-2 overflow-hidden rounded-lg dark:text-dark-blue12 bg-gray5 dark:bg-dark-slate1">
      <form onSubmit={handleSubmit} className="flex self-stretch w-full ">
        <div className="flex items-center w-full h-full gap-2 ps-1">
          <div className="relative flex h-full">
            <IconButton
              as={motion.button}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
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

          <Textarea
            ref={inputRef}
            placeholder="Type a message"
            _placeholder={{
              color: colorMode === "dark" ? "slate.300" : "gray.700",
            }}
            value={messageBody}
            onChange={handleChange}
            onBlur={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            color={colorMode === "dark" ? slate.slate2 : "black"}
            variant={"unstyled"}
            resize={"none"}
            rows={1}
            autoFocus
          />

          <IconButton
            variant={"ghost"}
            aria-label="send"
            icon={<PaperAirplaneIcon className="w-4 h-4" />}
            type="submit"
            isDisabled={sending || !messageBody.trim()}
          />
        </div>
      </form>
    </footer>
  );
};

export default MessageInput;

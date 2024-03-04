import { Badge, IconButton, Textarea, useColorMode } from "@chakra-ui/react";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { slate } from "@radix-ui/colors";
import { Models } from "appwrite";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { useRoomContext } from "../../context/RoomContext";
import { DirectMessageDetails, GroupMessageDetails } from "../../interfaces";
import { SERVER } from "../../utils/config";
import { FileTypeValidator } from "../../utils/fileValidators";
import useSendMessage from "../../utils/hooks/Room/useSendMessage";

type InputProps = {};

export type Message = DirectMessageDetails | GroupMessageDetails;

function createOptimisticMessageProps() {
  return {
    $id: new Date().toISOString(),
    $permissions: [] as string[],
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    optimistic: true,
  };
}
export interface DirectMessageSendDto extends Models.Document {
  optimistic: boolean;
  senderID: string;
  recepientID: string;
  body: string;
  read: boolean;
  chatDoc: string;
  attachments: File[];
}

export interface GroupMessageSendDto extends Models.Document {
  attachments: File[];
  senderID: string;
  body: string;
  groupDoc: string;
}

const MessageInput = ({}: InputProps) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;
  const { selectedChat, recepient } = useChatsContext();
  if (!selectedChat) return null;
  const [messageBody, setMessageBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const { colorMode } = useColorMode();
  let { mutate, cache } = useSWRConfig();
  const { isGroup, isPersonal, roomMessagesKey } = useRoomContext();
  const inputRef = useRef<null | HTMLTextAreaElement>(null);
  const { sendMessage, sending } = useSendMessage();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedChat]);

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
    setMessageBody("");
    setAttachments([]);
    if (isGroup) {
      let message: GroupMessageSendDto = {
        $collectionId: SERVER.COLLECTION_ID_GROUP_MESSAGES,
        $databaseId: SERVER.DATABASE_ID,
        attachments: attachments,
        senderID: currentUserDetails.$id,
        body: messageBody,
        groupDoc: selectedChat.$id,
        ...createOptimisticMessageProps(),
      };
      await sendMessage(message);
    } else {
      if (!recepient) return;
      let message: DirectMessageSendDto = {
        $collectionId: SERVER.COLLECTION_ID_CHAT_MESSAGES,
        $databaseId: SERVER.DATABASE_ID,
        senderID: currentUserDetails.$id,
        recepientID: recepient.$id,
        body: messageBody,
        read: isPersonal ? true : false,
        chatDoc: selectedChat.$id,
        attachments: attachments,
        ...createOptimisticMessageProps(),
      };
      await sendMessage(message);
    }

    clear();
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

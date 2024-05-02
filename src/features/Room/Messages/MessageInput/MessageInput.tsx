import { useMessagesContext } from "@/context/MessagesContext";
import {
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
  useColorMode,
} from "@chakra-ui/react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { slate } from "@radix-ui/colors";
import { Models } from "appwrite";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../../../context/AuthContext";
import { useChatsContext } from "../../../../context/ChatsContext";
import {
  RoomActionTypes,
  useRoomContext,
} from "../../../../context/Room/RoomContext";
import {
  DirectMessageDetails,
  GroupMessageDetails,
} from "../../../../interfaces/interfaces";
import { SERVER } from "../../../../utils/config";
import AttachmentInput, { AttachmentHandle } from "./AttachmentInput";
type InputProps = {};

export type Message = DirectMessageDetails | GroupMessageDetails;

function createOptimisticMessageProps() {
  return {
    $id: crypto?.randomUUID?.() || Math.random().toString(36).substring(7),
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

  const { selectedChat, recepient } = useChatsContext();
  const { createMessage } = useMessagesContext();
  if (!selectedChat || !currentUserDetails) return null;
  const [messageBody, setMessageBody] = useState("");

  const { colorMode } = useColorMode();
  const { isGroup, isPersonal, roomState, dispatch } = useRoomContext();
  const inputRef = useRef<null | HTMLTextAreaElement>(null);

  const attachmentInputRef = useRef<AttachmentHandle>(null);

  useEffect(() => {
    if (inputRef.current) {
      dispatch({ type: RoomActionTypes.SET_INPUT_REF, payload: inputRef });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 1498) {
      toast.error("Text too long");
      return;
    }
    setMessageBody(e.target.value.slice(0, 1498));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMessageBody("");
    dispatch({ type: RoomActionTypes.EXIT_REPLYING_TO, payload: null });

    const { attachments, clear, filesContent, setAttachments } =
      attachmentInputRef.current!;

    if (isGroup) {
      let message: GroupMessageSendDto = {
        $collectionId: SERVER.COLLECTION_ID_GROUP_MESSAGES,
        $databaseId: SERVER.DATABASE_ID,
        attachments: attachments,
        senderID: currentUserDetails.$id,
        body: messageBody,
        groupDoc: selectedChat.$id,
        replying: JSON.stringify(roomState.replyingTo),
        optimisticAttachments: filesContent,
        ...createOptimisticMessageProps(),
      };
      createMessage(message);
    } else {
      if (!recepient) {
        return;
      }

      let message: DirectMessageSendDto = {
        $collectionId: SERVER.COLLECTION_ID_CHAT_MESSAGES,
        $databaseId: SERVER.DATABASE_ID,
        senderID: currentUserDetails.$id,
        recepientID: recepient.$id,
        body: messageBody,
        read: isPersonal ? true : false,
        chatDoc: selectedChat.$id,
        attachments: attachments,
        replying: JSON.stringify(roomState.replyingTo),
        optimisticAttachments: filesContent,
        ...createOptimisticMessageProps(),
      };

      createMessage(message);
    }
    setAttachments([]);
    clear();
  };

  useEffect(() => {
    setMessageBody("");
  }, [selectedChat]);

  return (
    <div className="flex flex-col">
      {roomState.replyingTo && (
        <div className="mx-4 flex items-center gap-4 border-s-4 py-2 ps-5">
          <div className="line-clamp-1 flex max-w-xs flex-col overflow-hidden ps-6">
            <span className="line-clamp-1 text-xs">
              {roomState.replyingTo.sender.name}
            </span>
            <span className="line-clamp-2">{roomState.replyingTo.body}</span>
          </div>
          <IconButton
            variant={"ghost"}
            aria-label="cancel reply"
            className="ml-auto"
            icon={<XMarkIcon className="h-4 w-4" />}
            onClick={() =>
              dispatch({
                type: RoomActionTypes.EXIT_REPLYING_TO,
                payload: null,
              })
            }
            rounded={"full"}
          />
        </div>
      )}
      <footer className="mx-4 my-2 flex flex-col justify-start overflow-hidden rounded-3xl bg-gray5 px-2 py-1 dark:bg-dark-gray3 dark:text-dark-blue12 ">
        <form onSubmit={handleSubmit} className="flex w-full self-stretch ">
          <div className="flex h-full w-full items-center gap-1 ps-1 ">
            <Popover isLazy onClose={() => inputRef.current?.focus?.()}>
              <PopoverTrigger>
                <IconButton
                  variant={"ghost"}
                  aria-label="emoji"
                  icon={<FaceSmileIcon className="h-4 w-4" />}
                  size={"sm"}
                  rounded={"full"}
                />
              </PopoverTrigger>
              <PopoverContent border={"none"} bg={"transparent"}>
                <Picker
                  data={data}
                  onEmojiSelect={(v: any) => {
                    if (messageBody.length > 1498) return;
                    setMessageBody((prev) => prev + v.native);
                  }}
                />
              </PopoverContent>
            </Popover>
            <AttachmentInput ref={attachmentInputRef} />

            <Textarea
              ref={inputRef}
              placeholder="Type a message"
              _placeholder={{
                color: colorMode === "dark" ? "slate.300" : "gray.700",
              }}
              p={2}
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
            />

            <IconButton
              variant={"ghost"}
              aria-label="send"
              icon={<PaperAirplaneIcon className="h-4 w-4 text-indigo-600" />}
              type="submit"
              isDisabled={!messageBody.trim()}
              rounded={"full"}
            />
          </div>
        </form>
      </footer>
    </div>
  );
};

export default MessageInput;

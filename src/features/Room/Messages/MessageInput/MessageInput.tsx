import { useMessagesContext } from "@/context/MessagesContext";
import { insertCharacter } from "@/lib/utils";
import {
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Spinner,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { blueDark, gray, indigo } from "@radix-ui/colors";
import { Models } from "appwrite";
import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../../../context/AuthContext";
import { useChatsContext } from "../../../../context/ChatsContext";
import {
  RoomActionTypes,
  useRoomContext,
} from "../../../../context/Room/RoomContext";
import { SERVER } from "../../../../lib/config";
import {
  DirectMessageDetails,
  GroupMessageDetails,
} from "../../../../types/interfaces";
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
  const [messageBody, setMessageBody] = useState("");

  const inputBackground = useColorModeValue("white", blueDark.blue2);
  const inputBorder = useColorModeValue(gray.gray6, blueDark.blue6);
  const inputShadow = useColorModeValue(
    "0 8px 24px rgba(15, 23, 42, 0.08)",
    "0 10px 28px rgba(0, 0, 0, 0.26)",
  );
  const inputText = useColorModeValue(gray.gray12, gray.gray1);
  const placeholderColor = useColorModeValue(gray.gray10, gray.gray8);
  const sendColor = useColorModeValue(indigo.indigo10, indigo.indigo8);
  const { isGroup, isPersonal, roomState, dispatch } = useRoomContext();
  const inputRef = useRef<null | HTMLTextAreaElement>(null);

  const attachmentInputRef = useRef<AttachmentHandle>(null);

  const Picker = lazy(() => {
    return import("@emoji-mart/react");
  });

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
    if (!selectedChat || !currentUserDetails) return;

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

  if (!selectedChat || !currentUserDetails) return null;

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
      <footer
        style={{
          backgroundColor: inputBackground,
          borderColor: inputBorder,
          boxShadow: inputShadow,
          color: inputText,
        }}
        className="mx-3 mb-[calc(0.75rem+env(safe-area-inset-bottom))] mt-2 flex flex-col items-center justify-start overflow-hidden rounded-2xl border bg-white px-2 py-1 dark:bg-dark-blue2 md:mx-4"
      >
        <form onSubmit={handleSubmit} className="flex w-full self-stretch ">
          <div className="flex min-h-11 w-full items-center gap-1 ps-1 ">
            <Popover onClose={() => inputRef.current?.focus?.()} isLazy>
              <PopoverTrigger>
                <IconButton
                  variant={"ghost"}
                  aria-label="emoji"
                  icon={<FaceSmileIcon className="h-4 w-4" />}
                  size={"sm"}
                  color={inputText}
                  className="hidden sm:inline-flex"
                />
              </PopoverTrigger>
              <Portal>
                <PopoverContent border={"none"} bg={"transparent"}>
                  <Suspense fallback={<Spinner />}>
                    <Picker
                      onEmojiSelect={(v: any) => {
                        if (messageBody.length > 1498) return;
                        const cursorPosition =
                          inputRef.current?.selectionStart || 0;

                        setMessageBody((prev) =>
                          insertCharacter(prev, v.native, cursorPosition),
                        );
                      }}
                    />
                  </Suspense>
                </PopoverContent>
              </Portal>
            </Popover>
            <AttachmentInput ref={attachmentInputRef} />

            <Textarea
              ref={inputRef}
              size={"sm"}
              placeholder="Type a message"
              _placeholder={{
                color: placeholderColor,
                opacity: 1,
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
              color={inputText}
              fontSize="16px"
              lineHeight="1.5"
              minH="36px"
              py={1.5}
              sx={{
                WebkitTextSizeAdjust: "100%",
              }}
              variant={"unstyled"}
              resize={"none"}
              rows={1}
            />

            <IconButton
              variant={"ghost"}
              aria-label="send"
              color={sendColor}
              icon={<PaperAirplaneIcon className="h-5 w-5" />}
              type="submit"
              isDisabled={!messageBody.trim()}
              size={"sm"}
              my={1}
            />
          </div>
        </form>
      </footer>
    </div>
  );
};

export default MessageInput;

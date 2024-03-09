import { forwardRef, useEffect, useState } from "react";
import { DeleteIcon, PencilIcon } from "../../../components/Icons";
import { useAuth } from "../../../context/AuthContext";
import { useChatsContext } from "../../../context/ChatsContext";
import {
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../../../interfaces";
import api from "../../../services/api";
import { SERVER } from "../../../utils/config";

import { AspectRatio, Avatar, Checkbox, Image } from "@chakra-ui/react";
import useSWR from "swr";
import { getFormattedDateTime } from "../../../services/dateServices";
import { getUserDetails } from "../../../services/userDetailsServices";

import { motion } from "framer-motion";
import { confirmAlert } from "../../../components/Alert/alertStore";
import Blueticks from "../../../components/Blueticks";
import { openModal } from "../../../components/Modal";
import { useRoomContext } from "../../../context/RoomContext";
import UserProfileModal from "../../Profile/UserProfileModal";
import EditMessageForm from "./EditMessageForm";

interface MessageProps {
  message: DirectMessageDetails | GroupMessageDetails;
  onDelete: (
    message: DirectMessageDetails | GroupMessageDetails,
  ) => Promise<void>;
  i: number;
  prev?: DirectMessageDetails | GroupMessageDetails;
  next?: DirectMessageDetails | GroupMessageDetails;
}

const Message = forwardRef<any, MessageProps>(
  ({ message, onDelete, i, prev, next }, ref) => {
    const { currentUserDetails } = useAuth();

    const { selectedChat } = useChatsContext();
    const {} = useRoomContext();
    if (!currentUserDetails || !selectedChat) return;
    const [attachments, setAttachments] = useState<URL[] | []>([]);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const {
      selectedMessages,
      setSelectedMessages,
      editing,
      setEditing,
      isSelectingMessages,
    } = useRoomContext();
    const [newMessage, setNewMessage] = useState(message.body);
    const isEditing = editing === message.$id;
    const isOptimistic = !!message?.optimistic;

    const isGroupMessage =
      message.$collectionId === SERVER.COLLECTION_ID_GROUP_MESSAGES;
    const isAdmin =
      isGroupMessage &&
      (selectedChat as GroupChatDetails).admins?.includes(
        currentUserDetails.$id,
      );
    const isMine = message.senderID === currentUserDetails.$id;
    const prevSameSender = prev?.senderID === message.senderID;
    const nextSameSender = next?.senderID === message.senderID;

    const isSelected = selectedMessages.some((msg) => msg.$id === message.$id);

    const { data: senderDetails } = useSWR(
      () => {
        if (isMine) return null;
        else return `${message.senderID}-details`;
      },
      () => getUserDetails(message.senderID),
      {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      },
    );

    const { data } = useSWR(
      `${message.$id} attachments`,
      getMessageAttachments,
      {},
    );

    useEffect(() => {
      if (data) {
        setAttachments([...data]);
      }
    }, [data]);
    function getMessageAttachments() {
      let attachments: URL[] = [];
      message.attachments.forEach(async (attachmentID: any) => {
        if (isOptimistic) {
          attachments.push(attachmentID.content);
        } else {
          try {
            let response = api.getFile(
              isGroupMessage
                ? SERVER.BUCKET_ID_GROUP_ATTACHMENTS
                : SERVER.BUCKET_ID_CHAT_ATTACHMENTS,
              attachmentID,
            );
            attachments.push(response);
          } catch (error) {}
        }
      });

      return attachments;
    }

    const setReadMessage = async () => {
      if (message.optimistic) {
        return;
      }
      try {
        await api.updateDocument(
          message.$databaseId,
          message.$collectionId,
          message.$id,
          { read: true },
        );
        await api.updateDocument(
          selectedChat.$databaseId,
          selectedChat.$collectionId,
          selectedChat.$id,
          { changeLog: "readtext" },
        );
      } catch (error) {}
    };
    useEffect(() => {
      if (!isMine && !isOptimistic && !message.read) {
        setReadMessage();
      }
    }, []);

    const handleDelete = async () => {
      await onDelete(message);
    };

    function shouldShowHoverCard() {
      if (isOptimistic) {
        return false;
      }
      if (isMine) {
        return true;
      } else if (!isGroupMessage) {
        return isMine;
      } else if (!isMine && !isAdmin) {
        return false;
      } else if (
        isAdmin &&
        !(selectedChat as GroupChatDetails).admins.includes(message.senderID)
      ) {
        return true;
      }
      return false;
    }

    return (
      <motion.article
        layout
        initial={isMine && isOptimistic ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={isOptimistic ? {} : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        style={{ originX: isMine ? 1 : 0 }}
        onMouseEnter={() => setShowHoverCard(true)}
        onMouseLeave={() => setShowHoverCard(false)}
        ref={ref}
        tabIndex={0}
      >
        <div
          className={`relative gap-2 flex cursor-pointer ${
            isMine ? "flex-row-reverse" : ""
          } items-start focus:outline-0 focus:outline-slate-600 transition-all          
            `}
        >
          <Checkbox
            isChecked={isSelected}
            hidden={!isSelectingMessages}
            className="self-center mx-2"
            onChange={(e) => {
              if (!isSelected) {
                setSelectedMessages((prev) => [...prev, message]);
              } else {
                setSelectedMessages((prev) =>
                  prev.filter((msg) => msg.$id !== message.$id),
                );
              }
            }}
          />
          <Avatar
            visibility={prevSameSender ? "hidden" : "visible"}
            src={
              isMine ? currentUserDetails?.avatarURL : senderDetails?.avatarURL
            }
            name={
              isMine ? currentUserDetails.name : (senderDetails?.name as string)
            }
            size="sm"
            onClick={() => {
              openModal(
                <UserProfileModal
                  onClose={() => {}}
                  user={senderDetails as IUserDetails}
                />,
              );
            }}
            cursor={isGroupMessage ? "pointer" : ""}
          />
          <div className="flex flex-col gap-1 mt-3">
            {attachments.length > 0 && (
              <AspectRatio maxW="250px" w={220} ratio={4 / 3}>
                <Image
                  src={attachments[0] as any}
                  objectFit="cover"
                  borderRadius={"md"}
                  sizes="150px"
                />
              </AspectRatio>
            )}
            <div
              className={`flex flex-col relative
                px-3  pt-2   ${
                  isMine
                    ? `bg-indigo-300 dark:bg-gray4/90 dark:text-black rounded-tr-none self-end`
                    : "bg-dark-gray7 dark:bg-dark-indigo4 dark:text-dark-gray12 rounded-tl-none text-gray-100 min-w-[5rem] "
                } rounded-xl 

                 w-fit max-w-[400px]   `}
            >
              {isEditing ? (
                <EditMessageForm
                  message={message}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                />
              ) : (
                <p className="text-[0.9rem] leading-relaxed tracking-wide">
                  {newMessage}
                </p>
              )}
              {isMine && <Blueticks read={message.read} />}
              <div
                className={`self-end text-[0.54rem] tracking-wider mb-1
               ${
                 isMine
                   ? "dark:text-gray-500 justify-end text mx-3"
                   : "dark:text-gray-400 "
               }`}
              >
                {" " + getFormattedDateTime(message.$createdAt)}
              </div>
            </div>
          </div>

          {shouldShowHoverCard() && !isSelected && (
            <div
              className={`flex self-end gap-2 mb-5 ${
                showHoverCard ? "" : "invisible"
              }`}
            >
              <button
                onClick={(e) => {
                  confirmAlert({
                    message: "Delete this message? This action is irreversible",
                    title: "Delete message",
                    confirmText: "Delete",
                    onConfirm: () => handleDelete(),
                  });
                  e.stopPropagation();
                }}
              >
                <DeleteIcon className="w-4 h-4" />
              </button>
              <button
                hidden={!isMine}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(editing === message.$id ? null : message.$id);
                }}
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.article>
    );
  },
);

export default Message;

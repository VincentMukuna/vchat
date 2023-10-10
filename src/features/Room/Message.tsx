import { forwardRef, useEffect, useState } from "react";
import api from "../../services/api";
import { SERVER } from "../../utils/config";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { IChatMessage, IGroupMessage } from "../../interfaces";
import { DeleteIcon, PencilIcon } from "../../components/Icons";

import useSWR, { mutate } from "swr";
import { getUserDetails } from "../../services/userDetailsServices";
import { getFormattedDateTime } from "../../services/dateServices";
import {
  AspectRatio,
  Avatar,
  Editable,
  EditableInput,
  EditablePreview,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  useEditableControls,
} from "@chakra-ui/react";

import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/20/solid";
import Blueticks from "../../components/Blueticks";
import toast from "react-hot-toast";

interface MessageProps {
  message: IChatMessage | IGroupMessage;
  onDelete: (message: IChatMessage | IGroupMessage) => Promise<void>;
  i: number;
}

const Message = forwardRef<any, MessageProps>(
  ({ message, onDelete, i }, ref) => {
    const { currentUserDetails } = useAuth();

    const { selectedChat } = useChatsContext();
    if (!currentUserDetails || !selectedChat) return;
    const [attachments, setAttachments] = useState<URL[] | []>([]);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newMessage, setNewMessage] = useState(message.body);

    const isOptimistic = message?.optimistic;

    const isGroupMessage = !!(
      message.$collectionId === SERVER.COLLECTION_ID_GROUP_MESSAGES
    );
    let mine = message.senderID === currentUserDetails.$id;

    const { data: senderDetails } = useSWR(
      () => {
        if (mine || message.senderID === currentUserDetails.$id) return null;
        else return message.senderID;
      },
      getUserDetails,
      { revalidateIfStale: false },
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
        if (attachmentID?.content) {
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
          } catch (error) {
            console.log("ATTACHMENT ERROR: ", error);
          }
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
      if (!mine && !isOptimistic && !message.read) {
        setReadMessage();
      }
    }, []);

    const handleDelete = async () => {
      await onDelete(message);
      toast.success("Message deleted");
    };

    const handleEditMessage = async () => {
      if (newMessage !== message.body) {
        console.log("Edited");
        setIsEditing(false);
        try {
          await api.updateDocument(
            message.$databaseId,
            message.$collectionId,
            message.$id,
            { body: newMessage },
          );
          toast.success("Message succesfully edited");
          mutate(selectedChat?.$id);
        } catch (error) {
          toast.error("Something went wrong!");
        }
      }
    };

    return (
      <motion.article
        layout
        initial={mine ? {} : { opacity: 0, scaleX: 0.5 }}
        animate={{ opacity: 1, scaleX: 1 }}
        style={{ originX: mine ? 1 : 0 }}
        transition={{
          opacity: { duration: 0.2 },
          layout: { type: "spring", bounce: 0.4, duration: 0.4 },
          duration: 0.4,
        }}
        exit={{ opacity: 0, scaleX: 0.8 }}
        whileInView={{ opacity: 1, x: 0 }}
        onMouseEnter={() => setShowHoverCard(true)}
        onMouseLeave={() => setShowHoverCard(false)}
        ref={ref}
        tabIndex={0}
        className={`relative   flex ${
          mine ? "flex-row-reverse" : ""
        } items-end focus:outline-1 focus:outline-slate-600 transition-all`}
      >
        <Avatar
          src={mine ? currentUserDetails?.avatarURL : senderDetails?.avatarURL}
          name={
            mine ? currentUserDetails.name : (senderDetails?.name as string)
          }
          size="sm"
        />
        <div className="flex flex-col gap-1 mt-2">
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
            onClick={() => setIsEditing(true)}
            className={`flex relative gap-3
              ps-4  py-2 pe-4  ${
                mine
                  ? "bg-slate-300 dark:bg-gray4/90 dark:text-black rounded-br-none self-end pb-3 "
                  : "bg-slate-700 dark:bg-dark-tomato6  dark:text-dark-gray12 rounded-bl-none text-gray-100 "
              } rounded-3xl w-fit max-w-[400px] break-words`}
          >
            {mine ? (
              isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditMessage();
                  }}
                >
                  <InputGroup>
                    <InputRightElement>
                      <IconButton
                        aria-label="save changes"
                        onClick={handleEditMessage}
                        bg={"inherit"}
                        icon={<CheckIcon className="w-4 h-4 text-dark-gray1" />}
                      />
                    </InputRightElement>

                    <Input
                      autoFocus
                      value={newMessage}
                      onBlur={() => {
                        setIsEditing(false);
                      }}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                      }}
                    />
                  </InputGroup>
                </form>
              ) : (
                <p className="text-[15px] font-normal leading-relaxed tracking-wide">
                  {newMessage}
                </p>
              )
            ) : (
              <p className="text-[15px] font-normal leading-relaxed tracking-wide">
                {message.body}
              </p>
            )}
            {mine && <Blueticks read={message.read} />}
          </div>
          <div
            className={`flex  mx-3 text-[9px] tracking-wider md:text-[10px] gap-1 ${
              mine
                ? "dark:text-gray-500 justify-end text"
                : "dark:text-gray-400 "
            }`}
          >
            <span className="overflow-hidden text-elipsis whitespace-nowrap  max-w-[60px]  text-ellipsis ">
              {!mine && (senderDetails?.name || "User ")}
            </span>
            {" " + getFormattedDateTime(message.$createdAt)}
          </div>
        </div>

        {mine && (
          <div
            className={`flex self-end gap-2 mb-5 ${
              showHoverCard ? "" : "invisible"
            }`}
          >
            <button onClick={handleDelete}>
              <DeleteIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing((prev) => !prev);
              }}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.article>
    );
  },
);

export default Message;

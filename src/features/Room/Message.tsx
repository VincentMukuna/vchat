import { useEffect, useState } from "react";
import api from "../../services/api";
import { Server } from "../../utils/config";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { IChatMessage, IGroupMessage } from "../../interfaces";
import { DeleteIcon, PencilIcon } from "../../components/Icons";
//@ts-ignore
import avatarFallback from "../../assets/avatarFallback.png";
import useSWR from "swr";
import {
  getCurrentUserDetails,
  getUserDetails,
} from "../../services/userServices";
import Avatar from "../../components/Avatar";
import { getFormattedDateTime } from "../../services/dateServices";

interface MessageProps {
  message: IChatMessage | IGroupMessage;
  onDelete: (message: IChatMessage | IGroupMessage) => Promise<void>;
}

function Message({ message, onDelete }: MessageProps) {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return;
  const { recepient } = useChatsContext();
  const [attachments, setAttachments] = useState<URL[] | []>([]);
  const [showHoverCard, setShowHoverCard] = useState(false);

  const isGroupMessage = !!message?.groupID;

  let mine = message.senderID === currentUserDetails.$id;

  const { data: senderDetails } = useSWR(() => {
    if (mine || message.senderID === currentUserDetails.$id) return null;
    else return message.senderID;
  });
  const getMessageAttachments = () => {
    message.attachments.forEach(async (attachmentID) => {
      try {
        let response = api.getFile(Server.bucketIDAttachments, attachmentID);
        setAttachments([...attachments, response]);
      } catch (error) {
        console.log("ATTACHMENT ERROR: ", error);
      }
    });
  };

  const setReadMessage = async () => {
    if (!message.$id) return;
    try {
      await api.updateDocument(
        Server.databaseID,
        Server.collectionIDChatMessages,
        message.$id,
        { read: true },
      );
    } catch (error) {
      console.log("Error setting message as read: ", error);
    }
  };

  const handleDelete = () => {
    onDelete(message);
  };
  useEffect(() => {
    isGroupMessage || mine || message.read || setReadMessage();
    message.attachments?.length && getMessageAttachments();
  }, []);

  return (
    <article
      onMouseEnter={() => setShowHoverCard(true)}
      onMouseLeave={() => setShowHoverCard(false)}
      tabIndex={0}
      className={`relative   flex ${
        mine ? "flex-row-reverse" : ""
      } items-end focus:outline-1 focus:outline-slate-600 transition-all`}
    >
      <Avatar
        src={mine ? currentUserDetails?.avatarURL : null}
        name={mine ? currentUserDetails.name : (senderDetails?.name as string)}
        size="small"
      />
      <div className="flex flex-col ">
        <div
          className={`flex flex-col
            px-5 py-2 m-2 ${
              mine
                ? "bg-slate-300 dark:bg-dark-mauve68 dark:text-black rounded-br-none"
                : "bg-slate-700 dark:bg-dark-slate5 dark:text-dark-gray12 rounded-bl-none text-gray-100"
            } rounded-3xl w-fit max-w-[400px] break-words`}
        >
          <p className="font-normal leading-relaxed tracking-wide">
            {message.body}
          </p>
        </div>
        <div
          className={`flex mx-3 flex-row-reverse text-[9px] tracking-wider md:text-[10px] gap-1 ${
            mine ? "text-gray-500" : "text-gray-400 "
          }`}
        >
          {"@ " + getFormattedDateTime(message.$createdAt)}
          <span className="overflow-hidden text-elipsis whitespace-nowrap  max-w-[5rem] text-ellipsis ">
            {!isGroupMessage
              ? null
              : mine
              ? "You"
              : (senderDetails?.name as string)}
          </span>
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
          <button>
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </article>
  );
}

export default Message;

import { useEffect, useRef, useState } from "react";
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

interface MessageProps {
  message: IChatMessage | IGroupMessage;
  onDelete: (message: IChatMessage | IGroupMessage) => Promise<void>;
}

function Message({ message, onDelete }: MessageProps) {
  const { currentUser, currentUserDetails } = useAuth();
  if (!currentUser) return;
  const { recepient } = useChatsContext();
  const [attachments, setAttachments] = useState<URL[] | []>([]);
  const [showHoverCard, setShowHoverCard] = useState(false);

  const isGroupMessage = !!message?.groupID;

  let mine = message.senderID === currentUser.$id;
  const avatar = isGroupMessage
    ? null
    : mine
    ? currentUserDetails?.avatarURL
    : recepient?.avatarURL;

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

  const { data: senderDetails, error } = useSWR(
    isGroupMessage && !mine && message.senderID,
    getCurrentUserDetails,
    {},
  );

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
      } items-center focus:outline-1 focus:outline-slate-600 `}
    >
      <img
        src={senderDetails?.avatarURL || avatar || avatarFallback}
        alt="profile picture"
        className="self-end w-8 h-8 mb-1 rounded-full"
      />

      <div
        className={`flex flex-col
            px-5 py-2 m-2 ${
              mine
                ? "bg-slate-300 rounded-br-none"
                : "bg-slate-700 rounded-bl-none text-gray-100"
            } rounded-3xl w-fit max-w-[400px] break-words`}
      >
        <div className="font-normal leading-relaxed tracking-wide">
          {message.body}
        </div>
        <div
          className={`flex flex-row-reverse w-full text-[10px] ${
            mine ? "text-gray-800" : "text-gray-300"
          }`}
        >
          19:00 PM
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

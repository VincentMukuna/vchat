import { modal } from "@/components/VModal";
import { useAuth } from "@/context/AuthContext";
import { SERVER } from "@/lib/config";
import api from "@/services/api";
import { ChatMessage } from "@/types/interfaces";
import { AspectRatio, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useSWR from "swr";

type MessageAttachmentProps = {
  message: ChatMessage;
};

const MessageAttachments = ({ message }: MessageAttachmentProps) => {
  const { currentUserDetails } = useAuth();
  const [attachments, setAttachments] = useState<URL[] | []>([]);
  const isMine = message.senderID === currentUserDetails?.$id;
  const isSystem = message.senderID === "system";
  const isOptimistic = !!message?.optimistic;
  const isGroupMessage =
    message.$collectionId === SERVER.COLLECTION_ID_GROUP_MESSAGES;
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
  const { data } = useSWR(
    () => {
      if (isSystem) return null;
      return `${message.$id} attachments`;
    },
    getMessageAttachments,
    {},
  );

  useEffect(() => {
    if (data) {
      setAttachments([...data]);
    }
  }, [data]);
  return (
    <div>
      {attachments.length > 0 && (
        <AspectRatio
          maxW="10rem"
          w={220}
          ratio={4 / 3}
          mx={isMine ? 4 : 0}
          mt={2}
        >
          <Image
            onClick={(e) => {
              e.stopPropagation();
              modal(
                <Image
                  src={attachments[0] as any}
                  objectFit="scale-down"
                  borderRadius={"md"}
                  sizes="150px"
                  maxH={"80vh"}
                />,
                { isCentered: true, size: "xl" },
              );
            }}
            src={attachments[0] as any}
            objectFit="cover"
            borderRadius={"md"}
            sizes="150px"
          />
        </AspectRatio>
      )}
    </div>
  );
};

export default MessageAttachments;

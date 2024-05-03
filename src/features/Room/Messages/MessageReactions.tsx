import { FluentEmojiFlatHeartSuit } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";
import { useChatsContext } from "@/context/ChatsContext";
import { useRoomContext } from "@/context/Room/RoomContext";
import { ChatMessage } from "@/interfaces/interfaces";
import {
  updateChatDetails,
  updateDirectMessage,
} from "@/services/chatMessageServices";
import {
  updateGroupDetails,
  updateGroupMessage,
} from "@/services/groupMessageServices";
import { fromJson, toJson } from "@/utils/utils";
import { Button, useColorMode } from "@chakra-ui/react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface MessageReactionsProps {
  message: ChatMessage;
  hoverCardShowing: boolean;
}

const MessageReactions = ({
  message,
  hoverCardShowing,
}: MessageReactionsProps) => {
  const { currentUserDetails } = useAuth();

  const { selectedChat } = useChatsContext();
  const { isGroup } = useRoomContext();
  const { colorMode } = useColorMode();

  const [reactions, setReactions] = useState<{ likes: string[] }>(
    message.reactions ? fromJson(message.reactions) : { likes: [] },
  );

  const isLiked = reactions.likes.includes(currentUserDetails!.$id);
  const likesCount = reactions.likes.length;
  const isMine = message.senderID === currentUserDetails!.$id;
  const handleLike = useDebouncedCallback(async () => {
    if (isMine) return;
    if (isLiked) {
      unLike();
    } else {
      like();
    }
  }, 300);
  function updateConversationChangeLog(like: boolean) {
    const changeLog = `message/${like ? "like" : "unlike"}/${message.$id}`;
    if (isGroup) {
      updateGroupDetails(selectedChat?.$id!, {
        changeLog: changeLog,
        changerID: currentUserDetails!.$id,
      });
    } else {
      updateChatDetails(selectedChat?.$id!, {
        changeLog: changeLog,
        changerID: currentUserDetails!.$id,
      });
    }
  }

  async function unLike() {
    try {
      //modify state
      setReactions((prev) => ({
        ...prev,
        likes: reactions.likes.filter((id) => id !== currentUserDetails!.$id),
      }));
      if (isGroup) {
        await updateGroupMessage(message.$id, {
          reactions: toJson({
            likes: reactions.likes.filter(
              (id) => id !== currentUserDetails!.$id,
            ),
          }),
        });
      } else {
        await updateDirectMessage(message.$id, {
          reactions: toJson({
            likes: reactions.likes.filter(
              (id) => id !== currentUserDetails!.$id,
            ),
          }),
        });
      }
      updateConversationChangeLog(false);
    } catch (error) {
      // reverse state change
      setReactions((prev) => ({
        ...prev,
        likes: [...reactions.likes, currentUserDetails!.$id],
      }));
    }
  }

  async function like() {
    try {
      //modify state
      setReactions((prev) => ({
        ...prev,
        likes: [...reactions.likes, currentUserDetails!.$id],
      }));
      if (isGroup) {
        await updateGroupMessage(message.$id, {
          reactions: toJson({
            likes: [...reactions.likes, currentUserDetails!.$id],
          }),
        });
      } else {
        await updateDirectMessage(message.$id, {
          reactions: toJson({
            likes: [...reactions.likes, currentUserDetails!.$id],
          }),
        });
      }
      updateConversationChangeLog(true);
    } catch (error) {
      //reverse state change
      setReactions((prev) => ({
        ...prev,
        likes: reactions.likes.filter((id) => id !== currentUserDetails!.$id),
      }));
    }
  }

  function shouldShowReactions() {
    if (likesCount > 0) return true;
    if (hoverCardShowing) return true;
    return false;
  }

  return (
    <Button
      visibility={shouldShowReactions() ? "visible" : "hidden"}
      onClick={(e) => {
        e.stopPropagation();
        handleLike();
      }}
      variant={"ghost"}
      aria-label={isLiked ? "Unlike" : "Like"}
      size={"xs"}
      title={isLiked ? "Unlike" : "Like"}
    >
      <FluentEmojiFlatHeartSuit />
      <span className="ms-1 text-xs">{likesCount}</span>
    </Button>
  );
};

export default MessageReactions;

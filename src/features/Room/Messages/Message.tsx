import React, {
  createContext,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../../context/AuthContext";
import { useChatsContext } from "../../../context/ChatsContext";
import {
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../../../interfaces/interfaces";
import { SERVER } from "../../../utils/config";

import { Avatar, Checkbox } from "@chakra-ui/react";
import useSWR from "swr";
import { getUserDetails } from "../../../services/userDetailsServices";

import { modal } from "../../../components/VModal";
import {
  RoomActionTypes,
  useRoomContext,
} from "../../../context/Room/RoomContext";
import UserProfileModal from "../../Profile/UserProfileModal";

import Blueticks from "@/components/Blueticks";
import { useMessagesContext } from "@/context/MessagesContext";
import useReadMessage from "@/features/Room/hooks/useReadMessage";
import { pluck } from "@/utils/utils";
import { ClockIcon } from "@heroicons/react/24/outline";
import MessageAttachments from "./MessageAttachments";
import MessageBubble from "./MessageBubble";
import MessageOptions from "./MessageOptions";
import MessageReactions from "./MessageReactions";
import MessageReply from "./MessageReply";
import SystemMessage from "./SystemMessage";

export type MessagesContextType = {
  handleDelete: (messageID: string) => Promise<void>;
  message: DirectMessageDetails | GroupMessageDetails;
  setShowHoverCard: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
};

const MessagesContext = createContext<MessagesContextType | null>(null);

interface MessageProps {
  i: number;
  message: DirectMessageDetails | GroupMessageDetails;
  messagesListRef: React.RefObject<HTMLElement>;
  prev?: DirectMessageDetails | GroupMessageDetails;
  next?: DirectMessageDetails | GroupMessageDetails;
  initialRender?: boolean;
}

const Message = forwardRef<any, MessageProps>(
  ({ message, prev, next, initialRender, messagesListRef, i }, ref) => {
    const { currentUserDetails } = useAuth();
    const { selectedChat } = useChatsContext();
    const { deleteMessage } = useMessagesContext();
    const { roomState, dispatch } = useRoomContext();
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const isOptimistic = !!message?.optimistic;
    if (!currentUserDetails || !selectedChat) return;

    const isGroupMessage =
      message.$collectionId === SERVER.COLLECTION_ID_GROUP_MESSAGES;
    const isAdmin =
      isGroupMessage &&
      (selectedChat as GroupChatDetails).admins?.includes(
        currentUserDetails.$id,
      );
    const isMine = message.senderID === currentUserDetails.$id;
    const isSystem = message.senderID === "system";
    const prevSameSender = prev?.senderID === message.senderID;
    const nextSameSender = next?.senderID === message.senderID;

    const isSelected = useMemo(
      () => roomState.selectedMessages.some((msg) => msg.$id === message.$id),
      [roomState, message],
    );

    const { data: senderDetails } = useSWR(
      () => {
        if (isMine || isSystem) return null;
        else return `${message.senderID}-details`;
      },
      () => getUserDetails(message.senderID),
      {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      },
    );

    const { messageRef } = useReadMessage(message, messagesListRef);

    const handleDelete = async () => {
      await deleteMessage(message.$id);
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

    //call read message after message is in view for 2 seconds

    const [shouldRender, setShouldRender] = useState(initialRender);
    useEffect(() => {
      !shouldRender &&
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setShouldRender(true);
          });
        });
    }, []);

    if (!shouldRender) {
      return null;
    }

    if (isSystem) {
      return <SystemMessage message={message} />;
    }

    return (
      <MessagesContext.Provider
        value={{ handleDelete, message, setShowHoverCard, setShowMenu }}
      >
        <article
          id={message.$id}
          ref={ref}
          onMouseEnter={() => setShowHoverCard(true)}
          onMouseLeave={() => {
            if (showMenu) {
              return;
            }
            setShowHoverCard(false);
          }}
          tabIndex={1}
          className="flex flex-col transition-all"
        >
          <div
            className={`relative flex gap-1   ${
              isMine ? "flex-row-reverse" : ""
            } flex-wrap items-end transition-all focus:outline-0  focus:outline-slate-600 
          
          ${prevSameSender ? "" : "mt-1.5"}

          ${nextSameSender ? "" : "mb-1.5"}

          ${
            isSelected
              ? "my-0.5 rounded-sm bg-gray-200 dark:bg-dark-gray6/80"
              : ""
          }
          
          
            `}
          >
            {roomState.isSelectingMessages && (
              <Checkbox
                isChecked={isSelected}
                hidden={!roomState.isSelectingMessages}
                className="mx-2 self-center"
                onChange={(e) => {
                  dispatch({
                    type: RoomActionTypes.TOGGLE_MESSAGE_SELECT,
                    payload: message,
                  });
                  e.stopPropagation();
                }}
              />
            )}

            {!isMine && (
              <Avatar
                visibility={prevSameSender ? "hidden" : "visible"}
                src={
                  isMine
                    ? currentUserDetails?.avatarURL
                    : senderDetails?.avatarURL
                }
                name={
                  isMine
                    ? currentUserDetails.name
                    : (senderDetails?.name as string)
                }
                size="sm"
                onClick={() => {
                  modal(
                    <UserProfileModal
                      onClose={() => {}}
                      user={senderDetails as IUserDetails}
                    />,
                  );
                }}
                cursor={isGroupMessage ? "pointer" : ""}
              />
            )}
            <div
              onClick={() => {
                if (roomState.isSelectingMessages) {
                  dispatch({
                    type: RoomActionTypes.TOGGLE_MESSAGE_SELECT,
                    payload: message,
                  });
                } else {
                  dispatch({
                    type: RoomActionTypes.SET_REPLYING_TO,
                    payload: {
                      ...message,
                      body: message.body.slice(0, 100),
                      sender: pluck(
                        isMine ? currentUserDetails : senderDetails,
                        "name,avatarURL",
                      ),
                    },
                  });
                }
              }}
              className="grid cursor-pointer gap-1"
            >
              <div>
                <MessageAttachments message={message} />
              </div>
              <MessageReply message={message} />
              <MessageBubble
                message={message}
                next={next}
                prev={prev}
                ref={messageRef}
              />
            </div>
            <div
              className={`relative  w-4  ${
                isMine && !showHoverCard ? "visible" : "invisible"
              }`}
            >
              {isOptimistic ? (
                <ClockIcon className="relative bottom-1 h-3 w-3 text-gray-500" />
              ) : (
                <Blueticks
                  read={message.read}
                  className="relative bottom-1 dark:text-blue-400"
                />
              )}
            </div>

            <div
              className={`relative z-0 -ms-2 flex gap-1 ${
                isMine ? "start-2" : "-start-2 "
              } `}
            >
              <MessageReactions
                message={message}
                hoverCardShowing={showHoverCard}
              />
            </div>

            {shouldShowHoverCard() && showHoverCard && <MessageOptions />}
          </div>
        </article>
      </MessagesContext.Provider>
    );
  },
);

export default Message;

export const useMessageContext = () => {
  const context = React.useContext(MessagesContext);
  if (!context) {
    throw new Error(
      "useMessagesContext must be used within a MessagesContextProvider",
    );
  }
  return context;
};

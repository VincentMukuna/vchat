import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { DeleteIcon, PencilIcon } from "../../../components/Icons";
import { useAuth } from "../../../context/AuthContext";
import { useChatsContext } from "../../../context/ChatsContext";
import {
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../../../interfaces/interfaces";
import api from "../../../services/api";
import { SERVER } from "../../../utils/config";

import {
  AspectRatio,
  Avatar,
  Checkbox,
  IconButton,
  Image,
} from "@chakra-ui/react";
import useSWR from "swr";
import { getUserDetails } from "../../../services/userDetailsServices";

import { confirmAlert } from "../../../components/Alert/alertStore";
import { modal } from "../../../components/VModal";
import {
  RoomActionTypes,
  useRoomContext,
} from "../../../context/Room/RoomContext";
import UserProfileModal from "../../Profile/UserProfileModal";

import Blueticks from "@/components/Blueticks";
import { useMessagesContext } from "@/context/MessagesContext";
import useReadMessage from "@/utils/hooks/Room/useReadMessage";
import { pluck } from "@/utils/utils";
import { ClockIcon } from "@heroicons/react/24/outline";
import EditMessageForm from "./EditMessageModal";
import MessageReactions from "./MessageReactions";
import SystemMessage from "./SystemMessage";

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

    const [attachments, setAttachments] = useState<URL[] | []>([]);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const isOptimistic = !!message?.optimistic;
    if (!currentUserDetails || !selectedChat) return;

    const replying = useMemo(() => {
      return JSON.parse(message.replying!);
    }, [message.replying]);

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

    const isSelected = roomState.selectedMessages.some(
      (msg) => msg.$id === message.$id,
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

    const { messageRef } = useReadMessage(message, messagesListRef);

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
      <article
        id={message.$id}
        ref={ref}
        onMouseEnter={() => setShowHoverCard(true)}
        onMouseLeave={() => setShowHoverCard(false)}
        tabIndex={1}
        className="flex flex-col transition-all"
      >
        <div
          className={`relative gap-1 flex   ${
            isMine ? "flex-row-reverse" : ""
          } items-end focus:outline-0 focus:outline-slate-600 transition-all   
          
          ${prevSameSender ? "" : "mt-1.5"}

          ${nextSameSender ? "" : "mb-1.5"}
          
          
            `}
        >
          {roomState.isSelectingMessages && (
            <Checkbox
              isChecked={isSelected}
              hidden={!roomState.isSelectingMessages}
              className="self-center mx-2"
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
            className="grid gap-1 cursor-pointer"
          >
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
            {replying && (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const replying = document.getElementById(
                    JSON.parse(message.replying!).$id,
                  );

                  replying?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest",
                  });

                  replying?.focus();
                }}
                className="sm:max-w-[22rem] max-w-[80vw] border-indigo-500 text-gray-500 mt-2 dark:text-gray-400 py-1 overflow-hidden border-s-4 ps-4"
              >
                <span className="line-clamp-2">{replying?.body}</span>
              </div>
            )}
            <div
              ref={messageRef}
              className={`flex flex-col relative min-w-[3rem] gap-1 rounded-3xl  sm:max-w-[22rem] max-w-[80vw] 
                p-3 ps-3 py-2 z-10
                ${
                  isMine
                    ? `bg-indigo-200 dark:bg-indigo-900 dark:text-white  self-end me-4`
                    : "bg-gray7 dark:bg-dark-gray6/90   text-gray-100s"
                } 

                ${
                  prevSameSender
                    ? isMine
                      ? "rounded-tr-md"
                      : "rounded-tl-md"
                    : ""
                }

                ${
                  nextSameSender
                    ? isMine
                      ? "rounded-br-md"
                      : "rounded-bl-md"
                    : ""
                }
                
                `}
            >
              <div className="text-[0.9rem] leading-relaxed tracking-wide flex ">
                <pre className="font-sans whitespace-pre-wrap">
                  {message.body}
                </pre>
              </div>
            </div>
          </div>
          <div
            className={`relative self-end w-4  ${
              isMine && !showHoverCard ? "visible" : "invisible"
            }`}
          >
            {isOptimistic ? (
              <ClockIcon className="relative w-3 h-3 text-gray-500 bottom-1" />
            ) : (
              <Blueticks
                read={message.read}
                className="relative bottom-1 dark:text-blue-400"
              />
            )}
          </div>

          <div
            className={`relative flex gap-1 z-0 -ms-2 ${
              isMine ? "start-2" : "-start-2 "
            } `}
          >
            <MessageReactions
              message={message}
              hoverCardShowing={showHoverCard}
            />
          </div>

          <div
            className={`flex self-end gap-1 ${
              showHoverCard && shouldShowHoverCard() ? "visible" : "invisible"
            }`}
          >
            <IconButton
              hidden={!shouldShowHoverCard()}
              title="Delete message"
              variant={"ghost"}
              size={"xs"}
              aria-label="Delete message"
              icon={<DeleteIcon className="w-3" />}
              onClick={(e) => {
                confirmAlert({
                  message: "Delete this message? This action is irreversible",
                  title: "Delete message",
                  confirmText: "Delete",
                  onConfirm: () => handleDelete(),
                });
                e.stopPropagation();
              }}
            />
            <IconButton
              title="Edit message"
              variant={"ghost"}
              size={"xs"}
              aria-label="Edit message"
              icon={<PencilIcon className="w-3" />}
              hidden={!isMine}
              onClick={(e) => {
                e.stopPropagation();
                modal(<EditMessageForm message={message} />);
              }}
            />
          </div>
        </div>
      </article>
    );
  },
);

export default Message;

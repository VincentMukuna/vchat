import React, { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import {
  IUserDetails,
  IChat,
  IGroup,
  IChatMessage,
  IGroupMessage,
} from "../../interfaces";
import { getFormatedDate } from "../../services/dateServices";
import { deleteContact } from "../../services/userDetailsServices";
import { useAuth } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import useSWR, { mutate } from "swr";
import { clearChatMessages } from "../../services/chatMessageServices";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { SERVER } from "../../utils/config";
import { Avatar, Card } from "@chakra-ui/react";

interface IChatProps {
  conversation: IChat | IGroup;
}

const Chat = ({ conversation }: IChatProps) => {
  const { currentUserDetails, currentUser } = useAuth();
  if (!currentUserDetails) return null;
  const { setSelectedChat, selectedChat, setRecepient } = useChatsContext();
  const [showHoverCard, setShowHoverCard] = useState(false);
  const [contactDetails, setContactDetails] = useState<
    IUserDetails | undefined
  >();

  const isGroup = !!conversation?.groupMessages;
  const isPersonal =
    !isGroup &&
    conversation.participants?.every(
      (participant: IUserDetails) => participant.$id === currentUserDetails.$id,
    );

  async function getLastMessage() {
    try {
      let doc = (await api.getDocument(
        conversation.$databaseId,
        conversation.$collectionId,
        conversation.$id,
      )) as IChat | IGroup;
      let msgDoc = isGroup ? doc.groupMessages.at(-1) : doc.chatMessages.at(-1);
      return msgDoc as IChatMessage | IGroupMessage;
    } catch (error) {}
  }

  //only fetch data only if conversation is not a group chat or a personal chat

  const { data: lastMessage } = useSWR(
    `lastMessage ${conversation.$id}`,
    getLastMessage,
  );

  useEffect(() => {
    if (isPersonal) {
      setContactDetails(currentUserDetails);
    } else if (!isGroup && !isPersonal) {
      setContactDetails(
        conversation.participants?.filter(
          (participant: IUserDetails) =>
            participant.$id != currentUserDetails.$id,
        )[0],
      );
    }
  });

  const isActive = selectedChat?.$id === conversation.$id;

  return (
    <Card
      bg={"inherit"}
      shadow={"none"}
      direction={"row"}
      onMouseOver={() => setShowHoverCard(true)}
      onMouseLeave={() => setShowHoverCard(false)}
      py={3}
      ps={3}
      rounded={"none"}
      onClick={() => {
        setRecepient(contactDetails);
        setSelectedChat(conversation);
      }}
      className={`transition-all gap-2 flex items-start cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-slate6 ${
        isActive ? "bg-dark-slate5 dark:bg-dark-slate3" : ""
      }`}
    >
      <Avatar
        name={
          isGroup
            ? conversation.name
            : isPersonal
            ? "You"
            : contactDetails?.name
        }
        src={
          isGroup
            ? conversation.avatarID &&
              api.getFile(SERVER.BUCKET_ID_GROUP_AVATARS, conversation.avatarID)
            : contactDetails?.avatarID &&
              api.getFile(
                SERVER.BUCKET_ID_USER_AVATARS,
                contactDetails?.avatarID,
              )
        }
      />
      <div className="flex flex-col ml-2 overflow-hidden shrink text-ellipsis">
        <span className="max-w-full overflow-hidden text-base font-semibold tracking-wider whitespace-nowrap text-ellipsis dark:text-gray1">
          {isGroup
            ? conversation.name
            : isPersonal
            ? "You"
            : contactDetails?.name}
        </span>
        <span className="overflow-hidden font-sans text-sm italic tracking-wide whitespace-nowrap text-ellipsis dark:text-gray6">
          {lastMessage?.body
            ? lastMessage.senderID === currentUserDetails.$id
              ? "Me: " + lastMessage.body
              : lastMessage.body
            : "Click to start messaging "}
        </span>
      </div>
      <div className="flex flex-col gap-4 mx-3 mt-1 ml-auto mr-3 text-gray8 ">
        <span className="relative flex text-[10px] tracking-wide ">
          {getFormatedDate(conversation.$updatedAt)}
        </span>
        <div className="absolute bottom-0 right-2">
          {!isGroup && showHoverCard && (
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHoverCard(true);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.4}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="z-30 flex flex-col overflow-hidden bg-gray-500 rounded">
                  <DropdownMenu.Item className="px-3 py-2 hover:bg-gray-600 hover:text-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        let promise = clearChatMessages(conversation.$id);
                        toast.promise(promise, {
                          loading: "Clearing chat messages...",
                          success: "Cleared",
                          error: (error) =>
                            "Whoops! Cannot clear this chat's messages at the moment. Try again later " +
                            error,
                        });
                        promise.then(() => {
                          mutate(selectedChat?.$id);
                        });
                      }}
                      className="w-full"
                    >
                      Clear messages
                    </button>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 hover:bg-gray-600 hover:text-gray-200">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();

                        if (contactDetails) {
                          let promise = deleteContact(conversation.$id);
                          // promise.then(() => mutate(currentUserDetails.$id));

                          toast.promise(promise, {
                            loading: "deleting contact...",
                            success: "deleted",
                            error: "cannot delete contact",
                          });
                        }
                      }}
                      className="w-full"
                    >
                      Delete contact
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Chat;

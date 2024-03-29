import { useMessagesContext } from "@/context/MessagesContext";
import { Avatar, AvatarGroup, IconButton, VStack } from "@chakra-ui/react";
import { PencilIcon, UserIcon, UsersIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import useSWR from "swr";
import { modal } from "../../../components/VModal";
import { useAuth } from "../../../context/AuthContext";
import { useChatsContext } from "../../../context/ChatsContext";
import { GroupChatDetails, IUserDetails } from "../../../interfaces/interfaces";
import api from "../../../services/api";
import { getFormatedDate } from "../../../services/dateServices";
import { getGroupDetails } from "../../../services/groupMessageServices";
import { SERVER } from "../../../utils/config";
import { EditGroupDetailsForm } from "./EditGroupDetailsForm";

const RoomDetails = () => {
  const { selectedChat, recepient } = useChatsContext();
  const { currentUserDetails } = useAuth();
  const { messages } = useMessagesContext();

  if (!currentUserDetails) return null;
  if (selectedChat === undefined) return null;
  const isGroup = !!(
    selectedChat?.$collectionId === SERVER.COLLECTION_ID_GROUPS
  );
  const isAdmin =
    isGroup &&
    (selectedChat as GroupChatDetails).admins.includes(currentUserDetails.$id);

  const { data: roomDetails } = useSWR(
    () => {
      if (!isGroup) return undefined;
      return `details ${selectedChat.$id}`;
    },
    () => getGroupDetails(selectedChat.$id),
  );
  const isGroupMember = roomDetails?.members.some(
    (member) => (member as IUserDetails).$id === currentUserDetails.$id,
  );

  return (
    <div className="relative flex flex-col items-center w-full h-full gap-4 overflow-hidden overflow-y-auto ">
      <div className="flex flex-col items-center w-full gap-8 mt-4 text-sm">
        <VStack gap={-1}>
          <div className="flex flex-col items-center gap-2">
            <div className="relative ">
              <Avatar
                size={"2xl"}
                src={!isGroup ? recepient?.avatarURL : selectedChat.avatarURL}
                icon={
                  isGroup ? (
                    <UsersIcon className="w-16 h-16" />
                  ) : (
                    <UserIcon className="w-16 h-16" />
                  )
                }
              />
            </div>
            <div className="relative flex flex-col items-center gap-2 mb-6">
              <div className="mt-3 text-lg font-semibold">
                {isGroup ? selectedChat.name : recepient?.name}
              </div>
              <div className=" text-dark-gray5 dark:text-gray6">
                {isGroup
                  ? selectedChat.description
                  : recepient?.about || "about"}
              </div>
              {isGroup && isGroupMember && isAdmin && (
                <IconButton
                  as={motion.button}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="edit details"
                  variant={"outline"}
                  onClick={() =>
                    modal(
                      <EditGroupDetailsForm
                        group={selectedChat as GroupChatDetails}
                      />,
                    )
                  }
                  icon={
                    <PencilIcon className="w-5 h-5 text-gray11 dark:text-gray7" />
                  }
                  pos={"absolute"}
                  bg={"transparent"}
                  className="z-20 -right-8"
                  border={"none"}
                />
              )}
            </div>
          </div>

          <p className="inline-flex gap-2 mt-3">
            <span className="font-semibold ">Message Count :</span>
            {messages.length}
          </p>

          <p className="mt-3">
            <span className="font-semibold ">Created :</span>
            {" " + getFormatedDate(selectedChat.$createdAt)}
          </p>
        </VStack>
        <div className="flex flex-col items-center w-full ">
          <span className="inline-flex gap-2">
            Participants :
            <span className="">{` ${
              isGroup
                ? roomDetails?.members.length || 0
                : selectedChat?.participants.length || 0
            }`}</span>
          </span>
          <div className="flex w-full max-w-[80%] overflow-x-hidden  items-center justify-center">
            <AvatarGroup size={"sm"} max={2}>
              {isGroup
                ? roomDetails?.members?.map((member: any) => {
                    return (
                      <Avatar
                        src={member.avatarURL || undefined}
                        name={member.name}
                        key={member.$id}
                        size={"sm"}
                      />
                    );
                  })
                : selectedChat.participants?.map(
                    (participant: IUserDetails) => (
                      <Avatar
                        src={participant.avatarURL}
                        name={participant.name}
                        key={participant.$id}
                        size={"sm"}
                      />
                    ),
                  )}
            </AvatarGroup>
          </div>
        </div>
        <div>
          {isGroup && (
            <>
              Admins
              <div className="flex">
                <AvatarGroup size={"sm"} max={5}>
                  {roomDetails?.members
                    ?.filter((member: any) =>
                      roomDetails.admins.includes(member.$id),
                    )
                    .map((member: any) => {
                      return (
                        <Avatar
                          src={
                            (member.avatarID &&
                              api
                                .getFile(
                                  SERVER.BUCKET_ID_USER_AVATARS,
                                  member?.avatarID,
                                )
                                .toString()) ||
                            undefined
                          }
                          name={member.name}
                          key={member.$id}
                          size={"sm"}
                        />
                      );
                    })}
                </AvatarGroup>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;

export const RoomDetailsHeader = () => {
  const { recepient, selectedChat } = useChatsContext();
  const isGroup = !!(
    selectedChat?.$collectionId === SERVER.COLLECTION_ID_GROUPS
  );
  return (
    <div className="text-lg font-bold">
      {isGroup
        ? selectedChat.name + " details"
        : `Chat with ${recepient?.name.split(" ")[0]}`}
    </div>
  );
};

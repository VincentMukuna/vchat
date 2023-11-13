import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useChatsContext } from "../../../context/ChatsContext";
import { IChat, IGroup, IUserDetails } from "../../../interfaces";
import {
  deleteGroup,
  getGroupDetails,
  leaveGroup,
  updateGroupAvatar,
  updateGroupDetails,
} from "../../../services/groupMessageServices";
import useSWR, { mutate, useSWRConfig } from "swr";
import { getChatDoc } from "../../../services/chatMessageServices";
import api from "../../../services/api";
import { SERVER } from "../../../utils/config";
import {
  Avatar,
  AvatarGroup,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  IconButton,
  Modal,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowRightOnRectangleIcon,
  PencilIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { getFormatedDate } from "../../../services/dateServices";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { deleteContact } from "../../../services/userDetailsServices";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import { useState } from "react";
import { confirmAlert } from "../../../components/Alert/alertStore";
import { openModal } from "../../../components/Modal";
import { EditGroupDetailsForm } from "./EditGroupDetailsForm";

const RoomDetails = () => {
  const { selectedChat, recepient, setSelectedChat, msgsCount } =
    useChatsContext();
  const { currentUserDetails } = useAuth();

  if (!currentUserDetails) return null;
  if (selectedChat === undefined) return null;
  const isGroup = !!(selectedChat?.$collectionId === "groups");
  const isAdmin =
    isGroup && (selectedChat as IGroup).admins.includes(currentUserDetails.$id);

  async function getRoomDetails() {
    if (isGroup) {
      let doc = await getGroupDetails(selectedChat.$id);
      return doc;
    } else if (selectedChat) {
      return await getChatDoc(selectedChat.$id);
    }
  }

  const { data: roomDetails } = useSWR(
    `details ${selectedChat.$id}`,
    getRoomDetails,
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
              <div className="mt-3 text-lg font-bold">
                {isGroup ? selectedChat.name : recepient?.name}
              </div>
              <div className=" text-dark-gray5 dark:text-gray6">
                {isGroup
                  ? selectedChat.description
                  : recepient?.about || "about"}
              </div>
              {isGroup && (
                <IconButton
                  aria-label="edit details"
                  variant={"outline"}
                  onClick={() =>
                    openModal(
                      <EditGroupDetailsForm group={selectedChat as IGroup} />,
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
            {msgsCount}
          </p>

          <p className="mt-3">
            <span className="font-semibold ">Created on :</span>
            {" " + getFormatedDate(selectedChat.$createdAt)}
          </p>
        </VStack>
        <div className="flex flex-col items-center w-full ">
          <span className="inline-flex gap-2">
            Participants :
            <span className="">{` ${
              isGroup
                ? roomDetails?.members.length || 0
                : roomDetails?.participants.length || 0
            }`}</span>
          </span>
          <div className="flex w-full max-w-[80%] overflow-x-hidden  items-center justify-center">
            <AvatarGroup size={"sm"} max={2}>
              {isGroup
                ? roomDetails?.members?.map((member: IUserDetails) => {
                    return (
                      <Avatar
                        src={member.avatarURL || undefined}
                        name={member.name}
                        key={member.$id}
                        size={"sm"}
                      />
                    );
                  })
                : roomDetails?.participants?.map(
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
                    ?.filter((member: IUserDetails) =>
                      roomDetails.admins.includes(member.$id),
                    )
                    .map((member: IUserDetails) => {
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
  const isGroup = !!(selectedChat?.$collectionId === "groups");
  return (
    <div className="text-lg font-bold">
      {isGroup
        ? selectedChat.name + " details"
        : `Chat with ${recepient?.name.split(" ")[0]}`}
    </div>
  );
};

export const RoomDetailsFooter = () => {
  const { cache } = useSWRConfig();
  const { recepient, setSelectedChat, selectedChat } = useChatsContext();

  if (selectedChat === undefined) return null;
  const { currentUserDetails } = useAuth();
  const isGroup = !!(selectedChat?.$collectionId === "groups");
  const isPersonal =
    !isGroup &&
    selectedChat.participants.every(
      (participant: IUserDetails) =>
        participant.$id === currentUserDetails?.$id,
    );
  const isAdmin =
    isGroup &&
    (selectedChat as IGroup).admins.includes(currentUserDetails!.$id);
  function getConversations() {
    if (cache.get("conversations")?.data) {
      return cache.get("conversations")?.data as (IChat | IGroup)[];
    } else return [];
  }

  function removeConversation() {
    let chatID = selectedChat!.$id;
    mutate(
      "conversations",
      getConversations().filter((conversation) => conversation.$id !== chatID),
      {
        revalidate: false,
      },
    );
    setSelectedChat(undefined);
  }
  function handleDeleteChat() {
    let promise: Promise<void>;
    removeConversation();
    if (isGroup) {
      promise = deleteGroup(selectedChat.$id);
    } else {
      promise = deleteContact(
        (selectedChat as IChat).$id,
        (recepient as any).$id,
      );
    }
    promise.catch(() => {
      toast.error("Something went wrong");
    });
  }
  async function handleExitGroup() {
    let chatID = selectedChat!.$id;
    removeConversation();
    let promise = leaveGroup(currentUserDetails!.$id, chatID);

    promise.catch(() => {
      toast.error("Something went wrong! ");
    });
  }
  return (
    <HStack>
      <Button
        hidden={!isGroup}
        size={"sm"}
        variant={"outline"}
        leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
        onClick={() => {
          confirmAlert({
            message: `Are you sure you want to leave this conversation?`,
            title: `Exit Discussion `,
            confirmText: `Yes, I'm sure`,
            onConfirm: () => handleExitGroup(),
          });
        }}
      >
        Leave
      </Button>
      <Button
        hidden={isGroup ? !isAdmin : false}
        size={"sm"}
        variant={"outline"}
        colorScheme="red"
        leftIcon={<TrashIcon className="w-5 h-5" />}
        onClick={() => {
          confirmAlert({
            message: `Are you sure you want to delete this ${
              isGroup ? "group" : "chat"
            } ? All records of this conversation will be removed from our servers `,
            title: `Delete conversation `,
            confirmText: `Yes, I'm sure`,
            onConfirm: () => {
              handleDeleteChat();
            },
            cancelText: `No, keep conversation`,
          });
        }}
      >
        Delete
      </Button>
    </HStack>
  );
};
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useChatsContext } from "../../context/ChatsContext";
import { IChat, IGroup, IUserDetails } from "../../interfaces";
import {
  deleteGroup,
  getGroupDetails,
  getGroupMessageCount,
  leaveGroup,
  updateGroupAvatar,
  updateGroupDetails,
} from "../../services/groupMessageServices";
import useSWR, { mutate, useSWRConfig } from "swr";
import {
  getChatDoc,
  getChatMessageCount,
} from "../../services/chatMessageServices";
import api from "../../services/api";
import { SERVER } from "../../utils/config";
import {
  Avatar,
  AvatarGroup,
  Button,
  Center,
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowRightOnRectangleIcon,
  PencilIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import {
  getFormatedDate,
  getFormattedDateTime,
} from "../../services/dateServices";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { deleteContact } from "../../services/userDetailsServices";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import { useEffect, useState } from "react";
import { confirmAlert } from "../../components/Alert/alertStore";

const RoomDetails = () => {
  const { selectedChat, recepient, setSelectedChat } = useChatsContext();
  const { currentUserDetails } = useAuth();
  const { cache } = useSWRConfig();
  if (!currentUserDetails) return null;
  if (selectedChat === undefined) return null;

  const [msgCount, setMsgCount] = useState(0);

  const [groupDetails, setGroupDetails] = useState({
    name: selectedChat?.name,
    description: selectedChat?.description,
  });
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

  const { openFilePicker, filesContent } = useFilePicker({
    accept: [".jpg", ".png"],
    multiple: false,
    readAs: "DataURL",
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 }),
    ],
    onFilesSuccessfullySelected(data) {
      let promise = updateGroupAvatar(
        selectedChat.$id,
        data.plainFiles[0] as File,
      );
      promise.catch((error) => {
        toast.error(error.message);
      });

      promise.then(() => {
        mutate(selectedChat.$id);
        toast.success("Avatar changed");
      });
    },

    onFilesRejected: () => {
      toast.error("Invalid file");
    },
  });

  useEffect(() => {
    if (isGroup) {
      getGroupMessageCount(selectedChat.$id).then((count) => {
        setMsgCount(count);
      });
    } else {
      getChatMessageCount(selectedChat.$id).then((count) => {
        setMsgCount(count);
      });
    }
  }, [selectedChat]);

  function getConversations() {
    if (cache.get("conversations")?.data) {
      return cache.get("conversations")?.data as (IChat | IGroup)[];
    } else return [];
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

  async function handleExitGroup() {
    let chatID = selectedChat!.$id;
    removeConversation();
    let promise = leaveGroup(currentUserDetails!.$id, chatID);

    promise.catch(() => {
      toast.error("Something went wrong! ");
    });
  }
  return (
    <div className="relative flex flex-col items-center w-full h-full gap-4 overflow-hidden overflow-y-auto bg-gray2 dark:bg-dark-slate2 dark:text-white">
      <div className="flex items-center w-full gap-3 p-4 ">
        <div className="absolute top-0 left-0 p-2">
          <IconButton
            aria-label="close side panel"
            icon={<ArrowLeftIcon className="w-5 h-5" />}
            title="Close details panel"
            bg={"inherit"}
          ></IconButton>
        </div>

        <span className="inline-flex justify-center w-full ">Chat Details</span>
      </div>
      <div className="flex flex-col items-center w-full gap-8 text-sm">
        <VStack gap={-1}>
          <div className="relative ">
            {isGroup && (
              <IconButton
                title="Edit avatar"
                onClick={openFilePicker}
                aria-label="edit avatar"
                icon={
                  <PencilIcon className="w-5 h-5 text-gray11 dark:text-gray7" />
                }
                pos={"absolute"}
                bg={"transparent"}
                className="z-20 -right-10"
              />
            )}
            <Avatar
              size={"2xl"}
              name={isGroup ? selectedChat.name : recepient?.name}
              src={
                !isGroup
                  ? recepient?.avatarURL
                  : filesContent[0]?.content || selectedChat.avatarURL
              }
            />
          </div>
          <Editable
            isDisabled={!(isGroup && isAdmin)}
            title={isGroup && isAdmin ? "click to edit group name" : ""}
            textAlign="center"
            value={isGroup ? groupDetails.name : recepient?.name}
            onChange={(val) => {
              setGroupDetails({ ...groupDetails, name: val });
            }}
            onSubmit={async (val) => {
              if (selectedChat.name !== groupDetails.name) {
                try {
                  await updateGroupDetails(selectedChat.$id, groupDetails);
                  toast.success("Group name changed successfully!");
                  mutate(selectedChat.$id);
                } catch (error) {
                  toast.error("Something went wrong");
                }
              }
            }}
            className="mt-3 text-lg font-bold"
          >
            <EditablePreview />
            <EditableInput />
          </Editable>

          <Editable
            isDisabled={!(isGroup && isAdmin)}
            title={isGroup && isAdmin ? "click to edit group description" : ""}
            value={
              isGroup ? groupDetails.description : recepient?.about || "about"
            }
            onChange={(val) => {
              setGroupDetails({ ...groupDetails, description: val });
            }}
            onSubmit={async (val) => {
              if (selectedChat.description !== groupDetails.description) {
                try {
                  await updateGroupDetails(selectedChat.$id, groupDetails);
                  toast.success("Group description changed successfully!");
                  mutate(selectedChat.$id);
                } catch (error) {
                  toast.error("Something went wrong");
                }

                return;
              }
            }}
            className=" text-dark-gray5 dark:text-gray6"
          >
            <EditablePreview />
            <EditableInput />
          </Editable>
          <p className="inline-flex gap-2 mt-3">
            <span className="font-semibold ">Message Count :</span>
            {msgCount}
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
                ? roomDetails?.members.length
                : roomDetails?.participants.length
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
        <HStack></HStack>

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
      </div>
    </div>
  );
};

export default RoomDetails;

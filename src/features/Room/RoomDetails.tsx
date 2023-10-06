import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useChatsContext } from "../../context/ChatsContext";
import { IGroup, IUserDetails } from "../../interfaces";
import {
  deleteGroup,
  getGroupDetails,
  updateGroupAvatar,
  updateGroupDetails,
} from "../../services/groupMessageServices";
import useSWR, { mutate } from "swr";
import { getChatDoc } from "../../services/chatMessageServices";
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
import { useState } from "react";

const RoomDetails = () => {
  const { selectedChat, recepient, setSelectedChat } = useChatsContext();
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  if (selectedChat === undefined) return null;

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
      });
    },

    onFilesRejected: () => {
      toast.error("Invalid file");
    },
  });

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden bg-gray2 dark:bg-dark-slate2 dark:text-white">
      <div className="absolute top-0 left-0 flex items-center w-full gap-3 p-2 ">
        <IconButton
          aria-label="close side panel"
          icon={<ArrowLeftIcon className="w-5 h-5" />}
          title="Close details panel"
          bg={"inherit"}
          rounded={"full"}
        ></IconButton>
        Chat Details
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
                  })
                : roomDetails?.participants?.map(
                    (participant: IUserDetails) => (
                      <Avatar
                        name={participant.name}
                        key={participant.$id}
                        size={"sm"}
                      />
                    ),
                  )}
            </AvatarGroup>
          </div>
        </div>
        <Center flexDir={"column"}>
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
        </Center>
        <HStack>
          <Button
            size={"sm"}
            variant={"outline"}
            leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
            onClick={() => {}}
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
              if (isGroup) {
                let promise = deleteGroup(selectedChat.$id);
                toast.promise(promise, {
                  loading: "Deleting",
                  error: "Something went wrong, try again later",
                  success: "Group deleted",
                });
                promise.then(() => {
                  setSelectedChat(undefined);
                  mutate(currentUserDetails?.$id);
                });
              } else {
                let promise = deleteContact(selectedChat.$id);
                toast.promise(promise, {
                  loading: "Deleting",
                  error: "Something went wrong, try again later",
                  success: "Chat deleted",
                });
                promise.then(() => {
                  setSelectedChat(undefined);
                  mutate(currentUserDetails?.$id);
                });
              }
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

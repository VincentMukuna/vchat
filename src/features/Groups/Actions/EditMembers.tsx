import { sendSystemMessage } from "@/services/systemMessageService";
import { SERVER } from "@/utils/config";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import {
  Avatar,
  Button,
  Checkbox,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Stack,
  useCheckboxGroup,
  useColorMode,
  useModalContext,
} from "@chakra-ui/react";
import { UserIcon } from "@heroicons/react/20/solid";
import { blueDark, gray } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useEffect } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { confirmAlert } from "../../../components/Alert/alertStore";
import VSkeleton from "../../../components/VSkeleton";
import { useAuth } from "../../../context/AuthContext";
import { GroupChatDetails } from "../../../interfaces";
import {
  editMembers,
  getGroupDetails,
} from "../../../services/groupMessageServices";

const EditMembers = ({ group }: { group: GroupChatDetails }) => {
  const { data: roomDetails, isLoading } = useSWR(`details ${group.$id}`, () =>
    getGroupDetails(group.$id),
  );
  const { colorMode } = useColorMode();
  const { onClose } = useModalContext();
  const { currentUserDetails } = useAuth();

  const { value, getCheckboxProps, setValue } = useCheckboxGroup();
  let canSave = roomDetails?.members.every((member: any) =>
    value.includes(member.$id),
  );

  const { update: updateRoomDetails } = useSWROptimistic(
    `details ${group.$id}`,
  );

  const handleEditMembers = () => {
    confirmAlert({
      confirmText: "Yes remove members",
      message: "Are you sure you want to remove members",

      onConfirm: () => {
        onClose();
        editMembers(group.$id, value as string[])
          .then((newDoc) => {
            updateRoomDetails(newDoc);
          })
          .catch(() => {
            toast.error("Something went wrong");
          });
      },
      title: "Remove members",
      onCancel: () => {},
    });

    sendSystemMessage(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_GROUP_MESSAGES, {
      groupDoc: group.$id,
      body: `${currentUserDetails!.name} removed members from the group`,
    });
  };

  useEffect(() => {
    if (roomDetails && roomDetails.members.length > 0) {
      setValue(roomDetails.members.map((member: any) => member.$id));
    }
  }, [roomDetails]);

  return (
    <>
      <ModalHeader>Remove Members</ModalHeader>
      <ModalCloseButton />

      <ModalBody className="flex flex-col gap-2">
        <p className="text-sm italic text-dark-gray9">
          Uncheck member to remove
        </p>
        <Stack maxH={200} overflowY={"auto"} gap={3}>
          {isLoading ? (
            <VSkeleton />
          ) : (
            roomDetails?.members
              .filter((member: any) => member.$id !== currentUserDetails?.$id)
              .map((member: any) => {
                return (
                  <Checkbox
                    key={member.$id}
                    iconColor={blueDark.blue1}
                    {...getCheckboxProps({ value: member.$id })}
                  >
                    <div className="flex items-center gap-2 text-[12]">
                      <Avatar
                        src={member.avatarURL}
                        size={"sm"}
                        icon={<UserIcon className="w-5 h-5" />}
                      />
                      {member.name}
                    </div>
                  </Checkbox>
                );
              })
          )}
        </Stack>
        <ModalFooter className="gap-2">
          <Button
            as={motion.button}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            variant={"ghost"}
            width={"40"}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            as={motion.button}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            width={"40"}
            rounded={"md"}
            onClick={handleEditMembers}
            bg={blueDark.blue5}
            color={colorMode === "dark" ? gray.gray2 : gray.gray1}
            _hover={
              colorMode === "light"
                ? { bg: blueDark.blue7, color: gray.gray1 }
                : {}
            }
            isDisabled={canSave}
            title="save changes"
          >
            Save
          </Button>
        </ModalFooter>
      </ModalBody>
    </>
  );
};
export default EditMembers;

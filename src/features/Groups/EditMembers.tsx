import {
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Stack,
  useCheckboxGroup,
  useColorMode,
  useModalContext,
} from "@chakra-ui/react";
import { IGroup, IUserDetails } from "../../interfaces";
import useSWR, { mutate } from "swr";
import {
  editMembers,
  getGroupDetails,
} from "../../services/groupMessageServices";
import { useEffect, useState } from "react";
import { blueDark, gray } from "@radix-ui/colors";
import toast from "react-hot-toast";
import { confirmAlert } from "../../components/Alert/alertStore";
import { useAuth } from "../../context/AuthContext";

const EditMembers = ({ group }: { group: IGroup }) => {
  const { data: roomDetails } = useSWR(`details ${group.$id}`, () =>
    getGroupDetails(group.$id),
  );
  const { colorMode } = useColorMode();
  const { onClose } = useModalContext();
  const { currentUserDetails } = useAuth();

  const { value, getCheckboxProps, setValue } = useCheckboxGroup();
  let canSave = roomDetails?.members.every((member: any) =>
    value.includes(member.$id),
  );

  const handleEditMembers = () => {
    confirmAlert({
      confirmText: "Yes remove members",
      message: "Are you sure you want to remove members",
      onConfirm: () => {
        toast.promise(editMembers(group.$id, value as string[]), {
          loading: "Saving changes",
          success: "Members changed",
          error: "Something went wrong",
        });
        mutate(group.$id);
        onClose();
      },
      title: "Remove members",
      onCancel: () => {},
    });
  };

  useEffect(() => {
    if (roomDetails && roomDetails.members.length > 0) {
      setValue(roomDetails.members.map((member: any) => member.$id));
    }
  }, [roomDetails]);

  return (
    <>
      <ModalHeader>Edit Members</ModalHeader>
      <ModalCloseButton />

      <ModalBody className="flex flex-col gap-2">
        <p className="text-sm italic text-dark-gray9">
          Uncheck member to remove
        </p>
        {/* <CheckboxGroup defaultValue={memberIDs}> */}
        <Stack maxH={200} overflowY={"auto"} gap={3}>
          {roomDetails?.members
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
                      name={member.name}
                      src={member.avatarURL}
                      size={"sm"}
                    />
                    {member.name}
                  </div>
                </Checkbox>
              );
            })}
        </Stack>
        {/* </CheckboxGroup> */}
        <ModalFooter className="gap-2">
          <Button variant={"ghost"} width={"40"} onClick={onClose}>
            Cancel
          </Button>
          <Button
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

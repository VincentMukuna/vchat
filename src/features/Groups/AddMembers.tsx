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
import { IGroup } from "../../interfaces";
import useSWR, { mutate } from "swr";
import {
  editMembers,
  getGroupDetails,
} from "../../services/groupMessageServices";
import { blueDark, gray } from "@radix-ui/colors";
import { getUsers } from "../../services/userDetailsServices";
import { useEffect } from "react";
import toast from "react-hot-toast";

const AddMembers = ({ group }: { group: IGroup }) => {
  const { data: roomDetails } = useSWR(`details ${group.$id}`, () =>
    getGroupDetails(group.$id),
  );
  const { data: users } = useSWR("users", getUsers);
  const { value, getCheckboxProps, setValue } = useCheckboxGroup();
  const { colorMode } = useColorMode();

  const { onClose } = useModalContext();

  let memberIDs = roomDetails?.members.map(
    (member: any) => member.$id,
  ) as string[];

  const handleAddMembers = () => {
    toast.promise(
      editMembers(group.$id, (value as string[]).concat(memberIDs)),
      {
        loading: "Saving changes",
        success: "Members changed",
        error: "Something went wrong",
      },
    );
    mutate(group.$id);
    onClose();
  };

  return (
    <>
      <ModalHeader>Add members</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <p className="mb-2 text-sm italic text-dark-gray9">
          Check member to add to {group.name}
        </p>
        <Stack maxH={200} overflowY={"auto"} gap={2}>
          {users
            ?.filter((user) => !memberIDs?.includes(user.$id))
            .map((user) => {
              return (
                <Checkbox
                  key={user.$id}
                  iconColor={blueDark.blue1}
                  {...getCheckboxProps({ value: user.$id })}
                >
                  <div className="flex items-center gap-2 text-[12]">
                    <Avatar name={user.name} src={user.avatarURL} size={"sm"} />
                    {user.name}
                  </div>
                </Checkbox>
              );
            })}
        </Stack>
      </ModalBody>
      <ModalFooter className="gap-2">
        <Button variant={"ghost"} width={"40"} onClick={onClose}>
          Cancel
        </Button>
        <Button
          width={"40"}
          rounded={"md"}
          onClick={handleAddMembers}
          color={colorMode === "dark" ? gray.gray2 : gray.gray1}
          title="save changes"
          isDisabled={value.length < 1}
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
};

export default AddMembers;

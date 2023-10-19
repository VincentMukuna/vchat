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
import useSWR from "swr";
import { getGroupDetails } from "../../services/groupMessageServices";
import { blueDark, gray } from "@radix-ui/colors";
import { getUsers } from "../../services/userDetailsServices";

const AddMembers = ({ group }: { group: IGroup }) => {
  const { data: roomDetails } = useSWR(`details ${group.$id}`, () =>
    getGroupDetails(group.$id),
  );
  const { data: users } = useSWR("users", getUsers);
  const { value, getCheckboxProps, setValue } = useCheckboxGroup();
  const { colorMode } = useColorMode();

  const { onClose } = useModalContext();

  const handleAddMembers = () => {};
  return (
    <>
      <ModalHeader>Add members</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <p className="text-sm italic text-dark-gray9">
          Check member to add to {group.name}
        </p>
        <Stack>
          {users?.map((user) => {
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
          bg={blueDark.blue5}
          color={colorMode === "dark" ? gray.gray2 : gray.gray1}
          _hover={
            colorMode === "light"
              ? { bg: blueDark.blue7, color: gray.gray1 }
              : {}
          }
          title="save changes"
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
};

export default AddMembers;

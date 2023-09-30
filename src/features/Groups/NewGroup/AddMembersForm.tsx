import React, { useState } from "react";
import { IUserDetails } from "../../../interfaces";
import useSWR from "swr";
import { getUsers } from "../../../services/userDetailsServices";
import { useAuth } from "../../../context/AuthContext";
import {
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Divider,
  Flex,
  Stack,
  VStack,
  useColorMode,
} from "@chakra-ui/react";

import { motion } from "framer-motion";
import { useStepper } from "./FormStepper";
import { blueDark, gray, slate } from "@radix-ui/colors";

interface AddMembersProps {
  members: IUserDetails[];
  handleSubmit: () => void;
  setGroupDetails: (
    value: React.SetStateAction<{
      name: string;
      description: string;
      members: IUserDetails[];
      avatar: File | null;
    }>,
  ) => void;
}

const AddMembersForm = ({
  members: init,
  setGroupDetails,
  handleSubmit,
}: AddMembersProps) => {
  const { currentUserDetails } = useAuth();
  const { prev, next } = useStepper();
  if (!currentUserDetails) return null;
  const { data: users } = useSWR("users", getUsers);
  const { colorMode } = useColorMode();

  let [members, setMembers] = useState<IUserDetails[]>(init);

  function onSubmit(e: any) {
    e?.preventDefault();
    setGroupDetails((prev) => ({ ...prev, members: members }));
    handleSubmit();
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-8 pt-4 "
    >
      <div>
        <span className="font-bold dark:text-dark-slate11 text-dark-gray7">
          Add Members
        </span>
        <AvatarGroup max={4}>
          {members.map((member) => {
            return (
              <Avatar
                src={member.avatarURL}
                name={member.name}
                size="md"
                key={member.$id}
              />
            );
          })}
        </AvatarGroup>

        <VStack
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          maxWidth={"100%"}
          minH={300}
          maxH={400}
          overflowY={"auto"}
          overflowX={"hidden"}
          borderWidth={1}
          px={2}
          pt={1}
          bg={colorMode === "light" ? gray.gray3 : blueDark.blue2}
          rounded={"md"}
          mt={2}
          divider={<Divider />}
          spacing={0}
        >
          {users &&
            users
              .filter((member) => member.$id !== currentUserDetails.$id)
              .map((user: IUserDetails, index) => {
                return (
                  <div
                    className="flex items-center w-full gap-2 px-2 py-2 hover:bg-gray9/20 group "
                    key={index}
                  >
                    <Checkbox
                      type="checkbox"
                      id={index.toString()}
                      isChecked={members.includes(user)}
                      onChange={() => {
                        if (members.includes(user)) {
                          setMembers((prev) => {
                            return prev.filter(
                              (member) => member.$id !== user.$id,
                            );
                          });
                        } else {
                          setMembers((prev) => {
                            return [...prev, user];
                          });
                        }
                      }}
                      className=""
                    />
                    <label
                      htmlFor={index.toString()}
                      className="flex items-center w-full gap-1 p-1 text-sm font-semibold tracking-wide cursor-pointer"
                    >
                      <Avatar
                        name={user.name}
                        size="sm"
                        src={user.avatarID ?? undefined}
                      />
                      {user.name}
                    </label>
                  </div>
                );
              })}
        </VStack>
      </div>
      <div className="flex flex-row-reverse gap-4">
        <Button
          type="submit"
          bg={blueDark.blue3}
          _hover={{ bg: blueDark.blue4 }}
          color={slate.slate1}
          maxW={"48"}
        >
          Create
        </Button>
        <Button variant="ghost" onClick={() => prev()}>
          Change Details
        </Button>
      </div>
    </motion.form>
  );
};

export default AddMembersForm;

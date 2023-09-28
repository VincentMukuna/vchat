import React from "react";
import { IUserDetails } from "../../../interfaces";
import useSWR from "swr";
import { getUsers } from "../../../services/userDetailsServices";
import { useAuth } from "../../../context/AuthContext";
import {
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Flex,
  Stack,
} from "@chakra-ui/react";

import { motion } from "framer-motion";
import { useStepper } from "./FormStepper";
import { blueDark, gray, slate } from "@radix-ui/colors";

interface AddMembersProps {
  members: IUserDetails[];
  setGroupDetails: (
    value: React.SetStateAction<{
      name: string;
      description: string;
      members: IUserDetails[];
    }>,
  ) => void;
}

const AddMembersForm = ({ members, setGroupDetails }: AddMembersProps) => {
  const { currentUserDetails } = useAuth();
  const { prev, next } = useStepper();
  if (!currentUserDetails) return null;
  const { data: users } = useSWR("users", getUsers);

  return (
    <motion.form
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
            return <Avatar name={member.name} size="md" key={member.$id} />;
          })}
        </AvatarGroup>

        <Flex
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          flexDir={"column"}
          maxWidth={"100%"}
          minH={300}
          maxH={400}
          overflowY={"auto"}
          overflowX={"hidden"}
          bg={gray.gray3}
          rounded={"md"}
          mt={2}
        >
          {users &&
            users
              .filter((member) => member.$id !== currentUserDetails.$id)
              .map((user: IUserDetails, index) => {
                return (
                  <div
                    className="flex items-center gap-2 px-2 py-2 hover:bg-gray9/20 group "
                    key={index}
                  >
                    <Checkbox
                      type="checkbox"
                      id={index.toString()}
                      isChecked={members.includes(user)}
                      onChange={() => {
                        if (members.includes(user)) {
                          setGroupDetails((groupDetails) => {
                            return {
                              ...groupDetails,
                              members: groupDetails.members.filter(
                                (member) => member.$id !== user.$id,
                              ),
                            };
                          });
                        } else {
                          setGroupDetails((groupDetails) => {
                            return {
                              ...groupDetails,
                              members: [...groupDetails.members, user],
                            };
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
        </Flex>
      </div>
      <div className="flex flex-row-reverse gap-4">
        <Button
          bg={blueDark.blue3}
          _hover={{ bg: blueDark.blue4 }}
          color={slate.slate1}
          maxW={"48"}
          onClick={() => {
            next();
          }}
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

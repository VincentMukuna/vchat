import React, { useEffect, useState } from "react";
import { IUserDetails } from "../../../interfaces";
import useSWR from "swr";
import { getUsers, searchUsers } from "../../../services/userDetailsServices";
import { useAuth } from "../../../context/AuthContext";
import {
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Divider,
  VStack,
  useColorMode,
} from "@chakra-ui/react";

import { motion } from "framer-motion";
import { useStepper } from "./FormStepper";
import { blueDark, gray, slate, slateDark } from "@radix-ui/colors";
import toast from "react-hot-toast";
import User, { UserAvatar, UserDescription } from "../../Users/User";
import Search from "../../../components/Search";
import { useInfinite } from "../../../utils/hooks/useInfinite";
import { UserIcon } from "@heroicons/react/20/solid";
import VSkeleton from "../../../components/VSkeleton";

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

const NewGroupAddMembersForm = ({
  members: init,
  setGroupDetails,
  handleSubmit,
}: AddMembersProps) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const { prev, next } = useStepper();

  const {
    data,
    isLoading,
    error,
    mutate,
    size,
    setSize,
    isValidating,
    totalRef,
  } = useInfinite<IUserDetails>(getUsers, "users", /users-(\w+)/, []);

  const users = data ? ([] as IUserDetails[]).concat(...data) : [];
  const { colorMode } = useColorMode();
  let [members, setMembers] = useState<IUserDetails[]>(init);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) {
      handleSubmit();
      setDone(false);
    }
  }, [done]);

  function handleAddMembers() {
    if (members.length <= 1) {
      toast.error("Groups should have more than one member");
      return;
    }
    setGroupDetails((prev) => ({ ...prev, members: members }));
    setDone(true);
  }

  return (
    <motion.div
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
                icon={<UserIcon className="w-[26px] h-[26px]" />}
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
          minH={200}
          maxH={300}
          overflowY={"auto"}
          overflowX={"hidden"}
          borderWidth={1}
          px={2}
          pt={4}
          bg={colorMode === "light" ? gray.gray3 : slateDark.slate2}
          rounded={"md"}
          mt={2}
          spacing={0}
        >
          <Search
            handleSearch={async (name, onCloseSearch) => {
              let res = await searchUsers(name);
              return res
                .filter(
                  (user) =>
                    user.$id !== currentUserDetails.$id &&
                    !members.some((member) => member.$id === user.$id),
                )
                .map((user) => (
                  <User
                    user={user}
                    onClick={() => {
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
                      onCloseSearch();
                    }}
                    key={user.$id}
                  >
                    <UserAvatar size="sm" />
                    <UserDescription />
                  </User>
                ));
            }}
          />
          {isLoading ? (
            <>
              <VSkeleton />
              <VSkeleton />
            </>
          ) : (
            users?.length &&
            ([] as IUserDetails[])
              .concat(...users)
              .filter((member) => member.$id !== currentUserDetails.$id)
              .map((user: IUserDetails, index) => {
                return (
                  <div
                    className="flex items-center w-full gap-2 group "
                    key={user.$id}
                  >
                    <Checkbox
                      type="checkbox"
                      id={index.toString()}
                      isChecked={members.some(
                        (member) => member.$id === user.$id,
                      )}
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
                    />
                    <label
                      htmlFor={index.toString()}
                      className="flex items-center w-full gap-1 p-1 text-sm font-semibold tracking-wide cursor-pointer grow"
                    >
                      <User user={user} onClick={() => {}}>
                        <UserAvatar size="sm" />
                        <UserDescription />
                      </User>
                    </label>
                  </div>
                );
              })
          )}

          {totalRef.current >
            ([] as IUserDetails[]).concat(...users!).length && (
            <Button
              as={motion.button}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              variant={"ghost"}
              onClick={() => {
                setSize(size + 1);
              }}
              isLoading={isValidating}
              w={"full"}
              flexShrink={0}
              mb={2}
            >
              {isValidating ? "Fetching" : "See more"}
            </Button>
          )}
        </VStack>
      </div>
      <div className="flex flex-row-reverse gap-4">
        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddMembers}
          bg={blueDark.blue3}
          _hover={{ bg: blueDark.blue4 }}
          color={slate.slate1}
          maxW={"48"}
        >
          Create
        </Button>
        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          variant="ghost"
          onClick={() => prev()}
        >
          Change Details
        </Button>
      </div>
    </motion.div>
  );
};

export default NewGroupAddMembersForm;

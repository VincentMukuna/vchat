import {
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  HStack,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  SkeletonCircle,
  SkeletonText,
  Stack,
  VStack,
  useCheckboxGroup,
  useColorMode,
  useModalContext,
} from "@chakra-ui/react";
import { GroupChatDetails, IUserDetails } from "../../../interfaces";
import useSWR, { mutate, useSWRConfig } from "swr";
import {
  editMembers,
  getGroupDetails,
} from "../../../services/groupMessageServices";
import { blueDark, gray, slateDark } from "@radix-ui/colors";
import { getUsers, searchUsers } from "../../../services/userDetailsServices";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useInfinite } from "../../../utils/hooks/useInfinite";
import Search from "../../../components/Search";
import { UserIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import User, { UserAvatar, UserDescription } from "../../Users/User";
import VSkeleton from "../../../components/VSkeleton";
import { confirmAlert } from "../../../components/Alert/alertStore";

const AddMembers = ({ group }: { group: GroupChatDetails }) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const { data: roomDetails } = useSWR(`details ${group.$id}`, () =>
    getGroupDetails(group.$id),
  );
  const { cache } = useSWRConfig();
  const { data, isLoading, error, size, setSize, isValidating, totalRef } =
    useInfinite<IUserDetails>(getUsers, "users", /users-(\w+)/, []);

  const users = data ? ([] as IUserDetails[]).concat(...data) : [];
  const { colorMode } = useColorMode();

  const { onClose } = useModalContext();

  const [newMembers, setNewMembers] = useState<IUserDetails[]>([]);

  let memberIDs = roomDetails?.members.map(
    (member: any) => member.$id,
  ) as string[];

  const handleAddMembers = () => {
    const details = cache.get(`details ${group.$id}`)?.data;
    mutate(
      `details ${group.$id}`,
      {
        ...details,
        members: [...newMembers, ...(roomDetails?.members as IUserDetails[])],
      },
      { revalidate: false },
    );
    onClose();
    editMembers(
      group.$id,
      newMembers.map((member) => member.$id).concat(memberIDs),
    )
      .then((newDoc) => {
        mutate(`details ${group.$id}`, newDoc, { revalidate: false });
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  return (
    <>
      <ModalHeader>Add members</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <p className="mb-2 overflow-hidden text-sm italic text-dark-gray9 whitespace-nowrap text-ellipsis">
          Check member to add to {group.name}
        </p>
        <div>
          {isLoading ? (
            <VSkeleton />
          ) : (
            <>
              <AvatarGroup max={4}>
                {newMembers.map((member) => {
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
                          !newMembers.some(
                            (member) => member.$id !== user.$id,
                          ) &&
                          !roomDetails?.members.some(
                            (member) =>
                              (member as IUserDetails).$id === user.$id,
                          ),
                      )
                      .map((user) => (
                        <User
                          user={user}
                          onClick={() => {
                            setNewMembers((prev) => {
                              return [...prev, user];
                            });

                            onCloseSearch();
                          }}
                          key={user.$id}
                        >
                          <UserAvatar />
                          <UserDescription />
                        </User>
                      ));
                  }}
                />
                {users?.length &&
                  ([] as IUserDetails[])
                    .concat(...users)
                    .filter(
                      (user) =>
                        user.$id !== currentUserDetails.$id &&
                        !roomDetails?.members.some(
                          (member) => (member as IUserDetails).$id === user.$id,
                        ),
                    )
                    .map((user: IUserDetails, index) => {
                      return (
                        <div
                          className="flex items-center w-full  group gap-1 "
                          key={user.$id}
                        >
                          <Checkbox
                            type="checkbox"
                            id={index.toString()}
                            isChecked={newMembers.some(
                              (member) => member.$id === user.$id,
                            )}
                            onChange={() => {
                              if (newMembers.includes(user)) {
                                setNewMembers((prev) => {
                                  return prev.filter(
                                    (member) => member.$id !== user.$id,
                                  );
                                });
                              } else {
                                setNewMembers((prev) => {
                                  return [...prev, user];
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={index.toString()}
                            className="flex items-center w-full text-sm font-semibold tracking-wide cursor-pointer"
                          >
                            <User user={user} onClick={() => {}}>
                              <UserAvatar size="sm" />
                              <UserDescription />
                            </User>
                          </label>
                        </div>
                      );
                    })}

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
            </>
          )}
        </div>
      </ModalBody>
      <ModalFooter className="gap-2">
        <Button variant={"ghost"} width={"40"} onClick={onClose}>
          Cancel
        </Button>
        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          width={"40"}
          rounded={"md"}
          onClick={() =>
            confirmAlert({
              message: `Add ${newMembers.length} user${
                newMembers.length > 1 ? "s" : ""
              } to this group?`,
              title: "Add Members",
              onConfirm: handleAddMembers,
            })
          }
          color={colorMode === "dark" ? gray.gray2 : gray.gray1}
          title="save changes"
          isDisabled={newMembers.length < 1}
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
};

export default AddMembers;

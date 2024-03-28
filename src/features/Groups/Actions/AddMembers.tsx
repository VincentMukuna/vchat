import { sendSystemMessage } from "@/services/systemMessageService";
import { SERVER } from "@/utils/config";
import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import {
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  VStack,
  useColorMode,
  useModalContext,
} from "@chakra-ui/react";
import { UserIcon } from "@heroicons/react/20/solid";
import { blueDark, gray } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { confirmAlert } from "../../../components/Alert/alertStore";
import Search from "../../../components/Search";
import VSkeleton from "../../../components/VSkeleton";
import { useAuth } from "../../../context/AuthContext";
import { GroupChatDetails, IUserDetails } from "../../../interfaces/interfaces";
import {
  editMembers,
  getGroupDetails,
} from "../../../services/groupMessageServices";
import { getUsers, searchUsers } from "../../../services/userDetailsServices";
import { useInfinite } from "../../../utils/hooks/useInfinite";
import User, { UserAvatar, UserDescription } from "../../Users/User";

const AddMembers = ({ group }: { group: GroupChatDetails }) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const { data: roomDetails } = useSWR(`details ${group.$id}`, () =>
    getGroupDetails(group.$id),
  );
  const { update: updateConversationDetails } = useSWROptimistic(
    `details ${group.$id}`,
  );
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
    updateConversationDetails({
      ...roomDetails,
      members: [...newMembers, ...(roomDetails?.members as IUserDetails[])],
    });
    onClose();
    editMembers(
      group.$id,
      newMembers.map((member) => member.$id).concat(memberIDs),
    )
      .then((newDoc) => {
        updateConversationDetails(newDoc);
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
    sendSystemMessage(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_GROUP_MESSAGES, {
      groupDoc: group.$id,
      body: `${currentUserDetails!.name} added ${newMembers.length} user${
        newMembers.length > 1 ? "s" : ""
      } to the group`,
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
                bg={colorMode === "light" ? gray.gray3 : blueDark.blue2}
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
                          className="flex items-center w-full gap-1 group "
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

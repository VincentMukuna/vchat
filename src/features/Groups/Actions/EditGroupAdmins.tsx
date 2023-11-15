import {
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
import { gray, slateDark } from "@radix-ui/colors";
import React, { useState } from "react";
import User, { UserAvatar, UserDescription } from "../../UsersList/User";
import { IGroup, IUserDetails } from "../../../interfaces";
import { useAuth } from "../../../context/AuthContext";
import {
  getGroupDetails,
  updateGroupDetails,
} from "../../../services/groupMessageServices";
import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";
import { useChatsContext } from "../../../context/ChatsContext";
import { motion } from "framer-motion";

const EditGroupAdmins = ({ selectedGroup }: { selectedGroup: IGroup }) => {
  const { currentUserDetails } = useAuth();
  const { setSelectedChat } = useChatsContext();
  if (!currentUserDetails) return null;
  const { colorMode } = useColorMode();
  const { onClose } = useModalContext();
  const [newAdmins, setNewAdmins] = useState(selectedGroup.admins);

  const { data: group } = useSWR(`details ${selectedGroup.$id}`, () =>
    getGroupDetails(selectedGroup.$id),
  );

  function handleEditAdmins() {
    if (!group) return;
    onClose();
    updateGroupDetails(group.$id, { admins: newAdmins, changeLog: "addadmin" })
      .then((newDoc) => {
        mutate(`details ${group.$id}`, newDoc, { revalidate: false });
        setSelectedChat(newDoc);
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  }
  console.log(newAdmins);
  console.log(group);
  return (
    <>
      <ModalHeader>Add Admin</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <p className="mb-2 text-sm italic text-dark-gray9">
          Check member to make admin
        </p>
        <VStack
          maxWidth={"100%"}
          minH={300}
          maxH={400}
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
          {group &&
            (group.members as IUserDetails[])
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
                      isChecked={newAdmins.some(
                        (adminID) => adminID === user.$id,
                      )}
                      onChange={() => {
                        if (newAdmins.includes(user.$id)) {
                          setNewAdmins((prev) => {
                            return prev.filter(
                              (adminID) => adminID !== user.$id,
                            );
                          });
                        } else {
                          setNewAdmins((prev) => {
                            return [...prev, user.$id];
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={index.toString()}
                      className="flex items-center w-full gap-1 p-1 text-sm font-semibold tracking-wide cursor-pointer"
                    >
                      <User user={user} onClick={() => {}}>
                        <UserAvatar size="sm" />
                        <UserDescription />
                      </User>
                    </label>
                  </div>
                );
              })}
        </VStack>
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
          onClick={handleEditAdmins}
          color={colorMode === "dark" ? gray.gray2 : gray.gray1}
          title="save changes"
          isDisabled={
            newAdmins.every((adminId) => group?.admins.includes(adminId)) &&
            group?.admins.every((adminID) => newAdmins.includes(adminID))
          }
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
};

export default EditGroupAdmins;

import { FormEvent, useEffect, useState } from "react";
import { IUserDetails } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorMode,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
} from "@chakra-ui/react";
import { updateUserDetails } from "../../services/userDetailsServices";
import { Avatar } from "@chakra-ui/react";
import {
  blackA,
  blueDark,
  grassDark,
  gray,
  grayDark,
  redDark,
  skyDark,
} from "@radix-ui/colors";
import {
  CheckIcon,
  InformationCircleIcon,
  MapPinIcon,
  PencilIcon,
} from "@heroicons/react/20/solid";

import { AnimatePresence, motion } from "framer-motion";

type ProfileProps = {
  user: IUserDetails;
};
const Profile = ({ user }: ProfileProps) => {
  const { currentUser, currentUserDetails } = useAuth();

  const { colorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const isCurrentUser = user.userID === currentUser?.$id;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1 }}
        className="relative flex flex-col items-center justify-between w-full gap-2 py-4"
      >
        <div className="flex flex-col items-center gap-2">
          <Avatar size={"xl"} name={currentUserDetails?.name} />
          <span className="text-lg leading-6 tracking-wide">{user.name}</span>
          <span className="text-sm text-gray11 dark:text-gray-400">
            {currentUserDetails?.about || "Hi there! I'm using VChat"}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-900 dark:text-gray-400">
            <Icon as={MapPinIcon} className="w-3 h-3" />
            {currentUserDetails?.location}
          </span>
        </div>
        <div className="flex flex-col items-center w-full gap-4 mt-5 transition">
          {isCurrentUser && (
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent
                bg={colorMode === "light" ? gray.gray2 : blueDark.blue1}
                overflow={"hidden"}
              >
                <ModalHeader> Edit your details</ModalHeader>
                <ModalCloseButton />
                <EditUserDetails onClose={onClose} />
              </ModalContent>
            </Modal>
          )}
          <Button
            width={"48"}
            rounded={"md"}
            onClick={onOpen}
            bg={blueDark.blue6}
            color={gray.gray1}
          >
            {"Edit Info"}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
const EditUserDetails = ({ onClose }: { onClose: () => void }) => {
  const { currentUserDetails, refreshUserDetails } = useAuth();
  if (!currentUserDetails) return;

  const { colorMode } = useColorMode();

  const [details, setDetails] = useState({
    name: currentUserDetails?.name,
    about: currentUserDetails?.about,
    location: currentUserDetails?.location,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleDetailsChange = async (e: any) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    setSubmitting(true);
    e.preventDefault();
    try {
      await updateUserDetails(currentUserDetails.$id, details);
      refreshUserDetails();
      onClose();
    } catch (error) {
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 p-4 dark:text-gray-100 dark:bg-dark-blue1 bg-gray2 text-dark-blue1"
    >
      <div className="flex flex-col gap-4 ">
        <div className="flex flex-col gap-2 py-2 ">
          <label
            htmlFor="username"
            className="text-sm tracking-wider transition-[height]  text-dark-gray7 dark:peer-focus:text-gray5 dark:text-gray8 "
          >
            Username
          </label>
          <InputGroup>
            <InputLeftElement>
              <PencilIcon className="w-5 h-5" />
            </InputLeftElement>
            <Input
              autoFocus
              value={details.name}
              onChange={handleDetailsChange}
              type="text"
              name="name"
              id="username"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="about"
            className="text-sm tracking-wider transition-[height]  text-dark-gray7 dark:peer-focus:text-gray5 dark:text-gray8 "
          >
            About
          </label>
          <InputGroup>
            <InputLeftElement>
              <InformationCircleIcon
                className="w-5 h-5 dark:text-dark-gray8/50"
                pointerEvents="none"
              />
            </InputLeftElement>
            <Input
              value={details.about}
              onChange={handleDetailsChange}
              type="text"
              name="about"
              id="about"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="location"
            className="text-sm tracking-wider transition-[height]  text-dark-gray7 dark:peer-focus:text-gray5 dark:text-gray8 "
          >
            Location
          </label>
          <InputGroup>
            <InputLeftElement>
              <MapPinIcon
                className="w-5 h-5 dark:text-dark-gray8/50"
                pointerEvents="none"
              />
            </InputLeftElement>
            <Input
              value={details.location}
              onChange={handleDetailsChange}
              type="text"
              name="location"
              id="location"
            />
          </InputGroup>
        </div>
      </div>
      <ModalFooter>
        <Button
          type="submit"
          bg={blueDark.blue5}
          color={colorMode === "dark" ? gray.gray2 : gray.gray3}
          isLoading={submitting}
          loadingText="Submitting"
          px={12}
          leftIcon={<CheckIcon className="w-5 h-5 " />}
        >
          Save
        </Button>
      </ModalFooter>
    </form>
  );
};

export default Profile;

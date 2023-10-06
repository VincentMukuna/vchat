import { useState } from "react";
import { IUserDetails } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
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
import {
  updateUserAvatar,
  updateUserDetails,
} from "../../services/userDetailsServices";
import { Avatar } from "@chakra-ui/react";
import {
  blackA,
  blueDark,
  grassDark,
  gray,
  grayDark,
  redDark,
  skyDark,
  slateDark,
} from "@radix-ui/colors";
import {
  CheckIcon,
  InformationCircleIcon,
  MapPinIcon,
  PencilIcon,
} from "@heroicons/react/20/solid";

import { AnimatePresence, motion } from "framer-motion";
import { useFilePicker } from "use-file-picker";
import toast from "react-hot-toast";
import api from "../../services/api";
import { SERVER } from "../../utils/config";

type ProfileProps = {
  user: IUserDetails;
};
const Profile = ({ user }: ProfileProps) => {
  const { currentUser, currentUserDetails, refreshUserDetails } = useAuth();
  if (!currentUserDetails) return null;

  const { colorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { openFilePicker, filesContent, plainFiles } = useFilePicker({
    accept: [".jpg", ".png"],
    multiple: false,
    readAs: "DataURL",
    onFilesSuccessfullySelected(data) {
      let promise = updateUserAvatar(
        currentUserDetails.$id,
        data.plainFiles[0] as File,
      );

      promise.then(() => {
        refreshUserDetails();
      });
    },

    onFilesRejected: () => {
      toast.error("Invalid file");
    },
  });

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
          <div className="relative ">
            <IconButton
              title="Edit avatar"
              onClick={openFilePicker}
              aria-label="edit avatar"
              icon={
                <PencilIcon className="w-5 h-5 text-gray11 dark:text-gray7" />
              }
              pos={"absolute"}
              bg={"transparent"}
              className="z-20 -right-10"
            />
            <Avatar
              size={"2xl"}
              name={currentUserDetails?.name}
              src={filesContent[0]?.content || currentUserDetails.avatarURL}
            />
          </div>
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
              <motion.div>
                <ModalContent
                  bg={colorMode === "light" ? gray.gray2 : slateDark.slate1}
                  overflow={"hidden"}
                  className="border"
                >
                  <ModalHeader> Edit your details</ModalHeader>
                  <ModalCloseButton />
                  <EditUserDetails onClose={onClose} />
                </ModalContent>
              </motion.div>
            </Modal>
          )}
          <Button
            width={"48"}
            rounded={"md"}
            onClick={onOpen}
            bg={blueDark.blue5}
            color={colorMode === "dark" ? gray.gray2 : gray.gray1}
            _hover={
              colorMode === "light"
                ? { bg: blueDark.blue7, color: gray.gray1 }
                : {}
            }
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
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 p-4 dark:text-gray-100 text-dark-blue1"
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
              <PencilIcon className="w-5 h-5 dark:text-dark-gray8/50" />
            </InputLeftElement>
            <Input
              autoFocus
              isRequired
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
              isRequired
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
              isRequired
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
          _hover={
            colorMode === "light"
              ? { bg: blueDark.blue7, color: gray.gray1 }
              : {}
          }
          isLoading={submitting}
          loadingText="Submitting"
          px={12}
          leftIcon={<CheckIcon className="w-5 h-5 " />}
        >
          Save
        </Button>
      </ModalFooter>
    </motion.form>
  );
};

export default Profile;

import {
  Avatar,
  Button,
  Icon,
  IconButton,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { MapPinIcon, PencilIcon } from "@heroicons/react/20/solid";
import { gray } from "@radix-ui/colors";
import { useAuth } from "../context/AuthContext";
import { updateUserAvatar } from "../services/userDetailsServices";

import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import { EditUserDetails } from "../features/Profile/EditUserDetails";
import Sidebar, { SideBarHeader } from "../features/Sidebar/Sidebar";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import { VARIANTS_MANAGER } from "../services/variants";

const Profile = () => {
  const { currentUserDetails, setCurrentUserDetails } = useAuth();
  if (!currentUserDetails) return null;

  const { colorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { openFilePicker, filesContent, plainFiles } = useFilePicker({
    accept: [".jpg", ".png"],
    multiple: false,
    readAs: "DataURL",
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({ maxFileSize: 2 * 1024 * 1024 }),
    ],
    onFilesSuccessfullySelected(data) {
      updateUserAvatar(currentUserDetails.$id, data.plainFiles[0] as File).then(
        (userDeets) => {
          setCurrentUserDetails(userDeets);
        },
      );
    },

    onFilesRejected: () => {
      toast.error("Invalid file");
    },
  });

  return (
    <AuthenticatedLayout>
      <Sidebar>
        <SideBarHeader title={"Profile"} className="" />
        <motion.div
          key="profile"
          variants={VARIANTS_MANAGER}
          initial="slide-from-left"
          animate="slide-in"
          exit="slide-from-right"
        >
          <div className="relative flex flex-col items-center justify-between w-full gap-2 py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative ">
                <IconButton
                  as={motion.button}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
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
              <div className="flex flex-col items-center">
                <span className="text-lg leading-6 tracking-wide">
                  {currentUserDetails.name}
                </span>
                <span className="text-sm italic text-gray11 dark:text-gray-400">
                  {currentUserDetails?.about || "Hi there! I'm using VChat"}
                </span>
              </div>

              <span className="inline-flex items-center gap-1 text-slate-900 dark:text-gray-400">
                <Icon as={MapPinIcon} className="w-3 h-3" />
                {currentUserDetails?.location}
              </span>
            </div>
            <div className="flex flex-col items-center w-full gap-4 mt-5 transition">
              {
                <Modal isOpen={isOpen} onClose={onClose} size={"xs"}>
                  <ModalOverlay />
                  <motion.div>
                    <ModalContent className="border">
                      <ModalHeader> Edit your details</ModalHeader>
                      <ModalCloseButton />
                      <EditUserDetails />
                    </ModalContent>
                  </motion.div>
                </Modal>
              }
              <Button
                width={"48"}
                rounded={"md"}
                onClick={onOpen}
                color={colorMode === "dark" ? gray.gray2 : gray.gray1}
              >
                Edit Info
              </Button>
            </div>
          </div>
        </motion.div>
      </Sidebar>
    </AuthenticatedLayout>
  );
};
export default Profile;

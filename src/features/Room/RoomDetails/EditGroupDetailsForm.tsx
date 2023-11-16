import { IChat, IGroup } from "../../../interfaces";
import {
  updateGroupAvatar,
  updateGroupDetails,
} from "../../../services/groupMessageServices";
import { mutate, useSWRConfig } from "swr";
import {
  Avatar,
  Button,
  FocusLock,
  IconButton,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useModalContext,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import { useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import { useFilePicker } from "use-file-picker";
import { PencilIcon, UsersIcon } from "@heroicons/react/20/solid";
import { useChatsContext } from "../../../context/ChatsContext";
import { motion } from "framer-motion";

export const EditGroupDetailsForm = ({ group }: { group: IGroup }) => {
  const { setSelectedChat } = useChatsContext();
  const { cache } = useSWRConfig();
  const { onClose } = useModalContext();
  const [details, setDetails] = useState({
    name: group.name,
    description: group.description,
  });

  const [saving, setSaving] = useState(false);
  const { currentUserDetails } = useAuth();
  let firstInputRef = useRef(null);
  if (!currentUserDetails) return null;
  const canSave =
    Object.keys(details).some(
      (key) => details[key as keyof typeof details] !== group[key],
    ) && Object.values(details).every((val) => val != "");

  const { openFilePicker, filesContent } = useFilePicker({
    accept: [".jpg", ".png", ".webp"],
    multiple: false,
    readAs: "DataURL",
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 }),
    ],
    onFilesSuccessfullySelected(data) {
      let promise = updateGroupAvatar(group.$id, data.plainFiles[0] as File);
      promise.catch((error) => {
        toast.error(error.message);
      });

      promise.then((updatedChatDoc) => {
        let chats = cache.get("conversations")?.data as (IChat | IGroup)[];
        let updatedChats = chats.map((chat) => {
          if (chat.$id === group.$id) {
            return {
              ...chat,
              avatarID: updatedChatDoc.avatarID,
              avatarURL: updatedChatDoc.avatarURL,
            };
          }
          return chat;
        });
        mutate("conversations", updatedChats);
        setSelectedChat(updatedChatDoc);
        toast.success("Avatar changed");
      });
    },

    onFilesRejected: () => {
      toast.error("Invalid file");
    },
  });
  function handleChange(name: string, value: string) {
    setDetails((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSave) {
      toast.error("Details unchanged");
      return;
    }

    try {
      setSaving(true);
      let updatedGroupDoc = await updateGroupDetails(group.$id, details);
      let chats = cache.get("conversations")?.data as (IChat | IGroup)[];
      let updatedChats = chats.map((chat) => {
        if (chat.$id === updatedGroupDoc.$id) {
          return updatedGroupDoc;
        }
        return chat;
      });
      mutate(`details ${group.$id}`, updatedGroupDoc, { revalidate: false });
      mutate("conversations", updatedChats, { revalidate: false });
      setSelectedChat(updatedGroupDoc);
    } catch (error) {
      toast.error(`Can't change ${group.name} 's details right now `);
    } finally {
      setSaving(false);
      onClose();
    }
  }
  return (
    <>
      <ModalCloseButton />
      <ModalHeader>Edit group details</ModalHeader>
      <ModalBody>
        <FocusLock finalFocusRef={firstInputRef}>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="relative self-center w-fit ">
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
                className="z-20 -right-6"
              />
              <Avatar
                size={"2xl"}
                src={filesContent[0]?.content || group.avatarURL}
                icon={<UsersIcon className="w-14 h-14" />}
              />
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2">
                <label
                  htmlFor="name"
                  className="text-sm leading-none text-gray10"
                >
                  Name
                </label>
                <Input
                  ref={firstInputRef}
                  autoComplete="true"
                  max={30}
                  required
                  id="name"
                  value={details.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  name="name"
                  placeholder=""
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="description"
                  className="text-sm leading-none text-gray10"
                >
                  Description
                </label>
                <Textarea
                  required
                  value={details.description}
                  onChange={(e) =>
                    handleChange("description", e.target.value.slice(0, 50))
                  }
                  id="description"
                  name="description"
                  placeholder=""
                />
              </div>
            </div>
          </form>
        </FocusLock>
      </ModalBody>
      <ModalFooter gap={2}>
        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          variant={"ghost"}
          onClick={onClose}
          isLoading={saving}
          className="w-full "
        >
          Cancel
        </Button>

        <Button
          isDisabled={!canSave}
          onClick={() => handleSubmit()}
          isLoading={saving}
          loadingText="Saving"
          className="w-full "
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
};

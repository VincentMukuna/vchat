import useSWROptimistic from "@/utils/hooks/useSWROptimistic";
import {
  Avatar,
  Button,
  FocusLock,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Textarea,
  useModalContext,
} from "@chakra-ui/react";
import { PencilIcon, UsersIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import { useAuth } from "../../../context/AuthContext";
import { useChatsContext } from "../../../context/ChatsContext";
import { GroupChatDetails } from "../../../interfaces/interfaces";
import {
  updateGroupAvatar,
  updateGroupDetails,
} from "../../../services/groupMessageServices";

export const EditGroupDetailsForm = ({
  group,
}: {
  group: GroupChatDetails;
}) => {
  const { setSelectedChat } = useChatsContext();
  const {
    conversationsData: { conversations },
  } = useChatsContext();
  const { update: updateConversations } = useSWROptimistic("conversations");
  const { update: updateRoomDetails } = useSWROptimistic(
    `details ${group.$id}`,
  );
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
        let chats = conversations;
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
        updateConversations(updatedChats);
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
      let chats = conversations;
      let updatedChats = chats.map((chat) => {
        if (chat.$id === updatedGroupDoc.$id) {
          return updatedGroupDoc;
        }
        return chat;
      });
      updateRoomDetails(updatedGroupDoc);
      updateConversations(updatedChats);
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
            <div className="group relative w-fit self-center  ">
              <Avatar
                size={"2xl"}
                src={filesContent[0]?.content || group.avatarURL}
                icon={<UsersIcon className="h-14 w-14" />}
                position={"relative"}
                overflow={"hidden"}
              >
                <div className=" absolute inset-0 flex hidden items-center justify-center bg-slate-800/40  transition-all group-hover:flex ">
                  <Button
                    as={motion.button}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    title="Edit avatar"
                    onClick={openFilePicker}
                    aria-label="edit avatar"
                    size={"sm"}
                    variant={"ghost"}
                  >
                    <PencilIcon className="mr-2 h-4 w-4 text-gray11 dark:text-gray7" />
                    Edit
                  </Button>
                </div>
              </Avatar>
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

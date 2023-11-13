import { IChat, IGroup } from "../../interfaces";
import {
  updateGroupAvatar,
  updateGroupDetails,
} from "../../services/groupMessageServices";
import { mutate, useSWRConfig } from "swr";
import {
  Button,
  FocusLock,
  Input,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useModalContext,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import { useFilePicker } from "use-file-picker";

export const EditGroupDetailsForm = ({ group }: { group: IGroup }) => {
  const { cache } = useSWRConfig();
  const { onClose } = useModalContext();
  const [details, setDetails] = useState({
    name: group.name,
    description: group.description,
  });

  const [saving, setSaving] = useState(false);
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const canSave =
    details.name === group.name && details.description === group.description;
  const isAdmin = group.admins.includes(currentUserDetails.$id);
  const { openFilePicker, filesContent } = useFilePicker({
    accept: [".jpg", ".png", ".webp"],
    multiple: false,
    readAs: "DataURL",
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 }),
    ],
    onFilesSuccessfullySelected(data) {
      let promise = updateGroupAvatar(
        selectedChat.$id,
        data.plainFiles[0] as File,
      );
      promise.catch((error) => {
        toast.error(error.message);
      });

      promise.then(() => {
        mutate(selectedChat.$id);
        mutate("conversations");
        toast.success("Avatar changed");
      });
    },

    onFilesRejected: () => {
      toast.error("Invalid file");
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      let updatedGroupDoc = await updateGroupDetails(group.$id, details);
      let chats = cache.get("conversations")?.data as (IChat | IGroup)[];
      let updatedChats = chats.map((chat) => {
        if (chat.$id === updatedGroupDoc.$id) {
          return updatedGroupDoc;
        }
        return chat;
      });
      mutate("conversations", updatedChats, { revalidate: false });
    } catch (error) {
      toast.error(`Can't change ${group.name} 's details right now `);
    } finally {
      setSaving(false);
      onClose();
    }
  }
  return (
    <>
      <ModalHeader>Edit group details</ModalHeader>
      <ModalContent>
        <FocusLock>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label
                  htmlFor="name"
                  className="text-sm leading-none text-gray10"
                >
                  Name
                </label>
                <Input
                  autoComplete="true"
                  required
                  id="name"
                  defaultValue={group.name}
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
                <Input
                  autoComplete="true"
                  required
                  defaultValue={group.description}
                  id="description"
                  name="description"
                  placeholder=""
                />
              </div>
            </div>
          </form>
        </FocusLock>
      </ModalContent>
      <ModalFooter>
        <div className="">
          <Button
            variant={"ghost"}
            onClick={onClose}
            isLoading={saving}
            className="w-full "
          >
            Cancel
          </Button>
        </div>
        <div>
          <Button
            isDisabled={!canSave}
            onClick={handleSubmit}
            isLoading={saving}
            loadingText="Saving"
            className="w-full "
          >
            Save
          </Button>
        </div>
      </ModalFooter>
    </>
  );
};

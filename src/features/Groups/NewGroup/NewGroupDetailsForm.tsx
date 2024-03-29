import { Avatar, Button, IconButton, Input } from "@chakra-ui/react";
import { PencilIcon } from "@heroicons/react/20/solid";
import { gray } from "@radix-ui/colors";
import { motion } from "framer-motion";
import React from "react";
import toast from "react-hot-toast";
import { useFilePicker } from "use-file-picker";
import { useStepper } from "./FormStepper";
interface GroupDetailsProps {
  description: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  handleAvatar: (avatar: File | null) => void;
}

const NewGroupDetailsForm = ({
  name,
  onChange,
  description,
  handleAvatar,
}: GroupDetailsProps) => {
  const { next } = useStepper();
  const { openFilePicker, filesContent, plainFiles } = useFilePicker({
    accept: [".jpg", ".png", ".jpeg", ".webp"],
    multiple: true,
    readAs: "DataURL",
    onFilesSuccessfullySelected: (data) => {
      handleAvatar(data.plainFiles[0] as File);
    },

    onFilesRejected: () => {
      toast.error("Invalid file");
    },
  });

  return (
    <motion.form
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      id="add details"
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
      className="relative flex flex-col h-full gap-5 mt-4 space-y-2 "
    >
      <div className="relative self-center ">
        <IconButton
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          title="Edit avatar"
          onClick={openFilePicker}
          aria-label="edit avatar"
          icon={<PencilIcon className="w-5 h-5 text-gray11 dark:text-gray7" />}
          pos={"absolute"}
          bg={"transparent"}
          className="z-20 -right-10"
        />
        <Avatar size={"xl"} name={name} src={filesContent[0]?.content} />
      </div>
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm leading-none text-gray10">
          Name :
        </label>
        <Input
          max={30}
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={onChange}
          placeholder="Group Name"
        />
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="description"
          className="text-sm leading-none text-gray10"
        >
          Description :
        </label>
        <Input
          max={50}
          type="text"
          required
          name="description"
          id="description"
          value={description}
          onChange={onChange}
          placeholder="Few words to describe this group's purpose"
        />
      </div>

      <div className="flex flex-row-reverse w-full mt-auto text-gray2 ">
        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          w={"48"}
          color={gray.gray2}
        >
          Add Members
        </Button>
      </div>
    </motion.form>
  );
};

export default NewGroupDetailsForm;

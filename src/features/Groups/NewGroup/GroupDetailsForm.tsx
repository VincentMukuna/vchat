import { blueDark, indigoDark, slate } from "@radix-ui/colors";
import React from "react";
import { motion } from "framer-motion";
import { useStepper } from "./FormStepper";
import { Avatar, Button, IconButton } from "@chakra-ui/react";
import { useFilePicker } from "use-file-picker";
import toast from "react-hot-toast";
import { PencilIcon } from "@heroicons/react/20/solid";
interface GroupDetailsProps {
  description: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  handleAvatar: (avatar: File | null) => void;
}

const GroupDetailsForm = ({
  name,
  onChange,
  description,
  handleAvatar,
}: GroupDetailsProps) => {
  const { next } = useStepper();
  const { openFilePicker, filesContent, plainFiles } = useFilePicker({
    accept: [".jpg", ".png"],
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
      className="relative flex flex-col h-full gap-3 mt-8 space-y-2 "
    >
      <div className="relative self-center ">
        <IconButton
          title="Edit avatar"
          onClick={openFilePicker}
          aria-label="edit avatar"
          icon={<PencilIcon className="w-5 h-5 text-gray11 dark:text-gray7" />}
          pos={"absolute"}
          bg={"transparent"}
          className="z-20 -right-10"
        />
        <Avatar size={"2xl"} name={name} src={filesContent[0]?.content} />
      </div>
      <div className="relative flex flex-col-reverse gap-2 transition-[height]">
        <input
          max={30}
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={onChange}
          placeholder="Group Name"
          className={`p-2 bg-transparent shadow-dark-indigo12 focus:shadow-[0_0_0_2px] dark:shadow-dark-indigo4 rounded shadow-[0_0_0_2px] dark:focus:shadow-[0_0_0_2px] dark:focus:shadow-dark-indigo6 placeholder:text-gray9 placeholder:text-sm peer dark:border-dark-indigo4 focus:outline-none  `}
        />
        <label
          htmlFor="name"
          className="text-sm tracking-wider transition-[height]  text-dark-gray7 dark:peer-focus:text-gray5 dark:text-gray8 "
        >
          Name :
        </label>
      </div>
      <div className="relative flex flex-col-reverse gap-2">
        <input
          max={50}
          type="text"
          required
          name="description"
          id="description"
          value={description}
          onChange={onChange}
          placeholder="Few words to describe this group's purpose"
          className={`p-2 bg-transparent shadow-dark-indigo12 focus:shadow-[0_0_0_2px] dark:shadow-dark-indigo4 rounded shadow-[0_0_0_2px] dark:focus:shadow-[0_0_0_2px] dark:focus:shadow-dark-indigo6 placeholder:text-gray9 placeholder:text-sm peer border-dark-indigo4 focus:outline-none focus:border-dark-indigo7 `}
        />
        <label
          htmlFor="description"
          className="text-sm tracking-wider transition-[height]  text-dark-gray7 dark:peer-focus:text-gray5 dark:text-gray8 "
        >
          Description :
        </label>
      </div>

      <div className="absolute flex flex-row-reverse w-full mt-auto bottom-2">
        <Button
          type="submit"
          bg={blueDark.blue3}
          _hover={{ bg: blueDark.blue4 }}
          color={slate.slate1}
          maxW={"48"}
        >
          Add Members
        </Button>
      </div>
    </motion.form>
  );
};

export default GroupDetailsForm;

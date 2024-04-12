import { FileTypeValidator } from "@/utils/fileValidators";
import { Badge, IconButton } from "@chakra-ui/react";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import toast from "react-hot-toast";
import { useFilePicker } from "use-file-picker";
import { FileContent } from "use-file-picker/dist/interfaces";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";

export type AttachmentHandle = {
  clear: () => void;
  filesContent: FileContent<string>[];
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
};

const AttachmentInput = forwardRef<AttachmentHandle>((props, ref) => {
  const [attachments, setAttachments] = useState<File[]>([]);

  const { openFilePicker, filesContent, clear } = useFilePicker({
    accept: [".jpg", ".png"],
    multiple: false,
    readAs: "DataURL",
    validators: [
      new FileTypeValidator(["image/png", "image/jpeg"]),
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 }),
    ],
    onFilesSuccessfullySelected(data) {
      setAttachments(data.plainFiles as File[]);
    },

    onFilesRejected: ({ errors }) => {
      toast.error(
        "Invalid file " + errors.map((error: any) => error.reason + " \n"),
      );
    },

    onClear: () => {
      setAttachments([]);
    },
  });

  useImperativeHandle(ref, () => ({
    clear,
    filesContent,
    attachments,
    setAttachments,
  }));
  return (
    <div className="relative flex h-full">
      <IconButton
        as={motion.button}
        variant={"ghost"}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        bg={"inherit"}
        aria-label="add attachment"
        title="add attachment"
        icon={<PaperClipIcon className="h-4 w-4" />}
        onClick={() => {
          clear();
          openFilePicker();
        }}
        rounded={"full"}
      ></IconButton>
      {attachments.length > 0 && (
        <Badge
          colorScheme="green"
          className="absolute right-0 "
          rounded={"full"}
          size="2xl"
        >
          {attachments.length}
        </Badge>
      )}
    </div>
  );
});

export default AttachmentInput;

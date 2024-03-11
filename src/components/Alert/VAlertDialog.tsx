import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { tomato, tomatoA } from "@radix-ui/colors";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Alert, clearAlert } from "./alertStore";

type VAlertDialogProps = { alert: Alert };

const VAlertDialog = ({ alert }: VAlertDialogProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelRef = useRef(null);

  useEffect(() => {
    if (alert.isShown) {
      onOpen();
    }
  }, [alert]);

  function handleAlertClose() {
    onClose();
    clearAlert();
  }
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => handleAlertClose()}
      isCentered={true}
      size={["xs", "sm"]}
      autoFocus
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>{alert.title}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody className="flex flex-col gap-1">
          {alert.message.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </AlertDialogBody>
        <AlertDialogFooter
          gap={2}
          display={"flex"}
          flexWrap={["wrap", "nowrap"]}
          justifyContent={["center", "end"]}
        >
          <Button
            as={motion.button}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            variant="ghost"
            ref={cancelRef}
            onClick={() => {
              handleAlertClose();
              alert.onCancel && alert.onCancel();
            }}
            w={["full", "fit-content"]}
          >
            {alert.cancelText || "Cancel"}
          </Button>
          <Button
            tabIndex={0}
            as={motion.button}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            bg={tomatoA.tomatoA10}
            opacity={0.8}
            _hover={{ bg: tomato.tomato9 }}
            color={"white"}
            onClick={() => {
              alert.onConfirm();
              handleAlertClose();
            }}
            colorScheme="red"
            w={["full", "fit-content"]}
          >
            {alert.confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VAlertDialog;

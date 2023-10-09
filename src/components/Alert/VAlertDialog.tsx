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
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Alert, clearAlert } from "./store";

type VAlertDialogProps = { alert: Alert };

const VAlertDialog = forwardRef(({ alert }: VAlertDialogProps, ref: any) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      onOpen,
    };
  });

  useEffect(() => {
    if (alert.isShown) {
      onOpen();
    }
  }, [alert]);
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered={true}
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
        <AlertDialogFooter>
          <Button variant="ghost" ref={cancelRef} onClick={onClose}>
            {alert.cancelText || "Cancel"}
          </Button>
          <Button
            colorScheme="red"
            onClick={() => {
              alert.onConfirm();
              onClose();
              clearAlert();
            }}
          >
            {alert.confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

export default VAlertDialog;

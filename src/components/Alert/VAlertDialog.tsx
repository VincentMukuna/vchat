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
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useAlert } from "./Alerter";

const VAlertDialog = forwardRef((ref: any) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelRef = useRef(null);
  const { cancelText, confirmText, message, onCancel, onConfirm } = useAlert()!;

  useImperativeHandle(ref, () => {
    return {
      onOpen,
    };
  });
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader></AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>{message}</AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef}>{cancelText}</Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

export default VAlertDialog;

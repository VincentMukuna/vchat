import React, { useEffect, useState } from "react";
import { Store } from "../utils/observableStore";
import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { blueDark, gray, slateDark } from "@radix-ui/colors";
import { CheckIcon } from "@heroicons/react/20/solid";

let modalStore = new Store<any>({ modalContent: null });

const VModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [state, setState] = useState({ modalContent: null });

  const { colorMode } = useColorMode();

  useEffect(() => {
    if (state.modalContent) {
      onOpen();
    }
  }, [state]);

  useEffect(() => {
    return modalStore.subscribe(setState);
  }, []);
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        bg={colorMode === "light" ? gray.gray2 : slateDark.slate1}
        className="border"
      >
        {state.modalContent}
        <ModalFooter gap={4}>
          <Button variant={"ghost"} onClick={onClose}>
            Cancel
          </Button>
          <Button
            bg={blueDark.blue5}
            color={colorMode === "dark" ? gray.gray2 : gray.gray3}
            _hover={
              colorMode === "light"
                ? { bg: blueDark.blue7, color: gray.gray1 }
                : {}
            }
            isLoading={false}
            loadingText="Submitting"
            px={12}
            leftIcon={<CheckIcon className="w-5 h-5 " />}
            onClick={onClose}
          >
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export function openModal(modalContent: React.JSX.Element) {
  modalStore.set({ modalContent: modalContent });
}

export default VModal;

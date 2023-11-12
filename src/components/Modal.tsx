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
    <Modal isOpen={isOpen} onClose={onClose} size={"xs"}>
      <ModalOverlay />
      <ModalContent className="border">{state.modalContent}</ModalContent>
    </Modal>
  );
};

export function openModal(modalContent: React.JSX.Element) {
  modalStore.set({ modalContent: modalContent });
}

export default VModal;

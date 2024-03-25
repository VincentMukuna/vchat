import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalProps,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Store } from "../utils/observableStore";

let modalStore = new Store<any>({ modalContent: null });

const VModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [state, setState] = useState({ modalContent: null, props: {} });

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
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        modalStore.set({ modalContent: null, props: {} });
      }}
      {...state.props}
    >
      <ModalOverlay />
      <ModalContent className="border">{state.modalContent}</ModalContent>
    </Modal>
  );
};

export function openModal(
  modalContent: React.JSX.Element,
  props?: Partial<ModalProps>,
) {
  modalStore.set({ modalContent: modalContent, props: props });
}

export default VModal;

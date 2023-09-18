import { useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  children: JSX.Element;
  showModal: (state: boolean) => void;
};

const Modal = ({ children, showModal }: ModalProps) => {
  const overlayRef = useRef(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      showModal(false);
    }
  };

  return createPortal(
    <div
      onClick={handleOverlayClick}
      ref={overlayRef}
      className="absolute top-0 left-0 z-20 flex items-center justify-center w-screen h-screen text-gray-200 rounded-lg bg-black/50"
    >
      <div className="px-4 rounded-xl py-7 bg-primary-shaded">{children}</div>
    </div>,
    document.getElementById("modal") as HTMLElement,
  );
};

export default Modal;

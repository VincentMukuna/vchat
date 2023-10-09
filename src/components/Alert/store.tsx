import { Alert } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export type Alert = {
  isShown: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel?: () => void;
  cancelText?: string;
};

let initialState = {
  isShown: false,
  title: "",
  message: "",
  confirmText: "",
  onConfirm: () => {},
  onCancel: () => {},
  cancelText: "",
};

let value: Alert = initialState;

let listener: null | ((state: Alert) => void) = null;

export const useAlert: () => Alert = () => {
  const [state, setState] = useState<Alert>(value);

  useEffect(() => {
    listener = setState;
    return () => {
      listener = null;
    };
  }, [state]);

  return state;
};

// export const toggleIsShown = () => {
//   value.isShown = !value.isShown;
// };

export const clearAlert = () => {
  value = initialState;
  if (listener) {
    listener(value);
  }
};

export const alert = (options: Omit<Alert, "isShown">) => {
  value = { ...options, isShown: true };
  if (listener) {
    listener(value);
  }
};

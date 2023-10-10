import { Alert } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Store } from "../../services/observableStore";

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

let alertStore = new Store(initialState);

export const useAlert: () => Alert = () => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    return alertStore.subscribe(setState);
  }, []);
  return state;
};

// export const toggleIsShown = () => {
//   value.isShown = !value.isShown;
// };

export const clearAlert = () => {
  alertStore.set(initialState);
};

export const confirmAlert = (options: Omit<Alert, "isShown">) => {
  let newAlert = { ...options, isShown: true };
  alertStore.set(newAlert);
};

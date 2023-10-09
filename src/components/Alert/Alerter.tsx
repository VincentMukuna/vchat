import { ReactNode, createContext, useContext, useRef, useState } from "react";
import VAlertDialog from "./VAlertDialog";

type AlertContextValueType = {
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  cancelText: string;
};

const AlertContext = createContext<AlertContextValueType | null>(null);

const Alerter = () => {
  const [alert, setAlert] = useState<AlertContextValueType | null>(null);
  const alertRef = useRef(null);
  
  return (
    <AlertContext.Provider value={alert}>
      <VAlertDialog ref={alertRef} />
    </AlertContext.Provider>
  );
};

export default Alerter;

export const useAlert = () => useContext(AlertContext);

function createAlert(a:AlertContextValueType){
    
}

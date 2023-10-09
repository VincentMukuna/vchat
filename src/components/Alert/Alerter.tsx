import { createContext, useContext, useEffect, useRef, useState } from "react";
import VAlertDialog from "./VAlertDialog";
import { useAlert } from "./store";

const Alerter = () => {
  const alert = useAlert();
  const alertRef = useRef(null);

  if (!alert.isShown) return null;

  return <VAlertDialog ref={alertRef} alert={alert} />;
};

export default Alerter;

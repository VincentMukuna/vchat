import VAlertDialog from "./VAlertDialog";
import { useAlert } from "./alertStore";

const Alerter = () => {
  const alert = useAlert();

  return <VAlertDialog alert={alert} />;
};

export default Alerter;

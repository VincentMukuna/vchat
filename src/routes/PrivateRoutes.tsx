import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoutes = () => {
  let { currentUserDetails } = useAuth();

  return currentUserDetails ? <Outlet /> : <Navigate to={"login"} />;
};

export default PrivateRoutes;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoutes = () => {
  let { currentUserDetails, currentUser } = useAuth();
  return currentUserDetails !== null && currentUser !== null ? (
    <Outlet />
  ) : (
    <Navigate to={"login"} />
  );
};

export default PrivateRoutes;

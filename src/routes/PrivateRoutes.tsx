import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../pages/Loading";

const PrivateRoutes = () => {
  let { currentUserDetails, isLoading } = useAuth();

  return isLoading ? (
    <Loading />
  ) : currentUserDetails ? (
    <Outlet />
  ) : (
    <Navigate to={"login"} />
  );
};

export default PrivateRoutes;

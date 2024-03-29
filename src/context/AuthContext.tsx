import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Models } from "appwrite";

import Loading from "@/pages/Loading";
import toast from "react-hot-toast";
import { IUserDetails } from "../interfaces";
import api from "../services/api";
import { createDetailsDoc } from "../services/registerUserService";
import { getCurrentUserDetails } from "../services/userDetailsServices";

type AuthProviderProps = {
  children: ReactNode;
};

export interface IAuthContext {
  intended: string;
  isLoading: boolean;
  currentUser: Models.User<Models.Preferences> | null;
  currentUserDetails: IUserDetails | null;
  setCurrentUserDetails: React.Dispatch<
    React.SetStateAction<IUserDetails | null>
  >;
  setCurrentUser: React.Dispatch<
    React.SetStateAction<Models.User<Models.Preferences> | null>
  >;
  refreshUserDetails: () => void;
  register(credentials: {
    email: string;
    password: string;
    name: string;
  }): Promise<void>;
  logIn(credentials: { email: string; password: string }): Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { pathname } = useLocation();
  const [currentUser, setCurrentUser] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [currentUserDetails, setCurrentUserDetails] =
    useState<IUserDetails | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const intendedRef = useRef<string>("/");
  const navigate = useNavigate();

  const getUserDetails = async (user: Models.User<Models.Preferences>) => {
    try {
      return await getCurrentUserDetails(user);
    } catch (error) {
      return await createDetailsDoc(user);
    }
  };
  const getUserOnLoad = async () => {
    try {
      const user = await api.getAccount();
      const userDetails = await getUserDetails(user);
      setCurrentUser(user);
      setCurrentUserDetails(userDetails);
      if (
        intendedRef.current === "/login" ||
        intendedRef.current === "/register"
      ) {
        intendedRef.current = "/chats";
      }
      navigate(intendedRef.current);
    } catch (error) {
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  async function register(credentials: {
    email: string;
    password: string;
    name: string;
  }) {
    try {
      await api.createAccount(
        credentials.email,
        credentials.password,
        credentials.name,
      );
      await api.createSession(credentials.email, credentials.password);
      getUserOnLoad();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function logIn(credentials: { email: string; password: string }) {
    try {
      await api.createSession(credentials.email, credentials.password);
      await getUserOnLoad();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function refreshUserDetails() {
    if (!currentUser) throw Error("No user");
    let userDeets = await getCurrentUserDetails(currentUser);
    setCurrentUserDetails(userDeets);
  }
  useEffect(() => {
    intendedRef.current = pathname;
    if (currentUser && currentUserDetails) return;
    getUserOnLoad();
  }, []);

  let contextData = {
    intended: intendedRef.current,
    isLoading,
    currentUser,
    currentUserDetails,
    setCurrentUserDetails,
    setCurrentUser,
    refreshUserDetails,
    register,
    logIn,
  };
  if (isLoading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  let navigate = useNavigate();
  let context = useContext(AuthContext);
  if (context === null) {
    navigate("/login");
  }
  return context as IAuthContext;
};

export default AuthContext;

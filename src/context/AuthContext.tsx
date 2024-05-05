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
import { logUserOut } from "@/services/sessionServices";
import useLocalStorage from "@/utils/hooks/useLocalStorage";
import useUpdateOnlineAt from "@/utils/hooks/useUpdateOnlineAt";
import toast from "react-hot-toast";
import { IUserDetails } from "../interfaces/interfaces";
import api from "../services/api";
import { createDetailsDoc } from "../services/registerUserService";
import { getCurrentUserDetails } from "../services/userDetailsService";

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
  logOut(): void;
}

const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { pathname } = useLocation();
  const [currentUser, setCurrentUser] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [currentUserDetails, setCurrentUserDetails] =
    useState<IUserDetails | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const intendedRef = useRef<string>("/");
  const navigate = useNavigate();

  const [localUser, setLocalUser] =
    useLocalStorage<Models.User<Models.Preferences> | null>("user", null);

  useUpdateOnlineAt(currentUserDetails?.$id);
  const getAccount = async () => {
    return await api.getAccount();
  };

  const getUserDetails = async (
    user: Models.User<Models.Preferences>,
    optimistic: boolean = false,
  ) => {
    try {
      return await getCurrentUserDetails(user);
    } catch (error) {
      if (optimistic) {
        throw new Error("No user details found");
      } else {
        return await createDetailsDoc(user);
      }
    }
  };
  const fetchUserDataOnLoad = async () => {
    try {
      if (!localUser) {
        const user = await getAccount();
        setLocalUser(user);
        const userDetails = await getUserDetails(user);
        setCurrentUser(user);
        setCurrentUserDetails(userDetails);
      } else {
        const userDetails = await getUserDetails(localUser, true);
        setCurrentUser(localUser);
        setCurrentUserDetails(userDetails);
      }
      if (
        intendedRef.current === "/login" ||
        intendedRef.current === "/register"
      ) {
        navigate("/");
      } else {
        navigate(intendedRef.current);
      }
    } catch (error: any) {
      navigate("/login");
    }
    setIsLoading(false);
  };

  async function register(credentials: {
    email: string;
    password: string;
    name: string;
  }) {
    try {
      const user = await api.createAccount(
        credentials.email,
        credentials.password,
        credentials.name,
      );
      await api.createSession(credentials.email, credentials.password);
      setCurrentUser(user);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function logIn(credentials: { email: string; password: string }) {
    try {
      await api.createSession(credentials.email, credentials.password);
      await fetchUserDataOnLoad();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function logOut() {
    await logUserOut();
    localStorage.clear();
    setCurrentUser(null);
    setCurrentUserDetails(null);
  }

  async function refreshUserDetails() {
    if (!currentUser) throw Error("No user");
    let userDeets = await getCurrentUserDetails(currentUser);
    setCurrentUserDetails(userDeets);
  }

  useEffect(() => {
    intendedRef.current = pathname;
    if (currentUser && currentUserDetails) return;
    fetchUserDataOnLoad();
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
    logOut,
  };
  if (isLoading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  let context = useContext(AuthContext);
  if (context === null) {
    throw new Error("No AuthProvider found");
  }
  return context as IAuthContext;
};

export default AuthContext;

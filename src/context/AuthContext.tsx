import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import { Models } from "appwrite";

import { IUserDetails } from "../interfaces";
import {
  getCurrentUserDetails,
  getUsers,
} from "../services/userDetailsServices";
import api from "../services/api";
import { createDetailsDoc } from "../services/registerUserService";
import toast from "react-hot-toast";
import { preload } from "swr";
import { getConversations } from "../features/Chats/Chats";

type AuthProviderProps = {
  children: ReactNode;
};

export interface IAuthContext {
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
  const [currentUser, setCurrentUser] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [currentUserDetails, setCurrentUserDetails] =
    useState<IUserDetails | null>(null);

  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(false);
      navigate("home");
      preload("users", getUsers);
    } catch (error) {
      setIsLoading(false);
      navigate("login");
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
    (currentUser && currentUserDetails) || getUserOnLoad();
  }, []);

  let contextData = {
    isLoading,
    currentUser,
    currentUserDetails,
    setCurrentUserDetails,
    setCurrentUser,
    refreshUserDetails,
    register,
    logIn,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  let navigate = useNavigate();
  let context = useContext(AuthContext);
  if (context === null) {
    console.log("No context");
    navigate("/login");
  }
  return context as IAuthContext;
};

export default AuthContext;

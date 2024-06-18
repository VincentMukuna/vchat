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

import useLocalStorage from "@/lib/hooks/useLocalStorage";
import useUpdateOnlineAt from "@/lib/hooks/useUpdateOnlineAt";
import Loading from "@/pages/Loading";
import { logUserOut } from "@/services/sessionServices";
import toast from "react-hot-toast";
import api from "../services/api";
import { createDetailsDoc } from "../services/registerUserService";
import {
  getCurrentUserDetails,
  updateUserDetails,
} from "../services/userDetailsService";
import { IUserDetails, UserPrefs } from "../types/interfaces";

type AuthProviderProps = {
  children: ReactNode;
};

export interface IAuthContext {
  intended: string;
  isLoading: boolean;
  currentUser: Models.User<UserPrefs> | null;
  currentUserDetails: IUserDetails | null;
  setCurrentUserDetails: React.Dispatch<
    React.SetStateAction<IUserDetails | null>
  >;
  setCurrentUser: React.Dispatch<
    React.SetStateAction<Models.User<UserPrefs> | null>
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
  const [currentUser, setCurrentUser] = useState<Models.User<UserPrefs> | null>(
    null,
  );
  const [currentUserDetails, setCurrentUserDetails] =
    useState<IUserDetails | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const intendedRef = useRef<string>("/");
  const navigate = useNavigate();

  const [localUser, setLocalUser] =
    useLocalStorage<Models.User<UserPrefs> | null>("user", null);

  useUpdateOnlineAt(currentUserDetails?.$id);
  const getAccount = async () => {
    return (await api.getAccount()) as Models.User<UserPrefs>;
  };

  useEffect(() => {
    if (currentUser) {
      setLocalUser(currentUser);
    }
  }, [currentUser, setLocalUser]);

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
        let user = await getAccount();
        setLocalUser(user);
        let userDetails = await getUserDetails(user);
        if (user.name === null) {
          user = await api
            .provider()
            .account.updateName(user.email.split("@")[0]!);
          userDetails = await updateUserDetails(userDetails.$id, {
            name: user.email.split("@")[0]!,
          });
        }
        setCurrentUser(user);
        setCurrentUserDetails(userDetails);
        navigate("/chats");
      } else {
        const userDetails = await getUserDetails(localUser, true);
        setCurrentUser(localUser);
        setCurrentUserDetails(userDetails);
        navigate("/chats");
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
    navigate("/login");
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

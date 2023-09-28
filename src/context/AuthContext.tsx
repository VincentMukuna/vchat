import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Models } from "appwrite";

import { IUserDetails } from "../interfaces";
import {
  getCurrentUserDetails,
  getSession,
  getUserDetails,
} from "../services/userDetailsServices";
import { logUserIn } from "../services/sessionServices";
import api from "../services/api";

type AuthProviderProps = {
  children: React.JSX.Element;
};

export interface IAuthContext {
  currentUser: Models.User<Models.Preferences> | null;
  currentUserDetails: IUserDetails | null;
  setCurrentUserDetails: React.Dispatch<
    React.SetStateAction<IUserDetails | null>
  >;
  setCurrentUser: React.Dispatch<
    React.SetStateAction<Models.User<Models.Preferences> | null>
  >;
  refreshUserDetails: () => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [currentUserDetails, setCurrentUserDetails] =
    useState<IUserDetails | null>(null);

  const getUserOnLoad = async () => {
    try {
      const { user, userDetails } = await logUserIn();
      setCurrentUser(user);
      setCurrentUserDetails(userDetails);
      navigate("/");
    } catch (error: any) {
      navigate("/login");
    }
  };

  async function refreshUserDetails() {
    if (!currentUser) throw Error("No user");
    let userDeets = await getCurrentUserDetails(currentUser);
    setCurrentUserDetails(userDeets);
  }
  useEffect(() => {
    getUserOnLoad();
  }, []);

  let contextData = {
    currentUser,
    currentUserDetails,
    setCurrentUserDetails,
    setCurrentUser,
    refreshUserDetails,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  let context = useContext(AuthContext);
  if (context === null) {
    throw new Error("auth context not initialised");
  }
  return context as IAuthContext;
};

export default AuthContext;

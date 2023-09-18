import React, { useContext, useState } from "react";

type AppProviderProps = {
  children: React.JSX.Element[] | React.JSX.Element;
};

type AppContextValue = {
  activePage: string;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
};

const AppContext = React.createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: AppProviderProps) => {
  const [activePage, setActivePage] = useState("Chats");
  let contextData = { activePage, setActivePage };
  return (
    <AppContext.Provider value={contextData}>{children}</AppContext.Provider>
  );
};

export const useAppSelector = () => {
  let appContext = useContext(AppContext);

  if (appContext === null) {
    throw new Error("App context not initalised");
  }
  return appContext;
};

export default AppContext;

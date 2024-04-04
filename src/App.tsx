import { useColorMode } from "@chakra-ui/react";
import { slateDark } from "@radix-ui/colors";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";
import Alerter from "./components/Alert/Alerter";
import VModal from "./components/VModal";
import { AuthProvider } from "./context/AuthContext";
import { ChatsProvider } from "./context/ChatsContext";
import ErrorBoundary from "./pages/ErrorBoundary";

function App() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  return (
    <>
      <ErrorBoundary>
        <Toaster
          toastOptions={{
            style: {
              backgroundColor: darkMode ? slateDark.slate4 : slateDark.slate12,
              color: darkMode ? "white" : slateDark.slate1,
            },
          }}
        />
        <AuthProvider>
          <ChatsProvider>
            <Alerter />
            <VModal />
            <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gray1 dark:bg-dark-blue1">
              <Outlet />
            </div>
          </ChatsProvider>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;

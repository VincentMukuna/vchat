import { useColorMode } from "@chakra-ui/react";
import { slateDark } from "@radix-ui/colors";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";
import { SWRConfig } from "swr/_internal";
import Alerter from "./components/Alert/Alerter";
import VModal from "./components/Modal";
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

        <SWRConfig>
          <AuthProvider>
            <ChatsProvider>
              <Alerter />
              <VModal />
              <div className="fixed inset-0 flex items-center justify-center bg-gray1 dark:bg-dark-blue1">
                <Outlet />
              </div>
            </ChatsProvider>
          </AuthProvider>
        </SWRConfig>
      </ErrorBoundary>
      <Analytics />
    </>
  );
}

export default App;

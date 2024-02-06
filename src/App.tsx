import { Outlet } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import toast, { Toaster } from "react-hot-toast";
import { ChatsProvider } from "./context/ChatsContext";
import ErrorBoundary from "./pages/ErrorBoundary";
import { SWRConfig } from "swr/_internal";
import { useColorMode } from "@chakra-ui/react";
import { slate, slateDark } from "@radix-ui/colors";
import Alerter from "./components/Alert/Alerter";
import VModal from "./components/Modal";

function App() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  return (
    <>
      <ErrorBoundary>
        <Toaster
          gutter={2}
          toastOptions={{
            style: {
              backgroundColor: darkMode ? slateDark.slate4 : slateDark.slate12,
              color: darkMode ? slate.slate1 : slateDark.slate1,
            },
          }}
          containerStyle={{
            maxHeight: "100px",
            overflow: "hidden",
          }}
        />

        <SWRConfig>
          <AuthProvider>
            <AppProvider>
              <ChatsProvider>
                <Alerter />
                <VModal />
                <div className="fixed inset-0 flex items-center justify-center bg-gray1 dark:bg-dark-slate1">
                  <Outlet />
                </div>
              </ChatsProvider>
            </AppProvider>
          </AuthProvider>
        </SWRConfig>
      </ErrorBoundary>
      <Analytics />
    </>
  );
}

export default App;

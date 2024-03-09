import { useColorMode } from "@chakra-ui/react";
import { slate, slateDark } from "@radix-ui/colors";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";
import { SWRConfig } from "swr/_internal";
import Alerter from "./components/Alert/Alerter";
import VModal from "./components/Modal";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./pages/ErrorBoundary";
import { localStorageProvider } from "./services/localStorageProvider";

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

        <SWRConfig value={{ provider: localStorageProvider }}>
          <AuthProvider>
            <Alerter />
            <VModal />
            <div className="fixed inset-0 flex items-center justify-center bg-gray1 dark:bg-dark-blue1">
              <Outlet />
            </div>
          </AuthProvider>
        </SWRConfig>
      </ErrorBoundary>
      <Analytics />
    </>
  );
}

export default App;

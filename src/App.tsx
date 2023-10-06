import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./routes/PrivateRoutes";
import { Analytics } from "@vercel/analytics/react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/Register";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "react-hot-toast";
import { ChatsProvider } from "./context/ChatsContext";
import ErrorBoundary from "./pages/ErrorBoundary";
import { SWRConfig } from "swr/_internal";
import Loading from "./pages/Loading";
import { useColorMode } from "@chakra-ui/react";
import { slate, slateDark } from "@radix-ui/colors";
import { AnimatePresence } from "framer-motion";

function App() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  return (
    <>
      <ErrorBoundary>
        <Router>
          <Toaster
            gutter={2}
            toastOptions={{
              style: {
                backgroundColor: darkMode
                  ? slateDark.slate4
                  : slateDark.slate12,
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
                  <div className="fixed inset-0 flex items-center justify-center bg-gray1 dark:bg-dark-slate1">
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/loading" element={<Loading />} />
                      <Route element={<PrivateRoutes />}>
                        <Route path="/" element={<Home />} />
                      </Route>
                    </Routes>
                  </div>
                </ChatsProvider>
              </AppProvider>
            </AuthProvider>
          </SWRConfig>
        </Router>
      </ErrorBoundary>
      <Analytics />
    </>
  );
}

export default App;

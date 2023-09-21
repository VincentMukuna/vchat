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

function App() {
  return (
    <>
      <ErrorBoundary>
        <Router>
          <Toaster
            containerStyle={{
              maxHeight: "100px",
              overflow: "hidden",
            }}
          />
          <SWRConfig value={{ keepPreviousData: true }}>
            <AuthProvider>
              <AppProvider>
                <ChatsProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route element={<PrivateRoutes />}>
                      <Route path="/" element={<Home />} />
                    </Route>
                  </Routes>
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

import ReactDOM from "react-dom/client";

import {
  ChakraProvider,
  ColorModeScript,
  ThemeConfig,
  extendTheme,
} from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { SWRConfig } from "swr";
import App from "./App";
import Error from "./components/Error";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PrivateRoutes from "./routes/PrivateRoutes";
import { avatarTheme } from "./services/theming/avatarTheme";
import { butttonTheme } from "./services/theming/buttonTheme";
import { modalTheme } from "./services/theming/modalTheme";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <PrivateRoutes />,
        children: [
          {
            path: "",
            element: <Navigate to={"/chats"} />,
          },
          {
            path: "chats/*",
            lazy: () => {
              return import("./pages/Chats");
            },
            errorElement: <Error message="Error getting chats." />,
          },
          {
            path: "users",
            lazy: () => {
              return import("./pages/Users");
            },
            errorElement: <Error message="Error getting users." />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
        ],
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        async lazy() {
          let x = await import("./pages/Register");
          return { Component: x.default };
        },
        errorElement: <Error message="Error getting register page." />,
      },
    ],
  },
]);

let config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};
const theme = extendTheme({
  config,
  components: {
    Modal: modalTheme,
    Button: butttonTheme,
    Avatar: avatarTheme,
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <ColorModeScript initialColorMode="system" />
    <ChakraProvider theme={theme}>
      <SWRConfig>
        <RouterProvider router={router} />
      </SWRConfig>
    </ChakraProvider>
    <Analytics />
    <SpeedInsights />
  </>,
);

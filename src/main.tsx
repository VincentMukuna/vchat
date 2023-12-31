import ReactDOM from "react-dom/client";

import App from "./App";
import {
  ChakraProvider,
  ColorModeScript,
  ThemeConfig,
  extendTheme,
} from "@chakra-ui/react";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoutes from "./routes/PrivateRoutes";
import Home from "./pages/Home";
import Chats from "./features/Chats/ChatsList";
import Users from "./features/Users/UsersList";
import Profile from "./features/Profile/Profile";
import Settings from "./features/Settings/Settings";
import { blueDark, gray, slateDark } from "@radix-ui/colors";
import { modalTheme } from "./services/theming/modalTheme";
import { butttonTheme } from "./services/theming/buttonTheme";
import { avatarTheme } from "./services/theming/avatarTheme";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "",
        element: <PrivateRoutes />,
        children: [
          {
            path: "home",
            element: <Home />,
            children: [
              { index: true, path: "", element: <Chats /> },

              {
                path: "chats",
                element: <Chats />,
              },
              {
                path: "users",
                element: <Users />,
              },
              {
                path: "profile",
                element: <Profile />,
              },
              {
                path: "settings",
                element: <Settings />,
              },
            ],
          },
        ],
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
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
    <ColorModeScript initialColorMode="dark" />
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </>,
);

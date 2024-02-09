import ReactDOM from "react-dom/client";

import {
  ChakraProvider,
  ColorModeScript,
  ThemeConfig,
  extendTheme,
} from "@chakra-ui/react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import Chats from "./features/Chats/ChatsList";
import Profile from "./features/Profile/Profile";
import Settings from "./features/Settings/Settings";
import Users from "./features/Users/UsersList";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoutes from "./routes/PrivateRoutes";
import { avatarTheme } from "./services/theming/avatarTheme";
import { butttonTheme } from "./services/theming/buttonTheme";
import { modalTheme } from "./services/theming/modalTheme";

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

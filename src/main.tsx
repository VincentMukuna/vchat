import ReactDOM from "react-dom/client";

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
import App from "./App";
import Chats from "./pages/Chats";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import PrivateRoutes from "./routes/PrivateRoutes";
import { avatarTheme } from "./services/theming/avatarTheme";
import { butttonTheme } from "./services/theming/buttonTheme";
import { modalTheme } from "./services/theming/modalTheme";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      //protected routes should be children of PrivateRoutes
      {
        path: "/",
        element: <PrivateRoutes />,
        children: [
          {
            path: "",
            element: <Navigate to={"/chats"} />,
          },
          {
            path: "chats",
            element: <Chats />,
          },
          {
            path: "users",
            element: <Users />,
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

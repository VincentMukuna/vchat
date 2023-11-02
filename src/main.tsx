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
import Chats from "./features/Chats/Chats";
import Users from "./features/UsersList/Users";
import Profile from "./features/Profile/Profile";
import Settings from "./features/Settings/Settings";
import { blueDark, gray, slateDark } from "@radix-ui/colors";
import { modalTheme } from "./services/theming/modalTheme";
import { butttonTheme } from "./services/theming/buttonTheme";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "",
        element: <PrivateRoutes />,
        children: [
          {
            index: true,
            element: <Navigate to="home" />,
          },
          {
            path: "home",
            element: <Home />,
            children: [
              {
                path: "",
                element: <Navigate to="chats" />,
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

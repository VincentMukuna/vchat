import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
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

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/",
        element: <PrivateRoutes />,
        children: [
          {
            path: "",
            element: <Navigate to="home" />,
          },
          {
            path: "/home",
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
              {
                path: "*/:chatID",
                element: <Chats />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <ColorModeScript initialColorMode="dark" />
    <ChakraProvider resetCSS>
      <RouterProvider router={router} />
    </ChakraProvider>
  </>,
);

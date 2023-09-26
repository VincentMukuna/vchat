import ReactDOM from "react-dom/client";
import App from "./App";
import {
  ChakraBaseProvider,
  ChakraProvider,
  ColorModeScript,
  ThemeConfig,
  extendTheme,
} from "@chakra-ui/react";
import React from "react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode="dark" />
    <ChakraProvider resetCSS={true}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);

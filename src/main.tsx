import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <ColorModeScript initialColorMode="system" />
    <ChakraProvider resetCSS>
      <App />
    </ChakraProvider>
  </>,
);

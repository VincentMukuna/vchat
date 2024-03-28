import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { slateDark } from "@radix-ui/colors";
import { Analytics } from "@vercel/analytics/react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";
import { SWRConfig } from "swr/_internal";
import Alerter from "./components/Alert/Alerter";
import VModal from "./components/Modal";
import { AuthProvider } from "./context/AuthContext";
import { ChatsProvider } from "./context/ChatsContext";
import ErrorBoundary from "./pages/ErrorBoundary";
import useLocalStorage from "./utils/hooks/useLocalStorage";

function App() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const [userSeenDataLossAlert, setUserSeenDataLossAlert] = useLocalStorage(
    "vchat/alert/data-loss",
    false,
  );

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(
    !userSeenDataLossAlert,
  );

  function onCloseAlertModal() {
    setIsAlertModalOpen(false);
    setUserSeenDataLossAlert(true);
  }
  return (
    <>
      <ErrorBoundary>
        <Toaster
          toastOptions={{
            style: {
              backgroundColor: darkMode ? slateDark.slate4 : slateDark.slate12,
              color: darkMode ? "white" : slateDark.slate1,
            },
          }}
        />

        <SWRConfig>
          <AuthProvider>
            <ChatsProvider>
              <Alerter />
              <VModal />
              <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gray1 dark:bg-dark-blue1">
                <Modal
                  isCentered
                  isOpen={isAlertModalOpen}
                  onClose={onCloseAlertModal}
                  closeOnOverlayClick={false}
                >
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>🚨 Attention: Data Loss Alert! 🚨</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <Text>
                        Dear VChat Users, I regret to inform you that an
                        unexpected issue has led to the loss of data in the
                        chats database.
                        <br />
                        <br />
                        As the sole developer, I take full responsibility for
                        this incident and sincerely apologize for any
                        inconvenience it may cause. Unfortunately, this means
                        that your chat history and associated data have been
                        reset.
                        <br />
                        <br />I understand the frustration this may cause, and
                        I'm working tirelessly to rectify the situation and
                        prevent such occurrences in the future.
                        <br />
                        <br />
                        Best regards,
                        <br /> Vincent Mukuna
                      </Text>
                    </ModalBody>

                    <ModalFooter>
                      <Button colorScheme="blue" mr={3} borderRadius={"md"}>
                        Close
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
                <Outlet />
              </div>
            </ChatsProvider>
          </AuthProvider>
        </SWRConfig>
      </ErrorBoundary>
      <Analytics />
    </>
  );
}

export default App;

import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { blue, blueDark, gray } from "@radix-ui/colors";
import toast from "react-hot-toast";
import {
  Button,
  FocusLock,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import api from "../services/api";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";
import usePassword from "../hooks/usePassword";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";
import PasswordInput from "../components/PasswordInput";
import OauthSignUp from "../components/OauthSignUp";

function Login() {
  const { logIn, isLoading } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const { colorMode } = useColorMode();

  type Credentials = {
    email: string;
    password: string;
  };

  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });

  async function handleOauthSignIn(provider: string) {
    setVerifying(true);
    api.handleOauth(provider);
    setVerifying(false);
  }

  function handleChange(name: string, value: string) {
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEmailSignIn(e: FormEvent) {
    e.preventDefault();
    setVerifying(true);
    logIn(credentials).finally(() => setVerifying(false));
  }
  const [item, setItem] = useState(true);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <FocusLock>
      <motion.div
        key={"login"}
        initial={{ opacity: 0, x: "-20%" }}
        animate={{ opacity: 1, x: "0%" }}
        exit={{ scale: 1.5 }}
        className=" flex  items-center  [&>div]:w-full transition-all  "
      >
        <div className="grid gap-4 p-6 overflow-hidden border shadow text-gray12 dark:text-dark-slate12 rounded-xl">
          <div className="flex flex-col space-y-2 ">
            <h1 className="text-2xl font-semibold leading-8 tracking-tight ">
              Log in to your account
            </h1>
            <h2 className="text-sm font-normal tracking-wide below text-gray11 dark:text-indigo2/60">
              Enter your email below
            </h2>
          </div>

          <form onSubmit={handleEmailSignIn} className="grid gap-5 mt-2 ">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label
                  htmlFor="email"
                  className="text-sm leading-none text-gray10"
                >
                  Email
                </label>
                <Input
                  autoComplete="true"
                  required
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => {
                    handleChange("email", e.target.value);
                  }}
                  placeholder="xyz@example.com"
                />
              </div>
              <div className="grid gap-2 ">
                <label
                  htmlFor="password"
                  className="text-sm leading-none text-gray10 "
                >
                  Password
                </label>
                <PasswordInput
                  value={credentials.password}
                  onChange={(e) => {
                    handleChange("password", e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="">
              <Button
                type="submit"
                isLoading={verifying}
                loadingText="Verifying"
                bg={blueDark.blue4}
                color={blue.blue1}
                _hover={
                  colorMode === "light"
                    ? { bg: blueDark.blue7, color: gray.gray1 }
                    : {}
                }
                className="w-full "
              >
                Login
              </Button>
            </div>
          </form>

          <OauthSignUp loading={verifying} onClick={handleOauthSignIn} />

          <div className="flex justify-center gap-1 text-xs tracking-wide text-dark-gray4 dark:text-indigo2/50">
            <div className="flex justify-center gap-1 ">
              No account?
              <Link
                to="/register"
                className="font-bold underline text-dark-blue4 dark:text-dark-blue10"
              >
                Sign up
              </Link>
              instead
            </div>
          </div>
        </div>
      </motion.div>
    </FocusLock>
  );
}

export default Login;

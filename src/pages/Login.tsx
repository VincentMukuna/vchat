import { Button, FocusLock, Input, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OauthSignUp from "../components/OauthSignUp";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loading from "./Loading";

function Login() {
  const { logIn, isLoading, currentUser, intended, currentUserDetails } =
    useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (currentUser && currentUserDetails) {
      navigate(intended || "/");
    }
  }, [currentUser, currentUserDetails]);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <motion.div
      initial={{ opacity: 0, x: "-25%" }}
      animate={{ opacity: 1, x: "0%" }}
      transition={{ duration: 0.3 }}
    >
      <div className=" flex  items-center  [&>div]:w-full transition-all  ">
        <FocusLock>
          <div className="grid gap-4 p-6 border shadow text-gray12 dark:text-dark-slate12 rounded-xl">
            <div className="flex flex-col space-y-2 ">
              <h1 className="text-2xl font-semibold leading-8 tracking-tight ">
                Log in to VChat
              </h1>
              <h2 className="text-sm font-normal tracking-wide below text-gray11 dark:text-indigo2/60">
                Enter your email and password below
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
                  as={motion.button}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  isLoading={verifying}
                  loadingText="Verifying"
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
          </div>{" "}
        </FocusLock>
      </div>
    </motion.div>
  );
}

export default Login;

import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { blue, blueDark, gray } from "@radix-ui/colors";
import { Button, FocusLock, Input, useColorMode } from "@chakra-ui/react";
import api from "../services/api";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import OauthSignUp from "../components/OauthSignUp";

function Register() {
  const { register, currentUser } = useAuth();
  const [registering, setRegistering] = useState(false);
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  useEffect(() => {
    if (currentUser) {
      navigate("/home");
    }
  }, [currentUser]);

  type Credentials = {
    email: string;
    password: string;
    name: string;
  };

  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
    name: "",
  });

  function handleOauthSignUp(provider: string) {
    setRegistering(true);
    api.handleOauth(provider);
    setRegistering(false);
  }

  function handleEmailSignUp(e: FormEvent) {
    setRegistering(true);
    e.preventDefault();
    register(credentials).finally(() => {
      setRegistering(false);
    });
  }
  function handleChange(name: string, value: string) {
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: "-25%" }}
      animate={{ opacity: 1, x: "0%" }}
      transition={{ duration: 0.3 }}
    >
      <FocusLock>
        <div className="flex items-center h-full transition-all ">
          <div className="grid gap-6 p-6 overflow-hidden border shadow text-gray12 dark:text-dark-slate12 rounded-xl">
            <div className="flex flex-col space-y-2 ">
              <h1 className="text-2xl font-semibold leading-8 tracking-tight ">
                Create an account
              </h1>
              <h2 className="text-sm tracking-wide below text-gray11 dark:text-indigo2/60">
                Enter your email below
              </h2>
            </div>

            <form onSubmit={handleEmailSignUp} className="grid gap-6">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm leading-none text-gray10"
                  >
                    Email
                  </label>
                  <Input
                    required
                    value={credentials.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    id="email"
                    type="email"
                    placeholder="xyz@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="name"
                    className="text-sm leading-none text-gray10"
                  >
                    Username
                  </label>
                  <Input
                    required
                    value={credentials.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    id="name"
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm leading-none text-gray10"
                  >
                    Password
                  </label>
                  <PasswordInput
                    value={credentials.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </div>
              </div>
              <div className="">
                <Button
                  isLoading={registering}
                  loadingText="Registering"
                  bg={blueDark.blue4}
                  color={blue.blue1}
                  _hover={
                    colorMode === "light"
                      ? { bg: blueDark.blue7, color: gray.gray1 }
                      : {}
                  }
                  className="w-full "
                  type="submit"
                >
                  Create an account
                </Button>
              </div>
            </form>

            <OauthSignUp loading={registering} onClick={handleOauthSignUp} />

            <div className="flex justify-center gap-1 text-xs tracking-wide text-dark-gray4 dark:text-indigo2/50">
              <div className="flex justify-center gap-1 ">
                Have an account?
                <Link
                  to="/login"
                  className="font-bold underline text-dark-blue4 dark:text-dark-blue10"
                >
                  Log in
                </Link>
                instead
              </div>
            </div>
          </div>
        </div>
      </FocusLock>
    </motion.div>
  );
}

export default Register;

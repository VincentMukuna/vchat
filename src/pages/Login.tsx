import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logUserIn } from "../services/sessionServices";
import { ClipLoader } from "react-spinners";
import FormInput from "../components/FormInput";
import { blueDark, gray, tomato, tomatoDark } from "@radix-ui/colors";
import toast from "react-hot-toast";
import { AppwriteException } from "appwrite";
import { AnimatePresence, motion } from "framer-motion";
import { Button, VStack } from "@chakra-ui/react";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const { setCurrentUser, setCurrentUserDetails } = useAuth();

  const [loggingIn, setLoggingIn] = useState(false);

  async function handleLogin(provider: string) {
    setLoggingIn(true);
    try {
      const { user, userDetails } = await logUserIn(provider);
      setCurrentUser(user);
      setCurrentUserDetails(userDetails);

      navigate("/");
    } catch (error) {
      navigate("/register");
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray2 text-dark-blue1 dark:text-dark-blue12 dark:bg-dark-blue1">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="py-4 px-12 rounded-lg flex flex-col items-center w-[340px] gap-12"
      >
        <VStack>
          <h1 className="text-xl font-bold tracking-wider text-dark-blue1 dark:text-indigo2">
            VChat
          </h1>
          <h2 className="mt-1 text-xs tracking-wide text-slate-500 dark:text-indigo2/60">
            Log In
          </h2>
        </VStack>

        <VStack>
          <Button
            isLoading={loggingIn}
            loadingText={"Verifying"}
            onClick={() => handleLogin("google")}
          >
            Log In with Google
          </Button>

          <Button
            isLoading={loggingIn}
            loadingText={"Verifying"}
            onClick={() => handleLogin("github")}
          >
            Log In with GitHub
          </Button>

          <div className="flex gap-1 mt-3 text-xs text-dark-blue4 dark:text-indigo2/50">
            Do not have an account?
            <Link
              to="/register"
              className="font-semibold underline text-dark-tomato4 dark:text-dark-tomato8/100"
            >
              {" Register "}
            </Link>
            here
          </div>
        </VStack>
      </motion.div>
    </div>
  );
}

export default Login;

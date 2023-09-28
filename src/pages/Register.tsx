import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { blueDark } from "@radix-ui/colors";
import toast from "react-hot-toast";
import { Button, VStack } from "@chakra-ui/react";
import api from "../services/api";
import { motion } from "framer-motion";

function Register() {
  const [registering, setRegistering] = useState(false);
  const timerRef = useRef(0);
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  async function handleSignUp(provider: string) {
    setRegistering(true);
    api.handleOauth(provider);
    setRegistering(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center w-full h-screen bg-gray2 text-dark-blue1 dark:text-dark-blue12 dark:bg-dark-blue1"
      >
        <div className=" py-4 px-12 rounded-lg flex flex-col items-center w-[340px] gap-8">
          <VStack>
            <h1 className="text-xl font-bold tracking-wider text-gray12 dark:text-indigo2">
              VChat
            </h1>
            <h2 className="mt-1 text-xs tracking-wide text-gray11 dark:text-indigo2/60">
              Register
            </h2>
          </VStack>
          <VStack>
            <Button
              isLoading={registering}
              loadingText={"Registering"}
              onClick={() => handleSignUp("google")}
            >
              Sign Up With Google
            </Button>

            <Button
              isLoading={registering}
              loadingText={"Registering"}
              onClick={() => handleSignUp("github")}
            >
              Sign Up with GitHub
            </Button>

            <div className="flex gap-1 mt-3 text-xs text-dark-blue4 dark:text-indigo2/50">
              Have an account?
              <Link
                to="/login"
                className="font-semibold text-dark-tomato4 dark:text-dark-tomato8/100"
              >
                Log in
              </Link>
              instead
            </div>
          </VStack>
        </div>
      </motion.div>
    </>
  );
}

export default Register;

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

function Login() {
  const navigate = useNavigate();

  const { setCurrentUser, setCurrentUserDetails } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [loggingIn, setLoggingIn] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let name = e.target.name;
    let value = e.target.value;

    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const { user, userDetails } = await logUserIn(credentials);
      setCurrentUser(user);
      setCurrentUserDetails(userDetails);
      navigate("/");
    } catch (error) {
      toast.error("Error logging in: " + (error as AppwriteException).message, {
        style: {
          border: ` 0.5px solid ${blueDark.blue1} `,
          backgroundColor: `${blueDark.blue1}`,
          color: `${gray.gray1}`,
        },
      });
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray2 text-dark-blue1 dark:text-dark-blue12 dark:bg-dark-blue1">
      <div className="py-4 px-12 rounded-lg flex flex-col items-center w-[340px]">
        <h1 className="text-xl font-bold tracking-wider text-dark-blue1 dark:text-indigo2">
          VChat
        </h1>
        <h2 className="mt-1 text-xs tracking-wide text-slate-500 dark:text-indigo2/60">
          Log In
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full gap-8 mt-12"
        >
          <FormInput
            id="email"
            label="Email"
            name="email"
            onChange={handleInputChange}
            type="email"
            value={credentials.email}
          />

          <FormInput
            id="password"
            label="Password"
            name="password"
            onChange={handleInputChange}
            type="password"
            value={credentials.password}
          />

          <button
            type="submit"
            className="relative items-center justify-center w-full py-2 mt-4 text-sm font-bold tracking-wide h-11 dark:bg-dark-tomato4 bg-dark-blue1 text-gray1"
          >
            Log In
            <div className="absolute right-3 top-2">
              <ClipLoader
                size={28}
                color={blueDark.blue12}
                loading={loggingIn}
              />
            </div>
          </button>
        </form>
        <div className="flex gap-1 mt-3 text-xs text-dark-blue4 dark:text-indigo2/50">
          Do not have an account?
          <Link
            to="/register"
            className="font-semibold underline text-dark-tomato4 dark:text-dark-tomato8/100"
          >
            Register
          </Link>{" "}
          here
        </div>
      </div>
    </div>
  );
}

export default Login;

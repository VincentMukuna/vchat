import React, { useEffect } from "react";
import { ImageIcon } from "@radix-ui/react-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logUserIn } from "../services/sessionServices";
import { ClipLoader } from "react-spinners";

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
      console.log("Error logging in");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-primary-shaded">
      <div className="bg-primary-light/40 py-4 px-12 rounded-lg flex flex-col items-center w-[340px]">
        <h1 className="text-xl font-bold tracking-wide text-gray-100">VChat</h1>
        <h2 className="mt-1 text-xs text-slate-500">Log In</h2>

        <form onSubmit={handleSubmit} className="w-full mt-12">
          <div className="relative mb-8 ">
            <input
              name="email"
              id="email"
              value={credentials.email}
              onChange={handleInputChange}
              type="email"
              placeholder="email"
              className="block border-b-[1px] border-slate-400 text-md  text-gray-100 px-2 py-2  w-full bg-inherit
                focus:outline-none
                focus:border
                focus:rounded-md
                focus:mt-4
                placeholder-transparent peer  
                transition-all              
                "
            />
            <label
              htmlFor="email"
              className="absolute transition-all -top-4 text-sm text-gray-400
              peer-focus:top-[-1.6rem]
              peer-focus:bg-inherit
              peer-focus:px-1 
              peer-focus:text-indigo-300 
              peer-focus:text-sm
              peer-placeholder-shown:top-3.5
              
              "
            >
              Email
            </label>
          </div>

          <div className="relative mb-8">
            <input
              name="password"
              id="password"
              value={credentials.password}
              onChange={handleInputChange}
              type="password"
              placeholder="password"
              className="block border-b-[1px] border-slate-400 text-md  text-gray-100 px-2 py-2  w-full bg-inherit
                focus:outline-none
                focus:border
                focus:rounded-md
                focus:mt-12
                placeholder-transparent peer transition-all "
            />
            <label
              htmlFor="password"
              className="absolute transition-all -top-4 text-sm text-gray-400
              peer-focus:top-[-1.6rem]
              peer-focus:bg-inherit
              peer-focus:px-1 
              peer-focus:text-indigo-300 
              peer-focus:text-sm
              peer-placeholder-shown:top-3.5"
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            className="relative items-center justify-center w-full py-2 mt-4 text-sm font-bold tracking-wide h-11 bg-secondary-main text-slate-100"
          >
            Log In
            <div className="absolute right-3 top-2">
              <ClipLoader size={28} color="#151328" loading={loggingIn} />
            </div>
          </button>
        </form>
        <div className="mt-3 text-xs text-gray-400">
          Do not have an account?{" "}
          <Link
            to="/register"
            className="font-semibold underline text-secondary-main "
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

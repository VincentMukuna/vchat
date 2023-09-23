import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { registerNewUser } from "../services/registerUserService";
import { ClipLoader } from "react-spinners";
import { blueDark } from "@radix-ui/colors";

function Register() {
  const navigate = useNavigate();
  const { setCurrentUser, setCurrentUserDetails } = useAuth();
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    avatar: undefined,
  });
  const [registering, setRegistering] = useState(false);
  const timerRef = useRef(0);
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { user, userDeets } = await registerNewUser({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      });
      setCurrentUser(user);
      setCurrentUserDetails(userDeets);
      navigate("/");
    } catch (error) {
      console.log("Error registering");
    }
  }

  const handleInputChange = (e: any) => {
    let name = e.target.name;
    let value = e.target.value;
    setCredentials({ ...credentials, [name]: value });
  };

  return (
    <>
      <div className="flex items-center justify-center w-full h-screen bg-gray2 text-dark-blue1 dark:text-dark-blue12 dark:bg-dark-blue1">
        <div className=" py-4 px-12 rounded-lg flex flex-col items-center w-[340px]">
          <h1 className="text-xl font-bold tracking-wider text-gray12 dark:text-indigo2">
            VChat
          </h1>
          <h2 className="mt-1 text-xs tracking-wide text-gray11 dark:text-indigo2/60">
            Register
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col w-full mt-10">
            <FormInput
              id="email"
              name="email"
              type="email"
              value={credentials.email}
              label={"Email"}
              onChange={handleInputChange}
            />
            <FormInput
              id="name"
              name="name"
              type="text"
              value={credentials.name}
              label={"Username"}
              onChange={handleInputChange}
            />
            <FormInput
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              label={"Password"}
              onChange={handleInputChange}
            />

            <button
              type="submit"
              className="w-full py-2 mt-4 text-sm font-bold tracking-wide bg-secondary-main text-slate-100 dark:bg-dark-tomato4 bg-dark-blue1"
            >
              Register
              <ClipLoader
                size={28}
                color={blueDark.blue12}
                loading={registering}
              />
            </button>
          </form>
          <div className="flex gap-1 mt-3 text-xs text-dark-blue4 dark:text-indigo2/50">
            You do have an account?{"   "}
            <Link
              to="/login"
              className="font-semibold underline text-dark-tomato4 dark:text-dark-tomato8/100"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;

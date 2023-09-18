import { useAuth } from "../../context/AuthContext";
import { IUserDetails } from "../../interfaces";
import { getUsers } from "../../services/userServices";
import { ClipLoader } from "react-spinners";
import useSWR from "swr";
import User from "./User";
import { useEffect, useState } from "react";

function Users() {
  const { currentUser } = useAuth();

  const [localUsers, setLocalUsers] = useState<IUserDetails[]>();

  const {
    data: users,
    error,
    isValidating,
    isLoading,
  } = useSWR("users", getUsers, { keepPreviousData: true });

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-8 p-4 text-gray-300">
        <div>
          <p>Whoops!</p>
          <p>An error occurred while fetching users</p>
        </div>

        <button
          onClick={getUsers}
          className="w-3/5 px-4 py-3 text-gray-200 bg-purple-700 rounded-full hover:bg-purple-900"
        >
          Refresh
        </button>
      </div>
    );
  } else if (isLoading) {
    return (
      <div className="relative flex flex-col items-center justify-center w-full top-1/3">
        <ClipLoader color="#8C5959" />
        Fetching users...
      </div>
    );
  } else if (!isValidating && !isLoading && users?.length === 0) {
    return (
      <div className="flex flex-col items-center px-10 gap-7">
        <span className="text-xl">Seems you're our first user!</span>
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center italic text-center text-sky-100">
            Simulate a real chat experience with the personal chat feature in
            the meantime
          </span>
          <button className="px-3 py-2 bg-purple-800 rounded ">
            Personal Chat
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="px-3 py-4">
        {localUsers?.map((user) => <User key={user.$id} user={user} />)}
      </div>
    );
  }
}

export default Users;

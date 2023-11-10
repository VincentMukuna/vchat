import { useAuth } from "../../context/AuthContext";
import { IUserDetails } from "../../interfaces";
import { getUsers } from "../../services/userDetailsServices";
import { ClipLoader } from "react-spinners";
import useSWR from "swr";
import User from "./User";
import { useEffect, useState } from "react";
import { Button, Divider, Stack, useColorMode } from "@chakra-ui/react";
import { blueDark, gray } from "@radix-ui/colors";

function UsersList() {
  const [localUsers, setLocalUsers] = useState<IUserDetails[]>();
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const { colorMode } = useColorMode();

  const {
    data: users,
    error,
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

        <Button
          width={"44"}
          rounded={"md"}
          onClick={getUsers}
          bg={blueDark.blue5}
          color={colorMode === "dark" ? gray.gray2 : gray.gray1}
          _hover={
            colorMode === "light"
              ? { bg: blueDark.blue7, color: gray.gray1 }
              : { bg: blueDark.blue7 }
          }
        >
          Refresh
        </Button>
      </div>
    );
  } else if (isLoading) {
    return (
      <div className="relative flex flex-col items-center justify-center w-full top-1/3">
        <ClipLoader color="#8C5959" />
        Fetching users...
      </div>
    );
  } else {
    return (
      <Stack spacing={0} px={1}>
        <span className="self-center w-2/3 mb-2 ml-2 text-sm italic text-gray8">
          Click on a user to view their profile
        </span>
        {localUsers?.map((user) => <User key={user.$id} user={user} />)}
      </Stack>
    );
  }
}

export default UsersList;

import { useAuth } from "../../context/AuthContext";
import { IUserDetails } from "../../interfaces";
import { getUsers, searchUsers } from "../../services/userDetailsServices";
import { ClipLoader } from "react-spinners";
import useSWR, { mutate } from "swr";
import User from "./User";
import { useEffect, useRef, useState } from "react";
import { Button, Divider, Stack, VStack, useColorMode } from "@chakra-ui/react";
import { blueDark, gray } from "@radix-ui/colors";
import useSWRInfinite from "swr/infinite";
import Search from "../../components/Search";
import { useInfinite } from "../../hooks/useInfinite";

function UsersList({ onUserClick }: { onUserClick?: () => void }) {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const { colorMode } = useColorMode();

  const {
    data: users,
    isLoading,
    error,
    mutate,
    size,
    setSize,
    isValidating,
    totalRef,
  } = useInfinite<IUserDetails>(getUsers, "users", /users-(\w+)/, []);
  if (error) {
    return (
      <div className="flex flex-col items-center gap-8 p-4 text-gray-300">
        <div>
          <p>Whoops!</p>
          <p>An error occurred while fetching users</p>
          <p>{error.message}</p>
        </div>

        <Button
          width={"44"}
          rounded={"md"}
          onClick={() => mutate()}
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
      <div className="relative flex flex-col items-center justify-center w-full ">
        <ClipLoader color="#8C5959" />
        Fetching users...
      </div>
    );
  } else {
    return (
      <VStack spacing={0} px={1} height={"full"} alignItems={"flex-start"}>
        <Search
          handleSearch={async (name, onClick) => {
            let res = await searchUsers(name);
            return res.map((user, i) => (
              <User
                user={user}
                onCloseModal={() => {
                  if (onUserClick) {
                    onUserClick();
                  }
                  onClick();
                }}
                // key={user.$id}
                key={i}
              />
            ));
          }}
        />
        {([] as IUserDetails[])
          .concat(...users!)
          .filter((user) => (user ? true : false))
          ?.map((user) => <User key={user.$id} user={user} />)}
        {totalRef.current > ([] as IUserDetails[]).concat(...users!).length && (
          <Button
            variant={"ghost"}
            onClick={() => {
              setSize(size + 1);
            }}
            isLoading={isValidating}
            w={"full"}
          >
            {isValidating ? "Fetching" : "See more"}
          </Button>
        )}
      </VStack>
    );
  }
}

export default UsersList;
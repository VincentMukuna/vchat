import { useAuth } from "../../context/AuthContext";
import { IUserDetails } from "../../interfaces";
import { getUsers, searchUsers } from "../../services/userDetailsServices";
import { ClipLoader } from "react-spinners";
import useSWR, { mutate } from "swr";
import User, { UserAbout, UserAvatar, UserDescription } from "./User";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Divider,
  HStack,
  SkeletonCircle,
  SkeletonText,
  Stack,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { blueDark, gray } from "@radix-ui/colors";
import useSWRInfinite from "swr/infinite";
import Search from "../../components/Search";
import { useInfinite } from "../../hooks/useInfinite";
import { motion } from "framer-motion";
import { VARIANTS_MANAGER } from "../../services/variants";

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
  } else {
    return (
      <motion.div
        key="users"
        variants={VARIANTS_MANAGER}
        initial="slide-from-left"
        animate="slide-in"
        exit="slide-from-right"
      >
        <Stack spacing={0} px={1}>
          <Search
            handleSearch={async (name, onCloseSearch) => {
              let res = await searchUsers(name);
              return res.map((user, i) => (
                <User
                  user={user}
                  onCloseModal={() => {
                    if (onUserClick) {
                      onUserClick();
                    }
                    onCloseSearch();
                  }}
                  key={user.$id}
                >
                  <UserAvatar size="sm" />
                  <UserDescription />
                </User>
              ));
            }}
          />

          {isLoading && !users?.length ? (
            <>
              <HStack className="p-4">
                <SkeletonCircle size="12" w="14" />
                <SkeletonText
                  mt="2"
                  noOfLines={2}
                  spacing="4"
                  skeletonHeight="2"
                  w="full"
                />
              </HStack>
              <HStack className="p-4">
                <SkeletonCircle size="12" w="14" />
                <SkeletonText
                  mt="2"
                  noOfLines={2}
                  spacing="4"
                  skeletonHeight="2"
                  w="full"
                />
              </HStack>
            </>
          ) : (
            <>
              {([] as IUserDetails[])
                .concat(...(users ? users : []))
                .filter((user) => (user ? true : false))
                ?.map((user) => (
                  <User key={user.$id} user={user}>
                    <UserAvatar />
                    <UserDescription>
                      <UserAbout />
                    </UserDescription>
                  </User>
                ))}
              {totalRef.current >
                ([] as IUserDetails[]).concat(...users!).length && (
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
            </>
          )}
        </Stack>
      </motion.div>
    );
  }
}

export default UsersList;

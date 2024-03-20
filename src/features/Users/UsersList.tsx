import { Button, Stack, useColorMode } from "@chakra-ui/react";
import { blueDark, gray } from "@radix-ui/colors";
import { motion } from "framer-motion";
import Search from "../../components/Search";
import VSkeleton from "../../components/VSkeleton";
import { useAuth } from "../../context/AuthContext";
import { IUserDetails } from "../../interfaces";
import { getUsers, searchUsers } from "../../services/userDetailsServices";
import { VARIANTS_MANAGER } from "../../services/variants";
import { useInfinite } from "../../utils/hooks/useInfinite";
import User, { UserAbout, UserAvatar, UserDescription } from "./User";

function UsersList({
  onUserClick,
  className,
}: {
  onUserClick?: () => void;
  className: string;
}) {
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
      <div
        className={
          "flex flex-col items-center gap-8 p-4 text-gray-300 " + className
        }
      >
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
              <VSkeleton />
              <VSkeleton />
            </>
          ) : (
            <>
              <div className="flex flex-col space-y-1 overflow-y-auto overflow-x-hidden  max-h-[70dvh] md:max-h-[75dvh]">
                {([] as IUserDetails[])
                  .concat(...(users ? users : []))
                  .filter((user) => (user ? true : false))
                  ?.map((user) => (
                    <User key={user.$id} user={user}>
                      <UserAvatar size="sm" />
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
                    flexShrink={0}
                    mb={2}
                  >
                    {isValidating ? "Fetching" : "See more"}
                  </Button>
                )}
              </div>
            </>
          )}
        </Stack>
      </motion.div>
    );
  }
}

export default UsersList;

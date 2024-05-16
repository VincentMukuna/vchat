import { Avatar, Tooltip, useColorMode } from "@chakra-ui/react";
import { UserIcon } from "@heroicons/react/20/solid";
import { indigo, indigoDark } from "@radix-ui/colors";
import { Link, redirect } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCurrentUserDetails } from "../../services/userDetailsService";

export const MyProfile = () => {
  const { colorMode } = useColorMode();
  const { currentUser, currentUserDetails, setCurrentUserDetails } = useAuth();
  if (!currentUser || !currentUserDetails) return null;

  return (
    <Tooltip
      label="My Profile"
      hasArrow
      placement="right"
      py={2}
      fontSize={"sm"}
      fontWeight={"normal"}
      bg={colorMode === "light" ? indigoDark.indigo1 : indigo.indigo8}
      textColor={colorMode === "light" ? indigo.indigo3 : "black"}
      rounded={"md"}
    >
      <Link
        to={"/profile"}
        className="mt-4 "
        onClick={() => {
          redirect("profile");
          getCurrentUserDetails(currentUser).then((deets) => {
            setCurrentUserDetails(deets);
          });
        }}
      >
        <Avatar
          size={"sm"}
          borderRadius={"md"}
          src={currentUserDetails.avatarURL}
          icon={<UserIcon className="h-5 w-5" />}
          bg={colorMode === "light" ? "gray.400" : "gray.700"}
        />
      </Link>
    </Tooltip>
  );
};

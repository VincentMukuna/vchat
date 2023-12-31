import { useAuth } from "../../context/AuthContext";
import { useAppSelector } from "../../context/AppContext";
import { getCurrentUserDetails } from "../../services/userDetailsServices";
import { Link, redirect } from "react-router-dom";
import { Avatar, Tooltip, useColorMode } from "@chakra-ui/react";
import { indigo, indigoDark } from "@radix-ui/colors";
import { UserIcon } from "@heroicons/react/20/solid";

export const MyProfile = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const {
    currentUser,
    currentUserDetails,
    setCurrentUserDetails,
    setCurrentUser,
  } = useAuth();
  if (!currentUser || !currentUserDetails) return null;
  const { setActivePage } = useAppSelector();

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
        to={"profile"}
        className="mt-4 "
        onClick={() => {
          redirect("profile");
          getCurrentUserDetails(currentUser).then((deets) => {
            setCurrentUserDetails(deets);
          });
          setActivePage("Profile");
        }}
      >
        <Avatar
          size={"md"}
          src={currentUserDetails.avatarURL}
          icon={<UserIcon className="w-7 h-7" />}
        />
      </Link>
    </Tooltip>
  );
};

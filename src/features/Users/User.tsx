import { Avatar, Card, Image } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactNode, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { modal } from "../../components/VModal";
import { useAuth } from "../../context/AuthContext";
import { IUserDetails } from "../../interfaces/interfaces";
import UserProfileModal from "../Profile/UserProfileModal";

interface UserContextValue {
  user: IUserDetails;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

function User({
  user,
  onCloseModal,
  onClick,
  children,
}: {
  user: IUserDetails;
  onClick?: () => void;
  onCloseModal?: () => void;
  children: ReactNode;
}) {
  const { currentUserDetails } = useAuth();

  const navigate = useNavigate();
  if (!currentUserDetails) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Card
        as={"article"}
        bg={"inherit"}
        shadow={"none"}
        direction={"row"}
        py={3}
        ps={3}
        rounded={"md"}
        onClick={
          onClick
            ? onClick
            : () => {
                modal(
                  <UserProfileModal
                    onClose={() => {
                      onCloseModal && onCloseModal();
                      navigate("/chats");
                    }}
                    user={user}
                  />,
                  {
                    isCentered: true,
                  },
                );
              }
        }
        className={`flex w-full cursor-pointer items-center gap-1 transition-all hover:bg-slate-100 focus-visible:outline-none dark:hover:bg-dark-blue3/25`}
      >
        <UserContext.Provider value={{ user: user }}>
          {children}
        </UserContext.Provider>
      </Card>
    </motion.div>
  );
}

export default User;

export const UserAvatar = ({ size }: { size?: string }) => {
  const { user } = useContext(UserContext)!;
  return (
    <Avatar
      size={size}
      name={user.name}
      src={user.avatarURL}
      onClick={(e) => {
        if (user.avatarURL) {
          e.stopPropagation();
          modal(
            <Image
              src={user.avatarURL}
              objectFit="scale-down"
              borderRadius={"md"}
              sizes="150px"
              maxH={"80vh"}
            />,
            { isCentered: true, size: "lg" },
          );
        }
      }}
    />
  );
};

export const UserDescription = ({ children }: { children?: ReactNode }) => {
  const { user } = useContext(UserContext)!;
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const isPersonal = user.$id === currentUserDetails.$id;
  return (
    <div className="ms-2 flex flex-col justify-center">
      <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold tracking-wider dark:text-gray1">
        {isPersonal ? "You" : user.name}
      </span>
      {children}
    </div>
  );
};

export const UserAbout = () => {
  const { user } = useContext(UserContext)!;
  return (
    <span className="overflow-hidden text-ellipsis whitespace-nowrap font-sans text-sm italic tracking-wide dark:text-gray6">
      {user.about}
    </span>
  );
};

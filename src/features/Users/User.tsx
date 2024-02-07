import { Avatar, Card } from "@chakra-ui/react";
import { UserIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import { ReactNode, createContext, useContext } from "react";
import { openModal } from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { IUserDetails } from "../../interfaces";
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
                openModal(
                  <UserProfileModal
                    onClose={() => {
                      onCloseModal && onCloseModal();
                    }}
                    user={user}
                  />,
                );
              }
        }
        className={`transition-all gap-1 flex items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-slate6 w-full`}
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
      icon={<UserIcon className="w-[26px] h-[26px]" />}
      src={user.avatarURL}
    />
  );
};

export const UserDescription = ({ children }: { children?: ReactNode }) => {
  const { user } = useContext(UserContext)!;
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const isPersonal = user.$id === currentUserDetails.$id;
  return (
    <div className="flex flex-col justify-center ms-2">
      <span className="max-w-full overflow-hidden text-base font-semibold tracking-wider whitespace-nowrap text-ellipsis dark:text-gray1">
        {isPersonal ? "You" : user.name}
      </span>
      {children}
    </div>
  );
};

export const UserAbout = () => {
  const { user } = useContext(UserContext)!;
  return (
    <span className="overflow-hidden font-sans text-sm italic tracking-wide whitespace-nowrap text-ellipsis dark:text-gray6">
      {user.about}
    </span>
  );
};

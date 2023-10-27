import { mutate } from "swr";
import { IUserDetails } from "../../interfaces";
import { addContact } from "../../services/userDetailsServices";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { Avatar, Card } from "@chakra-ui/react";
import api from "../../services/api";
import { SERVER } from "../../utils/config";

function User({ user }: { user: IUserDetails }) {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const isPersonal = user.$id === currentUserDetails.$id;

  const handleClick = async () => {
    let addContactStatus = addContact(currentUserDetails.$id, user.$id);
    addContactStatus
      .then(() => mutate(currentUserDetails.îd))
      .catch((error: any) => {});
    toast.promise(addContactStatus, {
      loading: "Adding contact...",
      success: `Success! ${
        isPersonal
          ? "You now have a personal chat "
          : "You can now message " + user.name
      }`,
      error: (error) => `${error.message}`,
    });
  };
  return (
    <Card
      as={"article"}
      bg={"inherit"}
      shadow={"none"}
      direction={"row"}
      py={3}
      ps={3}
      rounded={"none"}
      onClick={handleClick}
      className={`transition-all gap-2 flex items-start cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-slate6 `}
    >
      <Avatar
        src={
          user.avatarID
            ? api
                .getFile(SERVER.BUCKET_ID_USER_AVATARS, user?.avatarID)
                .toString()
            : undefined
        }
        name={user.name}
      />
      <div className="flex flex-col justify-center ms-2">
        <span className="max-w-full overflow-hidden text-base font-semibold tracking-wider whitespace-nowrap text-ellipsis dark:text-gray1">
          {isPersonal ? "You" : user.name}
        </span>
        <span className="overflow-hidden font-sans text-sm italic tracking-wide whitespace-nowrap text-ellipsis dark:text-gray6">
          {user.about}
        </span>
      </div>
    </Card>
  );
}

export default User;

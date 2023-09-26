import { mutate } from "swr";
import { IUserDetails } from "../../interfaces";
import { addContact } from "../../services/userServices";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { Avatar } from "@chakra-ui/react";
import api from "../../services/api";
import { Server } from "../../utils/config";

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
    <article
      onClick={handleClick}
      className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-slate-600"
    >
      <Avatar
        fontWeight={"bold"}
        src={
          user.avatarID
            ? api.getFile(Server.bucketIDUserAvatars, user?.avatarID).toString()
            : undefined
        }
        name={user.name}
      />
      <div className="flex flex-col justify-center 0">
        <span className="text-lg font-semibold ]tracking-wide ">
          {isPersonal ? "You" : user.name}
        </span>
        <span className="text-sm italic ">{user.about}</span>
      </div>
    </article>
  );
}

export default User;

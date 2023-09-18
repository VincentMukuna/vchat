import { mutate } from "swr";
import { IUserDetails } from "../../interfaces";
import { addContact } from "../../services/userServices";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

function User({ user }: { user: IUserDetails }) {
  const { currentUserDetails, refreshUserDetails } = useAuth();
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
      <img
        src={user.avatarURL}
        alt="profile picture"
        className="w-10 h-10 rounded-full "
      />
      <div className="flex flex-col justify-center 0">
        <span className="font-normaltracking-wide text-md text-slate-200">
          {isPersonal ? "You" : user.name}
        </span>
        <span className="text-xs italic text-gray-300">{user.about}</span>
      </div>
    </article>
  );
}

export default User;

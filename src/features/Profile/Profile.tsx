import { FormEvent, useEffect, useState } from "react";
import { IUserDetails } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/modal/Modal";
import { updateUserDetails } from "../../services/userServices";
import toast from "react-hot-toast";

type ProfileProps = {
  user: IUserDetails;
};
const Profile = ({ user }: ProfileProps) => {
  const { currentUser } = useAuth();

  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const isCurrentUser = user.userID === currentUser?.$id;
  return (
    <div className="relative flex flex-col items-center justify-between w-full gap-2 py-4">
      <div className="flex flex-col items-center gap-1">
        <img
          src={user.avatarURL || undefined}
          alt={`User's display photo`}
          className="w-48 h-48 rounded-full"
        />
        <span className="text-lg leading-6 tracking-wide">{user.name}</span>
        <span className="text-sm text-gray-400">
          {user.about || "Hi there! I'm using VChat"}
        </span>
      </div>
      <div className="flex flex-col items-center w-full gap-4 mt-5 transition">
        {isCurrentUser && (
          <dialog
            id="editdialog"
            className="bg-transparent backdrop:bg-black/20"
          >
            <EditUserDetails />
          </dialog>
        )}
        <button
          onClick={() =>
            (
              document.getElementById("editdialog") as HTMLDialogElement
            ).showModal()
          }
          className="w-3/5 px-4 py-3 bg-purple-700 rounded-full hover:bg-purple-900"
        >
          {"Edit Info"}
        </button>
      </div>
    </div>
  );
};
const EditUserDetails = () => {
  const { currentUserDetails, refreshUserDetails } = useAuth();
  if (!currentUserDetails) return;

  const [details, setDetails] = useState({
    name: currentUserDetails?.name,
    about: currentUserDetails?.about,
  });

  const handleDetailsChange = async (e: any) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let promise = updateUserDetails(currentUserDetails.$id, details);
    toast.promise(promise, {
      loading: "Updating details...",
      success: "Details updated.",
      error: (error) => `Whoops! Error updating your details`,
    });
    promise.then(() => {
      (document.getElementById("editdialog") as HTMLDialogElement).close();
      refreshUserDetails();
    });
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 p-4 text-gray-100 rounded-md bg-primary-main"
    >
      <div className="flex flex-col gap-4 ">
        <div className="flex flex-col gap-2 py-2 ">
          <label htmlFor="username">Username</label>
          <input
            value={details.name}
            onChange={handleDetailsChange}
            type="text"
            name="name"
            id="username"
            className="px-2 py-2 bg-transparent border border-gray-400 rounded-lg focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="about">About</label>

          <input
            value={details.about}
            onChange={handleDetailsChange}
            type="text"
            name="about"
            id="about"
            className="px-2 py-2 bg-transparent border border-gray-400 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      <button
        className="self-center px-16 py-2 text-base bg-purple-800 rounded"
        type="submit"
        formMethod="dialog"
      >
        Submit
      </button>
    </form>
  );
};

export default Profile;

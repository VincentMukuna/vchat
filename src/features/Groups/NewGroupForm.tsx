import React, { useState } from "react";
import FormInput from "../../components/FormInput";
import Users from "../UsersList/Users";
import { Close } from "@radix-ui/react-dialog";
import useSWR, { mutate } from "swr";
import { getUsers } from "../../services/userServices";
import Avatar from "../../components/Avatar";
import { IUserDetails } from "../../interfaces";
import { createGroup } from "../../services/groupMessageServices";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const NewGroupForm = ({
  setShowCreateGroupModal,
}: {
  setShowCreateGroupModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const [groupDetails, setGroupDetails] = useState({
    name: "",
    description: "",
    members: [currentUserDetails] as IUserDetails[],
  });

  const { data: users } = useSWR("users", getUsers);
  let _users = Array.isArray(users) && Array(10).fill(users[0]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    let promise = createGroup({
      name: groupDetails.name,
      description: groupDetails.description,
      members: groupDetails.members.map((member) => member.$id),
      admins: [currentUserDetails.$id],
    });
    toast.promise(promise, {
      loading: "Creating group",
      success: "Group created",
      error: "Couldn't create group",
    });
    promise.then(() => {
      mutate(currentUserDetails.$id);
    });
    promise.finally(() => setShowCreateGroupModal(false));
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 mt-3 text-white md:divide-x-[0px] md:flex-row  md:gap-8 space-x-2 divide-dark-gray md:my-8 ">
          <fieldset className="flex flex-col gap-3 space-y-2">
            <div className="relative flex flex-col-reverse gap-2 transition-[height]">
              <input
                max={30}
                type="text"
                id="name"
                required
                value={groupDetails.name}
                onChange={(e) =>
                  setGroupDetails({ ...groupDetails, name: e.target.value })
                }
                placeholder="Group Name"
                className="p-2 bg-transparent border-2 rounded w-80 placeholder:text-gray9 placeholder:text-sm peer border-dark-indigo4 focus:outline-none focus:border-dark-indigo7 "
              />
              <label
                htmlFor="name"
                className="text-sm tracking-wider transition-[height] -top-3 left-1 peer-focus:text-gray5 text-gray8 "
              >
                Name :
              </label>
            </div>
            <div className="relative flex flex-col-reverse gap-2">
              <input
                max={50}
                type="text"
                required
                id="description"
                value={groupDetails.description}
                onChange={(e) =>
                  setGroupDetails({
                    ...groupDetails,
                    description: e.target.value,
                  })
                }
                placeholder="Few words to describe this group's purpose"
                className="p-2 bg-transparent border-2 rounded w-80 placeholder:text-gray9 placeholder:text-sm peer border-dark-indigo4 focus:outline-none focus:border-dark-indigo7 "
              />
              <label
                htmlFor="descrription"
                className="text-sm tracking-wider peer-focus:text-gray5 text-gray8 "
              >
                Description :
              </label>
            </div>
          </fieldset>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-hidden pt-4 md:max-h-full md:px-8 md:pt-0 ">
            <span className="text-dark-slate11">Add Members</span>
            <div className="flex items-center">
              {groupDetails.members.map((member) => {
                return (
                  <Avatar name={member.name} size="small" key={member.$id} />
                );
              })}
            </div>
            <fieldset className="overflow-x-hidden overflow-y-auto max-h-[200px] flex flex-col gap-2  ">
              {users &&
                users
                  .filter((member) => member.$id !== currentUserDetails.$id)
                  .map((user: IUserDetails, index) => {
                    return (
                      <div
                        className="flex items-center gap-2 px-2 py-2 hover:bg-gray9/20 group focus-within:bg-gray9/20"
                        key={index}
                      >
                        <input
                          type="checkbox"
                          id={index.toString()}
                          checked={groupDetails.members.includes(user)}
                          onChange={() => {
                            if (groupDetails.members.includes(user)) {
                              setGroupDetails({
                                ...groupDetails,
                                members: groupDetails.members.filter(
                                  (member) => member.$id !== user.$id,
                                ),
                              });
                            } else {
                              setGroupDetails({
                                ...groupDetails,
                                members: [...groupDetails.members, user],
                              });
                            }
                          }}
                          className="border-none accent-dark-blue8 bg-gray6 focus:outline-none focus:outline-dark-blue7 "
                        />
                        <label
                          htmlFor={index.toString()}
                          className="flex items-center gap-1 p-1 tracking-wide cursor-pointer text-md"
                        >
                          <Avatar
                            name={user.name}
                            size="small"
                            src={user.avatarID ?? undefined}
                          />
                          {user.name}
                        </label>
                      </div>
                    );
                  })}
            </fieldset>
          </div>
        </div>

        <div className="flex flex-row-reverse items-center gap-2 mt-6 font-bold tracking-wider bottom-3 md:mt-16 right-2">
          <button
            type="submit"
            className="px-12 py-2 rounded bg-dark-blue6 w-fit "
          >
            Create
          </button>

          <Close className="px-12 py-2 rounded text-tomato10 hover:border-[1px] border-tomato11 transition-all hover:bg-tomato12/20">
            Cancel
          </Close>
        </div>
      </form>
    </>
  );
};

export default NewGroupForm;

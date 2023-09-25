import React from "react";
import { IUserDetails } from "../../../interfaces";
import Avatar from "../../../components/Avatar";
import useSWR from "swr";
import { getUsers } from "../../../services/userServices";
import { useAuth } from "../../../context/AuthContext";

interface AddMembersProps {
  members: IUserDetails[];
  setGroupDetails: (
    value: React.SetStateAction<{
      name: string;
      description: string;
      members: IUserDetails[];
    }>,
  ) => void;
}

const AddMembersForm = ({ members, setGroupDetails }: AddMembersProps) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const { data: users } = useSWR("users", getUsers);

  return (
    <div className="flex flex-col gap-2 max-h-[300px] overflow-hidden pt-4 md:max-h-full  ">
      <span className="font-bold dark:text-dark-slate11 text-dark-gray7">
        Add Members
      </span>
      <div className="flex items-center">
        {members.map((member) => {
          return <Avatar name={member.name} size="small" key={member.$id} />;
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
                    checked={members.includes(user)}
                    onChange={() => {
                      if (members.includes(user)) {
                        setGroupDetails((groupDetails) => {
                          return {
                            ...groupDetails,
                            members: groupDetails.members.filter(
                              (member) => member.$id !== user.$id,
                            ),
                          };
                        });
                      } else {
                        setGroupDetails((groupDetails) => {
                          return {
                            ...groupDetails,
                            members: [...groupDetails.members, user],
                          };
                        });
                      }
                    }}
                    className="border-none dark:accent-dark-blue8 accent-dark-blue1 bg-gray6 focus:outline-none focus:outline-dark-blue7 "
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
  );
};

export default AddMembersForm;

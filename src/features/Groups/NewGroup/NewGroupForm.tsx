import { useState } from "react";

import { mutate, useSWRConfig } from "swr";
import { IUserDetails } from "../../../interfaces";
import { createGroup } from "../../../services/groupMessageServices";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import AddMembersForm from "./AddMembersForm";
import GroupDetailsForm from "./GroupDetailsForm";
import FormStepper from "./FormStepper";

const NewGroupForm = ({ onClose }: { onClose: () => void }) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;

  const { cache } = useSWRConfig();

  const [groupDetails, setGroupDetails] = useState<{
    name: string;
    description: string;
    members: IUserDetails[];
    avatar: File | null;
  }>({
    name: "",
    description: "",
    members: [currentUserDetails] as IUserDetails[],
    avatar: null,
  });
  const handleSubmit = () => {
    let promise = createGroup({
      name: groupDetails.name,
      description: groupDetails.description,
      members: groupDetails.members.map((member) => member.$id),
      admins: [currentUserDetails.$id],
      avatar: groupDetails.avatar,
    });
    toast.promise(promise, {
      loading: "Creating group",
      success: "Group created",
      error: "Couldn't create group",
    });
    promise.then((doc) => {
      mutate("conversations", [doc, ...cache.get("conversations")?.data], {
        revalidate: false,
      });
    });
    promise.finally(() => onClose());
  };

  const handleChange = (e: any) => {
    setGroupDetails((d) => {
      return { ...d, [e.target.name]: e.target.value };
    });
  };
  const handleAvatar = (avatar: File | null) => {
    setGroupDetails((prev) => {
      return { ...prev, avatar: avatar };
    });
  };

  return (
    <FormStepper handleSubmit={handleSubmit}>
      <GroupDetailsForm
        description={groupDetails.description}
        name={groupDetails.name}
        onChange={handleChange}
        handleAvatar={handleAvatar}
      />
      <AddMembersForm
        members={groupDetails.members}
        setGroupDetails={setGroupDetails}
        handleSubmit={handleSubmit}
      />
    </FormStepper>
  );
};

export default NewGroupForm;

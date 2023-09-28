import React, { useState } from "react";
import FormInput from "../../../components/FormInput";
import Users from "../../UsersList/Users";
import { Close } from "@radix-ui/react-dialog";
import useSWR, { mutate } from "swr";
import { getUsers } from "../../../services/userDetailsServices";
import Avatar from "../../../components/Avatar";
import { IUserDetails } from "../../../interfaces";
import { createGroup } from "../../../services/groupMessageServices";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import AddMembersForm from "./AddMembersForm";
import GroupDetailsForm from "./GroupDetailsForm";
import VButton from "../../../components/button/VButton";
import FormStepper from "./FormStepper";

const NewGroupForm = ({ onClose }: { onClose: () => void }) => {
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;
  const [groupDetails, setGroupDetails] = useState({
    name: "",
    description: "",
    members: [currentUserDetails] as IUserDetails[],
  });
  const handleSubmit = () => {
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
    promise.finally(() => onClose());
  };

  const handleChange = (e: any) => {
    setGroupDetails((d) => {
      return { ...d, [e.target.name]: e.target.value };
    });
  };

  return (
    <FormStepper handleSubmit={handleSubmit}>
      <GroupDetailsForm
        description={groupDetails.description}
        name={groupDetails.name}
        onChange={handleChange}
      />
      <AddMembersForm
        members={groupDetails.members}
        setGroupDetails={setGroupDetails}
      />
    </FormStepper>
  );
};

export default NewGroupForm;

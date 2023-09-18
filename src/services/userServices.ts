import { AppwriteException, Models, Permission, Role } from "appwrite";
import { Server } from "../utils/config";
import api from "./api";
import { IUserDetails } from "../interfaces";
export async function getSession() {
  try {
    let user = await api.getAccount();
    console.log("Active session: ");
    return user;
  } catch (error) {
    console.log("No active session: ");
  }
}
export async function getUserDetails(detailsDocID: string) {
  return (await api.getDocument(
    Server.databaseID,
    Server.collectionIDUsers,
    detailsDocID,
  )) as IUserDetails;
}
export async function getCurrentUserDetails(
  user: Models.User<Models.Preferences>,
) {
  try {
    let userDetails = (await api.getDocument(
      Server.databaseID,
      Server.collectionIDUsers,
      user.prefs.detailsDocID,
    )) as IUserDetails;
    return userDetails;
  } catch (error) {
    console.log(
      "Error getting details...,",
      (error as AppwriteException).message,
    );
    throw error;
  }
}
export async function getUsers() {
  const { documents } = await api.listDocuments(
    Server.databaseID,
    Server.collectionIDUsers,
  );

  return documents as IUserDetails[];
}

export async function editUserDetails(
  userDetailsDocID: string,
  details: Partial<IUserDetails>,
) {
  await api.updateDocument(
    Server.databaseID,
    Server.collectionIDUsers,
    userDetailsDocID,
    { ...details },
  );
}

export async function addContact(
  adderDetailsID: string,
  addeeDetailsID: string,
) {
  let exec = await api.executeFunction(Server.functionIDFuncs, {
    action: "add contact",
    params: {
      adderDetailsID,
      addeeDetailsID,
    },
  });
  let response = JSON.parse(exec.response);
  if (!response.ok) {
    throw Error(response.message);
  }
}

export async function deleteContact(
  deleterDetailsID: string,
  deleteeDetailsID: string,
) {
  let exec = await api.executeFunction(Server.functionIDFuncs, {
    action: "delete contact",
    params: {
      deleterDetailsID,
      deleteeDetailsID,
    },
  });
  let response = JSON.parse(exec.response);

  if (!response.ok) {
    throw Error(response.message);
  }
}

export async function updateUserDetails(
  userDetailsID: string,
  details: Partial<IUserDetails>,
) {
  return (await api.updateDocument(
    Server.databaseID,
    Server.collectionIDUsers,
    userDetailsID,
    details,
  )) as IUserDetails;
}

export async function deleteUserAvatar(userDetailsID: string) {
  let details = await getUserDetails(userDetailsID);
  if (details.avatarID) {
    await api.deleteFile(Server.bucketIDAvatars, details.avatarID);
    await updateUserDetails(userDetailsID, { avatarID: null, avatarURL: null });
  }
}

export async function uploadUserAvatar(userDetailsID: string, avatar: File) {
  if (avatar.size > 10_000_000) {
    throw new Error("Avatar cannot be larger than 10MB ");
  }
  let res = await api.createFile(Server.bucketIDAvatars, avatar);
  let url = api.getFile(Server.bucketIDAvatars, res.$id);
  return await updateUserDetails(userDetailsID, {
    avatarID: res.$id,
    avatarURL: url,
  });
}

export async function updateUserAvatar(userDetailsID: string, avatar: File) {
  if (avatar.size > 10_000_000)
    throw new Error("Avatar cannot be larger than 10MB ");
  await deleteUserAvatar(userDetailsID);
  return await uploadUserAvatar(userDetailsID, avatar);
}

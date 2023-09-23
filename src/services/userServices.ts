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
  let userDoc = (await api.getDocument(
    Server.databaseID,
    Server.collectionIDUsers,
    detailsDocID,
  )) as IUserDetails;
  return userDoc;
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
  //Only add one chat Id if its a personal chat
  await api.createDocument(Server.databaseID, Server.collectionIDChats, {
    participants:
      adderDetailsID === addeeDetailsID
        ? [addeeDetailsID]
        : [adderDetailsID, addeeDetailsID],
  });
}

export async function deleteContact(chatID: string) {
  await api.deleteDocument(Server.databaseID, Server.collectionIDChats, chatID);
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
    await api.deleteFile(Server.bucketIDUserAvatars, details.avatarID);
    await updateUserDetails(userDetailsID, { avatarID: null });
  }
}

export async function uploadUserAvatar(userDetailsID: string, avatar: File) {
  if (avatar.size > 5_000_000) {
    throw new Error("Avatar cannot be larger than 5MB ");
  }
  let res = await api.createFile(Server.bucketIDUserAvatars, avatar);
  return await updateUserDetails(userDetailsID, {
    avatarID: res.$id,
  });
}

export async function updateUserAvatar(userDetailsID: string, avatar: File) {
  if (avatar.size > 5_000_000)
    throw new Error("Avatar cannot be larger than 5MB ");
  await deleteUserAvatar(userDetailsID);
  return await uploadUserAvatar(userDetailsID, avatar);
}

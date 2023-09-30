import { AppwriteException, Models, Permission, Query, Role } from "appwrite";
import { SERVER } from "../utils/config";
import api from "./api";
import { IUserDetails } from "../interfaces";
import { getUserChats } from "./chatMessageServices";
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
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    detailsDocID,
  )) as IUserDetails;
  return userDoc;
}
export async function getCurrentUserDetails(
  user: Models.User<Models.Preferences>,
) {
  try {
    let userDetails = (await api.getDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_USERS,
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
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
  );

  return documents as IUserDetails[];
}

export async function editUserDetails(
  userDetailsDocID: string,
  details: Partial<IUserDetails>,
) {
  await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    userDetailsDocID,
    { ...details },
  );
}

export async function addContact(
  adderDetailsID: string,
  addeeDetailsID: string,
) {
  //check if chat doc exists
  if (adderDetailsID === addeeDetailsID) {
    let deets = await getUserChats(addeeDetailsID);
    deets.forEach((chat) => {
      if (
        chat.participants.length === 1 &&
        chat.participants[0].$id === adderDetailsID
      ) {
        throw new Error("You already have a personal chat");
      }
    });
  } else {
    let deets = await getUserChats(addeeDetailsID);
    deets.forEach((chat) =>
      chat.participants.forEach((participant) => {
        if (participant.$id === adderDetailsID) {
          throw new Error("Already have a chat with user");
        }
      }),
    );
  }

  //Only add one chat Id if its a personal chat
  await api.createDocument(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_CHATS, {
    participants:
      adderDetailsID === addeeDetailsID
        ? [addeeDetailsID]
        : [adderDetailsID, addeeDetailsID],
  });
}

export async function deleteContact(chatID: string) {
  await api.deleteDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    chatID,
  );
}

export async function updateUserDetails(
  userDetailsID: string,
  details: Partial<IUserDetails>,
) {
  return (await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    userDetailsID,
    details,
  )) as IUserDetails;
}

export async function deleteUserAvatar(userDetailsID: string) {
  let details = await getUserDetails(userDetailsID);
  if (details.avatarID) {
    await api.deleteFile(SERVER.BUCKET_ID_USER_AVATARS, details.avatarID);
    await updateUserDetails(userDetailsID, { avatarID: null, avatarURL: null });
  }
}

export async function uploadUserAvatar(userDetailsID: string, avatar: File) {
  let res = await api.createFile(SERVER.BUCKET_ID_USER_AVATARS, avatar);
  return await updateUserDetails(userDetailsID, {
    avatarID: res.$id,
    avatarURL: api.getFile(SERVER.BUCKET_ID_USER_AVATARS, res.$id),
  });
}

export async function updateUserAvatar(userDetailsID: string, avatar: File) {
  await deleteUserAvatar(userDetailsID);
  return await uploadUserAvatar(userDetailsID, avatar);
}

export async function deleteUser(userID: string) {
  let deleteResponse = await api.executeFunction(SERVER.FUNCTION_ID_FUNCS, {
    action: "delete user",
    params: {
      userID,
    },
  });

  let response = JSON.parse(deleteResponse.response) as {
    ok: boolean;
    message: string;
  };

  return response;
}

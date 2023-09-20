import { AppwriteException, Permission, Query, Role } from "appwrite";
import { Server } from "../utils/config";
import api from "./api";
import { IGroup, IGroupMessage, IUserDetails } from "../interfaces";
import { addUserToGlobalChat } from "./registerUserService";

export async function getGroups(userDetailsDocID: string) {
  try {
    const { documents } = await api.listDocuments(
      Server.databaseID,
      Server.collectionIDGroups,
      [Query.search("groupMembers", userDetailsDocID)],
    );
    return documents as IGroup[];
  } catch (error) {
    console.log("Error getting via search...", error);
    throw error;
  }
}

export async function getGroupMessages(groupID: string) {
  const { documents } = await api.listDocuments(
    Server.databaseID,
    Server.collectionIDGroupMessages,
    [Query.equal("groupID", groupID), Query.orderDesc("$createdAt")],
  );
  return documents as IGroupMessage[];
}

export async function sendGroupMessage(
  groupID: string,
  message: {
    senderID: string;
    body: string;
    groupID: string;
    attachments: string[] | null;
  },
) {
  try {
    await api.createDocument(
      Server.databaseID,
      Server.collectionIDGroupMessages,
      {
        ...message,
      },
    );
    console.log("Message uploaded");
    await api.updateDocument(
      Server.databaseID,
      Server.collectionIDGroups,
      groupID,
      { changeLog: "newtext" },
    );
  } catch (error) {
    console.log(`Error sending group message `, error);
  }
}

export async function deleteGroupMessage(groupID: string, messageID: string) {
  await api.deleteDocument(
    Server.databaseID,
    Server.collectionIDGroupMessages,
    messageID,
  );
  await api.updateDocument(
    Server.databaseID,
    Server.collectionIDGroups,
    groupID,
    { changeLog: "deletetext" },
  );
}

export async function getGroupDetails(groupID: string) {
  return (await api.getDocument(
    Server.databaseID,
    Server.collectionIDGroups,
    groupID,
  )) as IGroup;
}

export async function updateGroupDetails(
  groupID: string,
  details: Partial<IGroup>,
) {
  return (await api.updateDocument(
    Server.databaseID,
    Server.collectionIDGroups,
    groupID,
  )) as IGroup;
}

export async function deleteGroupAvatar(groupID: string) {
  let details = await getGroupDetails(groupID);
  if (details.groupAvatarID) {
    await api.deleteFile(Server.bucketIDGroupAvatars, details.groupAvatarID);
    await updateGroupDetails(groupID, {
      groupAvatarID: null,
      groupAvatarURL: null,
    });
  }
}

export async function uploadGroupAvatar(groupID: string, groupAvatar: File) {
  if (groupAvatar.size > 10_000_000) {
    throw new Error("Avatar cannot be larger than 10MB ");
  }
  let res = await api.createFile(Server.bucketIDAvatars, groupAvatar);
  let url = api.getFile(Server.bucketIDAvatars, res.$id);
  return await updateGroupDetails(groupID, {
    groupAvatarID: res.$id,
    groupAvatarURL: url,
  });
}

export async function updateUserAvatar(groupID: string, groupAvatar: File) {
  if (groupAvatar.size > 10_000_000)
    throw new Error("Avatar cannot be larger than 10MB ");
  await deleteGroupAvatar(groupID);
  return await uploadGroupAvatar(groupID, groupAvatar);
}

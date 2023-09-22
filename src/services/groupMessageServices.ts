import { Query } from "appwrite";
import { Server } from "../utils/config";
import api from "./api";
import { IGroup, IGroupMessage, IUserDetails } from "../interfaces";

export async function getGroups(userDetailsDocID: string) {
  try {
    let deets = (await api.getDocument(
      Server.databaseID,
      Server.collectionIDUsers,
      userDetailsDocID,
    )) as IUserDetails;
    return deets.groups;
  } catch (error: any) {
    console.log("Error getting groups ", error.message);
    throw error;
  }
}

export async function getGroupMessages(groupID: string) {
  let groupDoc = await api.getDocument(
    Server.databaseID,
    Server.collectionIDGroups,
    groupID,
  );
  console.log("group doc ", groupDoc);
  let messages = groupDoc.groupMessages;
  return messages as IGroupMessage[];
}

export async function sendGroupMessage(
  groupID: string,
  message: {
    senderID: string;
    body: string;
    group: string;
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
    await api.updateDocument(
      Server.databaseID,
      Server.collectionIDGroups,
      groupID,
      { changeLog: "newtext" },
    );
  } catch (error: any) {
    console.log(`Error sending group message `, error.message);
  }
}

export async function deleteGroupMessage(groupID: string, messageID: string) {
  await api.deleteDocument(
    Server.databaseID,
    Server.collectionIDGroupMessages,
    messageID,
  );
  api.updateDocument(Server.databaseID, Server.collectionIDGroups, groupID, {
    changeLog: "deletetext",
  });
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
    details,
  )) as IGroup;
}

export async function deleteGroupAvatar(groupID: string) {
  let details = await getGroupDetails(groupID);
  if (details.avatarID) {
    await api.deleteFile(Server.bucketIDGroupAvatars, details.groupAvatarID);
    await updateGroupDetails(groupID, {
      avatarID: null,
    });
  }
}

export async function uploadGroupAvatar(groupID: string, groupAvatar: File) {
  if (groupAvatar.size > 5_000_000) {
    throw new Error("Avatar cannot be larger than 5MB ");
  }
  let res = await api.createFile(Server.bucketIDGroupAvatars, groupAvatar);
  return await updateGroupDetails(groupID, {
    avatarID: res.$id,
  });
}

export async function updateUserAvatar(groupID: string, groupAvatar: File) {
  if (groupAvatar.size > 5_000_000)
    throw new Error("Avatar cannot be larger than 5MB ");
  await deleteGroupAvatar(groupID);
  return await uploadGroupAvatar(groupID, groupAvatar);
}

import { SERVER } from "../utils/config";
import api from "./api";
import { IGroup, IGroupMessage, IUserDetails } from "../interfaces";

type IInitGroup = {
  name: string;
  description: string;
  members: string[];
  admins: string[];
  avatar: File | null;
};

export async function createGroup({
  name,
  description,
  members,
  admins,
  avatar,
}: IInitGroup) {
  let doc = (await api.createDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUPS,
    { name, description, members, admins },
  )) as IGroup;

  if (avatar) {
    setTimeout(() => {
      uploadGroupAvatar(doc.$id, avatar);
    }, 1000);
  }
}

export async function getGroups(userDetailsDocID: string) {
  try {
    let deets = (await api.getDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_USERS,
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
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUPS,
    groupID,
  );
  let messages = groupDoc.groupMessages as IGroupMessage[];

  if (messages.length > 1) {
    messages.sort((a, b) => {
      if (a.$createdAt < b.$createdAt) {
        return 1;
      } else if (a.$createdAt > b.$createdAt) {
        return -1;
      } else {
        return 0;
      }
    });
  }
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
    let msg = await api.createDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_GROUP_MESSAGES,
      {
        ...message,
      },
    );
    api
      .updateDocument(
        SERVER.DATABASE_ID,
        SERVER.COLLECTION_ID_GROUPS,
        groupID,
        {
          changeLog: "newtext",
        },
      )
      .catch(() => {});
  } catch (error: any) {
    console.log(`Error sending group message `, error.message);
  }
}

export async function deleteGroupMessage(groupID: string, messageID: string) {
  await api.deleteDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUP_MESSAGES,
    messageID,
  );
  api.updateDocument(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_GROUPS, groupID, {
    changeLog: "deletetext",
  });
}

export async function getGroupDetails(groupID: string) {
  return (await api.getDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUPS,
    groupID,
  )) as IGroup;
}

export async function updateGroupDetails(
  groupID: string,
  details: Partial<IGroup>,
) {
  return (await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUPS,
    groupID,
    details,
  )) as IGroup;
}

export async function deleteGroupAvatar(groupID: string) {
  let details = await getGroupDetails(groupID);
  if (details.avatarID) {
    await api.deleteFile(SERVER.BUCKET_ID_GROUP_AVATARS, details.avatarID);
  }
}

export async function uploadGroupAvatar(groupID: string, groupAvatar: File) {
  let res = await api.createFile(SERVER.BUCKET_ID_GROUP_AVATARS, groupAvatar);
  return await updateGroupDetails(groupID, {
    avatarID: res.$id,
    avatarURL: api.getFile(SERVER.BUCKET_ID_GROUP_AVATARS, res.$id),
  });
}

export async function updateGroupAvatar(groupID: string, groupAvatar: File) {
  try {
    await deleteGroupAvatar(groupID);
  } catch (error) {}
  return await uploadGroupAvatar(groupID, groupAvatar);
}

export async function addMembers(groupID: string, membersID: string[]) {
  try {
    let groupDoc = await getGroupDetails(groupID);
    let newMembers = [...groupDoc.members, ...membersID] as string[];
    await updateGroupDetails(groupDoc.$id, {
      members: newMembers,
      changeLog: "addmember",
    });
  } catch (error) {}
}

export async function removeMembers(groupID: string, membersID: string[]) {
  let groupDoc = await getGroupDetails(groupID);
  let newMembers = groupDoc.members.filter((member) => {
    return !membersID.includes((member as IUserDetails).$id);
  });

  await updateGroupDetails(groupID, {
    members: newMembers,
    changeLog: "removemember",
  });
}

export async function clearGroupMessageAttachments(groupID: string) {
  let attachments: string[] = [];
  let groupDoc = await getGroupDetails(groupID);
  attachments = groupDoc.groupMessages.reduce(
    (a: any, message) => [...a, ...message.attachments],
    [],
  );

  attachments.forEach((attachment) => {
    api.deleteFile(SERVER.BUCKET_ID_GROUP_ATTACHMENTS, attachment);
  });
}

export async function deleteGroup(groupID: string) {
  await deleteGroupAvatar(groupID);
  await clearGroupMessageAttachments(groupID);
  await api.deleteDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUPS,
    groupID,
  );
}

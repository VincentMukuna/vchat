import { SERVER } from "../utils/config";
import api from "./api";
import { IGroup, IGroupMessage, IUserDetails } from "../interfaces";
import { Query } from "appwrite";
import { updateUserDetails } from "./userDetailsServices";
import { mutate } from "swr";

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
      uploadGroupAvatar(doc.$id, avatar).then(() => mutate("conversations"));
    }, 1000);
  }

  return doc as IGroup;
}

export async function getUserGroups(userDetailsDocID: string) {
  try {
    let deets = (await api.getDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_USERS,
      userDetailsDocID,
    )) as IUserDetails;
    return deets.groups;
  } catch (error: any) {
    throw error;
  }
}

export async function getGroupMessages(groupID: string, cursor?: string) {
  let querySet = [
    Query.orderDesc("$createdAt"),
    Query.equal("group", groupID),
    Query.limit(20),
  ];
  if (cursor) {
    querySet.push(Query.cursorAfter(cursor));
  }
  const { documents, total } = await api.listDocuments(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUP_MESSAGES,
    querySet,
  );
  return [documents, total] as [IGroupMessage[], number];
}

async function getAllGroupMessages(groupID: string) {
  const { documents, total } = await api.listDocuments(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUP_MESSAGES,
    [Query.equal("group", groupID), Query.limit(2000)],
  );
  return documents as IGroupMessage[];
}

export async function sendGroupMessage(
  groupID: string,
  message: {
    senderID: string;
    body: string;
    group: string;
    attachments: File[] | null;
  },
) {
  try {
    let attachmentIDs: string[] = [];
    if (message.attachments) {
      for (const attachment of message.attachments.slice(0, 4)) {
        let { $id } = await api.createFile(
          SERVER.BUCKET_ID_GROUP_ATTACHMENTS,
          attachment,
        );
        attachmentIDs.push($id);
      }
    }
    let msg = await api.createDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_GROUP_MESSAGES,
      {
        ...message,
        attachments: attachmentIDs,
      },
    );
    api
      .updateDocument(
        SERVER.DATABASE_ID,
        SERVER.COLLECTION_ID_GROUPS,
        groupID,
        {
          changeLog: "newtext",
          changerID: message.senderID,
        },
      )
      .catch(() => {});

    return msg as IGroupMessage;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteGroupMessage(
  deleterID: string,
  groupID: string,
  messageID: string,
  attachments: string[] = [],
) {
  if (attachments.every((attachment) => typeof attachment === "string")) {
    for (const attachmentID of attachments) {
      api
        .deleteFile(SERVER.BUCKET_ID_GROUP_ATTACHMENTS, attachmentID)
        .catch(() => {});
    }
  }
  await api.deleteDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUP_MESSAGES,
    messageID,
  );
  api.updateDocument(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_GROUPS, groupID, {
    changeLog: "deletetext",
    changerID: `${deleterID}`,
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

export async function editMembers(groupID: string, memberIDs: string[]) {
  return await updateGroupDetails(groupID, {
    members: memberIDs,
    changeLog: "editmembers",
  });
}

export async function clearGroupMessageAttachments(groupID: string) {
  const messages = await getAllGroupMessages(groupID);
  let attachments = ([] as string[])
    .concat(...messages.map((message) => message.attachments))
    .filter((attach) => !!attach);

  attachments.forEach((attachment) => {
    api.deleteFile(SERVER.BUCKET_ID_GROUP_ATTACHMENTS, attachment);
  });
}

export async function clearGroupMessages(groupID: string) {
  const messages = await getAllGroupMessages(groupID);
  let attachments = ([] as string[])
    .concat(...messages.map((message) => message.attachments))
    .filter((attach) => !!attach);
  messages.forEach((message) => {
    api
      .deleteDocument(
        SERVER.DATABASE_ID,
        SERVER.COLLECTION_ID_GROUP_MESSAGES,
        message.$id,
      )
      .catch((e) => {});
  });
  updateGroupDetails(groupID, { changeLog: "clearmessages" });
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

export async function leaveGroup(userDetailsID: string, groupID: string) {
  let groups = await getUserGroups(userDetailsID);
  let newGroups = groups.filter((group) => group.$id !== groupID);
  await updateUserDetails(userDetailsID, { groups: newGroups });
}

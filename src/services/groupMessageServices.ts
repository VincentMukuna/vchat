import { SERVER } from "../utils/config";
import api from "./api";
import { IGroup, IGroupMessage, IUserDetails } from "../interfaces";
import { Query } from "appwrite";
import { confirmAlert } from "../components/Alert/alertStore";
import toast from "react-hot-toast";

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
    throw error;
  }
}
export async function getGroupMessageCount(groupID: string) {
  try {
    const { total } = await api.listDocuments(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_GROUP_MESSAGES,
      [Query.equal("group", groupID), Query.select(["$id"])],
    );
    return total;
  } catch (error) {
    throw new Error("error getting count");
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
  } catch (error: any) {
    console.log(`Error sending group message `, error.message);
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
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log("new membersList: ", memberIDs);
      resolve(1);
    }, 2000);
  });
  // await updateGroupDetails(groupID, {
  //   members: memberIDs,
  //   changeLog: "editmembers",
  // });
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

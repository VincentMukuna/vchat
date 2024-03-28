import { Query } from "appwrite";
import {
  GroupChatDetails,
  GroupMessageDetails,
  IUserDetails,
} from "../interfaces/interfaces";
import { SERVER } from "../utils/config";
import { sortDocumentsByCreationDateDesc } from "../utils/utils";
import api from "./api";
import { sendSystemMessage } from "./systemMessageService";
import { updateUserDetails } from "./userDetailsServices";

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
  )) as GroupChatDetails;

  if (avatar) {
    setTimeout(() => {
      uploadGroupAvatar(doc.$id, avatar);
    }, 1000);
  }

  return doc as GroupChatDetails;
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

export async function getGroupMessages(groupID: string) {
  let groupDoc = (await api.getDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUPS,
    groupID,
  )) as GroupChatDetails;
  return groupDoc.groupMessages.toSorted(
    sortDocumentsByCreationDateDesc,
  ) as GroupMessageDetails[];
}

export async function sendGroupMessage(
  groupID: string,
  message: {
    senderID: string;
    body: string;
    attachments: File[] | null;
    replying: string | null;
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
        groupDoc: groupID,
        attachments: attachmentIDs,
        read: false,
      },
    );

    api
      .updateDocument(
        SERVER.DATABASE_ID,
        SERVER.COLLECTION_ID_GROUPS,
        groupID,
        {
          changeLog: `message/create/${msg.$id}`,
          changerID: message.senderID,
        },
      )
      .catch(() => {});

    return msg as GroupMessageDetails;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteGroupMessage(
  deleterID: string,
  groupID: string,
  message: GroupMessageDetails,
) {
  let attachments = message.attachments;
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
    message.$id,
  );

  api.updateDocument(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_GROUPS, groupID, {
    changeLog: `message/delete/${message.$id}`,
    changerID: `${deleterID}`,
  });
}

export async function getGroupDetails(groupID: string) {
  return (await api.getDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUPS,
    groupID,
  )) as GroupChatDetails;
}

export async function updateGroupDetails(
  groupID: string,
  details: Partial<GroupChatDetails>,
) {
  return (await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUPS,
    groupID,
    details,
  )) as GroupChatDetails;
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
  const messages = await getGroupMessages(groupID);
  let attachments = ([] as string[])
    .concat(...messages.map((message) => message.attachments))
    .filter((attach) => !!attach);

  attachments.forEach((attachment) => {
    api.deleteFile(SERVER.BUCKET_ID_GROUP_ATTACHMENTS, attachment);
  });
}

export async function clearGroupMessages(
  groupID: string,
  clearer?: IUserDetails,
) {
  const messages = (await getGroupMessages(groupID)).filter(
    (msg) => msg.senderID !== "system",
  );

  if (messages.length === 0) return;
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
  clearer &&
    sendSystemMessage(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_GROUP_MESSAGES, {
      body: `${clearer.name} cleared the chat. All messages have been deleted.`,
      groupDoc: groupID,
    });
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

export async function getGroupUnreadMessagesCount(
  groupID: string,
  userID: string,
) {
  let { documents, total } = await api.listDocuments(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUP_MESSAGES,
    [
      Query.orderDesc("$createdAt"),
      Query.equal("groupDoc", groupID),
      Query.select(["read"]),
      Query.equal("read", false),
      Query.notEqual("senderID", userID),
      Query.limit(10),
    ],
  );
  return total;
}

export async function deleteSelectedGroupMessages({
  deleter,
  groupID,
  messages,
}: {
  deleter: string;
  groupID: string;
  messages: GroupMessageDetails[];
}) {
  for (const message of messages) {
    await deleteGroupMessage(deleter, groupID, message);
  }
}

type messageForwardDto = {
  groupDoc: string;
  senderID: string;
  body: string;
};

export async function forwardGroupMessages(
  groupID: string,
  senderID: string,
  messages: messageForwardDto[],
) {
  let prevMessages = await getGroupMessages(groupID);
  await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUPS,
    groupID,
    {
      changeLog: "newtext",
      changerID: senderID,
      groupMessages: [...prevMessages, ...messages],
    },
  );
}

export async function updateGroupMessage(
  messageID: string,
  message: Partial<GroupMessageDetails>,
) {
  await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_GROUP_MESSAGES,
    messageID,
    message,
  );
}

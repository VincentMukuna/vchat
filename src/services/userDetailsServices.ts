import { Models, Query } from "appwrite";
import toast from "react-hot-toast";
import {
  DirectChatDetails,
  GroupChatDetails,
  IUserDetails,
} from "../interfaces";
import { SERVER } from "../utils/config";
import api from "./api";
import { clearChatMessages, getUserChats } from "./chatMessageServices";
import { getUserGroups } from "./groupMessageServices";
import { sendSystemMessage } from "./systemMessageService";
export async function getSession() {
  try {
    let user = await api.getAccount();
    return user;
  } catch (error) {}
}

export async function getUserDetails(detailsDocID: string) {
  let userDoc = (await api.getDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    detailsDocID,
    [Query.select(["$id", "avatarURL", "about", "name", "location"])],
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
    throw error;
  }
}
export async function getUsers(cursor?: string) {
  let querySet = [
    Query.orderAsc("$createdAt"),
    Query.limit(20),
    Query.select(["$id", "avatarURL", "about", "name", "location"]),
  ];
  if (cursor) {
    querySet.push(Query.cursorAfter(cursor));
  }
  const { documents, total } = await api.listDocuments(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    querySet,
  );

  return [documents, total] as [IUserDetails[], number];
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

export const createPersonalChat = async (userDetailsID: string) => {
  let chats = await getUserChats(userDetailsID);
  let chat = chats.find(
    (chat) =>
      chat.participants.length === 1 &&
      chat.participants[0].$id === userDetailsID,
  ) as DirectChatDetails;
  if (chat) return { ...chat, existed: true };
  return (await api.createDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    {
      participants: [userDetailsID],
    },
  )) as DirectChatDetails;
};

export async function addContact(
  adderDetailsID: string,
  addeeDetailsID: string,
): Promise<DirectChatDetails> {
  //check if chat doc exists
  let chats = await getUserChats(adderDetailsID);
  let result: DirectChatDetails | undefined;
  result = chats.find(
    (chat) =>
      chat.participants.length === 2 &&
      chat.participants.some(
        (participant) => participant.$id === addeeDetailsID,
      ),
  );

  if (result) return { ...result, existed: true };
  let doc = await api.createDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    {
      participants: [adderDetailsID, addeeDetailsID],
    },
  );

  let user = doc.participants.find(
    (participant: any) => participant.$id === adderDetailsID,
  );

  sendSystemMessage(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_CHAT_MESSAGES, {
    body: `${user?.name} created this chat. You can now start chatting`,
    chatDoc: doc.$id,
    recepientID: "system",
  });

  api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    addeeDetailsID,
    { changeLog: `conversations/create/${doc.$id}` },
  );

  return doc as DirectChatDetails;
}

export async function deleteContact(chatID: string, contactDetailsID: string) {
  await clearChatMessages(chatID);
  await api.deleteDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    chatID,
  );

  api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    contactDetailsID,
    { changeLog: `conversations/delete/${chatID}` },
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

export async function setOnlineStatus(
  userDetailsID: string,
  isOnline: boolean,
) {
  return (await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    userDetailsID,
    { online: isOnline, lastSeen: new Date(Date.now()) },
  )) as IUserDetails;
}

export async function deleteUser(userID: string) {
  let deleteResponse = await api.executeFunction(SERVER.FUNCTION_ID_FUNCS, {
    action: "delete user",
    params: {
      userID,
    },
  });

  let response = JSON.parse(deleteResponse.responseBody) as {
    ok: boolean;
    message: string;
  };

  return response;
}

export async function searchUsers(name: string) {
  if (name) {
    try {
      const { documents } = await api.listDocuments(
        SERVER.DATABASE_ID,
        SERVER.COLLECTION_ID_USERS,
        [Query.search("name", name), Query.limit(4)],
      );
      return documents as IUserDetails[];
    } catch (error) {
      toast.error("Something went wrong");
      return [];
    }
  } else return [];
}

export async function getConversations(userDetailsID: string) {
  if (!userDetailsID) return [];
  let conversations: (GroupChatDetails | DirectChatDetails)[] = [];

  const res = await Promise.allSettled([
    getUserChats(userDetailsID),
    getUserGroups(userDetailsID),
  ]);

  conversations = ([] as (DirectChatDetails | GroupChatDetails)[]).concat(
    ...(res
      .map((resVal) =>
        resVal.status === "fulfilled" ? resVal.value : undefined,
      )
      .filter((x) => x !== undefined) as (
      | DirectChatDetails
      | GroupChatDetails
    )[][]),
  );
  return conversations;
}

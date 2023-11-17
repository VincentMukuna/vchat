import { AppwriteException, Models, Query } from "appwrite";
import { SERVER } from "../utils/config";
import api from "./api";
import { IChat, IUserDetails } from "../interfaces";
import { clearChatMessages, getUserChats } from "./chatMessageServices";
import toast from "react-hot-toast";
import { mutate } from "swr";
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
    [Query.select(["$id", "avatarURL", "about", "name"])],
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
    Query.select(["$id", "avatarURL", "about", "name"]),
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

export async function addContact(
  adderDetailsID: string,
  addeeDetailsID: string,
): Promise<{ existed: boolean; chat: IChat }> {
  const isPersonal = adderDetailsID === adderDetailsID;
  //check if chat doc exists
  let chats = await getUserChats(adderDetailsID);
  let chatsArray = chats.map((chat, i) => ({
    chatIndex: i,
    participants: chat.participants.map((participant) => participant.$id),
  }));
  for (let chat of chatsArray) {
    if (isPersonal && chat.participants.every((id) => id === addeeDetailsID)) {
      return { existed: true, chat: chats[chat.chatIndex] as IChat };
    } else if (chat.participants.includes(addeeDetailsID)) {
      return { existed: true, chat: chats[chat.chatIndex] as IChat };
    }
  }

  //Only add one chat Id if its a personal chat
  let doc = await api.createDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    {
      participants:
        adderDetailsID === addeeDetailsID
          ? [addeeDetailsID]
          : [adderDetailsID, addeeDetailsID],
    },
  );
  api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    addeeDetailsID,
    { changeLog: "newchat" },
  );

  return { existed: false, chat: doc as IChat };
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
    { changeLog: "deletechat" },
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

  let response = JSON.parse(deleteResponse.response) as {
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

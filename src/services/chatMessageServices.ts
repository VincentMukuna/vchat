import { Query } from "appwrite";
import { IChat, IChatMessage, IUserDetails } from "../interfaces";
import { SERVER } from "../utils/config";
import api from "./api";
import { compareUpdatedAt } from "../features/Chats/ChatsList";
import { compareCreatedAt } from "../features/Room/Room";
type sendMessageProps = {
  senderID: string;
  recepientID: string;
  messageBody: string;
  attachments?: File[];
  read: boolean;
};

export async function sendChatMessage(
  chatID: string,
  sentMessage: sendMessageProps,
) {
  let message = {
    chatDoc: chatID,
    senderID: sentMessage.senderID,
    recepientID: sentMessage.recepientID,
    body: sentMessage.messageBody,
    read: sentMessage.read,
    attachments: sentMessage.attachments,
  };

  try {
    let attachmentIDs: string[] = [];
    if (message.attachments) {
      for await (const attachment of message.attachments) {
        let { $id } = await api.createFile(
          SERVER.BUCKET_ID_CHAT_ATTACHMENTS,
          attachment,
        );
        attachmentIDs.push($id);
      }
    }

    let msg = await api.createDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_CHAT_MESSAGES,
      { ...message, attachments: attachmentIDs },
    );
    //change last message id in chats db
    api.updateDocument(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_CHATS, chatID, {
      changeLog: "newtext",
      changerID: sentMessage.senderID,
    });

    return msg as IChatMessage;
  } catch (error: any) {
    throw error;
  }
}

export async function getChatMessages(chatID: string, cursor?: string) {
  let chatDoc = (await api.getDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    chatID,
  )) as IChat;

  return [
    chatDoc.chatMessages.sort(compareCreatedAt),
    chatDoc.chatMessages.length,
  ] as [IChatMessage[], number];
}

export async function clearChatMessages(chatID: string) {
  let [messages] = await getChatMessages(chatID);
  messages.forEach((message) => {
    if (message.attachments.length > 0) {
      message.attachments.forEach((attachmentID) => {
        api
          .deleteFile(SERVER.BUCKET_ID_CHAT_ATTACHMENTS, attachmentID)
          .catch((e) => {});
      });
    }
  });
  messages.forEach((message) => {
    api
      .deleteDocument(
        SERVER.DATABASE_ID,
        SERVER.COLLECTION_ID_CHAT_MESSAGES,
        message.$id,
      )
      .catch((e) => {});
  });

  api.updateDocument(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_CHATS, chatID, {
    changeLog: "cleared",
  });
}

export async function getChatDoc(chatID: string) {
  try {
    let chatDoc = await api.getDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_CHATS,
      chatID,
    );
    return chatDoc as IChat;
  } catch (error) {
    throw new Error("Error getting chat doc");
  }
}

export async function deleteChatMessage(
  deleterID: string,
  chatID: string,
  message: IChatMessage,
  attachments: string[] = [],
) {
  if (attachments.every((attachment) => typeof attachment === "string")) {
    for (const attachmentID of attachments) {
      api
        .deleteFile(SERVER.BUCKET_ID_CHAT_ATTACHMENTS, attachmentID)
        .catch(() => {});
    }
  }
  await api.deleteDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHAT_MESSAGES,
    message.$id,
  );
  api.updateDocument(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_CHATS, chatID, {
    changeLog: "deletetext",
    changerID: `${deleterID}`,
  });
}

export async function getUserChats(userDetailsID: string) {
  let deets = (await api.getDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_USERS,
    userDetailsID,
  )) as IUserDetails;

  let chatIDs = deets.chats.map((chat) => chat.$id);
  let chats: IChat[] = [];
  if (chatIDs.length > 0) {
    let { documents } = await api.listDocuments(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_CHATS,
      [Query.equal("$id", [...chatIDs])],
    );
    chats = documents as IChat[];
  }

  return chats as IChat[];
}

export async function getChatUnreadMessagesCount(
  chatID: string,
  userID: string,
) {
  let { documents, total } = await api.listDocuments(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHAT_MESSAGES,
    [
      Query.orderDesc("$createdAt"),
      Query.select(["read"]),
      Query.equal("chatDoc", chatID),
      Query.equal("read", false),
      Query.notEqual("senderID", userID),
      Query.limit(10),
    ],
  );
  return total;
}

import { AppwriteException, Query } from "appwrite";
import { IChat, IChatMessage, IUserDetails } from "../interfaces";
import { Server } from "../utils/config";
import api from "./api";
type sendMessageProps = {
  senderID: string;
  recepientID: string;
  messageBody: string;
  attachments?: File[];
};

export async function sendChatMessage(
  chatID: string,
  sentMessage: sendMessageProps,
) {
  let message = {
    chatID,
    senderID: sentMessage.senderID,
    recepientID: sentMessage.recepientID,
    body: sentMessage.messageBody,
    read: false,
    attachments: sentMessage.attachments,
  };

  try {
    await api.createDocument(
      Server.databaseID,
      Server.collectionIDChatMessages,
      message,
    );
    //change last message id in chats db
    await api.updateDocument(
      Server.databaseID,
      Server.collectionIDChats,
      chatID,
      { changeLog: "newtext" },
    );
  } catch (error: any) {
    console.log("Error sending chat message ", error.message);
  }
}
export async function getChatMessages(chatID: string) {
  const { documents } = await api.listDocuments(
    Server.databaseID,
    Server.collectionIDChatMessages,
    [Query.equal("chatID", chatID), Query.orderDesc("$createdAt")],
  );
  return documents as IChatMessage[];
}

export async function getChatMessage(messageID: string) {
  let msgDoc = await api.getDocument(
    Server.databaseID,
    Server.collectionIDChatMessages,
    messageID,
  );
  return msgDoc as IChatMessage;
}
export async function getChats(userDetailsID: string) {
  try {
    let currentUserDetails = (await api.getDocument(
      Server.databaseID,
      Server.collectionIDUsers,
      userDetailsID,
    )) as IUserDetails;
    // Get contact list and chats list using useMemo
    const contactList = new Map<string, string>(
      Object.entries(JSON.parse(currentUserDetails.contacts)),
    );
    const chatsList = Array.from(contactList.values());
    if (chatsList.length === 0) return [];

    let { documents } = await api.listDocuments(
      Server.databaseID,
      Server.collectionIDChats,
      [Query.equal("$id", [...chatsList])],
    );
    return documents as IChat[];
  } catch (error) {
    console.log("Eror fetching chats: ", (error as AppwriteException).message);
    throw error;
  }
}

export async function clearChatMessages(chatID: string) {
  try {
    api.executeFunction(Server.functionIDFuncs, {
      action: "delete contact",
      params: {
        chatID: chatID,
      },
    });
  } catch (error) {
    console.log(
      "Error deleting chat messages",
      (error as AppwriteException).message,
    );
  }
}

export async function getChatDoc(chatID: string) {
  try {
    let chatDoc = await api.getDocument(
      Server.databaseID,
      Server.collectionIDChats,
      chatID,
    );
    return chatDoc as IChat;
  } catch (error) {
    throw new Error("Error getting chat doc");
  }
}

export async function deleteChatMessage(chatID: string, message: IChatMessage) {
  api.deleteDocument(
    Server.databaseID,
    Server.collectionIDChatMessages,
    message.$id,
  );
  api.updateDocument(Server.databaseID, Server.collectionIDChats, chatID, {
    changeLog: "deletetext",
  });
}

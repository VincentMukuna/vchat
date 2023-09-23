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
    chat: chatID,
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
    api.updateDocument(Server.databaseID, Server.collectionIDChats, chatID, {
      changeLog: "newtext",
    });
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

export async function clearChatMessages(chatID: string) {
  let exec = await api.executeFunction(Server.functionIDFuncs, {
    action: "clear chat messages",
    params: {
      chatID: chatID,
    },
  });
  let response = JSON.parse(exec.response);
  if (!response.ok) {
    throw new Error(response.message);
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
  await api.deleteDocument(
    Server.databaseID,
    Server.collectionIDChatMessages,
    message.$id,
  );
  api.updateDocument(Server.databaseID, Server.collectionIDChats, chatID, {
    changeLog: "deletetext",
  });
}

export async function getUserChats(userDetailsID: string) {
  let deets = (await api.getDocument(
    Server.databaseID,
    Server.collectionIDUsers,
    userDetailsID,
  )) as IUserDetails;
  let chats = deets.chats;
  return chats;
}

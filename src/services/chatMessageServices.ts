import { AppwriteException, Query } from "appwrite";
import { IChat, IChatMessage, IUserDetails } from "../interfaces";
import { SERVER } from "../utils/config";
import api from "./api";
import { compareUpdatedAt } from "../features/Chats/Chats";
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
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_CHAT_MESSAGES,
      message,
    );
    //change last message id in chats db
    api.updateDocument(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_CHATS, chatID, {
      changeLog: "newtext",
    });
  } catch (error: any) {
    console.log("Error sending chat message ", error.message);
  }
}
export async function getChatMessages(chatID: string) {
  const chatDoc = await getChatDoc(chatID);
  let chatMessages = chatDoc?.chatMessages;
  if (chatMessages.length > 1) {
    chatMessages.sort((a, b) => {
      if (a.$createdAt < b.$createdAt) {
        return 1;
      } else if (a.$createdAt > b.$createdAt) {
        return -1;
      } else {
        return 0;
      }
    });
  }
  return chatMessages as IChatMessage[];
}

export async function clearChatMessages(chatID: string) {
  let exec = await api.executeFunction(SERVER.FUNCTION_ID_FUNCS, {
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
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_CHATS,
      chatID,
    );
    return chatDoc as IChat;
  } catch (error) {
    throw new Error("Error getting chat doc");
  }
}

export async function deleteChatMessage(chatID: string, message: IChatMessage) {
  await api.deleteDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHAT_MESSAGES,
    message.$id,
  );
  api.updateDocument(SERVER.DATABASE_ID, SERVER.COLLECTION_ID_CHATS, chatID, {
    changeLog: "deletetext",
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

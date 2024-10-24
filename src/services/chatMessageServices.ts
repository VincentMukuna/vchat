import { Query } from "appwrite";
import { SERVER } from "../lib/config";
import { sortByCreatedAtDesc } from "../lib/utils";
import {
  DirectChatDetails,
  DirectMessageDetails,
  IUserDetails,
} from "../types/interfaces";
import api from "./api";
import { sendSystemMessage } from "./systemMessageService";
export type SendMessageDTO = {
  senderID: string;
  recepientID: string;
  body: string;
  attachments?: File[];
  replying?: string | null;
  read: boolean;
};

export async function getChatMessage(messageID: string) {
  const message = await api.getDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHAT_MESSAGES,
    messageID,
  );
  return message as DirectMessageDetails;
}

export async function sendChatMessage(
  chatID: string,
  sentMessage: SendMessageDTO,
) {
  let message = {
    chatDoc: chatID,
    senderID: sentMessage.senderID,
    recepientID: sentMessage.recepientID,
    body: sentMessage.body,
    read: sentMessage.read,
    replying: sentMessage.replying,
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
    await api.updateDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_CHATS,
      chatID,
      {
        changeLog: `message/create/${msg.$id}`,
        changerID: sentMessage.senderID,
      },
    );

    return msg as DirectMessageDetails;
  } catch (error: any) {
    throw error;
  }
}

export async function getChatMessages(chatID: string) {
  let chatDoc = (await api.getDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    chatID,
  )) as DirectChatDetails;

  return chatDoc.chatMessages.toSorted(
    sortByCreatedAtDesc,
  ) as DirectMessageDetails[];
}

export async function clearChatMessages(
  chatID: string,
  clearer?: IUserDetails,
) {
  const messages = (await getChatMessages(chatID)).filter(
    (msg) => msg.senderID !== "system",
  );
  if (messages.length === 0) {
    return;
  }
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

  clearer &&
    (await sendSystemMessage(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_CHAT_MESSAGES,
      {
        body: `${clearer?.name} cleared the chat. All messages have been deleted.`,
        chatDoc: chatID,
        recepientID: "system",
      },
    ));

  await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    chatID,
    {
      changeLog: "message/clearAll",
      changerID: clearer?.$id,
    },
  );
}

export async function getChatDoc(chatID: string) {
  try {
    let chatDoc = await api.getDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_CHATS,
      chatID,
    );
    return chatDoc as DirectChatDetails;
  } catch (error) {
    throw new Error("Error getting chat doc");
  }
}

export async function deleteChatMessage(
  deleterID: string,
  chatID: string,
  message: DirectMessageDetails,
) {
  const attachments = message.attachments;
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
    changeLog: `message/delete/${message.$id}`,
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
  let chats: DirectChatDetails[] = [];
  if (chatIDs.length > 0) {
    let { documents } = await api.listDocuments(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_CHATS,
      [
        Query.equal("$id", [...chatIDs]),
        Query.orderDesc("$updatedAt"),
        Query.limit(100),
      ],
    );
    chats = documents as DirectChatDetails[];
  }
  return chats as DirectChatDetails[];
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

export async function deleteSelectedDirectChatMessages({
  deleter,
  groupID,
  messages,
}: {
  deleter: string;
  groupID: string;
  messages: DirectMessageDetails[];
}) {
  for (const message of messages) {
    await deleteChatMessage(deleter, groupID, message);
  }
}

type messageForwardDto = {
  chatDoc: string;
  senderID: string;
  recepientID: string;
  body: string;
  read: boolean;
};

export async function forwardDirectMessages(
  chatID: string,
  senderID: string,
  messages: messageForwardDto[],
) {
  let prevMessages = await getChatMessages(chatID);
  await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    chatID,
    {
      changeLog: "newtext",
      changerID: senderID,
      chatMessages: [...prevMessages, ...messages],
    },
  );
}

export async function updateDirectMessage(
  messageID: string,
  message: Partial<DirectMessageDetails>,
) {
  await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHAT_MESSAGES,
    messageID,
    message,
  );
}

export async function updateChatDetails(
  chatID: string,
  details: Partial<DirectChatDetails>,
) {
  await api.updateDocument(
    SERVER.DATABASE_ID,
    SERVER.COLLECTION_ID_CHATS,
    chatID,
    details,
  );
}

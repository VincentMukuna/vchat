import { ChatMessage } from "@/interfaces/interfaces";
import api from "./api";
/**
 * function to send system message
 * @param {ChatMessage} message
 */
export async function sendSystemMessage(
  databaseId: string,
  collectionId: string,
  message: any,
) {
  await api.createDocument(databaseId, collectionId, {
    ...message,
    senderID: "system",
    read: true,
  });
}

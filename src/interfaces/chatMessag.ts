import { Models } from "appwrite";

export default interface IChatMessage extends Models.Document {
  chatID: string;
  senderID: string;
  recepientID: string;
  body: string;
  read: boolean;
  attachments: string[];
}

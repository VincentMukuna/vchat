import { Models } from "appwrite";
import IChat from "./chat";

export default interface IChatMessage extends Models.Document {
  chat: IChat | string;
  senderID: string;
  recepientID: string;
  body: string;
  read: boolean;
  attachments: string[];
}

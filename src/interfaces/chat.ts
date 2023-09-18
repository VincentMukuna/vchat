import { Models } from "appwrite";

export default interface IChat extends Models.Document {
  lastMessageID: string;
  participants: [string, string];
  changeLog?:
    | "newtext"
    | "deletetext"
    | "edittext"
    | "clearmessages"
    | "created";
}

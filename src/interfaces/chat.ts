import { Models } from "appwrite";
import IChatMessage from "./chatMessage";
import IUserDetails from "./userDetails";

export default interface IChat extends Models.Document {
  chatMessages: IChatMessage[];
  participants: [IUserDetails, IUserDetails] | [IUserDetails];
  changeLog?: "newtext" | "deletetext" | "edittext" | "cleared" | "created";
}

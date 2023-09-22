import { Models } from "appwrite";
import { IChat, IGroup, IUserPrefs } from ".";
type changeLogTypes =
  | "newchat"
  | "deletechat"
  | "newgroup"
  | "removegroup"
  | "editdetails";
export default interface IUserDetails extends Models.Document {
  name: string;
  userID: string;
  avatarID: string | null;
  about: string;
  location: string;
  avatarURL: any;
  status: "Online" | "Offline" | "Typing";
  lastSeen: string;
  statusUpdates: string;
  prefs: IUserPrefs;
  email: string;
  groups: IGroup[];
  chats: IChat[];
  changeLog: changeLogTypes;
}

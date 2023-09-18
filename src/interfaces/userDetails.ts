import { Models } from "appwrite";
import { IUserPrefs } from ".";
type changeLogTypes =
  | "addcontact"
  | "deletecontact"
  | "addgroup"
  | "removegroup"
  | "editdetails";
export default interface IUserDetails extends Models.Document {
  name: string;
  userID: string;
  avatarID: string | null;
  about: string;
  contacts: string;
  groups: string;
  avatarURL: any;
  status: "Online" | "Offline" | "Typing";
  lastSeen: string;
  statusUpdates: string;
  prefs: IUserPrefs;
  email: string;
  changeLog: changeLogTypes;
}

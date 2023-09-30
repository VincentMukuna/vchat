import IUserDetails from "./userDetails";
import IChatMessage from "./chatMessage";
import IChat from "./chat";
import { Models } from "appwrite";
type IContactList = Map<string, string>;

type changeLogTypes =
  | "addmember"
  | "addadmin"
  | "newtext"
  | "removeadmin"
  | "removemember"
  | "changedetails"
  | "editavatar"
  | "edittext"
  | "deletetext"
  | "created";
interface IGroup extends Models.Document {
  name: string;
  description: string;
  avatarID: string | null;
  avatarURL: any;
  admins: string[];
  members: (IUserDetails | string)[];
  groupMessages: IChatMessage[];
  changeLog: changeLogTypes;
}
interface IGroupMessage extends Models.Document {
  group: [IGroup] | string;
  senderID: string;
  body: string;
  attachments: string[];
}
interface IUserPrefs extends Models.Preferences {
  detailsDocID: string;
}
export type {
  IUserDetails,
  IChatMessage,
  IChat,
  IContactList,
  IGroup,
  IGroupMessage,
  IUserPrefs,
};

import IUserDetails from "./userDetails";
import IChatMessage from "./chatMessag";
import IChat from "./chat";
import { Models } from "appwrite";
type IContactList = Map<string, string>;

type changeLogTypes =
  | "addmember"
  | "makeadmin"
  | "unmakeadmin"
  | "removemember"
  | "editname"
  | "editdescription"
  | "editavatar"
  | "edittext"
  | "deletetext"
  | "created";
interface IGroup extends Models.Document {
  groupName: string;
  description: string;
  groupAvatarID: string | null;
  groupAvtarURL: any;
  admins: string;
  groupMembers: string;
  changeLog: changeLogTypes;
}
interface IGroupMessage extends Models.Document {
  groupID: string;
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

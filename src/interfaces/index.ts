import { Models } from "appwrite";

type groupChangeLogTypes =
  | "addmember"
  | "addadmin"
  | "newtext"
  | "removeadmin"
  | "editmembers"
  | "changedetails"
  | "editavatar"
  | "edittext"
  | "deletetext"
  | "created"
  | "readtext"
  | "clearmessages";
interface IGroup extends Models.Document {
  name: string;
  description: string;
  avatarID: string | null;
  avatarURL: any;
  admins: string[];
  members: (IUserDetails | string)[];
  groupMessages: IGroupMessage[];
  changeLog: groupChangeLogTypes;
}
interface IGroupMessage extends Models.Document {
  groupDoc: [IGroup] | string;
  senderID: string;
  body: string;
  attachments: string[];
  read: boolean;
}
interface IUserPrefs extends Models.Preferences {
  detailsDocID: string;
}

interface IChat extends Models.Document {
  chatMessages: IChatMessage[];
  participants: [IUserDetails, IUserDetails] | [IUserDetails];
  changeLog?:
    | "newtext"
    | "deletetext"
    | "edittext"
    | "cleared"
    | "created"
    | "readtext";
}

interface IChatMessage extends Models.Document {
  chatDoc: IChat | string;
  senderID: string;
  recepientID: string;
  body: string;
  read: boolean;
  attachments: string[];
}

type userChangeLogTypes =
  | "newchat"
  | "deletechat"
  | "newgroup"
  | "removegroup"
  | "editdetails";
interface IUserDetails extends Models.Document {
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
  changeLog: userChangeLogTypes;
  online: boolean;
}
export type {
  IUserDetails,
  IChatMessage,
  IChat,
  IGroup,
  IGroupMessage,
  IUserPrefs,
};

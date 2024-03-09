import { Models } from "appwrite";

type GroupChangeLogTypes =
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
interface GroupChatDetails extends Models.Document {
  name: string;
  description: string;
  avatarID: string | null;
  avatarURL: any;
  admins: string[];
  members: (IUserDetails | string)[];
  groupMessages: GroupMessageDetails[];
  changeLog: GroupChangeLogTypes;
}
interface GroupMessageDetails extends Models.Document {
  groupDoc: [GroupChatDetails] | string;
  senderID: string;
  body: string;
  attachments: string[];
  read: boolean;
  replying: string | null;
}
interface UserPrefs extends Models.Preferences {
  detailsDocID: string;
}

interface DirectChatDetails extends Models.Document {
  chatMessages: DirectMessageDetails[];
  participants: [IUserDetails, IUserDetails] | [IUserDetails];
  changeLog?:
    | "newtext"
    | "deletetext"
    | "edittext"
    | "cleared"
    | "created"
    | "readtext";
}

interface DirectMessageDetails extends Models.Document {
  chatDoc: DirectChatDetails | string;
  senderID: string;
  recepientID: string;
  body: string;
  read: boolean;
  attachments: string[];
  replying: string | null;
}

type UserChangeLogTypes =
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
  prefs: UserPrefs;
  email: string;
  groups: GroupChatDetails[];
  chats: DirectChatDetails[];
  changeLog: UserChangeLogTypes;
  online: boolean;
}

type ChatMessage = DirectMessageDetails | GroupMessageDetails;
export type {
  ChatMessage,
  DirectChatDetails,
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
  IUserDetails,
  UserPrefs,
};

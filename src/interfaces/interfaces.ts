import { Models } from "appwrite";

export const CHAT_MESSAGES_CHANGE_LOG_REGEXES = {
  deleteMessage: /message\/delete\/([a-zA-Z0-9_-]+)/,
  newMessage: /message\/create\/([a-zA-Z0-9_-]+)/,
  editMessage: /message\/edit\/([a-zA-Z0-9_-]+)/,
  readMessage: /message\/read\/([a-zA-Z0-9_-]+)/,
  clearMessages: /message\/clearAll/,
  likeMessage: /message\/like\/([a-zA-Z0-9_-]+)/,
  unlikeMessage: /message\/unlike\/([a-zA-Z0-9_-]+)/,
} as const;

export const USER_DETAILS_CHANGE_LOG_REGEXES = {
  deleteConversation: /conversations\/delete\/([a-zA-Z0-9_-]+)/,
  createConversation: /conversations\/create\/([a-zA-Z0-9_-]+)/,
  editConversation: /conversations\/edit\/([a-zA-Z0-9_-]+)/,
} as const;

export const CHAT_DETAILS_CHANGE_LOG_REGEXES = {} as const;
export interface GroupChatDetails extends Models.Document {
  name: string;
  description: string;
  avatarID: string | null;
  avatarURL: any;
  admins: string[];
  members: (IUserDetails | string)[];
  groupMessages: GroupMessageDetails[];
  changeLog: string;
  changerID: string;
}
export interface GroupMessageDetails extends Models.Document {
  groupDoc: GroupChatDetails | string;
  senderID: string;
  body: string;
  attachments: string[];
  read: boolean;
  replying: string | null;
  reactions: string | null;
  editedAt: string | null;
}
export interface UserPrefs extends Models.Preferences {
  detailsDocID: string;
}

export interface DirectChatDetails extends Models.Document {
  chatMessages: DirectMessageDetails[];
  participants: [IUserDetails, IUserDetails] | [IUserDetails];
  changeLog?: string;
  changerID: string;
}

export interface DirectMessageDetails extends Models.Document {
  chatDoc: DirectChatDetails | string;
  senderID: string;
  recepientID: string;
  body: string;
  read: boolean;
  attachments: string[];
  replying: string | null;
  reactions: string | null;
  editedAt: string | null;
}

export interface IUserDetails extends Models.Document {
  name: string;
  userID: string;
  avatarID: string | null;
  about: string;
  location: string;
  avatarURL: any;
  status: "Online" | "Offline" | "Typing";
  lastOnlineAt: string;
  statusUpdates: string;
  prefs: UserPrefs;
  email: string;
  groups: GroupChatDetails[];
  chats: DirectChatDetails[];
  changeLog: string;
  online: boolean;
}

export type ChatMessage = DirectMessageDetails | GroupMessageDetails;
export type IConversation = DirectChatDetails | GroupChatDetails;

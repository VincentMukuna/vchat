import {
  Client as Appwrite,
  Databases,
  Account,
  ID,
  Storage,
  RealtimeResponseEvent,
  Models,
  Functions,
} from "appwrite";
import { Server } from "../utils/config";
import { IUserPrefs } from "../interfaces";
let api = {
  sdk: null as null | {
    appwrite: Appwrite;
    database: Databases;
    account: Account;
    storage: Storage;
    func: Functions;
  },

  provider: () => {
    if (api.sdk) {
      return api.sdk;
    }

    let appwrite = new Appwrite();
    appwrite.setEndpoint(Server.endpoint).setProject(Server.projectID);
    const account = new Account(appwrite);
    const database = new Databases(appwrite);
    const storage = new Storage(appwrite);
    const func = new Functions(appwrite);

    api.sdk = { appwrite, database, account, storage, func };
    return api.sdk;
  },

  //Account
  //Create a new account
  createAccount: (email: string, password: string, name?: string) => {
    return api.provider().account.create(ID.unique(), email, password, name);
  },

  handleOauth(provider: string = "google") {
    return api
      .provider()
      .account.createOAuth2Session(
        provider,
        "http://localhost:5173/login",
        "http://localhost:5173/register",
        ["profile"],
      );
  },

  //Session control
  createSession: (email: string, password: string) => {
    return api.provider().account.createEmailSession(email, password);
  },
  //Get logged in user data
  getAccount: () => {
    return api.provider().account.get();
  },
  getPrefs: () => {
    return api.provider().account.getPrefs<IUserPrefs>();
  },
  updatePrefs: (prefs: Partial<IUserPrefs>) => {
    return api.provider().account.updatePrefs(prefs);
  },

  deleteCurrentSession: () => {
    return api.provider().account.deleteSession("current");
  },

  //Document access
  createDocument: (
    databaseId: string,
    collectionId: string,
    data: Record<string, unknown>,
    permissions?: string[],
  ) => {
    return api
      .provider()
      .database.createDocument(
        databaseId,
        collectionId,
        "unique()",
        data,
        permissions,
      );
  },
  //
  getDocument: (
    databaseId: string,
    collectionId: string,
    documentId: string,
  ) => {
    return api
      .provider()
      .database.getDocument(databaseId, collectionId, documentId);
  },
  //
  listDocuments(databaseId: string, collectionId: string, queries?: string[]) {
    return api
      .provider()
      .database.listDocuments(databaseId, collectionId, queries);
  },

  updateDocument: (
    databaseId: string,
    collectionId: string,
    documentId: string,
    data?: Record<string, unknown>,
    permissions?: string[],
  ) => {
    return api
      .provider()
      .database.updateDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions,
      );
  },
  //Remove Doc from collection
  deleteDocument: (
    databaseId: string,
    collectionId: string,
    documentId: string,
  ) => {
    return api
      .provider()
      .database.deleteDocument(databaseId, collectionId, documentId);
  },

  //File methods
  createFile: (bucketID: string, file: File, permissions?: string[]) => {
    return api
      .provider()
      .storage.createFile(bucketID, ID.unique(), file, permissions);
  },
  getFile: (bucketID: string, fileID: string) => {
    return api.provider().storage.getFileView(bucketID, fileID);
  },
  downloadFile: (bucketID: string, fileID: string) => {
    return api.provider().storage.getFileDownload(bucketID, fileID);
  },
  deleteFile: (bucketID: string, fileID: string) => {
    return api.provider().storage.deleteFile(bucketID, fileID);
  },

  //Subscribe to collection changes
  subscribe<T>(
    channels: string | string[],
    callBack: (payload: RealtimeResponseEvent<T>) => void,
  ) {
    return api
      .provider()
      .appwrite.subscribe(channels, (response: RealtimeResponseEvent<T>) =>
        callBack(response),
      );
  },

  //execute function
  executeFunction: (
    functionID: string,
    data: {
      action:
        | "add contact"
        | "delete contact"
        | "send chat message"
        | "clear chat messages"
        | "add to global chat"
        | "delete user";
      params: { [param: string]: string };
    },
  ) => {
    return api
      .provider()
      .func.createExecution(functionID, JSON.stringify(data));
  },
};

export default api;

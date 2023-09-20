import { AppwriteException } from "appwrite";
import { IUserDetails } from "../interfaces";
import { Server } from "../utils/config";
import api from "./api";

export async function logUserIn(credentials?: {
  email: string;
  password: string;
}) {
  try {
    //check if there is a session
    try {
      let user = await api.getAccount();
      let userDetails = (await api.getDocument(
        Server.databaseID,
        Server.collectionIDUsers,
        user.prefs.detailsDocID,
      )) as IUserDetails;
      return { user, userDetails };
    } catch (error) {}
    //If there's no session create one
    if (!credentials) {
      throw new Error("No credentials");
    }
    await api.createSession(credentials.email, credentials.password);
    let user = await api.getAccount();
    console.log(`USER ${user.$id} logged in`);
    let userDetails = (await api.getDocument(
      Server.databaseID,
      Server.collectionIDUsers,
      user.prefs.detailsDocID,
    )) as IUserDetails;
    return { user, userDetails };
  } catch (error) {
    console.log("LOGIN error");
    throw new Error((error as AppwriteException)?.message);
  }
}
export async function logUserOut() {
  await api.deleteCurrentSession();
}

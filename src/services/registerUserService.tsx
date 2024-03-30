import DataLoss from "@/components/DataLoss";
import { modal } from "@/components/VModal";
import { Models } from "appwrite";
import { IUserDetails } from "../interfaces/interfaces";
import { SERVER } from "../utils/config";
import api from "./api";
import { sendSystemMessage } from "./systemMessageService";

export async function createDetailsDoc(user: Models.User<Models.Preferences>) {
  let userDeets: IUserDetails;
  //user already has a detail doc we return it
  if (user.prefs.detailsDocID) {
    try {
      userDeets = (await api.getDocument(
        SERVER.DATABASE_ID,
        SERVER.COLLECTION_ID_USERS,
        user.prefs.detailsDocID,
      )) as IUserDetails;
      return userDeets;
    } catch (error) {
      modal(<DataLoss />, {
        size: "md",
        isCentered: true,
        scrollBehavior: "inside",
      });
    }
  }
  //New user
  try {
    userDeets = (await api.createDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_USERS,
      {
        userID: user.$id,
        name: user.name,
      },
    )) as IUserDetails;
    api.updatePrefs({ detailsDocID: userDeets.$id });
    addUserToGlobalChat(userDeets.$id);
    return userDeets;
  } catch (error) {
    throw new Error("Error setting up");
  }
}

export async function addUserToGlobalChat(userDetailsID: string) {
  try {
    api
      .updateDocument(
        SERVER.DATABASE_ID,
        SERVER.COLLECTION_ID_USERS,
        userDetailsID,
        { groups: [SERVER.DOCUMENT_ID_GLOBAL_CHAT] },
      )
      .then((val) => {
        sendSystemMessage(
          SERVER.DATABASE_ID,
          SERVER.COLLECTION_ID_GROUP_MESSAGES,
          {
            groupDoc: SERVER.DOCUMENT_ID_GLOBAL_CHAT,
            body: `${val.name || "New User"} joined the chat`,
          },
        );
        return val;
      });
  } catch (error) {
    throw new Error("Error adding user to global chat...");
  }
}
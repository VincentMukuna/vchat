import DataLoss from "@/components/DataLoss";
import { modal } from "@/components/VModal";
import { Models } from "appwrite";
import { SERVER } from "../lib/config";
import { IUserDetails } from "../types/interfaces";
import api from "./api";

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
        name: user.name || user.email.split("@")[0],
      },
    )) as IUserDetails;
    api.updatePrefs({ detailsDocID: userDeets.$id });

    return userDeets;
  } catch (error) {
    throw new Error("Error setting up");
  }
}

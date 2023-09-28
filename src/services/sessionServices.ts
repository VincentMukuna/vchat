import { AppwriteException, Models } from "appwrite";
import { IUserDetails, IUserPrefs } from "../interfaces";
import { Server } from "../utils/config";
import api from "./api";
import { createDetailsDoc } from "./registerUserService";

export async function logUserIn(provider?: string) {
  let userDetails: IUserDetails;
  let user: Models.User<Models.Preferences>;

  try {
    //check if there is a session
    user = await api.getAccount();
    if (user) {
      userDetails = await createDetailsDoc(user);
    } else {
      //If there's no session create one
      api.handleOauth(provider);
      user = await api.getAccount();
      userDetails = await createDetailsDoc(user);
    }
    return { user, userDetails };
  } catch (error) {
    throw new Error("No account");
  }
}

export async function logUserOut() {
  await api.deleteCurrentSession();
}

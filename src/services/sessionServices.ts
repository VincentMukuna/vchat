import { AppwriteException, Models } from "appwrite";
import { IUserDetails, IUserPrefs } from "../interfaces";
import { SERVER } from "../utils/config";
import api from "./api";
import { createDetailsDoc } from "./registerUserService";

export async function logUserIn(provider?: string) {
  let userDetails: IUserDetails;
  let user: Models.User<Models.Preferences>;

  try {
    //check if there is a session
    user = await api.getAccount();
    console.log(user);
    if (user) {
      userDetails = await createDetailsDoc(user);
      return { user, userDetails };
    } else if (provider) {
      //If there's no session create one
      api.handleOauth(provider);
      user = await api.getAccount();
      userDetails = await createDetailsDoc(user);
      return { user, userDetails };
    }
    throw new Error("No account");
  } catch (error) {
    throw new Error("No account");
  }
}

export async function logUserOut() {
  await api.deleteCurrentSession();
}

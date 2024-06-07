import { Models } from "appwrite";
import { IUserDetails } from "../types/interfaces";
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

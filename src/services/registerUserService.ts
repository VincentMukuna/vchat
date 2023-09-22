import { AppwriteException, Models, Permission, Role } from "appwrite";
import { Server } from "../utils/config";
import api from "./api";
import { IUserDetails } from "../interfaces";

async function createDetailsFile(user: Models.User<Models.Preferences>) {
  //create details file
  let userDeets = (await api.createDocument(
    Server.databaseID,
    Server.collectionIDUsers,
    {
      userID: user.$id,
      name: user.name,
    },
  )) as IUserDetails;
  await api.updatePrefs({ detailsDocID: userDeets.id });
  return userDeets;
}
export async function addUserToGlobalChat(userDetailsID: string) {
  console.log("Adding to global chat...");
  console.time("globalchat");
  try {
    return (await api.updateDocument(
      Server.databaseID,
      Server.collectionIDUsers,
      userDetailsID,
      { groups: [Server.documentIDGlobalChat] },
    )) as IUserDetails;
  } catch (error) {
    throw new Error("Error adding user to global chat...");
  }
}

type registerProps = {
  email: string;
  password: string;
  name: string;
};

export async function registerNewUser({
  email,
  password,
  name,
}: registerProps) {
  let user: Models.User<Models.Preferences> | null = null;
  let userDeets: IUserDetails | null = null;
  try {
    console.log("Creating account...");
    user = await api.createAccount(email, password, name);
    console.log("Creating session... ");
    await api.createSession(email, password);
    try {
      console.log("Creating details file...");
      userDeets = await createDetailsFile(user);
      console.log("Updating preferences...");
      user = await api.updatePrefs({ detailsDocID: userDeets.$id });
      console.log(`Adding to global chat...`);
      userDeets = await addUserToGlobalChat(userDeets.$id);
    } catch (error) {
      console.log(
        "Error creating details file: ",
        (error as AppwriteException).message,
      );
      throw new Error((error as AppwriteException).message);
    }
    return { user, userDeets };
  } catch (error) {
    console.log("Error setting up account.");
    if (user) {
      console.log("Deleting account...");
      let deleteResponse = await api.executeFunction(Server.functionIDFuncs, {
        action: "delete user",
        params: {
          userID: user.$id,
        },
      });
    }
    throw error;
  }
}

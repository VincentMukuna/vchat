import { AppwriteException, Models, Permission, Query, Role } from "appwrite";
import { Server } from "../utils/config";
import api from "./api";
import { IUserDetails } from "../interfaces";
import { deleteUser } from "./userDetailsServices";

export async function createDetailsDoc(user: Models.User<Models.Preferences>) {
  console.log(user);
  let userDeets: IUserDetails;
  //user already has a detail doc we return it
  if (user.prefs.detailsDocID) {
    console.log("Prefs set, Getting details doc");
    userDeets = (await api.getDocument(
      Server.databaseID,
      Server.collectionIDUsers,
      user.prefs.detailsDocID,
    )) as IUserDetails;
    return userDeets;
  } else {
    //Search the db for such a document
    console.log("Searching db");
    let { documents } = await api.listDocuments(
      Server.databaseID,
      Server.collectionIDUsers,
      [Query.search("userID", user.$id), Query.limit(1)],
    );
    //If such a doc exists
    if (documents[0]) {
      console.log("User has a details doc");
      userDeets = documents[0] as IUserDetails;
      api.updatePrefs({ detailsDocID: userDeets.$id });
      return userDeets;
    }
    //New user
    console.log("New user, creating details doc");
    try {
      userDeets = (await api.createDocument(
        Server.databaseID,
        Server.collectionIDUsers,
        {
          userID: user.$id,
          name: user.name,
        },
      )) as IUserDetails;

      api.updatePrefs({ detailsDocID: userDeets.$id });
      addUserToGlobalChat(userDeets.$id);
      return userDeets;
    } catch (error) {
      console.log("Error setting up, ");
      await deleteUser(user.$id);
      throw new Error("Error setting up");
    }
  }
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

// export async function registerNewUser() {
//   let user: Models.User<Models.Preferences> | null = null;
//   let userDeets: IUserDetails | null = null;
//   try {
//     console.log("Creating account...");
//     api.handleOauth()
//     console.log("Creating session... ");
//     await api.createSession(email, password);
//     try {
//       console.log("Creating details file...");
//       userDeets = await createDetailsFile(user);
//       console.log("Updating preferences...");
//       user = await api.updatePrefs({ detailsDocID: userDeets.$id });
//       console.log(`Adding to global chat...`);
//       userDeets = await addUserToGlobalChat(userDeets.$id);
//     } catch (error) {
//       console.log(
//         "Error creating details file: ",
//         (error as AppwriteException).message,
//       );
//       throw new Error((error as AppwriteException).message);
//     }
//     return { user, userDeets };
//   } catch (error) {
//     console.log("Error setting up account.");
//     if (user) {
//       console.log("Deleting account...");
//       deleteUser(user.$id);
//     }
//     throw error;
//   }
// }

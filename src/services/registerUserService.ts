import { AppwriteException, Models, Permission, Query, Role } from "appwrite";
import { SERVER } from "../utils/config";
import api from "./api";
import { IUserDetails } from "../interfaces";
import { deleteUser } from "./userDetailsServices";

export async function createDetailsDoc(user: Models.User<Models.Preferences>) {
  let userDeets: IUserDetails;
  //user already has a detail doc we return it
  if (user.prefs.detailsDocID) {
    userDeets = (await api.getDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_USERS,
      user.prefs.detailsDocID,
    )) as IUserDetails;
    return userDeets;
  } else {
    //Search the db for such a document
    let { documents } = await api.listDocuments(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_USERS,
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
    try {
      userDeets = (await api.createDocument(
        SERVER.DATABASE_ID,
        SERVER.COLLECTION_ID_USERS,
        {
          userID: user.$id,
          name: user.name,
        },
      )) as IUserDetails;

      await api.updatePrefs({ detailsDocID: userDeets.$id });
      addUserToGlobalChat(userDeets.$id);
      return userDeets;
    } catch (error) {
      await deleteUser(user.$id);
      throw new Error("Error setting up");
    }
  }
}
export async function addUserToGlobalChat(userDetailsID: string) {
  try {
    return (await api.updateDocument(
      SERVER.DATABASE_ID,
      SERVER.COLLECTION_ID_USERS,
      userDetailsID,
      { groups: [SERVER.DOCUMENT_ID_GLOBAL_CHAT] },
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

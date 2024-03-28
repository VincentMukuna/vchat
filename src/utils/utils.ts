import {
  Conversation,
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
} from "@/interfaces";
import { Models } from "appwrite";
import { SERVER } from "./config";

export function sortDocumentsByUpdateAtDesc(
  a: Models.Document,
  b: Models.Document,
) {
  const dateA = new Date(a.$updatedAt);
  const dateB = new Date(b.$updatedAt);

  if (dateA < dateB) {
    return 1; // Sort b before a
  } else if (dateA > dateB) {
    return -1; // Sort a before b
  } else {
    return 0; // Dates are equal
  }
}

export function sortDocumentsByCreationDateDesc(
  a: Models.Document,
  b: Models.Document,
) {
  const dateA = new Date(a.$createdAt);
  const dateB = new Date(b.$createdAt);

  if (dateA < dateB) {
    return 1;
  } else if (dateA > dateB) {
    return -1;
  } else {
    return 0;
  }
}

//function to pluck properties from an object given a comma-separated string
export function pluck(obj: any, keys: string) {
  return keys.split(",").reduce((acc, key) => {
    acc[key.trim()] = obj[key.trim()];
    return acc;
  }, {} as any);
}

//function to find an object in an array
//of objects by id
export function findById(arr: any[], id: string, idKey: string = "$id") {
  return arr.find((item) => item[idKey] === id);
}

//function to find an object in an array
//of objects by id and update it with new data
export function findAndUpdate(
  arr: any[],
  id: string,
  data: any,
  idKey: string = "$id",
) {
  return arr.map((item) => {
    if (item[idKey] === id) {
      return { ...item, ...data };
    }
    return item;
  });
}

//a function to match a given string with
//regexps in a map which has regexps as keys
//and their corresponding callbacks as values
//this callbacks should receive arrays of matches

export function matchAndExecute(
  input: string,
  matchers: Map<RegExp, (matches: RegExpMatchArray) => any>,
) {
  for (let [matcher, callback] of matchers) {
    let matches = input.match(matcher);
    if (matches) {
      return callback(matches);
    }
  }
  return null;
}

export const getUnreadCount = (conversation: Conversation, userId: string) => {
  if (conversation.$collectionId === SERVER.COLLECTION_ID_GROUPS) {
    return conversation.groupMessages.filter(
      (m: GroupMessageDetails) => m.senderID !== userId && m.read === false,
    ).length;
  } else {
    return conversation.chatMessages.filter(
      (m: DirectMessageDetails) => m.senderID !== userId && m.read === false,
    ).length;
  }
};

export function isGroup(
  conversation: Conversation,
): conversation is GroupChatDetails {
  return conversation.$collectionId === SERVER.COLLECTION_ID_GROUPS;
}

//utilities to read to and from json
export const fromJson = (json: string) => {
  return JSON.parse(json);
};

export const toJson = (obj: any) => {
  return JSON.stringify(obj);
};

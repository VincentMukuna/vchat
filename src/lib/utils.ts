import {
  DirectMessageDetails,
  GroupChatDetails,
  GroupMessageDetails,
  IConversation,
} from "@/types/interfaces";
import { Models } from "appwrite";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SERVER } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortByUpdateAtDesc(a: Models.Document, b: Models.Document) {
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

export function sortByCreatedAtDesc(a: Models.Document, b: Models.Document) {
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

export function sortByCreatedAtAsc(a: Models.Document, b: Models.Document) {
  const dateA = new Date(a.$createdAt);
  const dateB = new Date(b.$createdAt);

  if (dateA > dateB) {
    return 1;
  } else if (dateA < dateB) {
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
  if (!input) return;
  for (let [matcher, callback] of matchers) {
    let matches = input.match(matcher);
    if (matches) {
      return callback(matches);
    }
  }
  return null;
}

export const getUnreadCount = (conversation: IConversation, userId: string) => {
  if (conversation.$collectionId === SERVER.COLLECTION_ID_GROUPS) {
    return conversation.groupMessages?.filter(
      (m: GroupMessageDetails) => m.senderID !== userId && m.read === false,
    ).length;
  } else {
    return conversation.chatMessages?.filter(
      (m: DirectMessageDetails) => m.senderID !== userId && m.read === false,
    ).length;
  }
};

export function isGroup(
  conversation: IConversation,
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

export const groupDocumentsByDate = <T extends Models.Document>(
  messages: T[],
) => {
  return messages.reduce(
    (acc, message) => {
      const date = new Date(message.$createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date]!.push(message);
      return acc;
    },
    {} as { [key: string]: T[] },
  );
};

export function removeDuplicates<T>(arr: Array<T>): Array<T> {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function insertCharacter(str: string, char: string, position: number) {
  return str.slice(0, position) + char + str.slice(position);
}

function fallbackCopyTextToClipboard(text: string) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
  } catch (err) {}

  document.body.removeChild(textArea);
}
export async function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  await navigator.clipboard.writeText(text);
}

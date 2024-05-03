import { useAuth } from "@/context/AuthContext";
import { useChatsContext } from "@/context/ChatsContext";
import {
  IUserDetails,
  USER_DETAILS_CHANGE_LOG_REGEXES,
} from "@/interfaces/interfaces";
import api from "@/services/api";
import { getChatDoc } from "@/services/chatMessageServices";
import { SERVER } from "@/utils/config";
import { matchAndExecute } from "@/utils/utils";
import { differenceInHours } from "date-fns";
import { useEffect } from "react";

const useUserChatsSubscription = () => {
  const { currentUser, currentUserDetails } = useAuth();
  const { addConversation, deleteConversation } = useChatsContext();
  if (!currentUser || !currentUserDetails) return null;
  useEffect(() => {
    const unsubscribe = api.subscribe<IUserDetails>(
      `databases.${SERVER.DATABASE_ID}.collections.${SERVER.COLLECTION_ID_USERS}.documents.${currentUserDetails.$id}`,
      (response) => {
        if (
          response.payload.changerID === currentUserDetails?.$id ||
          !response.payload.changeLog
        )
          return;
        const changeLog = response.payload.changeLog;
        const conversations = [
          ...response.payload.groups,
          ...response.payload.chats,
        ];

        const matchers = new Map();

        const handleNewConversation = async (id: string) => {
          const newConversation = conversations.find(
            (convo) => convo.$id === id,
          );
          if (!newConversation) return;
          if (newConversation?.$collectionId === SERVER.COLLECTION_ID_CHATS) {
            let chatDoc = await getChatDoc(newConversation.$id);
            const updatedAt = new Date(chatDoc.$createdAt);
            const hrsDifference = differenceInHours(new Date(), updatedAt);
            if (hrsDifference > 1) {
              return;
            }
            addConversation(chatDoc);
          } else {
            newConversation && addConversation(newConversation);
          }
        };

        const handleDeletedConversation = (id: string) => {
          deleteConversation(id);
        };

        matchers.set(
          USER_DETAILS_CHANGE_LOG_REGEXES.createConversation,
          (matches: string[]) => {
            handleNewConversation(matches.at(1)!);
          },
        );

        matchers.set(
          USER_DETAILS_CHANGE_LOG_REGEXES.deleteConversation,
          (matches: string[]) => {
            handleDeletedConversation(matches.at(1)!);
          },
        );

        matchAndExecute(changeLog, matchers);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserDetails, currentUser]);
};

export default useUserChatsSubscription;

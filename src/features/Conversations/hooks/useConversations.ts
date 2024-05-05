import { useAuth } from "@/context/AuthContext";
import { DirectChatDetails, GroupChatDetails } from "@/interfaces/interfaces";
import {
  getConversations,
  sortConversations,
} from "@/services/userDetailsService";
import { isGroup } from "@/utils/utils";
import useSWR from "swr";
import useLocalStorage from "../../../utils/hooks/useLocalStorage";

export default function useConversations() {
  const { currentUserDetails } = useAuth();

  const [cachedChats, setCachedChats] = useLocalStorage<
    (GroupChatDetails | DirectChatDetails)[]
  >(
    () => {
      if (!currentUserDetails) return undefined;
      return `vchat/${currentUserDetails?.$id}/conversations`;
    },
    currentUserDetails?.groups || [],
  );

  const swrRes = useSWR(
    () => (currentUserDetails ? "conversations" : null),
    () => (currentUserDetails ? getConversations(currentUserDetails.$id) : []),
    {
      fallbackData: sortConversations(
        cachedChats
          .filter((c) => !isGroup(c))
          .concat(currentUserDetails?.groups || []) || [],
      ),

      onSuccess(data) {
        setCachedChats(data);
      },
    },
  );

  return swrRes;
}

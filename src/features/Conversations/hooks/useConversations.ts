import { useAuth } from "@/context/AuthContext";
import { isGroup } from "@/lib/utils";
import {
  getConversations,
  sortConversations,
} from "@/services/userDetailsService";
import { DirectChatDetails, GroupChatDetails } from "@/types/interfaces";
import useSWR from "swr";
import useLocalStorage from "../../../lib/hooks/useLocalStorage";

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

import { useAuth } from "@/context/AuthContext";
import { DirectChatDetails, GroupChatDetails } from "@/interfaces";
import { getConversations } from "@/services/userDetailsServices";
import useSWR from "swr";
import useLocalStorage from "../useLocalStorage";

export default function useConversations() {
  const { currentUserDetails } = useAuth();

  const [cachedChats, setCachedChats] = useLocalStorage<
    (GroupChatDetails | DirectChatDetails)[]
  >("conversations", currentUserDetails?.groups || []);

  return useSWR(
    "conversations",
    () => getConversations(currentUserDetails!.$id),
    {
      fallbackData: cachedChats,
      onSuccess(data) {
        setCachedChats(data);
      },
    },
  );
}

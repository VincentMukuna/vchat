import { useAuth } from "@/context/AuthContext";
import { DirectChatDetails, GroupChatDetails } from "@/interfaces/interfaces";
import { getConversations } from "@/services/userDetailsServices";
import { isGroup } from "@/utils/utils";
import useSWR from "swr";
import useLocalStorage from "../../../utils/hooks/useLocalStorage";

export default function useConversations() {
  const { currentUserDetails } = useAuth();

  const [cachedChats, setCachedChats] = useLocalStorage<
    (GroupChatDetails | DirectChatDetails)[]
  >(
    `vchat/${currentUserDetails?.$id}/conversations`,
    currentUserDetails?.groups || [],
  );

  const swrRes = useSWR(
    () => (currentUserDetails ? "conversations" : null),
    () => (currentUserDetails ? getConversations(currentUserDetails.$id) : []),
    {
      fallbackData:
        cachedChats
          .filter((c) => !isGroup(c))
          .concat(currentUserDetails!.groups) || [],
      onSuccess(data) {
        setCachedChats(data);
      },
    },
  );

  return swrRes;
}

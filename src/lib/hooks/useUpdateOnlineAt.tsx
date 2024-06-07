import { updateLastSeen } from "@/services/userDetailsService";
import useSWR from "swr";

export default function useUpdateOnlineAt(
  currentUserDetailsId: string | undefined,
) {
  useSWR(
    () => (currentUserDetailsId ? "user/online" : null),
    async () => {
      await updateLastSeen(currentUserDetailsId!);
    },
    {
      // refresh every minute
      refreshInterval: 1000 * 60,
    },
  );
}

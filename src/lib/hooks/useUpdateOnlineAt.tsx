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
      revalidateOnMount: false,
      refreshInterval: 1000 * 60,
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );
}

import useSWR from "swr";
import { logUserIn } from "../services/sessionServices";

export default function useUser() {
  const { data, error, isLoading } = useSWR("", logUserIn);
  return {
    authData: data,
    isLoading,
    isError: error,
  };
}

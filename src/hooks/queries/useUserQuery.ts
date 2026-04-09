import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser, type CurrentUser } from "../../api";
import { queryKeys } from "../../queryKeys";

const LOADING_USER_QUERY_RESULT: CurrentUser = {
  id: "00000000-0000-0000-0000-000000000000",
  username: "",
  email: "",
  balance: 0,
  lockedBalance: 0,
  isAdmin: false,
};

export function useUserQuery() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => fetchCurrentUser(getToken),
    placeholderData: () => LOADING_USER_QUERY_RESULT,
    
    // caching knobs
    staleTime: 60_000, // 1 min: switching tabs won't refetch immediately
    gcTime: 10 * 60_000, // 10 min: keep cache around after unmount
    refetchOnWindowFocus: false,
  });
}

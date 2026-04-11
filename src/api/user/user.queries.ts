import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchCurrentUser, type CurrentUser } from "./user.api";

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

    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

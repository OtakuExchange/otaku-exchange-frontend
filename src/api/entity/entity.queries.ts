import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchEntities } from "./entity.api";

export function useEntitiesQuery() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.entities,
    queryFn: () => fetchEntities(getToken),

    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

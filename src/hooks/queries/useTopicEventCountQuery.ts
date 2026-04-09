import { useQuery } from "@tanstack/react-query";
import type { UUID } from "../../models/models";
import { fetchTopicEventCounts } from "../../api";
import { queryKeys } from "../queryKeys";

export function useTopicEventCountQuery(topicId: UUID) {
  return useQuery({
    queryKey: queryKeys.topicEventCounts(topicId),
    queryFn: () => fetchTopicEventCounts(topicId),

    // caching knobs
    staleTime: 60_000, // 1 min: switching tabs won't refetch immediately
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

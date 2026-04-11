import { useMemo } from "react";
import type { Pool, UUID } from "../../models/models";
import { usePoolsByEventIdsQueries } from "../../api/pool/pool.queries";

export function usePoolsVolumesByEventIds(eventIds: UUID[], enabled: boolean) {
  const { eventIds: uniqueEventIds, results } = usePoolsByEventIdsQueries(
    eventIds,
    enabled,
  );

  const volumeByEventId = useMemo(() => {
    const map = new Map<UUID, number>();
    for (let i = 0; i < uniqueEventIds.length; i++) {
      const eventId = uniqueEventIds[i];
      const pools = results[i]?.data as Pool[] | undefined;
      if (!pools) continue;
      const cents = pools.reduce((sum, p) => sum + p.volume, 0);
      map.set(eventId, cents);
    }
    return map;
  }, [results, uniqueEventIds]);

  return {
    volumeByEventId,
    isLoading: enabled ? results.some((r) => r.isLoading) : false,
    isError: enabled ? results.some((r) => r.isError) : false,
  };
}

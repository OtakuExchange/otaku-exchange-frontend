import { useAuth } from "@clerk/react";
import type { UUID } from "../models/models";
import { fetchPools, createMarketPool } from "../api/pool/pool.api";

export function useApi() {
  const { getToken } = useAuth();

  return {
    fetchPools: (eventId: UUID) => fetchPools(eventId, getToken),
    createMarketPool: (eventId: UUID, label: string, entityId: UUID | null) =>
      createMarketPool(eventId, label, entityId, getToken),
  };
}

import { useAuth } from "@clerk/react";
import type { UUID } from "../models/models";
import { fetchMarkets, fetchPools, deleteMarket, createMarketPool } from "../api/market/market.api";
import { fetchDailyStreak } from "../api/reward/reward.api";

export function useApi() {
  const { getToken } = useAuth();

  return {
    fetchMarkets: (eventId: UUID) => fetchMarkets(eventId, getToken),
    fetchPools: (eventId: UUID) => fetchPools(eventId, getToken),
    deleteMarket: (marketId: UUID) => deleteMarket(marketId, getToken),
    fetchDailyStreak: () => fetchDailyStreak(getToken),
    createMarketPool: (eventId: UUID, label: string, entityId: UUID | null) =>
      createMarketPool(eventId, label, entityId, getToken),
  };
}

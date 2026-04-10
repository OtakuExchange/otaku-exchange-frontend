import Box from "@mui/material/Box";
import { useMemo, useState, useEffect } from "react";
import { DesktopEventView } from "../components/event/desktop/DesktopEventView";
import { MobileEventView } from "../components/event/mobile/MobileEventView";
import type { PoolStat } from "../components/event/types";
import { useUserId } from "../contexts/UserContext";
import { usePoolsQuery } from "../api/market/market.queries";
import { useApi } from "../hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import type { Event, Pool } from "../models/models";
import { FIRST_BET_BONUS_STAKE_CENTS } from "../models/models";
import { useTopicsQuery } from "../api/topic/topic.queries";

export default function EventView({
  event,
  initialPools,
  initialPoolId,
}: {
  event: Event;
  initialPools?: Pool[];
  initialPoolId?: string;
}) {
  const { markEventSeen } = useApi();
  const userId = useUserId();
  const queryClient = useQueryClient();
  const { data: topics = [] } = useTopicsQuery();
  const { data: poolsData, refetch: refetchPools } = usePoolsQuery(event.id);
  const topicName = useMemo(() => topics.find((t) => t.id === event.topicId)?.topic, [topics, event.topicId]);
  const pools = useMemo(
    () => poolsData ?? initialPools ?? [],
    [poolsData, initialPools],
  );
  const [hypotheticalStakeCents, setHypotheticalStakeCents] = useState(0);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(
    initialPoolId ?? initialPools?.[0]?.id ?? null,
  );
  const [infoTabIdx, setInfoTabIdx] = useState<number>(0);

  const effectiveSelectedPoolId = selectedPoolId ?? pools[0]?.id ?? null;
  const selectedPool = useMemo(() => {
    if (!effectiveSelectedPoolId) return null;
    return pools.find((p: Pool) => p.id === effectiveSelectedPoolId) ?? null;
  }, [pools, effectiveSelectedPoolId]);

  const totalVolume = useMemo(
    () => pools.reduce((sum: number, p: Pool) => sum + p.volume, 0),
    [pools],
  );

  const effectiveStakeCents = useMemo(() => {
    const eligible =
      event.isFirstStakeBonusEligible &&
      (event.status === "open" || event.status === "hidden");
    if (!eligible) return hypotheticalStakeCents;
    const bonus = Math.min(hypotheticalStakeCents, FIRST_BET_BONUS_STAKE_CENTS);
    return hypotheticalStakeCents + bonus;
  }, [event.isFirstStakeBonusEligible, event.status, hypotheticalStakeCents]);

  const displayTotalVolume = useMemo(() => {
    if (!selectedPool || effectiveStakeCents <= 0) return totalVolume;
    return totalVolume + effectiveStakeCents;
  }, [totalVolume, selectedPool, effectiveStakeCents]);

  const poolStats = useMemo<PoolStat[]>(() => {
    return pools.map((pool: Pool) => {
      const color = pool.entity?.color ?? "#1565c0";
      const label = pool.entity?.name ?? pool.label;
      const effectivePoolVolume =
        selectedPool && effectiveStakeCents > 0 && pool.id === selectedPool.id
          ? pool.volume + effectiveStakeCents
          : pool.volume;
      const pct =
        displayTotalVolume > 0
          ? Math.round((effectivePoolVolume / displayTotalVolume) * 100)
          : 0;
      const volumeUsd = (pool.volume / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      return {
        pool:
          effectivePoolVolume === pool.volume
            ? pool
            : { ...pool, volume: effectivePoolVolume },
        color,
        label,
        pct,
        volumeUsd,
      };
    });
  }, [pools, selectedPool, effectiveStakeCents, displayTotalVolume]);

  useEffect(() => {
    if (userId)
      markEventSeen(event.id)
        .then(() => {
          queryClient.setQueriesData<Event[]>(
            { queryKey: ["events"] },
            (cached) =>
              cached?.map((e) =>
                e.id === event.id ? { ...e, isNew: false } : e,
              ),
          );
          // refreshTopics();
        })
        .catch(console.error);
  }, [event.id, markEventSeen, queryClient, userId]);

  function handleChangeTab(_event: React.SyntheticEvent, newValue: number) {
    setInfoTabIdx(newValue);
  }

  return (
    <>
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <MobileEventView
          event={event}
          topicName={topicName}
          poolStats={poolStats}
          effectiveSelectedPoolId={effectiveSelectedPoolId}
          onSelectPoolId={setSelectedPoolId}
          selectedPool={selectedPool}
          infoTabIdx={infoTabIdx}
          onChangeTab={handleChangeTab}
          pools={pools}
          refetchPools={refetchPools}
          stakeCents={hypotheticalStakeCents}
          onStakeCentsChange={setHypotheticalStakeCents}
        />
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <DesktopEventView
          event={event}
          topicName={topicName}
          poolStats={poolStats}
          totalVolume={displayTotalVolume}
          effectiveSelectedPoolId={effectiveSelectedPoolId}
          onSelectPoolId={setSelectedPoolId}
          selectedPool={selectedPool}
          infoTabIdx={infoTabIdx}
          onChangeTab={handleChangeTab}
          pools={pools}
          refetchPools={refetchPools}
          stakeCents={hypotheticalStakeCents}
          onStakeCentsChange={setHypotheticalStakeCents}
        />
      </Box>
    </>
  );
}

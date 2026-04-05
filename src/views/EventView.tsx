import Box from "@mui/material/Box";
import { useMemo, useState, useEffect } from "react";
import type { EventStake } from "../api";
import { DesktopEventView } from "../components/event/desktop/DesktopEventView";
import { MobileEventView } from "../components/event/mobile/MobileEventView";
import type { PoolStat } from "../components/event/types";
import { useTopics } from "../contexts/TopicsContext";
import { useUserId } from "../contexts/UserContext";
import { usePoolsQuery } from "../hooks/queries/usePoolsQuery";
import { useApi } from "../hooks/useApi";
import type { Event, Pool } from "../models/models";

export default function EventView({
  event,
  initialPools,
  initialPoolId,
}: {
  event: Event;
  initialPools?: Pool[];
  initialPoolId?: string;
}) {
  const { fetchEventStakes } = useApi();
  useUserId();
  const topics = useTopics();
  const topicName = topics.find((t) => t.id === event.topicId)?.topic;
  const { data: poolsData, refetch: refetchPools } = usePoolsQuery(event.id);
  const pools = useMemo(
    () => poolsData ?? initialPools ?? [],
    [poolsData, initialPools],
  );
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(
    initialPoolId ?? initialPools?.[0]?.id ?? null,
  );
  const [infoTabIdx, setInfoTabIdx] = useState<number>(0);
  const [eventStakes, setEventStakes] = useState<EventStake[]>([]);
  const [stakesLoading, setStakesLoading] = useState(true);

  const effectiveSelectedPoolId = selectedPoolId ?? pools[0]?.id ?? null;
  const selectedPool = useMemo(() => {
    if (!effectiveSelectedPoolId) return null;
    return pools.find((p) => p.id === effectiveSelectedPoolId) ?? null;
  }, [pools, effectiveSelectedPoolId]);

  const totalVolume = useMemo(
    () => pools.reduce((sum, p) => sum + p.volume, 0),
    [pools],
  );

  const poolStats = useMemo<PoolStat[]>(() => {
    return pools.map((pool) => {
      const color = pool.entity?.color ?? "#1565c0";
      const label = pool.entity?.name ?? pool.label;
      const pct =
        totalVolume > 0 ? Math.round((pool.volume / totalVolume) * 100) : 0;
      const volumeUsd = (pool.volume / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      return { pool, color, label, pct, volumeUsd };
    });
  }, [pools, totalVolume]);

  useEffect(() => {
    fetchEventStakes(event.id, 3)
      .then(setEventStakes)
      .catch(console.error)
      .finally(() => setStakesLoading(false));
  }, [event.id, fetchEventStakes]);

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
          stakesLoading={stakesLoading}
          eventStakes={eventStakes}
          pools={pools}
          refetchPools={refetchPools}
        />
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <DesktopEventView
          event={event}
          topicName={topicName}
          poolStats={poolStats}
          totalVolume={totalVolume}
          effectiveSelectedPoolId={effectiveSelectedPoolId}
          onSelectPoolId={setSelectedPoolId}
          selectedPool={selectedPool}
          infoTabIdx={infoTabIdx}
          onChangeTab={handleChangeTab}
          stakesLoading={stakesLoading}
          eventStakes={eventStakes}
          pools={pools}
          refetchPools={refetchPools}
        />
      </Box>
    </>
  );
}

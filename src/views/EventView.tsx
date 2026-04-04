import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import type { Event, Pool } from "../models/models";
import type { EventStake } from "../api";
import { useApi } from "../hooks/useApi";
import { useUserId } from "../contexts/UserContext";
import { useTopics } from "../contexts/TopicsContext";
import { usePoolsQuery } from "../hooks/queries/usePoolsQuery";
import TradeCard, { TradeDockMobile } from "../components/TradeCard";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { multiplierColor } from "../utils/parimutuel";
import { EventStatusTag } from "../components/EventStatusTag";

type PoolStat = {
  pool: Pool;
  color: string;
  label: string;
  pct: number;
  volumeUsd: string;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function InfoTab(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1.5, md: 3 } }}>{children}</Box>}
    </div>
  );
}

function EventHeaderSection({
  event,
  topicName,
}: {
  event: Event;
  topicName: string | undefined;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ mb: 2, display: { xs: "none", md: "flex" } }}
    >
      {event.logoPath && (
        <Box
          component="img"
          src={event.logoPath}
          sx={{ width: 64, height: 64, borderRadius: 1, flexShrink: 0 }}
        />
      )}
      <Box sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          flexWrap="wrap"
          sx={{ mb: 0.5 }}
        >
          {topicName && (
            <Typography sx={{ color: "#7B8996", fontSize: "14px" }}>
              {topicName}
            </Typography>
          )}
          <EventStatusTag status={event.status} closeTime={event.closeTime} />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 600, fontSize: "24px" }}
          >
            {event.name}
          </Typography>
          {event.multiplier > 1 && (
            <Chip
              label={`${event.multiplier}x`}
              size="small"
              sx={{
                bgcolor: multiplierColor(event.multiplier),
                color: "#000",
                fontWeight: 800,
                fontSize: "13px",
                height: 24,
                letterSpacing: "0.02em",
              }}
            />
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

function EventHeaderSectionMobile({
  event,
  topicName,
}: {
  event: Event;
  topicName: string | undefined;
}) {
  return (
    <Stack spacing={1.25} sx={{ mb: 1.5, display: { xs: "flex", md: "none" } }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {event.logoPath && (
          <Box
            component="img"
            src={event.logoPath}
            sx={{ width: 44, height: 44, borderRadius: 1, flexShrink: 0 }}
          />
        )}
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          {topicName && (
            <Typography sx={{ color: "#7B8996", fontSize: "13px", mb: 0.25 }}>
              {topicName}
            </Typography>
          )}
          <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: "18px",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {event.name}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <EventStatusTag status={event.status} closeTime={event.closeTime} />
        {event.multiplier > 1 && (
          <Chip
            label={`${event.multiplier}x`}
            size="small"
            sx={{
              bgcolor: multiplierColor(event.multiplier),
              color: "#000",
              fontWeight: 800,
              fontSize: "12px",
              height: 22,
              letterSpacing: "0.02em",
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}

function PoolRowsSectionDesktop({
  poolStats,
  totalVolume,
  selectedPoolId,
  onSelectPool,
}: {
  poolStats: PoolStat[];
  totalVolume: number;
  selectedPoolId: string | null;
  onSelectPool: (poolId: string) => void;
}) {
  if (poolStats.length === 0) return null;
  return (
    <Stack sx={{ my: 2, display: { xs: "none", md: "flex" } }}>
      {poolStats.map((s, i, arr) => (
        <Box key={s.pool.id}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={() => onSelectPool(s.pool.id)}
            sx={{
              height: 74,
              cursor: "pointer",
              borderRadius: "10px",
              px: 1,
              bgcolor:
                selectedPoolId === s.pool.id ? "action.selected" : "transparent",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ width: "20%", flexShrink: 0 }}
            >
              {s.pool.entity?.logoPath && (
                <Box
                  component="img"
                  src={s.pool.entity.logoPath}
                  sx={{ width: 48, height: 48, borderRadius: 0.5, flexShrink: 0 }}
                />
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                  {s.pool.entity?.name ?? s.pool.label}
                </Typography>
                <Typography
                  sx={{ fontSize: "13px", color: "#7B8996", fontWeight: 600 }}
                >
                  {s.volumeUsd} Vol.
                </Typography>
              </Box>
            </Stack>
            <Box
              sx={{
                flexGrow: 1,
                mx: 1.5,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: totalVolume > 0 ? `${(s.pool.volume / totalVolume) * 100}%` : "0%",
                  maxWidth: "calc(100% - 130px)",
                  height: 16,
                  borderRadius: 1,
                  bgcolor: s.color,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: "36px",
                  fontWeight: 600,
                  color: s.color,
                  lineHeight: 1,
                  ml: "18px",
                  flexShrink: 0,
                }}
              >
                {totalVolume > 0 ? `${Math.round((s.pool.volume / totalVolume) * 100)}%` : "0%"}
              </Typography>
            </Box>
          </Stack>
          {i < arr.length - 1 && <Divider sx={{ mx: "10px" }} />}
        </Box>
      ))}
    </Stack>
  );
}

function PoolRowsSectionMobile({
  poolStats,
  selectedPoolId,
  onSelectPool,
}: {
  poolStats: PoolStat[];
  selectedPoolId: string | null;
  onSelectPool: (poolId: string) => void;
}) {
  if (poolStats.length === 0) return null;

  return (
    <Stack spacing={1} sx={{ my: 1.5, display: { xs: "flex", md: "none" } }}>
      {poolStats.map((s) => {
        const isSelected = selectedPoolId === s.pool.id;
        return (
          <Box
            key={s.pool.id}
            onClick={() => onSelectPool(s.pool.id)}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: isSelected ? "divider" : "transparent",
              bgcolor: isSelected ? "action.selected" : "transparent",
              px: 1,
              py: 1,
              cursor: "pointer",
              "&:active": { transform: "scale(0.997)" },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {s.pool.entity?.logoPath ? (
                <Box
                  component="img"
                  src={s.pool.entity.logoPath}
                  sx={{ width: 28, height: 28, borderRadius: 0.5, flexShrink: 0 }}
                />
              ) : (
                <Box sx={{ width: 28, height: 28, flexShrink: 0 }} />
              )}

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.pool.entity?.name ?? s.pool.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#7B8996", fontWeight: 700 }}
                >
                  {s.volumeUsd} Vol.
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: "16px",
                  color: s.color,
                  flexShrink: 0,
                }}
              >
                {s.pct}%
              </Typography>
            </Stack>

            <Box
              sx={{
                mt: 0.75,
                height: 10,
                borderRadius: 999,
                bgcolor: "action.hover",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${s.pct}%`,
                  bgcolor: s.color,
                  borderRadius: 999,
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

function InfoSection({
  event,
  infoTabIdx,
  onChangeTab,
}: {
  event: Event;
  infoTabIdx: number;
  onChangeTab: (event: React.SyntheticEvent, newValue: number) => void;
}) {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={infoTabIdx} onChange={onChangeTab} aria-label="info tab">
            <Tab label="Rules" />
            <Tab label="Event Description" />
          </Tabs>
        </Box>
        <InfoTab value={infoTabIdx} index={0}>
          {event.resolutionRule}
        </InfoTab>
        <InfoTab value={infoTabIdx} index={1}>
          {event.description}
        </InfoTab>
      </Box>
    </>
  );
}

function TopStakesSectionDesktop({
  pools,
  eventStakes,
}: {
  pools: Pool[];
  eventStakes: EventStake[];
}) {
  const grouped = eventStakes.reduce<Record<string, typeof eventStakes>>(
    (acc, s) => {
      (acc[s.marketPoolId] ??= []).push(s);
      return acc;
    },
    {},
  );
  const sortedGroups = Object.values(grouped).sort((a, b) => {
    const aIdx = pools.findIndex((p) => p.id === a[0].marketPoolId);
    const bIdx = pools.findIndex((p) => p.id === b[0].marketPoolId);
    return aIdx - bIdx;
  });

  return (
    <Stack direction="row" spacing={4} sx={{ display: { xs: "none", md: "flex" } }}>
      {sortedGroups.map((group) => (
        <Box key={group[0].marketPoolId} sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: "#7B8996", mb: 0.5, display: "block" }}
          >
            {group[0].poolLabel}
          </Typography>
          <Stack spacing={1}>
            {group.map((stake) => (
              <Stack key={stake.id} direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  src={stake.avatarUrl ?? undefined}
                  sx={{ width: 28, height: 28, fontSize: 13 }}
                >
                  {stake.username[0].toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>
                  {stake.username}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {(stake.amount / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function TopStakesSectionMobile({
  pools,
  eventStakes,
}: {
  pools: Pool[];
  eventStakes: EventStake[];
}) {
  const grouped = eventStakes.reduce<Record<string, typeof eventStakes>>(
    (acc, s) => {
      (acc[s.marketPoolId] ??= []).push(s);
      return acc;
    },
    {},
  );
  const sortedGroups = Object.values(grouped).sort((a, b) => {
    const aIdx = pools.findIndex((p) => p.id === a[0].marketPoolId);
    const bIdx = pools.findIndex((p) => p.id === b[0].marketPoolId);
    return aIdx - bIdx;
  });

  return (
    <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
      {sortedGroups.map((group) => (
        <Box key={group[0].marketPoolId}>
          <Typography
            variant="caption"
            fontWeight={800}
            sx={{ color: "#7B8996", mb: 0.75, display: "block" }}
          >
            {group[0].poolLabel}
          </Typography>
          <Stack spacing={1}>
            {group.map((stake) => (
              <Stack key={stake.id} direction="row" alignItems="center" spacing={1.25}>
                <Avatar
                  src={stake.avatarUrl ?? undefined}
                  sx={{ width: 26, height: 26, fontSize: 12 }}
                >
                  {stake.username[0].toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={700} sx={{ flexGrow: 1 }}>
                  {stake.username}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {(stake.amount / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function DesktopEventView({
  event,
  topicName,
  poolStats,
  totalVolume,
  effectiveSelectedPoolId,
  onSelectPoolId,
  selectedPool,
  infoTabIdx,
  onChangeTab,
  stakesLoading,
  eventStakes,
  pools,
  refetchPools,
}: {
  event: Event;
  topicName: string | undefined;
  poolStats: PoolStat[];
  totalVolume: number;
  effectiveSelectedPoolId: string | null;
  onSelectPoolId: (poolId: string) => void;
  selectedPool: Pool | null;
  infoTabIdx: number;
  onChangeTab: (event: React.SyntheticEvent, newValue: number) => void;
  stakesLoading: boolean;
  eventStakes: EventStake[];
  pools: Pool[];
  refetchPools: () => void;
}) {
  return (
    <Stack direction="row" alignItems="flex-start" sx={{ p: 3, gap: 3 }}>
      <Box sx={{ flexGrow: 1 }}>
        <EventHeaderSection event={event} topicName={topicName} />

        <PoolRowsSectionDesktop
          poolStats={poolStats}
          totalVolume={totalVolume}
          selectedPoolId={effectiveSelectedPoolId}
          onSelectPool={onSelectPoolId}
        />

        <InfoSection event={event} infoTabIdx={infoTabIdx} onChangeTab={onChangeTab} />

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Top Stakes
        </Typography>
        {stakesLoading ? (
          <Stack spacing={1}>
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={40}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Stack>
        ) : eventStakes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No stakes yet.
          </Typography>
        ) : (
          <TopStakesSectionDesktop pools={pools} eventStakes={eventStakes} />
        )}
      </Box>

      {(event.status === "open" || event.status === "hidden") && (
        <TradeCard
          pools={pools}
          selectedPool={selectedPool}
          onPoolChange={(p) => onSelectPoolId(p.id)}
          onBuySuccess={() => refetchPools()}
        />
      )}
    </Stack>
  );
}

function MobileEventView({
  event,
  topicName,
  poolStats,
  effectiveSelectedPoolId,
  onSelectPoolId,
  selectedPool,
  infoTabIdx,
  onChangeTab,
  stakesLoading,
  eventStakes,
  pools,
  refetchPools,
}: {
  event: Event;
  topicName: string | undefined;
  poolStats: PoolStat[];
  effectiveSelectedPoolId: string | null;
  onSelectPoolId: (poolId: string) => void;
  selectedPool: Pool | null;
  infoTabIdx: number;
  onChangeTab: (event: React.SyntheticEvent, newValue: number) => void;
  stakesLoading: boolean;
  eventStakes: EventStake[];
  pools: Pool[];
  refetchPools: () => void;
}) {
  const showDock = event.status === "open" || event.status === "hidden";
  const dockPad = showDock
    ? "calc(168px + env(safe-area-inset-bottom))"
    : "16px";

  return (
    <Box sx={{ px: 2, pt: 2, pb: dockPad }}>
      <EventHeaderSectionMobile event={event} topicName={topicName} />

      <PoolRowsSectionMobile
        poolStats={poolStats}
        selectedPoolId={effectiveSelectedPoolId}
        onSelectPool={onSelectPoolId}
      />

      <InfoSection event={event} infoTabIdx={infoTabIdx} onChangeTab={onChangeTab} />

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Top Stakes
      </Typography>
      {stakesLoading ? (
        <Stack spacing={1}>
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={40}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Stack>
      ) : eventStakes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No stakes yet.
        </Typography>
      ) : (
        <TopStakesSectionMobile pools={pools} eventStakes={eventStakes} />
      )}

      {showDock && (
        <TradeDockMobile
          pools={pools}
          selectedPool={selectedPool}
          onPoolChange={(p) => onSelectPoolId(p.id)}
          onBuySuccess={() => refetchPools()}
        />
      )}
    </Box>
  );
}

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
  const pools = useMemo(() => poolsData ?? initialPools ?? [], [poolsData, initialPools]);
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
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Pool } from "../../../models/models";
import { InfoSection } from "../InfoSection";
import { EventHeaderSectionMobile } from "./EventHeaderSectionMobile";
import { PoolRowsSectionMobile } from "./PoolRowsSectionMobile";
import { TopStakesSectionMobile } from "./TopStakesSectionMobile";
import type { PoolStat } from "../types";
import type { Event } from "../../../models/models";
import { TradeDockMobile } from "../../trade-card/TradeDockMobile";
import { useEventStakesQuery } from "../../../hooks/queries/useEventStakesQuery";

export function MobileEventView({
  event,
  topicName,
  poolStats,
  effectiveSelectedPoolId,
  onSelectPoolId,
  selectedPool,
  infoTabIdx,
  onChangeTab,
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
  pools: Pool[];
  refetchPools: () => void;
}) {
  const { data: eventStakes = [], isLoading: stakesLoading } =
    useEventStakesQuery(event.id, 3);
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

      <InfoSection
        event={event}
        infoTabIdx={infoTabIdx}
        onChangeTab={onChangeTab}
      />

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
          isFirstStakeBonusEligible={event.isFirstStakeBonusEligible}
        />
      )}
    </Box>
  );
}

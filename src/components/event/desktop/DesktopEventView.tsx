import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Pool } from "../../../models/models";
import { InfoSection } from "../InfoSection";
import type { PoolStat } from "../types";
import { EventHeaderSection } from "./EventHeaderSection";
import { PoolRowsSectionDesktop } from "./PoolRowsSectionDesktop";
import { TopStakesSectionDesktop } from "./TopStakesSectionDesktop";
import type { Event } from "../../../models/models";
import { TradeCardDesktop } from "../../trade-card/TradeCardDesktop";
import { useEventStakesQuery } from "../../../hooks/queries/useEventStakesQuery";

export function DesktopEventView({
  event,
  topicName,
  poolStats,
  totalVolume,
  effectiveSelectedPoolId,
  onSelectPoolId,
  selectedPool,
  infoTabIdx,
  onChangeTab,
  pools,
  refetchPools,
  stakeCents,
  onStakeCentsChange,
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
  pools: Pool[];
  refetchPools: () => void;
  stakeCents: number;
  onStakeCentsChange: (cents: number) => void;
}) {
  const { data: eventStakes = [], isLoading: stakesLoading } =
    useEventStakesQuery(event.id, 3);

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
          <TopStakesSectionDesktop pools={pools} eventStakes={eventStakes} />
        )}
      </Box>

      {(event.status === "open" || event.status === "hidden") && (
        <TradeCardDesktop
          eventMultiplier={event.multiplier}
          pools={pools}
          selectedPool={selectedPool}
          onPoolChange={(p) => onSelectPoolId(p.id)}
          onBuySuccess={() => {
            refetchPools();
            onStakeCentsChange(0);
          }}
          isFirstStakeBonusEligible={event.isFirstStakeBonusEligible}
          stakeCents={stakeCents}
          onStakeCentsChange={onStakeCentsChange}
        />
      )}
    </Stack>
  );
}

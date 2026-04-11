import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import type { Event, Pool, UUID } from "../../models/models";
import { usePoolsQuery } from "../../api/pool/pool.queries";
import { useEventStakesQuery } from "../../api/events/events.queries";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../api/queryKeys";
import { EventCardLayout } from "../event-card/EventCardLayout";
import { DesktopEventCardBody } from "../event-card/DesktopEventCardBody";
import { MobileEventCardBody } from "../event-card/MobileEventCardBody";
import { EventCardFooter } from "../event-card/EventCardFooter";
import {
  EventCardHeaderMulti,
  EventCardHeaderSingle,
} from "../event-card/EventCardHeader";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { StakeLine } from "./StakeLine";

function PoolsSkeleton() {
  return (
    <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: "center" }}>
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
    </Stack>
  );
}

export function HistoryEventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });

  const { data: pools, isLoading: poolsLoading } = usePoolsQuery(event.id);
  const poolsList = pools ?? [];
  const totalVolume = poolsList.reduce((sum: number, p: Pool) => sum + p.volume, 0);

  // We only need the top stake per pool to compute winner/loser highlights.
  const {
    data: topStakes,
    isLoading: stakesLoading,
  } = useEventStakesQuery(event.id as UUID, 1);

  function primeEventRouteCache() {
    queryClient.setQueryData(queryKeys.eventById(event.id), event);
    if (pools) {
      queryClient.setQueryData(queryKeys.poolsByEventId(event.id), pools);
    }
  }

  function openEvent() {
    primeEventRouteCache();
    navigate(`/events/${event.id}`);
  }

  function selectPool(
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    poolId: string,
  ) {
    e.stopPropagation();
    primeEventRouteCache();
    navigate(`/events/${event.id}`, { state: { selectedPoolId: poolId } });
  }

  const winnerPoolId = poolsList.find((p) => p.isWinner)?.id ?? null;

  const winnerStake = winnerPoolId
    ? (topStakes ?? []).find((s) => s.marketPoolId === winnerPoolId) ?? null
    : null;

  const loserStake =
    (topStakes ?? [])
      .filter((s) => (winnerPoolId ? s.marketPoolId !== winnerPoolId : true))
      .sort((a, b) => b.amount - a.amount)[0] ?? null;

  return (
    <EventCardLayout isNew={event.isNew} onClick={openEvent}>
      <EventCardLayout.Content>
        {event.format === "multi" ? (
          <EventCardHeaderMulti
            event={event}
            bookmarked={event.bookmarked}
            showBookmark={false}
          />
        ) : (
          <EventCardHeaderSingle
            event={event}
            title={event.alias ?? ""}
            bookmarked={event.bookmarked}
            showBookmark={false}
          />
        )}

        {poolsLoading ? (
          <PoolsSkeleton />
        ) : isDesktop ? (
          <DesktopEventCardBody
            pools={poolsList}
            totalVolume={totalVolume}
            isMulti={event.format === "multi"}
            onSelectPool={selectPool}
            highlightWinnerPool
          />
        ) : (
          <MobileEventCardBody
            pools={poolsList}
            totalVolume={totalVolume}
            isMulti={event.format === "multi"}
            onSelectPool={selectPool}
            highlightWinnerPool
          />
        )}
      </EventCardLayout.Content>

      <EventCardLayout.Footer>
        <EventCardFooter
          event={event}
          pools={pools}
          bookmarked={event.bookmarked}
          showBookmark={false}
        />
        <Box sx={{ px: 2, pb: 1, minHeight: 44 }}>
          <Stack spacing={0.5}>
            <StakeLine
              label="Winner"
              loading={stakesLoading}
              username={winnerStake?.username ?? null}
              avatarUrl={winnerStake?.avatarUrl ?? null}
              amountCents={winnerStake?.amount ?? null}
            />
            <StakeLine
              label="Loser"
              loading={stakesLoading}
              username={loserStake?.username ?? null}
              avatarUrl={loserStake?.avatarUrl ?? null}
              amountCents={loserStake?.amount ?? null}
            />
          </Stack>
        </Box>
      </EventCardLayout.Footer>
    </EventCardLayout>
  );
}


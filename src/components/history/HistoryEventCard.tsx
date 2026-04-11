import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import type { Event, Pool, UUID } from "../../models/models";
import { usePoolsQuery } from "../../api/pool/pool.queries";
import { useEventStakesQuery } from "../../api/events/events.queries";
import { useBookmarkMutation } from "../../api/events/events.mutations";
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

function PoolsSkeleton() {
  return (
    <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: "center" }}>
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
    </Stack>
  );
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function StakeLine({
  label,
  loading,
  username,
  avatarUrl,
  amountCents,
}: {
  label: string;
  loading: boolean;
  username: string | null;
  avatarUrl: string | null;
  amountCents: number | null;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minHeight: 18 }}>
      <Typography
        variant="caption"
        sx={{ color: "#7B8996", width: 54, flexShrink: 0 }}
      >
        {label}
      </Typography>

      {loading ? (
        <>
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton variant="text" width={110} sx={{ flexGrow: 1 }} />
          <Skeleton variant="text" width={64} />
        </>
      ) : (
        <>
          <Avatar
            src={avatarUrl ?? undefined}
            sx={{ width: 18, height: 18, fontSize: 10 }}
          >
            {(username ?? "?").slice(0, 1).toUpperCase()}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexGrow: 1,
            }}
          >
            {username ?? "—"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700 }}>
            {amountCents != null ? formatCents(amountCents) : "—"}
          </Typography>
        </>
      )}
    </Stack>
  );
}

export function HistoryEventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { bookmarkEvent, unbookmarkEvent } = useBookmarkMutation();
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

  function handleBookmark(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const action = event.bookmarked
      ? unbookmarkEvent({ eventId: event.id as UUID, topicId: event.topicId as UUID })
      : bookmarkEvent({ eventId: event.id as UUID, topicId: event.topicId as UUID });
    action.catch(console.error);
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
            onBookmark={handleBookmark}
          />
        ) : (
          <EventCardHeaderSingle
            event={event}
            title={event.alias ?? ""}
            bookmarked={event.bookmarked}
            onBookmark={handleBookmark}
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
          onBookmark={handleBookmark}
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


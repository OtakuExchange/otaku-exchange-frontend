import { useNavigate } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import type { Event } from "../models/models";
import { useApi } from "../hooks/useApi";
import { usePoolsQuery } from "../hooks/queries/usePoolsQuery";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { EventCardLayout } from "./event-card/EventCardLayout";
import { DesktopEventCardBody } from "./event-card/DesktopEventCardBody";
import { EventCardFooter } from "./event-card/EventCardFooter";
import {
  EventCardHeaderMulti,
  EventCardHeaderSingle,
} from "./event-card/EventCardHeader";
import { MobileEventCardBody } from "./event-card/MobileEventCardBody";

function PoolsSkeleton() {
  return (
    <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: "center" }}>
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
    </Stack>
  );
}

export default function EventCard({
  event,
  bookmarked = event.bookmarked,
  onBookmarkChange,
}: {
  event: Event;
  bookmarked?: boolean;
  onBookmarkChange?: (id: Event["id"], bookmarked: boolean) => void;
}) {
  const navigate = useNavigate();
  const { bookmarkEvent, unbookmarkEvent } = useApi();
  const queryClient = useQueryClient();
  const { data: pools, isLoading } = usePoolsQuery(event.id);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });

  function handleBookmark(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onBookmarkChange?.(event.id, !bookmarked);
    const action = bookmarked
      ? unbookmarkEvent(event.id)
      : bookmarkEvent(event.id);
    action.catch(console.error);
  }

  function primeEventRouteCache() {
    queryClient.setQueryData(queryKeys.eventById(event.id), event);
    if (pools) {
      queryClient.setQueryData(queryKeys.poolsByEventId(event.id), pools);
    }
  }

  const poolsList = pools ?? [];
  const totalVolume = poolsList.reduce((sum, p) => sum + p.volume, 0);

  function openEvent() {
    primeEventRouteCache();
    navigate(`/events/${event.id}`);
  }

  function selectPool(e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>, poolId: string) {
    e.stopPropagation();
    primeEventRouteCache();
    navigate(`/events/${event.id}`, { state: { selectedPoolId: poolId } });
  }

  return (
    <EventCardLayout isNew={event.isNew} onClick={openEvent}>
      <EventCardLayout.Content>
        {event.format === "multi" ? (
          <EventCardHeaderMulti
            event={event}
            bookmarked={bookmarked}
            onBookmark={handleBookmark}
          />
        ) : (
          <EventCardHeaderSingle
            event={event}
            title={event.alias ?? ""}
            bookmarked={bookmarked}
            onBookmark={handleBookmark}
          />
        )}
        {isLoading ? (
          <PoolsSkeleton />
        ) : isDesktop ? (
          <DesktopEventCardBody
            pools={poolsList}
            totalVolume={totalVolume}
            isMulti={event.format === "multi"}
            onSelectPool={selectPool}
          />
        ) : (
          <MobileEventCardBody
            pools={poolsList}
            totalVolume={totalVolume}
            isMulti={event.format === "multi"}
            onSelectPool={selectPool}
          />
        )}
      </EventCardLayout.Content>
      <EventCardLayout.Footer>
        <EventCardFooter
          event={event}
          pools={pools}
          bookmarked={bookmarked}
          onBookmark={handleBookmark}
        />
      </EventCardLayout.Footer>
    </EventCardLayout>
  );
}

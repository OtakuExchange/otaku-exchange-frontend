import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import EventCard from "../components/EventCard";
import SubtopicNav from "../components/SubtopicNav";
import type { Event, Subtopic, UUID } from "../models/models";
import { useTopicEventsQuery } from "../hooks/queries/useTopicsQuery";
import { useTopicEventCountQuery } from "../hooks/queries/useTopicEventCountQuery";

function LoadingState() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        height: "100%",
      }}
    >
      <CircularProgress size={64} sx={{ color: "#ffffff" }} />
    </Box>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        height: "100%",
        mb: 8,
        mr: 8,
      }}
    >
      <Typography color="text.secondary" fontWeight="bold">
        {message}
      </Typography>
    </Box>
  );
}

function EmptyState({ topicLabel }: { topicLabel: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        height: "100%",
        width: "100%",
        mb: 8,
        mr: 8,
      }}
    >
      <Typography color="text.secondary" fontWeight="bold">
        No Events found for {topicLabel}
      </Typography>
    </Box>
  );
}

function TopicHeader({
  topicLabel,
  filterBookmarked,
  onToggleFilterBookmarked,
  disableBookmarkFilter,
}: {
  topicLabel: string;
  filterBookmarked: boolean;
  onToggleFilterBookmarked: () => void;
  disableBookmarkFilter: boolean;
}) {
  return (
    <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
        {topicLabel}
      </Typography>
      <IconButton
        size="small"
        onClick={onToggleFilterBookmarked}
        disabled={disableBookmarkFilter}
      >
        {filterBookmarked ? (
          <BookmarkIcon fontSize="small" />
        ) : (
          <BookmarkBorderIcon fontSize="small" />
        )}
      </IconButton>
    </Stack>
  );
}

function EventsGrid({
  events,
  bookmarkedIds,
  onBookmarkChange,
  hasSubtopicsSidebar,
}: {
  events: Event[];
  bookmarkedIds: Set<UUID>;
  onBookmarkChange: (id: UUID, bookmarked: boolean) => void;
  hasSubtopicsSidebar: boolean;
}) {
  const itemSize = hasSubtopicsSidebar
    ? { xs: 12, sm: 12, md: 6, lg: 4 }
    : { xs: 12, sm: 6, md: 4, lg: 3 };

  return (
    <Grid container spacing={{ xs: 1, sm: 2 }}>
      {events.map((event) => (
        <Grid key={event.id} size={itemSize}>
          <EventCard
            event={event}
            bookmarked={bookmarkedIds.has(event.id)}
            onBookmarkChange={onBookmarkChange}
          />
        </Grid>
      ))}
    </Grid>
  );
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function TopicView({
  topicId,
  topicLabel,
  topicPath,
  subtopics,
  isAdmin,
}: {
  topicId: UUID;
  topicLabel: string;
  topicPath: string;
  subtopics: Subtopic[];
  isAdmin: boolean;
}) {
  const { "*": subtopicSlug } = useParams();
  const navigate = useNavigate();
  const [bookmarkOverrides, setBookmarkOverrides] = useState<
    Map<UUID, boolean>
  >(() => new Map());
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const { data: topicEventCounts } = useTopicEventCountQuery(topicId);

  const selectedSubtopic =
    subtopics.find((s) => toSlug(s.name) === subtopicSlug)?.id ?? null;

  const {
    data: events,
    isLoading,
    error,
  } = useTopicEventsQuery(topicId, selectedSubtopic);

  const serverBookmarkedIds: Set<UUID> = useMemo(
    () => new Set((events ?? []).filter((e: Event) => e.bookmarked).map((e: Event) => e.id as UUID)),
    [events],
  );

  const bookmarkedIds: Set<UUID> = useMemo(() => {
    const next = new Set(serverBookmarkedIds);
    for (const [id, bookmarked] of bookmarkOverrides) {
      if (bookmarked) {
        next.add(id as UUID);
      } else {
        next.delete(id as UUID);
      }
    }
    return next;
  }, [serverBookmarkedIds, bookmarkOverrides]);

  useEffect(() => {
    if (subtopics.length > 0 && !subtopicSlug) {
      navigate(`${topicPath}/${toSlug(subtopics[0].name)}`, { replace: true });
    }
  }, [topicId, subtopics, navigate, topicPath, subtopicSlug]);

  function handleBookmarkChange(id: UUID, bookmarked: boolean) {
    setBookmarkOverrides((prev) => {
      const next = new Map(prev);
      const serverHas = serverBookmarkedIds.has(id);
      if (bookmarked === serverHas) next.delete(id);
      else next.set(id, bookmarked);
      return next;
    });
  }

  const formatOrder = (format: string) => (format === "multi" ? 0 : 1);

  const sortEvents = (list: Event[]) =>
    [...list].sort((a, b) => {
      const formatDiff = formatOrder(a.format) - formatOrder(b.format);
      if (formatDiff !== 0) return formatDiff;
      const timeDiff =
        new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime();
      return timeDiff !== 0 ? timeDiff : b.tradeVolume - a.tradeVolume;
    });

  const visibleEvents = sortEvents(
    (events ?? []).filter((e: Event) => {
      const status = e.status.toLowerCase();
      if (status === "hidden") return isAdmin;
      return status !== "resolved";
    }),
  );
  const renderedEvents = filterBookmarked
    ? visibleEvents.filter((e: Event) => bookmarkedIds.has(e.id as UUID))
    : visibleEvents;

  return (
    <Stack direction={{ xs: "column", md: "row" }} sx={{ minHeight: "80vh" }}>
      {subtopics.length > 0 && (
        <SubtopicNav
          topicEventCounts={topicEventCounts}
          subtopics={subtopics}
          selected={selectedSubtopic}
          onSelect={(id) => {
            const sub = subtopics.find((s: Subtopic) => s.id === id);
            if (sub) navigate(`${topicPath}/${toSlug(sub.name)}`);
          }}
        />
      )}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopicHeader
          topicLabel={topicLabel}
          filterBookmarked={filterBookmarked}
          onToggleFilterBookmarked={() => setFilterBookmarked((f) => !f)}
          disableBookmarkFilter={bookmarkedIds.size === 0}
        />

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message="Failed to load events" />
        ) : renderedEvents.length === 0 ? (
          <EmptyState topicLabel={topicLabel} />
        ) : (
          <EventsGrid
            events={renderedEvents}
            bookmarkedIds={bookmarkedIds}
            onBookmarkChange={handleBookmarkChange}
            hasSubtopicsSidebar={subtopics.length > 0}
          />
        )}
      </Box>
    </Stack>
  );
}

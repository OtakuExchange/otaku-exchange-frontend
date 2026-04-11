import { useEffect, useMemo } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { Event, Subtopic, Topic, UUID } from "../models/models";
import {
  useMultiTopicEventsQuery,
  useTopicsQuery,
  useTopicEventsQuery,
} from "../api/topic/topic.queries";
import { HistoryFiltersBar } from "../components/history/HistoryFiltersBar";
import { useHistoryEventFilters } from "../components/history/useHistoryEventFilters";
import { usePoolsVolumesByEventIds } from "../components/history/usePoolsVolumesByEventIds";
import { HistoryEventCard } from "../components/history/HistoryEventCard";

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function HistoryEmptyState() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography color="text.secondary" fontWeight="bold">
        No topics found.
      </Typography>
    </Box>
  );
}

function HistoryErrorState() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography color="text.secondary" fontWeight="bold">
        Failed to load history.
      </Typography>
    </Box>
  );
}

function ResolvedEventsGrid({ events }: { events: Event[] }) {
  return (
    <Grid container spacing={{ xs: 1, sm: 2 }}>
      {events.map((event) => (
        <Grid key={event.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <HistoryEventCard event={event} />
        </Grid>
      ))}
    </Grid>
  );
}

function HistoryTopicPage({ topics }: { topics: Topic[] }) {
  const navigate = useNavigate();
  const { topicSlug, "*": subtopicSlug } = useParams();

  const filters = useHistoryEventFilters();

  const topicIds = useMemo(() => topics.map((t) => t.id as UUID), [topics]);

  const selectedTopic: Topic | null = useMemo(() => {
    if (topicSlug === "all") return null;
    return topics.find((t) => toSlug(t.topic) === topicSlug) ?? null;
  }, [topics, topicSlug]);

  const topicValue: "all" | UUID = selectedTopic ? selectedTopic.id : "all";

  const selectedSubtopicId: UUID | null = useMemo(() => {
    if (!selectedTopic) return null;
    if (!subtopicSlug) return null; // All divisions
    return (
      selectedTopic.subtopics.find((s) => toSlug(s.name) === subtopicSlug)?.id ??
      null
    );
  }, [selectedTopic, subtopicSlug]);

  const divisionValue: "" | UUID =
    selectedTopic && selectedSubtopicId ? selectedSubtopicId : "";

  const {
    data: topicEvents,
    isLoading: topicEventsLoading,
    error: topicEventsError,
  } = useTopicEventsQuery(
    (selectedTopic?.id ?? "") as UUID | "",
    selectedSubtopicId,
  );

  const {
    data: allEventsByTopic,
    isLoading: allEventsLoading,
    isError: allEventsIsError,
  } = useMultiTopicEventsQuery(topicValue === "all" ? topicIds : []);

  useEffect(() => {
    // Normalize invalid topic slugs back to /history/all
    if (!topicSlug) return;
    if (topicSlug === "all") return;
    if (!selectedTopic) {
      navigate("/history/all", { replace: true });
    }
  }, [navigate, selectedTopic, topicSlug]);

  const sourceEvents: Event[] = useMemo(() => {
    if (topicValue === "all") return allEventsByTopic.flat();
    return topicEvents ?? [];
  }, [allEventsByTopic, topicEvents, topicValue]);

  const filteredEvents = useMemo(
    () => filters.filter(sourceEvents),
    [filters, sourceEvents],
  );

  const volumeSortEnabled =
    filters.sortOption === "volume_desc" || filters.sortOption === "volume_asc";

  const volumeSortEventIds = useMemo(
    () => (volumeSortEnabled ? filteredEvents.map((e) => e.id as UUID) : []),
    [filteredEvents, volumeSortEnabled],
  );

  const { volumeByEventId } = usePoolsVolumesByEventIds(
    volumeSortEventIds,
    volumeSortEnabled,
  );

  const resolvedEvents = useMemo(
    () => filters.sort(filteredEvents, { volumeByEventId }),
    [filters, filteredEvents, volumeByEventId],
  );

  const isLoading =
    topicValue === "all" ? allEventsLoading : topicEventsLoading;
  const error = topicValue === "all" ? (allEventsIsError ? true : false) : Boolean(topicEventsError);

  const subtopics: Subtopic[] = selectedTopic?.subtopics ?? [];

  function handleTopicChange(next: "all" | UUID) {
    if (next === "all") {
      navigate("/history/all");
      return;
    }
    const nextTopic = topics.find((t) => t.id === next);
    if (!nextTopic) return;
    navigate(`/history/${toSlug(nextTopic.topic)}`);
  }

  function handleDivisionChange(next: "" | UUID) {
    if (!selectedTopic) return;
    if (!next) {
      navigate(`/history/${toSlug(selectedTopic.topic)}`);
      return;
    }
    const sub = subtopics.find((s) => s.id === next);
    if (!sub) return;
    navigate(`/history/${toSlug(selectedTopic.topic)}/${toSlug(sub.name)}`);
  }

  function handleClearFilters() {
    filters.clearFilters();
    navigate("/history/all");
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "80vh" }}>
      <HistoryFiltersBar
        topics={topics}
        topicValue={topicValue}
        onTopicChange={handleTopicChange}
        subtopics={subtopics}
        divisionValue={divisionValue}
        onDivisionChange={handleDivisionChange}
        sortOption={filters.sortOption}
        onSortChange={filters.setSortOption}
        multiplierFilter={filters.multiplierFilter}
        onMultiplierFilterChange={filters.setMultiplierFilter}
        resultsCount={resolvedEvents.length}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
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
      ) : error ? (
        <HistoryErrorState />
      ) : resolvedEvents.length === 0 ? (
        <Box sx={{ mt: 2 }}>
          <Typography color="text.secondary" fontWeight="bold">
            No resolved events found.
          </Typography>
        </Box>
      ) : (
        <ResolvedEventsGrid events={resolvedEvents} />
      )}
    </Box>
  );
}

export default function HistoryView() {
  const { data: topics = [], isLoading, error } = useTopicsQuery();

  if (isLoading) return <CircularProgress />;
  if (error) return <HistoryErrorState />;
  if (topics.length === 0) return <HistoryEmptyState />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/history/all" replace />} />
      <Route path=":topicSlug/*" element={<HistoryTopicPage topics={topics} />} />
      <Route path="*" element={<Navigate to="/history/all" replace />} />
    </Routes>
  );
}


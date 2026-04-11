import { Navigate, Route, Routes } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { Event, Topic } from "../models/models";
import { useTopicsQuery } from "../api/topic/topic.queries";
import { HistoryFiltersBar } from "../components/history/HistoryFiltersBar";
import { HistoryEventCard } from "../components/history/HistoryEventCard";
import { useHistoryController } from "../components/history/useHistoryController";

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
  const c = useHistoryController(topics);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "80vh" }}>
      <HistoryFiltersBar
        topics={topics}
        topicValue={c.topicValue}
        onTopicChange={c.setTopic}
        subtopics={c.subtopics}
        divisionValue={c.divisionValue}
        onDivisionChange={c.setDivision}
        sortOption={c.sortOption}
        onSortChange={c.setSortOption}
        multiplierFilter={c.multiplierFilter}
        onMultiplierFilterChange={c.setMultiplierFilter}
        resultsCount={c.resultsCount}
        onClearFilters={c.clearAll}
      />

      {c.isLoading ? (
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
      ) : c.error ? (
        <HistoryErrorState />
      ) : c.resolvedEvents.length === 0 ? (
        <Box sx={{ mt: 2 }}>
          <Typography color="text.secondary" fontWeight="bold">
            No resolved events found.
          </Typography>
        </Box>
      ) : (
        <ResolvedEventsGrid events={c.resolvedEvents} />
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
      <Route
        path=":topicSlug/*"
        element={<HistoryTopicPage topics={topics} />}
      />
      <Route path="*" element={<Navigate to="/history/all" replace />} />
    </Routes>
  );
}

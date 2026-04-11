import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Subtopic, Topic, UUID } from "../../models/models";
import type { HistorySortOption, HistoryMultiplierFilter } from "./useHistoryEventFilters";

export function HistoryFiltersBar({
  topics,
  topicValue,
  onTopicChange,
  subtopics,
  divisionValue,
  onDivisionChange,
  sortOption,
  onSortChange,
  multiplierFilter,
  onMultiplierFilterChange,
  resultsCount,
  onClearFilters,
}: {
  topics: Topic[];
  topicValue: "all" | UUID;
  onTopicChange: (topicId: "all" | UUID) => void;
  subtopics: Subtopic[];
  divisionValue: "" | UUID;
  onDivisionChange: (subtopicId: "" | UUID) => void;
  sortOption: HistorySortOption;
  onSortChange: (next: HistorySortOption) => void;
  multiplierFilter: HistoryMultiplierFilter;
  onMultiplierFilterChange: (next: HistoryMultiplierFilter) => void;
  resultsCount: number;
  onClearFilters: () => void;
}) {
  const divisionsDisabled = topicValue === "all" || subtopics.length === 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{ flexWrap: "wrap", alignItems: { md: "center" } }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mr: { md: 1 }, flexShrink: 0 }}
        >
          History
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mr: { md: 1 }, flexShrink: 0 }}
        >
          {resultsCount.toLocaleString("en-US")} results
        </Typography>

        <TextField
          select
          label="Topic"
          size="small"
          value={topicValue}
          onChange={(e) => onTopicChange(e.target.value as "all" | UUID)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="all">All topics</MenuItem>
          {topics.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.topic}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Division"
          size="small"
          value={divisionsDisabled ? "" : divisionValue}
          onChange={(e) => onDivisionChange(e.target.value as "" | UUID)}
          disabled={divisionsDisabled}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All divisions</MenuItem>
          {subtopics.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Sort"
          size="small"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as HistorySortOption)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="date_desc">Date (newest)</MenuItem>
          <MenuItem value="date_asc">Date (oldest)</MenuItem>
          <MenuItem value="volume_desc">Volume (high)</MenuItem>
          <MenuItem value="volume_asc">Volume (low)</MenuItem>
        </TextField>

        <TextField
          select
          label="Multiplier"
          size="small"
          value={multiplierFilter}
          onChange={(e) =>
            onMultiplierFilterChange(e.target.value as HistoryMultiplierFilter)
          }
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="any">Any</MenuItem>
          <MenuItem value="ge2">2x+</MenuItem>
          <MenuItem value="ge3">3x+</MenuItem>
          <MenuItem value="ge4">4x+</MenuItem>
          <MenuItem value="ge5">5x+</MenuItem>
        </TextField>

        <Button
          variant="text"
          size="small"
          onClick={onClearFilters}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Clear filters
        </Button>
      </Stack>
    </Box>
  );
}


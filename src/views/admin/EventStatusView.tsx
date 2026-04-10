import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Event, EventStatus, Topic, UUID } from "../../models/models";
import { EVENT_STATUSES } from "../../models/models";
import { useApi } from "../../hooks/useApi";
import { useTopicsQuery } from "../../api/topic/topic.queries";

function statusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "open":
      return "#1b5e20";
    case "staking_closed":
      return "#e65100";
    case "hidden":
      return "#424242";
    default:
      return "#424242";
  }
}

function statusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "staking_closed":
      return "Staking Closed";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export default function EventStatusView() {
  const { fetchEvents, updateEventStatus } = useApi();
  const { data: topics = [] } = useTopicsQuery();
  const [eventsByTopic, setEventsByTopic] = useState<
    { topicId: UUID; topicLabel: string; events: Event[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<UUID | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topics.length === 0) return;
    setLoading(true);
    Promise.all(
      topics.map((t: Topic) => fetchEvents(t.id).then((evts) => ({ topic: t, evts }))),
    )
      .then((results) => {
        const grouped = results
          .map(({ topic, evts }) => ({
            topicId: topic.id,
            topicLabel: topic.topic,
            events: evts.filter((e) => {
              const s = e.status.toLowerCase();
              return s === "open" || s === "hidden" || s === "staking_closed";
            }),
          }))
          .filter((g) => g.events.length > 0);
        setEventsByTopic(grouped);
      })
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, [topics, fetchEvents]);

  async function handleToggle(event: Event, newStatus: string) {
    if (event.status.toLowerCase() === newStatus) return;
    setTogglingId(event.id);
    setError(null);
    try {
      await updateEventStatus(event.id, newStatus);
      setEventsByTopic((prev) =>
        prev.map((group) => ({
          ...group,
          events: group.events.map((e) =>
            e.id === event.id ? { ...e, status: newStatus as EventStatus } : e,
          ),
        })),
      );
    } catch {
      setError(`Failed to update ${event.name}`);
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Typography variant="h5" gutterBottom>
        Event Visibility
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Toggle events between open, staking closed, and hidden.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {eventsByTopic.length === 0 ? (
        <Typography color="text.secondary">
          No open, staking closed, or hidden events found.
        </Typography>
      ) : (
        eventsByTopic.map((group) => (
          <Box key={group.topicId} sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                mb: 1,
                px: 1,
                color: "#7B8996",
                textTransform: "uppercase",
                fontSize: "12px",
                letterSpacing: 1,
              }}
            >
              {group.topicLabel}
            </Typography>
            {group.events.map((event, i) => (
              <Box key={event.id}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ py: 1.5, px: 1, gap: 2 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap>
                      {event.name}
                    </Typography>
                    <Chip
                      label={statusLabel(event.status)}
                      size="small"
                      sx={{
                        mt: 0.5,
                        bgcolor: statusColor(event.status),
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    {EVENT_STATUSES.map((s) => (
                      <Button
                        key={s}
                        size="small"
                        variant={
                          event.status.toLowerCase() === s
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => handleToggle(event, s)}
                        disabled={
                          togglingId === event.id ||
                          event.status.toLowerCase() === s
                        }
                        startIcon={
                          togglingId === event.id &&
                          event.status.toLowerCase() !== s ? (
                            <CircularProgress size={12} />
                          ) : null
                        }
                        sx={{
                          textTransform: "none",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {statusLabel(s)}
                      </Button>
                    ))}
                  </Stack>
                </Stack>
                {i < group.events.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        ))
      )}
    </Box>
  );
}
